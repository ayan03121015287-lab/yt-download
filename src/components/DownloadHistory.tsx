import React from 'react';
import { History, Trash2, ArrowUpRight, Film, Music, Download } from 'lucide-react';
import { DownloadHistoryItem } from '../types';

interface DownloadHistoryProps {
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
  onSelectVideo: (url: string) => void;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({
  history,
  onClearHistory,
  onSelectVideo,
}) => {
  const formatTimeAgo = (timestamp: number) => {
    const elapsed = Date.now() - timestamp;
    const minutes = Math.floor(elapsed / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div id="history" className="w-full space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-rose-500" />
          <h2 className="text-base font-semibold text-white">Recent Downloads</h2>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            ({history.length})
          </span>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
          No downloaded videos in this session yet. Paste a link above to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3 hover:border-slate-700 hover:bg-slate-800/40 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.thumbnail}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-12 w-16 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-medium text-white truncate max-w-[220px]">
                    {item.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    <span className="text-rose-400">{item.format}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.quality}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatTimeAgo(item.downloadedAt)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectVideo(item.url)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Open again"
              >
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
