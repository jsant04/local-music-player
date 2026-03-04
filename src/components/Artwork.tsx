import React, { useEffect, useState } from 'react';
import type { Track } from '../types';
import { getArtworkUrl, placeholderFromTrack } from '../lib/audio';

interface ArtworkProps {
  track: Track;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<ArtworkProps['size']>, string> = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-52 w-52 md:h-64 md:w-64',
};

export const Artwork: React.FC<ArtworkProps> = ({ track, size = 'md' }) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const url = await getArtworkUrl(track.artworkBlobId);
      if (mounted) setSrc(url);
    })();
    return () => {
      mounted = false;
    };
  }, [track.artworkBlobId]);

  const placeholder = placeholderFromTrack(track);

  return (
    <div
      className={`${sizeClasses[size]} overflow-hidden rounded-lg bg-slate-800 shadow-soft`}
      aria-hidden={src ? undefined : true}
    >
      {src ? (
        <img src={src} alt={`${track.title} artwork`} className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-xl font-semibold text-white"
          style={{ backgroundImage: placeholder.gradient }}
        >
          {placeholder.initials}
        </div>
      )}
    </div>
  );
};
