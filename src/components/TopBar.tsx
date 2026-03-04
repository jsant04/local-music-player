import { Link, NavLink } from 'react-router-dom';
import React from 'react';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
      ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border-l-2 border-purple-500'
      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
  }`;

export const TopBar: React.FC = () => {
  return (
    <header className="flex h-full flex-col border-b border-white/5 bg-[#0a0a0a] p-4 lg:border-b-0">
      {/* Logo */}
      <Link to="/songs" className="mb-6 flex items-center gap-3 lg:mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 text-lg font-bold text-white shadow-glow">
          ♪
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight">Audify</span>
          <span className="text-xs text-muted-foreground">Stream & Enjoy</span>
        </div>
      </Link>
      
      {/* Navigation - vertical on desktop, horizontal on mobile */}
      <nav className="no-scrollbar flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
        <NavLink to="/songs" className={navLinkClass}>
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="whitespace-nowrap max-[390px]:hidden">Home</span>
        </NavLink>
        
        <NavLink to="/playlists" className={navLinkClass}>
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="whitespace-nowrap max-[390px]:hidden">Playlists</span>
        </NavLink>
        
        <NavLink to="/upload" className={navLinkClass}>
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="whitespace-nowrap max-[390px]:hidden">Upload</span>
        </NavLink>
        
        <NavLink to="/now-playing" className={navLinkClass}>
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span className="whitespace-nowrap max-[390px]:hidden">Now Playing</span>
        </NavLink>
      </nav>
    </header>
  );
};
