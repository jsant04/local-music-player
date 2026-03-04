import React, { useState } from 'react';
import { useAsyncQuery } from '../hooks/useIndexedDb';
import { db } from '../db/indexedDb';
import type { Playlist, Track } from '../types';
import { PlaylistCard } from '../components/PlaylistCard';
import { useToast } from '../components/ToastProvider';
import { usePlayer } from '../hooks/usePlayer';

export const PlaylistsPage: React.FC = () => {
  const [refetchKey, setRefetchKey] = useState(0);
  const { data, loading, error } = useAsyncQuery<Playlist[]>(async () => db.playlists.toArray(), [refetchKey]);
  const playlists = data ?? [];
  const [newName, setNewName] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { playTracks } = usePlayer();
  
  // Load tracks for selected playlist
  const { data: playlistData } = useAsyncQuery(
    async () => {
      if (!selectedPlaylistId) return null;
      const playlist = await db.playlists.get(selectedPlaylistId);
      if (!playlist) return null;
      const tracks = await db.tracks.bulkGet(playlist.trackIds);
      const filteredTracks = tracks.filter((t): t is Track => Boolean(t));
      return { playlist, tracks: filteredTracks };
    },
    [selectedPlaylistId, refetchKey],
  );

  const createPlaylist = async () => {
    const name = newName.trim();
    if (!name) return;
    const now = new Date().toISOString();
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name,
      trackIds: [],
      createdAt: now,
      updatedAt: now,
    };
    await db.playlists.put(playlist);
    setNewName('');
    setRefetchKey(prev => prev + 1);
    showToast('Playlist created');
  };

  const renamePlaylist = async (playlist: Playlist) => {
    const name = window.prompt('Rename playlist', playlist.name)?.trim();
    if (!name || name === playlist.name) return;
    await db.playlists.update(playlist.id, { name, updatedAt: new Date().toISOString() });
    setRefetchKey(prev => prev + 1);
    showToast('Playlist renamed');
  };

  const deletePlaylist = async (playlist: Playlist) => {
    if (!window.confirm(`Delete playlist "${playlist.name}"?`)) return;
    await db.playlists.delete(playlist.id);
    setRefetchKey(prev => prev + 1);
    showToast('Playlist deleted');
  };

  const exportLibrary = async () => {
    const [tracks, playlistsData, appSettings] = await Promise.all([
      db.tracks.toArray(),
      db.playlists.toArray(),
      db.app.toArray(),
    ]);

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tracks,
      playlists: playlistsData,
      appSettings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibe-player-library.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Library metadata exported');
  };

  const importLibrary = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        if (!Array.isArray(json.tracks) || !Array.isArray(json.playlists)) {
          throw new Error('Invalid export format');
        }
        await db.transaction('rw', db.tracks, db.playlists, db.app, async () => {
          for (const track of json.tracks) {
            await db.tracks.put(track);
          }
          for (const playlist of json.playlists) {
            await db.playlists.put(playlist);
          }
          if (Array.isArray(json.appSettings)) {
            for (const s of json.appSettings) {
              await db.app.put(s);
            }
          }
        });
        showToast('Library imported');
      } catch (e) {
        console.error(e);
        showToast('Failed to import library');
      }
    };
    input.click();
  };

  const removeTrackFromPlaylist = async (trackId: string) => {
    if (!selectedPlaylistId || !playlistData?.playlist) return;
    const nextIds = playlistData.playlist.trackIds.filter((id) => id !== trackId);
    await db.playlists.update(selectedPlaylistId, {
      trackIds: nextIds,
      updatedAt: new Date().toISOString(),
    });
    setRefetchKey(prev => prev + 1);
    showToast('Removed from playlist');
  };

  const playPlaylist = async () => {
    if (!playlistData?.tracks.length) return;
    await playTracks(playlistData.tracks, 0);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Selected Playlist Detail View */}
      {selectedPlaylistId && playlistData && (
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex-1">
              <button
                type="button"
                onClick={() => setSelectedPlaylistId(null)}
                className="mb-2 text-xs text-muted-foreground hover:underline"
              >
                ← Back to all playlists
              </button>
              <h2 className="text-lg font-semibold">{playlistData.playlist.name}</h2>
              <p className="text-xs text-muted-foreground">
                {playlistData.playlist.trackIds.length} track{playlistData.playlist.trackIds.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              type="button"
              onClick={playPlaylist}
              disabled={!playlistData.tracks.length}
              className="rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Play playlist
            </button>
          </div>
          
          <div className="divide-y divide-white/5 rounded-lg border border-white/10">
            {playlistData.tracks.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                This playlist is empty. Add songs from your library.
              </div>
            )}
            {playlistData.tracks.map((track) => (
              <div key={track.id} className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/5">
                <div className="flex-1">
                  <p className="truncate text-sm font-medium">{track.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {track.artist} • {track.album}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeTrackFromPlaylist(track.id)}
                  className="rounded-lg px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playlists Grid - Only show when no playlist is selected */}
      {!selectedPlaylistId && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-lg font-semibold tracking-tight">Playlists</h1>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? 'Loading playlists…'
                  : `${playlists.length} playlist${playlists.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={exportLibrary}
                className="rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1 transition hover:bg-white/5"
              >
                Export library
              </button>
              <button
                type="button"
                onClick={importLibrary}
                className="rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-3 py-1 text-white transition hover:scale-105"
              >
                Import library
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New playlist name"
              className="h-9 min-w-[180px] flex-1 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={createPlaylist}
              className="h-9 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-4 text-sm font-medium text-white transition hover:scale-105"
            >
              Create
            </button>
          </div>
          {error ? <p className="text-xs text-red-500">Error loading playlists</p> : null}
          <div className="mt-2 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {playlists.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                trackCount={pl.trackIds.length}
                onClick={() => setSelectedPlaylistId(pl.id)}
                onRename={() => renamePlaylist(pl)}
                onDelete={() => deletePlaylist(pl)}
              />
            ))}
          </div>
          {!loading && !playlists.length && (
            <p className="mt-6 text-sm text-muted-foreground">No playlists yet. Create one above.</p>
          )}
        </>
      )}
    </div>
  );
};
