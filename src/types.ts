export type BlobType = 'audio' | 'artwork';

export interface BlobDoc {
  id: string;
  type: BlobType;
  blob: Blob;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  year?: number;
  genre?: string;
  artworkBlobId?: string | null;
  audioBlobId: string;
  hash?: string;
  liked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type RepeatMode = 'off' | 'one' | 'all';

export interface AppSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  repeatMode: RepeatMode;
  shuffle: boolean;
  lastQueue: string[];
  lastTrackId?: string;
  lastPosition?: number;
}

export interface QueueState {
  queue: string[];
  currentIndex: number;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  canPlay: boolean;
}

export interface ImportProgressItem {
  fileName: string;
  status: 'pending' | 'parsing' | 'done' | 'skipped' | 'error';
  message?: string;
}
