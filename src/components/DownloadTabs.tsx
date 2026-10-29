import React, { useState } from 'react';
import {
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  Scissors,
  Terminal,
  Download,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { VideoInfo, VideoFormat, CaptionTrack } from '../types';

interface DownloadTabsProps {
  video: VideoInfo;
  onStartDownload: (format: VideoFormat | { type: string; quality: string; format: string; filesizeEstimate?: string }) => void;
}

export const DownloadTabs: React.FC<DownloadTabsProps> = ({ video, onStartDownload }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'thumbnails' | 'captions' | 'trim' | 'cli'>('video');
  const [copiedCli, setCopiedCli] = useState(false);
  const [trimStart, setTrimStart] = useState('00:00');
  const [trimEnd, setTrimEnd] = useState(video.durationFormatted || '03:30');
  const [subFormat, setSubFormat] = useState<'srt' | 'vtt' | 'txt'>('srt');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleDownloadThumbnail = (quality: 'maxres' | 'hq' | 'mq') => {
    const filename = `${video.safeFilename}_${quality}_thumbnail.jpg`;
    const downloadUrl = `/api/download-thumbnail?id=${video.id}&quality=${quality}&filename=${encodeURIComponent(filename)}`;
    
    // Create temporary link and click
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    onStartDownload({
      type: 'thumbnail',
      quality: quality === 'maxres' ? '1080p Full HD' : quality === 'hq' ? '720p HD' : '480p Medium',
      format: 'JPG',
      filesizeEstimate: quality === 'maxres' ? '450 KB' : '220 KB',
    });
  };

  const handleDownloadSubtitle = (track: CaptionTrack) => {
    const filename = `${video.safeFilename}_${track.languageCode}_captions`;
    const downloadUrl = `/api/subtitles?baseUrl=${encodeURIComponent(track.baseUrl)}&format=${subFormat}&filename=${encodeURIComponent(filename)}`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${filename}.${subFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    onStartDownload({
      type: 'subtitles',
      quality: `${track.name} (${track.languageCode.toUpperCase()})`,
      format: subFormat.toUpperCase(),
      filesizeEstimate: '35 KB',
    });
  };

  const handleTrimDownload = () => {
    onStartDownload({
      type: 'video',
      quality: `Clip [${trimStart} - ${trimEnd}]`,
      format: 'MP4',
      filesizeEstimate: 'Calculated at download',
    });
  };

  const ytdlpCommand = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" "${video.url}"`;
  const ytdlpAudioCommand = `yt-dlp -x --audio-format mp3 --audio-quality 0 "${video.url}"`;

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
      {/* Interactive Tabs Header */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'video'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Film className="h-4 w-4" />
          <span>Video (MP4)</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'audio'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Music className="h-4 w-4" />
          <span>Audio (MP3)</span>
        </button>

        <button
          onClick={() => setActiveTab('thumbnails')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'thumbnails'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Covers & Thumbnails</span>
        </button>

        <button
          onClick={() => setActiveTab('captions')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'captions'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Captions ({video.captions?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('trim')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'trim'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Scissors className="h-4 w-4" />
          <span>Clip & Trim</span>
        </button>

        <button
          onClick={() => setActiveTab('cli')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'cli'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>yt-dlp CLI</span>
        </button>
      </div>

      {/* Tab Content 1: Video Formats */}
      {activeTab === 'video' && (
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 px-3 pb-1">
            <span>Resolution & Format</span>
            <div className="flex items-center gap-8">
              <span>Estimated Size</span>
              <span className="w-24 text-right">Action</span>
            </div>
          </div>

          {video.videoFormats.map((format) => (
            <div
              key={format.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 transition-all hover:border-slate-700 hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-rose-400 font-mono text-xs font-semibold">
                  {format.format}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{format.quality}</span>
                    {format.isPopular && (
                      <span className="text-[10px] text-rose-400 font-medium">Recommended</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono tabular-nums">
                    {format.resolution} · {format.fps}fps · {format.bitrate}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xs font-mono tabular-nums text-slate-300">
                  {format.filesizeEstimate || '~30 MB'}
                </span>
                <button
                  onClick={() => onStartDownload(format)}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-600/30 hover:bg-rose-500 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 2: Audio Formats */}
      {activeTab === 'audio' && (
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 px-3 pb-1">
            <span>Audio Bitrate & Encoding</span>
            <div className="flex items-center gap-8">
              <span>Estimated Size</span>
              <span className="w-24 text-right">Action</span>
            </div>
          </div>

          {video.audioFormats.map((format) => (
            <div
              key={format.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 transition-all hover:border-slate-700 hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-amber-400 font-mono text-xs font-semibold">
                  {format.format}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{format.quality}</span>
                    {format.isPopular && (
                      <span className="text-[10px] text-amber-400 font-medium">Studio Master</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono tabular-nums">
                    {format.audioBitrate} · High Fidelity MP3 Stereo
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xs font-mono tabular-nums text-slate-300">
                  {format.filesizeEstimate}
                </span>
                <button
                  onClick={() => onStartDownload(format)}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-amber-600/30 hover:bg-amber-500 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Extract MP3</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 3: Thumbnails */}
      {activeTab === 'thumbnails' && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-400">
            Download the original uncompressed YouTube cover artwork in full resolution for posters, wallpapers, or editing:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Full HD MaxRes</span>
                <span className="block text-[11px] font-mono text-slate-400 mt-0.5">1920 × 1080 px</span>
              </div>
              <button
                onClick={() => handleDownloadThumbnail('maxres')}
                className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 py-2 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save 1080p JPG</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-white">High Quality HQ</span>
                <span className="block text-[11px] font-mono text-slate-400 mt-0.5">1280 × 720 px</span>
              </div>
              <button
                onClick={() => handleDownloadThumbnail('hq')}
                className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 py-2 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save 720p JPG</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Standard MQ</span>
                <span className="block text-[11px] font-mono text-slate-400 mt-0.5">640 × 480 px</span>
              </div>
              <button
                onClick={() => handleDownloadThumbnail('mq')}
                className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 py-2 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save 480p JPG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Captions & Subtitles */}
      {activeTab === 'captions' && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Select subtitle format:
            </p>
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg">
              {(['srt', 'vtt', 'txt'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSubFormat(fmt)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                    subFormat === fmt
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  .{fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {video.captions && video.captions.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {video.captions.map((track) => (
                <div
                  key={track.baseUrl + track.languageCode}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3 transition-colors hover:border-slate-700"
                >
                  <div>
                    <span className="text-sm font-medium text-white">{track.name}</span>
                    <span className="block text-xs font-mono text-slate-400 uppercase">
                      Code: {track.languageCode}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownloadSubtitle(track)}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download .{subFormat.toUpperCase()}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-400">
              No embedded captions track found for this video. You can download the video/audio and auto-transcribe.
            </div>
          )}
        </div>
      )}

      {/* Tab Content 5: Clip & Trim Tool */}
      {activeTab === 'trim' && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-400">
            Select custom start and end time marks to download only the highlighted portion of the video:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Start Time (MM:SS)
              </label>
              <input
                type="text"
                value={trimStart}
                onChange={(e) => setTrimStart(e.target.value)}
                placeholder="00:00"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                End Time (MM:SS)
              </label>
              <input
                type="text"
                value={trimEnd}
                onChange={(e) => setTrimEnd(e.target.value)}
                placeholder={video.durationFormatted}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleTrimDownload}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-rose-600/30 hover:bg-rose-500 transition-all cursor-pointer"
          >
            <Scissors className="h-4 w-4" />
            <span>Process & Download Clip ({trimStart} to {trimEnd})</span>
          </button>
        </div>
      )}

      {/* Tab Content 6: yt-dlp CLI Tool */}
      {activeTab === 'cli' && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-400">
            For advanced users who prefer downloading directly in terminal with 4K / 8K resolution and lossless bitrate:
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Best Video + Audio (MP4)</span>
                <button
                  onClick={() => copyToClipboard(ytdlpCommand)}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  {copiedCli ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCli ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-rose-300 overflow-x-auto">
                {ytdlpCommand}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Lossless Audio Extraction (MP3 320k)</span>
                <button
                  onClick={() => copyToClipboard(ytdlpAudioCommand)}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  {copiedCli ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCli ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-amber-300 overflow-x-auto">
                {ytdlpAudioCommand}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
