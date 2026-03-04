import React, { useCallback, useState } from 'react';

interface UploadDropzoneProps {
  onFiles: (files: FileList | File[]) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onFiles }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      onFiles(files);
    },
    [onFiles],
  );

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 bg-white/5'
      }`}
      tabIndex={0}
      role="button"
      aria-label="Upload audio files"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p className="text-sm font-medium">Drag & drop MP3 files here</p>
      <p className="text-xs text-muted-foreground">or click to choose files from your device</p>
      <label
        className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:scale-105"
      >
        <span>Browse files</span>
        <input
          type="file"
          accept="audio/mpeg,audio/mp3,audio/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
    </div>
  );
};
