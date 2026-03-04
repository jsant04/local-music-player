import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AppSettings, QueueState, RepeatMode, Track } from '../types';
import { db, getOrCreateSettings, updateSettings } from '../db/indexedDb';
import { formatTime, getAudioUrlForTrack } from '../lib/audio';

interface PlayerContextValue {
  currentTrack: Track | null;
  queueState: QueueState;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  playTracks: (tracks: Track[], startIndex?: number) => Promise<void>;
  enqueueTracks: (tracks: Track[], options?: { playNext?: boolean }) => void;
  playPause: () => void;
  seek: (time: number) => void;
  next: () => void;
  previous: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setShuffle: (value: boolean) => void;
  updateQueueOrder: (trackIds: string[]) => void;
  clearQueue: () => void;
  formattedTime: string;
  formattedDuration: string;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queueState, setQueueState] = useState<QueueState>({ queue: [], currentIndex: 0 });
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');
  const [shuffle, setShuffleState] = useState(false);

  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
        if (audio.buffered.length > 0) {
          setBuffered(audio.buffered.end(audio.buffered.length - 1));
        }
      }
    };

    const onEnded = () => {
      handleEnded();
    };

    const onCanPlay = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('canplay', onCanPlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      const settings = await getOrCreateSettings();
      setRepeatModeState(settings.repeatMode);
      setShuffleState(settings.shuffle);
      if (settings.lastQueue && settings.lastQueue.length > 0) {
        setQueueState({ queue: settings.lastQueue, currentIndex: 0 });
        if (settings.lastTrackId) {
          const track = await db.tracks.get(settings.lastTrackId);
          if (track) {
            setCurrentTrack(track);
            const audio = audioRef.current;
            if (audio) {
              const src = await getAudioUrlForTrack(track);
              audio.src = src;
              audio.currentTime = settings.lastPosition ?? 0;
            }
          }
        }
      }
      setSettingsLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    (async () => {
      const { queue, currentIndex } = queueState;
      const currentId = queue[currentIndex];
      const position = currentTime;
      await updateSettings({
        lastQueue: queue,
        lastTrackId: currentId,
        lastPosition: position,
      });
    })();
  }, [queueState, currentTime, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    const settingsUpdate: Partial<AppSettings> = {
      repeatMode,
      shuffle,
    };
    void updateSettings(settingsUpdate);
  }, [repeatMode, shuffle, settingsLoaded]);

  const applyMediaSession = useCallback(
    (track: Track | null) => {
      if (!('mediaSession' in navigator)) return;
      if (!track) return;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
      });

      navigator.mediaSession.setActionHandler('play', () => {
        play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        previous();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        next();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && 'fastSeek' in (audioRef.current ?? {})) {
          (audioRef.current as HTMLMediaElement & { fastSeek?: (time: number) => void }).fastSeek?.(
            details.seekTime ?? 0,
          );
          return;
        }
        if (typeof details.seekTime === 'number') {
          seek(details.seekTime);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queueState, currentTrack],
  );

  const loadTrackAtIndex = useCallback(
    async (index: number, autoplay: boolean) => {
      const audio = audioRef.current;
      if (!audio) return;
      const id = queueState.queue[index];
      if (!id) {
        setCurrentTrack(null);
        return;
      }
      const track = await db.tracks.get(id);
      if (!track) return;
      setCurrentTrack(track);
      const src = await getAudioUrlForTrack(track);
      audio.src = src;
      await audio.load();
      applyMediaSession(track);
      if (autoplay) {
        await audio.play();
        setIsPlaying(true);
      }
    },
    [queueState.queue, applyMediaSession],
  );

  const handleEnded = useCallback(() => {
    setQueueState((prev) => {
      const { queue, currentIndex } = prev;
      if (queue.length === 0) return prev;

      if (repeatMode === 'one') {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          void audio.play();
          setIsPlaying(true);
        }
        return prev;
      }

      let nextIndex = currentIndex + 1;
      if (shuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }

      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return prev;
        }
      }

      void loadTrackAtIndex(nextIndex, true);
      return { queue, currentIndex: nextIndex };
    });
  }, [loadTrackAtIndex, repeatMode, shuffle]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        setIsPlaying(false);
      });
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const playPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const playTracks = useCallback(
    async (tracks: Track[], startIndex = 0) => {
      const ids = tracks.map((t) => t.id);
      setQueueState({ queue: ids, currentIndex: startIndex });
      await loadTrackAtIndex(startIndex, true);
    },
    [loadTrackAtIndex],
  );

  const enqueueTracks = useCallback(
    (tracks: Track[], options?: { playNext?: boolean }) => {
      setQueueState((prev) => {
        const existing = new Set(prev.queue);
        const newIds = tracks.map((t) => t.id).filter((id) => !existing.has(id));
        if (newIds.length === 0) return prev;

        if (options?.playNext && prev.queue.length > 0) {
          const queue = [...prev.queue];
          const insertIndex = Math.min(prev.currentIndex + 1, queue.length);
          queue.splice(insertIndex, 0, ...newIds);
          return { queue, currentIndex: prev.currentIndex };
        }

        return { queue: [...prev.queue, ...newIds], currentIndex: prev.currentIndex };
      });
    },
    [],
  );

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const next = useCallback(() => {
    setQueueState((prev) => {
      if (prev.queue.length === 0) return prev;
      let nextIndex = prev.currentIndex + 1;
      if (shuffle) {
        nextIndex = Math.floor(Math.random() * prev.queue.length);
      }
      if (nextIndex >= prev.queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          return prev;
        }
      }
      void loadTrackAtIndex(nextIndex, true);
      return { queue: prev.queue, currentIndex: nextIndex };
    });
  }, [loadTrackAtIndex, repeatMode, shuffle]);

  const previous = useCallback(() => {
    setQueueState((prev) => {
      if (prev.queue.length === 0) return prev;
      let nextIndex = prev.currentIndex - 1;
      if (nextIndex < 0) {
        if (repeatMode === 'all') {
          nextIndex = prev.queue.length - 1;
        } else {
          return prev;
        }
      }
      void loadTrackAtIndex(nextIndex, true);
      return { queue: prev.queue, currentIndex: nextIndex };
    });
  }, [loadTrackAtIndex, repeatMode]);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeatModeState(mode);
  }, []);

  const setShuffle = useCallback((value: boolean) => {
    setShuffleState(value);
  }, []);

  const updateQueueOrder = useCallback((trackIds: string[]) => {
    setQueueState(() => ({ queue: trackIds, currentIndex: 0 }));
  }, []);

  const clearQueue = useCallback(() => {
    setQueueState({ queue: [], currentIndex: 0 });
    setCurrentTrack(null);
    setIsPlaying(false);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
  }, []);

  const formattedTime = useMemo(() => formatTime(currentTime), [currentTime]);
  const formattedDuration = useMemo(() => formatTime(duration), [duration]);

  const value: PlayerContextValue = {
    currentTrack,
    queueState,
    isPlaying,
    currentTime,
    duration,
    buffered,
    repeatMode,
    shuffle,
    playTracks,
    enqueueTracks,
    playPause,
    seek,
    next,
    previous,
    setRepeatMode,
    setShuffle,
    updateQueueOrder,
    clearQueue,
    formattedTime,
    formattedDuration,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} hidden aria-hidden="true" />
    </PlayerContext.Provider>
  );
};

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
