import type { Track } from '../types';
import { db } from '../db/indexedDb';

const objectUrlCache = new Map<string, string>();

export async function getAudioUrlForTrack(track: Track): Promise<string> {
  if (objectUrlCache.has(track.audioBlobId)) {
    return objectUrlCache.get(track.audioBlobId)!;
  }
  const blobDoc = await db.blobs.get(track.audioBlobId);
  if (!blobDoc) {
    throw new Error('Audio blob not found');
  }
  const url = URL.createObjectURL(blobDoc.blob);
  objectUrlCache.set(track.audioBlobId, url);
  return url;
}

export async function getArtworkUrl(artworkBlobId?: string | null): Promise<string | null> {
  if (!artworkBlobId) return null;
  if (objectUrlCache.has(artworkBlobId)) {
    return objectUrlCache.get(artworkBlobId)!;
  }
  const blobDoc = await db.blobs.get(artworkBlobId);
  if (!blobDoc) return null;
  const url = URL.createObjectURL(blobDoc.blob);
  objectUrlCache.set(artworkBlobId, url);
  return url;
}

export function revokeObjectUrls(): void {
  for (const url of objectUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  objectUrlCache.clear();
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const rounded = Math.floor(seconds);
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function placeholderFromTrack(track: Track): { gradient: string; initials: string } {
  const seed = track.id;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  const hue = Math.abs(hash) % 360;
  const gradient = `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 60) % 360} 80% 45%))`;

  const words = `${track.title} ${track.artist}`.trim().split(/\s+/);
  const initials = words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return { gradient, initials };
}
