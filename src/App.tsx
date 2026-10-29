/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Film,
  Music,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { Header } from './components/Header';
import { UrlInputBar, SAMPLE_VIDEOS } from './components/UrlInputBar';
import { VideoResultCard } from './components/VideoResultCard';
import { DownloadProgressModal } from './components/DownloadProgressModal';
import { DownloadHistory } from './components/DownloadHistory';
import { HowToAndFaq } from './components/HowToAndFaq';
import { VideoInfo, VideoFormat, DownloadHistoryItem } from './types';

export default function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('clipstream_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load history', e);
    }
  }, []);

  const saveHistoryItem = (item: DownloadHistoryItem) => {
    try {
      const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 15);
      setHistory(updated);
      localStorage.setItem('clipstream_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('clipstream_history');
    } catch (e) {
      console.warn('Failed to clear history', e);
    }
  };

  const fetchVideoDetails = async (videoUrlToFetch?: string) => {
    const targetUrl = videoUrlToFetch || url;
    if (!targetUrl.trim()) {
      setError('Please enter or paste a valid YouTube video link');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/video-info?url=${encodeURIComponent(targetUrl.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch video details');
      }

      setVideoInfo(data);

      // Scroll smoothly to the result card on desktop/mobile
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Fetch video error:', err);
      setError(err?.message || 'Could not fetch video. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchVideoDetails();
  };

  const handleStartDownload = (format: VideoFormat | { type: string; quality: string; format: string; filesizeEstimate?: string }) => {
    setSelectedFormat(format);
    setIsModalOpen(true);

    if (videoInfo) {
      const historyItem: DownloadHistoryItem = {
        id: `${videoInfo.id}-${Date.now()}`,
        videoId: videoInfo.id,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnails.mq || videoInfo.thumbnails.hq,
        format: format.format,
        quality: format.quality,
        filesize: format.filesizeEstimate || '~35 MB',
        downloadedAt: Date.now(),
        url: videoInfo.url,
      };
      saveHistoryItem(historyItem);
    }
  };

  const handlePasteInHeader = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setUrl(text.trim());
          fetchVideoDetails(text.trim());
          return;
        }
      }
    } catch (e) {
      console.warn('Clipboard read error', e);
    }
    // Fallback: focus input bar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'downloader') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'audio-extractor') {
      if (!videoInfo) {
        // Load the sample lo-fi audio track to showcase
        setUrl(SAMPLE_VIDEOS[1].url);
        fetchVideoDetails(SAMPLE_VIDEOS[1].url);
      } else {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSelectFromHistory = (historyUrl: string) => {
    setUrl(historyUrl);
    fetchVideoDetails(historyUrl);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Top Bar Contract (3 zones) */}
      <Header onPasteClick={handlePasteInHeader} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/50 via-slate-950 to-slate-950 pb-16 pt-12 sm:pb-20 sm:pt-16">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[380px] w-[700px] -translate-y-1/2 rounded-full bg-rose-600/10 blur-[120px] pointer-events-none" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15] text-balance">
                Download YouTube Videos & Audio in <span className="text-rose-500">1080p Full HD</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Paste any YouTube video or Shorts link below to convert and save video in high-definition MP4, extract 320 kbps MP3 audio, or download original thumbnail artwork.
              </p>
            </div>

            {/* Input Bar Component */}
            <div className="mt-8 max-w-3xl mx-auto">
              <UrlInputBar
                url={url}
                setUrl={setUrl}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
                onClear={() => {
                  setUrl('');
                  setError(null);
                }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Result Section or Hero Showcase */}
        <div ref={resultRef} className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {videoInfo ? (
            <VideoResultCard video={videoInfo} onStartDownload={handleStartDownload} />
          ) : (
            /* Empty State / Feature Grid with Generated Media Asset Banner */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden shadow-2xl">
              <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden bg-slate-900">
                <img
                  src="/src/assets/images/media_downloader_banner_1793277322416.jpg"
                  alt="ClipStream Studio Media Downloader"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-rose-400 mb-1">
                    <span>Universal YouTube Media Engine</span>
                    <span aria-hidden="true">·</span>
                    <span>No Watermark</span>
                    <span aria-hidden="true">·</span>
                    <span>Unlimited Downloads</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Paste any YouTube video or Shorts link above to unlock high-speed formats
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80 bg-slate-950/60 p-4">
                <div className="p-4 space-y-1.5">
                  <span className="text-xs font-semibold text-white">Full HD 1080p & 60fps</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Crisp high-definition video playback with synced stereo audio tracks.
                  </p>
                </div>
                <div className="p-4 space-y-1.5">
                  <span className="text-xs font-semibold text-white">Studio 320 kbps MP3</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Instant lossless audio extraction for playlists, podcasts, and songs.
                  </p>
                </div>
                <div className="p-4 space-y-1.5">
                  <span className="text-xs font-semibold text-white">Captions & 1080p Covers</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Download .SRT subtitle transcripts and uncompressed thumbnail imagery.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Download History Section */}
          <DownloadHistory
            history={history}
            onClearHistory={handleClearHistory}
            onSelectVideo={handleSelectFromHistory}
          />

          {/* How to & FAQ Section */}
          <HowToAndFaq />
        </div>
      </main>

      {/* Download Progress & Save Modal */}
      <DownloadProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        video={videoInfo}
        selectedFormat={selectedFormat}
      />

      {/* Clean Footer (Anti-Slop rule: No fake telemetry tickers) */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">ClipStream</span>
            <span aria-hidden="true">·</span>
            <span>YouTube Video & Audio Downloader</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Free Web Tool</span>
            <span aria-hidden="true">·</span>
            <span>Safe & Secure</span>
            <span aria-hidden="true">·</span>
            <span>All rights belong to respective content owners</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
