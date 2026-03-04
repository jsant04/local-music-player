import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { TopBar } from './components/TopBar';
import { PlayerBar } from './components/PlayerBar';
import { QueueDrawer } from './components/QueueDrawer';
import { UploadPage } from './pages/Upload';
import { SongsPage } from './pages/Songs';
import { PlaylistsPage } from './pages/Playlists';
import { PlaylistDetailPage } from './pages/PlaylistDetail';
import { NowPlayingPage } from './pages/NowPlaying';
import { PlayerProvider } from './hooks/usePlayer';
import { ToastProvider } from './components/ToastProvider';

const App: React.FC = () => {
  const [queueOpen, setQueueOpen] = useState(false);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(true);

  return (
    <BrowserRouter>
      <ToastProvider>
        <PlayerProvider>
          {/* 3-panel streaming layout: sidebar | main feed | now playing */}
          <div className="flex h-screen flex-col bg-[#090909]">
            {/* Mobile header */}
            <div className="lg:hidden">
              <TopBar />
            </div>
            
            {/* Main container with 3-panel layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left sidebar - navigation */}
              <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/5 lg:bg-[#0a0a0a]">
                <TopBar />
              </aside>

              {/* Center panel - main content feed */}
              <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4 lg:pb-28">
                <Routes>
                  <Route path="/" element={<Navigate to="/songs" replace />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/songs" element={<SongsPage />} />
                  <Route path="/playlists" element={<PlaylistsPage />} />
                  <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
                  <Route path="/now-playing" element={<NowPlayingPage />} />
                  <Route path="*" element={<Navigate to="/songs" replace />} />
                </Routes>
              </main>

              {/* Right panel - Now Playing (desktop only, collapsible) */}
              <aside
                className={`hidden lg:flex lg:flex-col lg:border-l lg:border-white/5 lg:bg-[#0a0a0a] transition-all duration-300 ${
                  nowPlayingOpen ? 'lg:w-80' : 'lg:w-0 lg:overflow-hidden'
                }`}
              >
                {nowPlayingOpen && (
                  <div className="flex h-full flex-col p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold">Now Playing</h2>
                      <button
                        type="button"
                        onClick={() => setNowPlayingOpen(false)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                        aria-label="Close now playing panel"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <NowPlayingPage compact />
                    </div>
                  </div>
                )}
              </aside>
            </div>

            {/* Bottom sticky player bar */}
            <PlayerBar 
              onToggleQueue={() => setQueueOpen((v) => !v)} 
              onToggleNowPlaying={() => setNowPlayingOpen((v) => !v)}
              nowPlayingOpen={nowPlayingOpen}
            />
            
            {/* Queue drawer (mobile/tablet) */}
            <QueueDrawer open={queueOpen} onClose={() => setQueueOpen(false)} />
          </div>
        </PlayerProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
