import React from 'react';
import type { Track } from '../types';
import { Artwork } from './Artwork';
import { formatTime } from '../lib/audio';
import { db } from '../db/indexedDb';

interface SongListProps {
  tracks: Track[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onPlay: (track: Track) => void;
  onLikeToggle?: (track: Track) => Promise<void>;
  tableView?: boolean;
}

export const SongList: React.FC<SongListProps> = ({ 
  tracks, 
  selectedIds, 
  onToggleSelect, 
  onPlay,
  onLikeToggle,
  tableView = false 
}) => {
  if (tracks.length === 0) {
    return (
      <div className="mt-8 text-center text-sm text-muted-foreground">
        No songs yet. Try uploading some tracks.
      </div>
    );
  }

  const handleLike = async (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = !track.liked;
    await db.tracks.update(track.id, { liked: newLiked });
    if (onLikeToggle) {
      await onLikeToggle({ ...track, liked: newLiked });
    }
  };

  if (tableView) {
    // Table layout for streaming feel
    return (
      <div className="mt-4">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5 text-left text-xs text-muted-foreground">
            <tr>
              <th className="w-12 pb-2">#</th>
              <th className="pb-2">Title</th>
              <th className="hidden pb-2 md:table-cell">Album</th>
              <th className="hidden pb-2 lg:table-cell">Added</th>
              <th className="w-20 pb-2 text-right">Duration</th>
              <th className="w-12 pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr
                key={track.id}
                className="group border-b border-white/5 transition hover:bg-white/5"
              >
                <td className="py-3">
                  <div className="flex items-center justify-center">
                    <span className="group-hover:hidden">{index + 1}</span>
                    <button
                      onClick={() => onPlay(track)}
                      className="hidden text-white group-hover:block"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Artwork track={track} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{track.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden py-3 md:table-cell">
                  <p className="truncate text-muted-foreground">{track.album}</p>
                </td>
                <td className="hidden py-3 text-muted-foreground lg:table-cell">
                  {new Date(track.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 text-right text-muted-foreground">
                  {formatTime(track.duration)}
                </td>
                <td className="py-3">
                  <button
                    onClick={(e) => handleLike(track, e)}
                    className="opacity-0 transition group-hover:opacity-100"
                    aria-label={track.liked ? 'Unlike' : 'Like'}
                  >
                    {track.liked ? (
                      <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Card/list layout (default)
  return (
    <ul className="mt-4 divide-y divide-white/5 rounded-xl border border-white/10 bg-white/5 backdrop-blur">
      {tracks.map((track) => (
        <li
          key={track.id}
          className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5"
        >
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/30 bg-transparent text-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            checked={selectedIds.has(track.id)}
            aria-label={`Select ${track.title}`}
            onChange={() => onToggleSelect(track.id)}
          />
          <button
            type="button"
            onClick={() => onPlay(track)}
            className="flex flex-1 items-center gap-3 text-left focus-visible:outline-none"
          >
            <Artwork track={track} size="sm" />
            <div className="flex flex-1 flex-col">
              <span className="truncate text-sm font-medium">{track.title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {track.artist} • {track.album}
              </span>
            </div>
            <span className="ml-auto text-xs text-muted-foreground">
              {formatTime(track.duration)}
            </span>
          </button>
          <button
            onClick={(e) => handleLike(track, e)}
            className="flex-shrink-0"
            aria-label={track.liked ? 'Unlike' : 'Like'}
          >
            {track.liked ? (
              <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-muted-foreground hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};
