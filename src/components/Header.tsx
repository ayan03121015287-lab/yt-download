import React from 'react';
import { Download, Sparkles, Youtube } from 'lucide-react';

interface HeaderProps {
  onPasteClick: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onPasteClick, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark */}
        <a
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm shadow-rose-600/30 transition-transform group-hover:scale-105">
            <Youtube className="h-5 w-5" />
          </div>
          <span>
            Clip<span className="text-rose-500">Stream</span>
          </span>
        </a>

        {/* Zone 2: 4-5 single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('downloader')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left"
          >
            Video Downloader
          </button>
          <button
            onClick={() => onNavigate('audio-extractor')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left"
          >
            Audio Extractor
          </button>
          <button
            onClick={() => onNavigate('subtitles')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left"
          >
            Captions & Subs
          </button>
          <button
            onClick={() => onNavigate('history')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left"
          >
            Recent Downloads
          </button>
          <button
            onClick={() => onNavigate('guide')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left"
          >
            How to Use
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onPasteClick}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-600/20 hover:bg-rose-500 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Paste Link</span>
          </button>
        </div>
      </div>
    </header>
  );
};
