import { parseBlob, type IAudioMetadata } from 'music-metadata-browser';
import type { Track } from '../types';
import { db } from '../db/indexedDb';

export interface ParsedTrackResult {
  track: Track;
  audioBlobId: string;
  artworkBlobId?: string;
}

async function computeHash(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function inferFromFilename(file: File) {
  const base = file.name.replace(/\.[^.]+$/, '');
  const parts = base.split(' - ');
  if (parts.length >= 2) {
    return {
      artist: parts[0],
      title: parts.slice(1).join(' - '),
    };
  }
  return {
    artist: 'Unknown Artist',
    title: base,
  };
}

function mapMetadata(meta: IAudioMetadata, file: File) {
  const { common, format } = meta;
  const fallback = inferFromFilename(file);

  const title = common.title || fallback.title;
  const artist = common.artist || 'Unknown Artist';
  const album = common.album || 'Unknown Album';
  const duration = format.duration ? Math.round(format.duration) : Math.round(file.size / 16000);
  const year = common.year || undefined;
  const genre = common.genre?.[0];

  return { title, artist, album, duration, year, genre };
}

export async function importAudioFile(file: File): Promise<ParsedTrackResult | null> {
  const arrayBuffer = await file.arrayBuffer();
  const hash = await computeHash(arrayBuffer).catch(() => undefined);

  if (hash) {
    const existing = await db.tracks.where('hash').equals(hash).first();
    if (existing) {
      return null;
    }
  }

  const blob = new Blob([arrayBuffer], { type: file.type || 'audio/mpeg' });
  const audioBlobId = crypto.randomUUID();
  await db.blobs.put({ id: audioBlobId, type: 'audio', blob });

  let meta: IAudioMetadata | null = null;
  try {
    meta = await parseBlob(blob);
  } catch (e) {
    meta = null;
  }

  const base = meta
    ? mapMetadata(meta, file)
    : {
        ...inferFromFilename(file),
        album: 'Unknown Album',
        duration: Math.round(file.size / 16000),
        year: undefined,
        genre: undefined,
      };

  let artworkBlobId: string | undefined;
  if (meta && meta.common.picture && meta.common.picture[0]) {
    const picture = meta.common.picture[0];
    const data = picture.data as unknown as ArrayBuffer;
    const artBlob = new Blob([data], { type: picture.format || 'image/jpeg' });
    artworkBlobId = crypto.randomUUID();
    await db.blobs.put({ id: artworkBlobId, type: 'artwork', blob: artBlob });
  }

  const now = new Date().toISOString();

  const track: Track = {
    id: crypto.randomUUID(),
    title: base.title,
    artist: base.artist,
    album: base.album,
    duration: base.duration,
    year: base.year,
    genre: base.genre,
    artworkBlobId: artworkBlobId ?? null,
    audioBlobId,
    hash,
    createdAt: now,
    updatedAt: now,
  };

  await db.tracks.put(track);

  return { track, audioBlobId, artworkBlobId };
}
