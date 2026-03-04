import React from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { useAsyncQuery } from '../hooks/useIndexedDb';
import { db } from '../db/indexedDb';

export const QueueDrawer: React.FC<{ open: boolean; onClose: () => void; compact?: boolean }> = ({ open, onClose, compact = false }) => {
  const { queueState, clearQueue, playTracks } = usePlayer();
  const { data: tracks } = useAsyncQuery(
    async () => {
      const records = await db.tracks.bulkGet(queueState.queue);
      return records.filter((t): t is NonNullable<typeof t> => Boolean(t));
    },
    [queueState.queue.join(',')],
  );

  const items = tracks ?? [];

  if (!open) return null;

  const handleTrackClick = async (index: number) => {
    if (items.length > 0) {
      await playTracks(items, index);
    }
  };

  // Compact mode for right sidebar - inline display
  if (compact) {
    return (
      <div className="flex h-full flex-col" aria-label="Playback queue">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold">Up Next</h3>
          <button
            type="button"
            onClick={clearQueue}
            className="rounded px-2 py-1 text-[10px] text-red-400 transition hover:bg-red-500/10"
          >
            Clear
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No tracks in queue</p>
        ) : (
          <ol className="flex flex-1 flex-col gap-0.5 overflow-y-auto pr-1 text-[11px]">
            {items.map((track, index) => (
              <li
                key={track.id}
                onClick={() => handleTrackClick(index)}
                className={`cursor-pointer rounded-lg px-2 py-2 transition hover:bg-white/10 ${
                  index === queueState.currentIndex ? 'bg-purple-500/10 text-purple-400' : ''
                }`}
              >
                <div className="truncate font-medium">
                  {index + 1}. {track.title}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">{track.artist}</div>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }

  // Full page mode for mobile
  return (
    <aside
      className="fixed inset-x-0 bottom-16 z-30 max-h-[70vh] rounded-t-3xl border border-white/10 bg-[#0a0a0a]/95 p-4 shadow-soft backdrop-blur-xl lg:inset-0 lg:relative lg:max-h-none lg:rounded-2xl"
      aria-label="Playback queue"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Queue</h2>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={clearQueue}
            className="rounded-lg px-3 py-1.5 text-red-400 transition hover:bg-red-500/10"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-muted-foreground transition hover:bg-white/5 lg:hidden"
          >
            Close
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No tracks in the queue.</p>
      ) : (
        <ol className="flex max-h-[calc(70vh-5rem)] flex-col gap-1 overflow-y-auto text-xs lg:max-h-[calc(100vh-16rem)]">
          {items.map((track, index) => (
            <li
              key={track.id}
              onClick={() => handleTrackClick(index)}
              className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition hover:bg-white/10 ${
                index === queueState.currentIndex ? 'bg-purple-500/10 text-purple-400' : ''
              }`}
            >
              <span className="truncate">
                {index + 1}. {track.title}
              </span>
              <span className="ml-2 truncate text-muted-foreground">{track.artist}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
};
