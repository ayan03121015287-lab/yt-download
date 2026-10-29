import React, { useState } from 'react';
import { Search, Clipboard, X, ArrowRight, Loader2, PlayCircle, Sparkles } from 'lucide-react';

interface UrlInputBarProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
}

export const SAMPLE_VIDEOS = [
  {
    label: '4K Cinematic Nature',
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    type: '1080p / 4K',
  },
  {
    label: 'Lo-Fi Chill Beats',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    type: 'Audio / MP3',
  },
  {
    label: 'NASA Space Launch',
    url: 'https://www.youtube.com/watch?v=b4O67Mfvzcc',
    type: 'HD 60fps',
  },
  {
    label: 'YouTube Short',
    url: 'https://www.youtube.com/shorts/51s1M53o1_g',
    type: 'Short',
  },
];

export const UrlInputBar: React.FC<UrlInputBarProps> = ({
  url,
  setUrl,
  onSubmit,
  isLoading,
  error,
  onClear,
}) => {
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setUrl(text.trim());
          setPasteNotice('Link pasted!');
          setTimeout(() => setPasteNotice(null), 2000);
        } else {
          setPasteNotice('Clipboard is empty');
          setTimeout(() => setPasteNotice(null), 2000);
        }
      } else {
        setPasteNotice('Please press Ctrl+V / Cmd+V');
        setTimeout(() => setPasteNotice(null), 2000);
      }
    } catch {
      setPasteNotice('Press Ctrl+V to paste');
      setTimeout(() => setPasteNotice(null), 2000);
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
  };

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="relative group">
        <div className="relative flex items-center rounded-xl border border-slate-700/80 bg-slate-900/90 shadow-2xl shadow-rose-950/20 transition-all focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20">
          <div className="pl-4 pr-2 text-slate-400">
            <Search className="h-5 w-5" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube video or Shorts link here (e.g., https://www.youtube.com/watch?v=...)"
            disabled={isLoading}
            className="w-full bg-transparent py-4 pr-3 text-base text-white placeholder-slate-500 focus:outline-none"
          />

          <div className="flex items-center gap-1.5 pr-2">
            {url && (
              <button
                type="button"
                onClick={onClear}
                className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
                title="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handlePaste}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all whitespace-nowrap cursor-pointer"
            >
              <Clipboard className="h-3.5 w-3.5" />
              <span>{pasteNotice || 'Paste'}</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-600/30 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Fetch Video</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error notification */}
      {error && (
        <div className="mt-3 rounded-lg border border-rose-900/50 bg-rose-950/40 p-3 text-sm text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={onClear}
            className="text-xs text-rose-400 underline hover:text-rose-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick sample testing links & formats supported */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500">Try quick sample:</span>
          {SAMPLE_VIDEOS.map((sample) => (
            <button
              key={sample.url}
              type="button"
              onClick={() => handleSelectSample(sample.url)}
              className="hover:text-rose-400 underline underline-offset-2 transition-colors cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Zero-pill metadata for supported link formats */}
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <span>MP4 1080p</span>
          <span aria-hidden="true">·</span>
          <span>MP3 320kbps</span>
          <span aria-hidden="true">·</span>
          <span>YouTube Shorts</span>
          <span aria-hidden="true">·</span>
          <span>Subtitles</span>
        </div>
      </div>
    </div>
  );
};
