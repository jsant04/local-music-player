import React, { useState } from 'react';
import { UploadDropzone } from '../components/UploadDropzone';
import { importAudioFile } from '../lib/id3';
import type { ImportProgressItem } from '../types';
import { useToast } from '../components/ToastProvider';

export const UploadPage: React.FC = () => {
  const [items, setItems] = useState<ImportProgressItem[]>([]);
  const { showToast } = useToast();

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    const initial: ImportProgressItem[] = files.map((f) => ({
      fileName: f.name,
      status: 'pending',
    }));
    setItems(initial);

    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      setItems((prev) => {
        const next = [...prev];
        next[i] = { ...next[i], status: 'parsing' };
        return next;
      });
      try {
        const result = await importAudioFile(file);
        if (!result) {
          skipped += 1;
          setItems((prev) => {
            const next = [...prev];
            next[i] = {
              ...next[i],
              status: 'skipped',
              message: 'Duplicate or already imported',
            };
            return next;
          });
          continue;
        }
        imported += 1;
        setItems((prev) => {
          const next = [...prev];
          next[i] = {
            ...next[i],
            status: 'done',
          };
          return next;
        });
      } catch (error) {
        console.error(error);
        setItems((prev) => {
          const next = [...prev];
          next[i] = {
            ...next[i],
            status: 'error',
            message: 'Failed to import',
          };
          return next;
        });
      }
    }

    showToast(`Imported ${imported} tracks${skipped ? `, skipped ${skipped}` : ''}.`);
  };

  const total = items.length || 1;
  const completed = items.filter((i) => i.status === 'done' || i.status === 'skipped').length;
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Upload music</h1>
        <p className="text-sm text-muted-foreground">
          Import MP3 files from your device. Metadata and artwork are extracted locally and stored in
          your browser.
        </p>
      </div>
      <UploadDropzone onFiles={handleFiles} />
      {items.length > 0 && (
        <section aria-label="Upload progress" className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Importing {items.length} file(s)</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ul className="max-h-56 space-y-1 overflow-y-auto text-xs">
            {items.map((item) => (
              <li key={item.fileName} className="flex items-center justify-between">
                <span className="truncate">{item.fileName}</span>
                <span
                  className={
                    item.status === 'done'
                      ? 'text-emerald-500'
                      : item.status === 'error'
                        ? 'text-red-500'
                        : item.status === 'skipped'
                          ? 'text-amber-500'
                          : 'text-muted-foreground'
                  }
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="text-xs text-muted-foreground">
        Tip: this app works entirely offline after import. Audio files and artwork stay on this
        device only.
      </p>
    </div>
  );
};
