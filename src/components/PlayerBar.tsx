import React, { useState } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { Artwork } from './Artwork';

export const PlayerBar: React.FC<{ 
  onToggleQueue: () => void;
}> = ({ onToggleQueue }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    formattedTime,
    formattedDuration,
    playPause,
    next,
    previous,
    seek,
  } = usePlayer();

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  const progress = duration ? ((isScrubbing ? scrubValue : currentTime) / duration) * 100 : 0;

  return (
    <section
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl"
      aria-label="Now playing bar"
    >
      {/* Progress bar at the top */}
      <div className="relative h-1 w-full bg-white/5">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={isScrubbing ? scrubValue : currentTime}
          onChange={(e) => {
            const value = Number(e.target.value);
            setIsScrubbing(true);
            setScrubValue(value);
          }}
          onMouseUp={() => {
            setIsScrubbing(false);
            seek(scrubValue);
          }}
          onTouchEnd={() => {
            setIsScrubbing(false);
            seek(scrubValue);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
          aria-label="Seek through track"
        />
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:gap-6">
        {/* Track info and artwork */}
        {currentTrack ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Artwork track={currentTrack} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{currentTrack.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {currentTrack.artist}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center text-sm text-muted-foreground">
            <span>No track playing</span>
          </div>
        )}

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-3 lg:gap-4">
          <button
            type="button"
            onClick={previous}
            aria-label="Previous track"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={playPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-glow transition hover:scale-105"
          >
            {isPlaying ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          <button
            type="button"
            onClick={next}
            aria-label="Next track"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z" />
            </svg>
          </button>
        </div>

        {/* Time display and controls */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <span className="hidden text-xs text-muted-foreground lg:inline">
            {formattedTime} / {formattedDuration}
          </span>
          
          {/* Queue button */}
          <button
            type="button"
            onClick={onToggleQueue}
            aria-label="Toggle queue"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/5 hover:text-foreground lg:hidden"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};
