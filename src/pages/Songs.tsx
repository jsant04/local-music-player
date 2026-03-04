import React, { useMemo, useState } from 'react';
import { useAsyncQuery } from '../hooks/useIndexedDb';
import { db } from '../db/indexedDb';
import type { Track } from '../types';
import { SearchBar } from '../components/SearchBar';
import { SongList } from '../components/SongList';
import { usePlayer } from '../hooks/usePlayer';
import { useToast } from '../components/ToastProvider';
import { Artwork } from '../components/Artwork';

export const SongsPage: React.FC = () => {
  const [refetchKey, setRefetchKey] = useState(0);
  const { data, loading } = useAsyncQuery<Track[]>(async () => {
    const all = await db.tracks.toArray();
    return all.sort((a, b) => a.title.localeCompare(b.title));
  }, [refetchKey]);
  const tracks = data ?? [];

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'recent'>('title');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const { playTracks, enqueueTracks } = usePlayer();
  const { showToast } = useToast();

  // Group tracks by album for featured albums
  const albumGroups = useMemo(() => {
    const groups = new Map<string, Track[]>();
    tracks.forEach(track => {
      const key = `${track.album}::${track.artist}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(track);
    });
    return Array.from(groups.values())
      .sort((a, b) => new Date(b[0].createdAt).getTime() - new Date(a[0].createdAt).getTime())
      .slice(0, 6); // Top 6 recent albums
  }, [tracks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result: Track[] = tracks;
    if (q) {
      result = result.filter((t) => {
        const hay = `${t.title} ${t.artist} ${t.album}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (sortBy === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'artist') {
      result = [...result].sort((a, b) => a.artist.localeCompare(b.artist));
    } else {
      result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return result;
  }, [tracks, query, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTracks: Track[] = useMemo(
    () => filtered.filter((t) => selectedIds.has(t.id)),
    [filtered, selectedIds],
  );

  const handlePlayTrack = async (track: Track) => {
    const index = filtered.findIndex((t) => t.id === track.id);
    await playTracks(filtered, index === -1 ? 0 : index);
  };

  const handleAddToQueue = (playNext = false) => {
    if (!selectedTracks.length) return;
    enqueueTracks(selectedTracks, { playNext });
    showToast(
      `${playNext ? 'Up next' : 'Added to queue'}: ${selectedTracks.length} track${selectedTracks.length === 1 ? '' : 's'}.`,
    );
    setSelectedIds(new Set());
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Featured Albums Section */}
      {!query && albumGroups.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Featured Albums</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {albumGroups.map((albumTracks) => {
              const firstTrack = albumTracks[0];
              return (
                <button
                  key={`${firstTrack.album}-${firstTrack.artist}`}
                  onClick={() => playTracks(albumTracks, 0)}
                  className="group flex flex-col gap-2 rounded-lg p-3 transition hover:bg-white/5"
                >
                  <div className="relative">
                    <Artwork track={firstTrack} size="md" />
                    <div className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 shadow-glow transition group-hover:opacity-100">
                      <svg className="h-5 w-5 translate-x-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="truncate text-sm font-semibold">{firstTrack.album}</p>
                    <p className="truncate text-xs text-muted-foreground">{firstTrack.artist}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* All Songs Section */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">
              {query ? 'Search Results' : 'All Songs'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading library…' : `${tracks.length} track${tracks.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SearchBar value={query} onChange={setQuery} placeholder="Search songs..." />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-9 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Sort songs"
            >
              <option value="title">Title</option>
              <option value="artist">Artist</option>
              <option value="recent">Recently added</option>
            </select>
            <div className="flex gap-1 rounded-lg border border-white/10 bg-[#0a0a0a] p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`rounded px-2 py-1 text-sm transition ${
                  viewMode === 'table' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded px-2 py-1 text-sm transition ${
                  viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>

        {tracks.length > 0 && viewMode === 'grid' && (
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {selectedTracks.length
                ? `${selectedTracks.length} selected`
                : 'Select songs to add to queue.'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!selectedTracks.length}
                onClick={() => handleAddToQueue(false)}
                className="rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to queue
              </button>
              <button
                type="button"
                disabled={!selectedTracks.length}
                onClick={() => handleAddToQueue(true)}
                className="rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Play next
              </button>
            </div>
          </div>
        )}

        <SongList
          tracks={filtered}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onPlay={handlePlayTrack}
          onLikeToggle={async () => setRefetchKey(prev => prev + 1)}
          tableView={viewMode === 'table'}
        />
      </section>
    </div>
  );
};
