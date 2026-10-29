import React, { useState } from 'react';
import {
  Play,
  Eye,
  Calendar,
  ExternalLink,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';
import { VideoInfo, VideoFormat } from '../types';
import { DownloadTabs } from './DownloadTabs';

interface VideoResultCardProps {
  video: VideoInfo;
  onStartDownload: (format: VideoFormat | { type: string; quality: string; format: string; filesizeEstimate?: string }) => void;
}

export const VideoResultCard: React.FC<VideoResultCardProps> = ({ video, onStartDownload }) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  return (
    <div className="w-full space-y-6">
      {/* Main Video Overview Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Thumbnail or Embedded Player */}
          <div className="lg:col-span-5 w-full">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800 shadow-inner group">
              {isPlayingPreview ? (
                <iframe
                  src={`${video.embedUrl}?autoplay=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <>
                  <img
                    src={video.thumbnails.maxres || video.thumbnails.hq}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback to HQ if maxres fails
                      (e.currentTarget as HTMLImageElement).src = video.thumbnails.hq;
                    }}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Measured Scrim for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Duration overlay badge */}
                  {video.durationFormatted && (
                    <div className="absolute bottom-3 right-3 rounded bg-black/85 px-2 py-0.5 text-xs font-mono font-medium text-white shadow">
                      {video.durationFormatted}
                    </div>
                  )}

                  {/* Play preview trigger button */}
                  <button
                    onClick={() => setIsPlayingPreview(true)}
                    className="absolute inset-0 flex items-center justify-center transition-opacity hover:opacity-100 cursor-pointer"
                    title="Play Preview"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600/90 text-white shadow-lg shadow-rose-600/40 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95">
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Preview Toggle button */}
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                {isPlayingPreview ? '← Switch to static cover' : '▶ Click to preview player'}
              </button>

              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-rose-400 transition-colors"
              >
                <span>Open on YouTube</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Right Column: Video Details & Quick Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
            <div>
              {/* Unboxed Metadata Line (Zero-Pill Rule) */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2 font-mono">
                <span className="text-rose-400 font-semibold">
                  {video.isShort ? 'YouTube Short' : 'YouTube Video'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 tabular-nums">
                  <Clock className="h-3 w-3 text-slate-500" />
                  {video.durationFormatted}
                </span>
                {video.viewsFormatted && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{video.viewsFormatted}</span>
                  </>
                )}
                {video.publishedDate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{video.publishedDate}</span>
                  </>
                )}
              </div>

              {/* Title with balance constraint */}
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-2 leading-snug">
                {video.title}
              </h1>

              {/* Author / Channel */}
              <div className="mt-2.5 flex items-center gap-2 text-sm text-slate-300">
                <User className="h-4 w-4 text-rose-500" />
                <a
                  href={video.authorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-white hover:underline transition-colors"
                >
                  {video.author}
                </a>
              </div>

              {/* Description preview snippet */}
              {video.description && (
                <p className="mt-3 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {video.description}
                </p>
              )}
            </div>

            {/* Quick 1-Click Action Buttons */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium block mb-2">
                Quick Download Options:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    onStartDownload(
                      video.videoFormats[0] || {
                        type: 'video',
                        quality: '1080p Full HD',
                        format: 'MP4',
                        filesizeEstimate: '~45 MB',
                      }
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-600/30 hover:bg-rose-500 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download 1080p MP4</span>
                </button>

                <button
                  onClick={() =>
                    onStartDownload(
                      video.audioFormats[0] || {
                        type: 'audio',
                        quality: '320 kbps High Quality',
                        format: 'MP3',
                        filesizeEstimate: '~8 MB',
                      }
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Extract 320k MP3</span>
                </button>

                <a
                  href={video.mirrors.savefrom}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  <span>Direct Web Portal</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Format Download Tabs Hub */}
      <DownloadTabs video={video} onStartDownload={onStartDownload} />
    </div>
  );
};
