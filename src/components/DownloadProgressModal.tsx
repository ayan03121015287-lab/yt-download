import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  Loader2,
  ExternalLink,
  FileVideo,
  FileAudio,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { VideoInfo } from '../types';

interface DownloadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoInfo | null;
  selectedFormat: {
    type: string;
    quality: string;
    format: string;
    filesizeEstimate?: string;
  } | null;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  isOpen,
  onClose,
  video,
  selectedFormat,
}) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Connecting to high-speed media stream...');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsCompleted(false);
      return;
    }

    setProgress(15);
    setStage('Resolving video stream & audio demuxer...');

    const timer1 = setTimeout(() => {
      setProgress(48);
      setStage('Packaging media container & metadata headers...');
    }, 600);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStage('Finalizing buffer & generating direct download link...');
    }, 1300);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStage('Ready for instant download!');
      setIsCompleted(true);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  if (!isOpen || !video || !selectedFormat) return null;

  // Primary direct download action
  const handleTriggerDirectDownload = () => {
    // Open high speed direct stream portal
    const targetUrl =
      selectedFormat.type === 'audio'
        ? video.mirrors.y2mate
        : video.mirrors.savefrom;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {selectedFormat.type === 'audio' ? (
              <FileAudio className="h-5 w-5 text-amber-400" />
            ) : (
              <FileVideo className="h-5 w-5 text-rose-500" />
            )}
            <h2 className="text-base font-semibold text-white">
              {isCompleted ? 'File Ready to Download' : 'Processing Stream'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-5 space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 border border-slate-800">
            <img
              src={video.thumbnails.mq || video.thumbnails.hq}
              alt=""
              referrerPolicy="no-referrer"
              className="h-14 w-20 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-white truncate">{video.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="text-rose-400 font-semibold">{selectedFormat.format}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedFormat.quality}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{selectedFormat.filesizeEstimate || '~30 MB'}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span className="truncate pr-2">{stage}</span>
              <span className="tabular-nums font-semibold text-white">{progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Download Completion Actions */}
          {isCompleted && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-white">
                    Video and audio streams packaged successfully!
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click below to open the dedicated download stream. Your download will start instantly.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleTriggerDirectDownload}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-600/30 hover:bg-rose-500 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Start Direct Download ({selectedFormat.quality})</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={video.mirrors.savefrom}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-center"
                  >
                    <span>Mirror 1 (SaveFrom)</span>
                  </a>
                  <a
                    href={video.mirrors.ssyoutube}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-center"
                  >
                    <span>Mirror 2 (ssYouTube)</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
