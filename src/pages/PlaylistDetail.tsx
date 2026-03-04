import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAsyncQuery } from '../hooks/useIndexedDb';
import { db } from '../db/indexedDb';
import type { Track } from '../types';
import { SearchBar } from '../components/SearchBar';
import { usePlayer } from '../hooks/usePlayer';
import { useToast } from '../components/ToastProvider';

export const PlaylistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playlistId = id as string;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { playTracks } = usePlayer();
  const [refetchKey, setRefetchKey] = useState(0);

  const { data } = useAsyncQuery(
    async () => {
      const playlist = await db.playlists.get(playlistId);
      if (!playlist) return null;
      const tracks = await db.tracks.bulkGet(playlist.trackIds);
      const filteredTracks = tracks.filter((t): t is Track => Boolean(t));
      return { playlist, tracks: filteredTracks };
    },
    [playlistId, refetchKey],
  );

  const [query, setQuery] = useState('');

  if (!data) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Back
        </button>
        <p className="text-sm">Playlist not found.</p>
      </div>
    );
  }

  const { playlist, tracks } = data;

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter((t) => `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(q));
  }, [query, tracks]);

  const removeTrack = async (trackId: string) => {
    const nextIds = playlist.trackIds.filter((id2) => id2 !== trackId);
    await db.playlists.update(playlist.id, {
      trackIds: nextIds,
      updatedAt: new Date().toISOString(),
    });
    setRefetchKey(prev => prev + 1);
    showToast('Removed from playlist');
  };

  const playPlaylist = async () => {
    if (!tracks.length) return;
    // Always play from the first song in the playlist, not the filtered results
    await playTracks(tracks, 0);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold tracking-tight">{playlist.name}</h1>
          <p className="text-xs text-muted-foreground">
            {playlist.trackIds.length} track{playlist.trackIds.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-xs md:flex-row md:items-center">
          <SearchBar value={query} onChange={setQuery} placeholder="Search in playlist" />
          <button
            type="button"
            onClick={playPlaylist}
            className="h-9 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-4 text-sm font-medium text-white transition hover:scale-105"
          >
            Play playlist
          </button>
        </div>
      </div>
      <ul className="mt-2 divide-y divide-white/5 rounded-xl border border-white/10 bg-[#0a0a0a] text-sm">
        {filteredTracks.length === 0 && (
          <li className="px-3 py-3 text-xs text-muted-foreground">No tracks match this search.</li>
        )}
        {filteredTracks.map((track) => (
          <li key={track.id} className="flex items-center gap-2 px-3 py-2.5 transition hover:bg-white/5">
            <div className="flex flex-1 flex-col">
              <span className="truncate text-sm font-medium">{track.title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {track.artist} • {track.album}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeTrack(track.id)}
              className="rounded-lg px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
