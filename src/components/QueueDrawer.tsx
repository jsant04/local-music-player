import React from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { useAsyncQuery } from '../hooks/useIndexedDb';
import { db } from '../db/indexedDb';

export const QueueDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { queueState, clearQueue } = usePlayer();
  const { data: tracks } = useAsyncQuery(
    async () => {
      const records = await db.tracks.bulkGet(queueState.queue);
      return records.filter((t): t is NonNullable<typeof t> => Boolean(t));
    },
    [queueState.queue.join(',')],
  );

  const items = tracks ?? [];

  if (!open) return null;

  return (
    <aside
      className="fixed inset-x-0 bottom-16 z-30 max-h-[60vh] rounded-t-3xl border border-white/10 bg-[#0a0a0a]/95 p-4 shadow-soft backdrop-blur-xl lg:inset-0 lg:relative lg:max-h-none lg:rounded-2xl"
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
        <ol className="flex max-h-[45vh] flex-col gap-1 overflow-y-auto text-xs lg:max-h-[calc(100vh-16rem)]">
          {items.map((track, index) => (
            <li
              key={track.id}
              className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-white/5"
            >
              <span className="truncate">
                {index + 1}. {track.title}
              </span>
              <span className="ml-2 text-muted-foreground">{track.artist}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
};
