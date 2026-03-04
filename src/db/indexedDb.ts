import Dexie, { type Table } from 'dexie';
import type { AppSettings, BlobDoc, Playlist, Track } from '../types';

export class MusicDatabase extends Dexie {
  tracks!: Table<Track, string>;
  blobs!: Table<BlobDoc, string>;
  playlists!: Table<Playlist, string>;
  app!: Table<AppSettings, string>;

  constructor() {
    super('VibeMusicDB');

    this.version(1).stores({
      tracks:
        'id, title, artist, album, duration, year, genre, artworkBlobId, audioBlobId, hash, createdAt, updatedAt',
      blobs: 'id, type',
      playlists: 'id, name, createdAt, updatedAt',
      app: 'id',
    });
  }
}

export const db = new MusicDatabase();

const SETTINGS_ID = 'settings';

export async function getOrCreateSettings(): Promise<AppSettings> {
  const existing = await db.app.get(SETTINGS_ID);
  if (existing) return existing;

  const initial: AppSettings = {
    id: SETTINGS_ID,
    theme: 'system',
    repeatMode: 'off',
    shuffle: false,
    lastQueue: [],
  };

  await db.app.put(initial);
  return initial;
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getOrCreateSettings();
  const updated: AppSettings = {
    ...current,
    ...partial,
    id: SETTINGS_ID,
  };
  await db.app.put(updated);
  return updated;
}

export async function seedDemoData(): Promise<void> {
  const existing = await db.tracks.count();
  if (existing > 0) return;

  // Load default track: El Manu - Tahanan from public folder
  try {
    const response = await fetch('/tahanan.mp3');
    if (!response.ok) {
      console.warn('Default track not found in /public/tahanan.mp3');
      return;
    }

    const audioBlob = await response.blob();
    const audioId = crypto.randomUUID();

    await db.blobs.put({
      id: audioId,
      type: 'audio',
      blob: audioBlob,
    });

    const createdAt = new Date().toISOString();

    await db.tracks.put({
      id: crypto.randomUUID(),
      title: 'Tahanan',
      artist: 'El Manu',
      album: 'Tahanan - Single',
      duration: 210, // Will be updated when played
      year: 2024,
      genre: 'Filipino Music',
      artworkBlobId: undefined,
      audioBlobId: audioId,
      liked: true,
      createdAt,
      updatedAt: createdAt,
    });

    console.log('✓ Default track "Tahanan" loaded successfully');
  } catch (error) {
    console.error('Failed to load default track:', error);
  }
}
