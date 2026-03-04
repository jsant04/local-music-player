import React, { useState } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { Artwork } from '../components/Artwork';
import { QueueDrawer } from '../components/QueueDrawer';

export const NowPlayingPage: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    currentTrack,
    isPlaying,
    playPause,
    next,
    previous,
    currentTime,
    duration,
    seek,
    formattedTime,
    formattedDuration,
    repeatMode,
    shuffle,
    setRepeatMode,
    setShuffle,
  } = usePlayer();

  const [queueOpen] = useState(true); // Always show queue in compact mode

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (compact) {
    // Compact mode for right sidebar
    return (
      <div className="flex h-full flex-col gap-4">
        {currentTrack ? (
          <>
            <div className="flex flex-col items-center gap-3">
              <Artwork track={currentTrack} size="lg" />
              <div className="w-full space-y-1 text-center">
                <h2 className="text-sm font-semibold">{currentTrack.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {currentTrack.artist}
                </p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex flex-col gap-1">
              <div className="relative h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{formattedTime}</span>
                <span>{formattedDuration}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShuffle(!shuffle)}
                className={`rounded-full p-1.5 transition ${
                  shuffle ? 'text-purple-400' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
              <button onClick={previous} className="rounded-full p-1.5 text-foreground transition hover:bg-white/5">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
              <button
                onClick={playPause}
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
              <button onClick={next} className="rounded-full p-1.5 text-foreground transition hover:bg-white/5">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() =>
                  setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')
                }
                className={`rounded-full p-1.5 transition ${
                  repeatMode !== 'off' ? 'text-purple-400' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            {/* Queue Section - inline with border */}
            <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-white/10 bg-[#0a0a0a] p-3">
              <h3 className="mb-2 text-xs font-semibold">Queue</h3>
              <div className="min-h-0 flex-1">
                <QueueDrawer open={queueOpen} onClose={() => {}} compact />
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            No track playing
          </p>
        )}
      </div>
    );
  }

  // Full page mode for mobile
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
      <section className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">Now playing</h1>
          <p className="text-xs text-muted-foreground">
            {currentTrack ? 'Control playback and queue.' : 'No track selected yet.'}
          </p>
        </header>
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] p-6 shadow-soft">
          {currentTrack ? (
            <>
              <Artwork track={currentTrack} size="lg" />
              <div className="w-full space-y-2 text-center">
                <h2 className="truncate text-lg font-semibold">{currentTrack.title}</h2>
                <p className="truncate text-sm text-muted-foreground">
                  {currentTrack.artist} • {currentTrack.album}
                </p>
              </div>
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="tabular-nums">{formattedTime}</span>
                  <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="tabular-nums">{formattedDuration}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-purple-500"
                  aria-label="Seek through track"
                />
              </div>
              <div className="mt-3 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setShuffle(!shuffle)}
                  aria-pressed={shuffle}
                  aria-label="Toggle shuffle"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    shuffle ? 'border-purple-500 text-purple-400' : 'border-white/10 text-muted-foreground hover:bg-white/5'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous track"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-foreground transition hover:bg-white/5"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={playPause}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-glow transition hover:scale-105"
                >
                  {isPlaying ? (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next track"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-foreground transition hover:bg-white/5"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')
                  }
                  aria-label="Toggle repeat mode"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    repeatMode === 'off'
                      ? 'border-white/10 text-muted-foreground hover:bg-white/5'
                      : 'border-purple-500 text-purple-400'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Choose a song from your library or a playlist to start playback.
            </p>
          )}
        </div>
      </section>
      <section className="flex min-h-0 flex-1 flex-col space-y-3">
        <h2 className="text-sm font-semibold">Queue</h2>
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
          <QueueDrawer open={true} onClose={() => {}} compact />
        </div>
      </section>
    </div>
  );
};
