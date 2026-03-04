import React from 'react';
import type { Playlist } from '../types';

interface PlaylistCardProps {
  playlist: Playlist;
  trackCount: number;
  onClick: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  trackCount,
  onClick,
  onRename,
  onDelete,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-left shadow-soft transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  >
    <div className="flex flex-col">
      <span className="text-sm font-semibold">{playlist.name}</span>
      <span className="text-xs text-muted-foreground">
        {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
      </span>
    </div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {onRename && (
        <span
          role="button"
          tabIndex={-1}
          className="rounded-lg px-2 py-1 transition hover:bg-white/10 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
        >
          Rename
        </span>
      )}
      {onDelete && (
        <span
          role="button"
          tabIndex={-1}
          className="rounded-lg px-2 py-1 transition hover:bg-red-500/10 hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          Delete
        </span>
      )}
    </div>
  </button>
);
