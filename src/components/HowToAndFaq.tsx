import React, { useState } from 'react';
import { Copy, Sparkles, Check, ChevronDown, ChevronUp, Zap, Shield, FileCheck, Layers } from 'lucide-react';

export const HowToAndFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Can I download YouTube Shorts and 60fps videos?',
      a: 'Yes! ClipStream fully supports regular YouTube videos, Shorts, 60fps HD content, and premiere links. Simply copy the link from your browser or mobile YouTube app and paste it.',
    },
    {
      q: 'How do I extract only the audio (MP3) from a YouTube video?',
      a: 'After pasting your video URL, click on the "Audio (MP3)" tab. You can choose from Studio 320 kbps high-fidelity, 192 kbps standard, or Apple AAC M4A formats for instant extraction.',
    },
    {
      q: 'What is the "ss" URL shortcut trick?',
      a: 'You can insert "ss" before "youtube.com" in your browser address bar (e.g., https://www.ssyoutube.com/watch?v=...) to quickly download any video without copying and pasting manually!',
    },
    {
      q: 'Can I download subtitles and closed captions?',
      a: 'Yes, if the creator uploaded or YouTube generated captions, ClipStream allows you to download them in .SRT, .VTT, or plain .TXT format with synced timestamps.',
    },
    {
      q: 'Is there a limit on video duration or file size?',
      a: 'No, ClipStream has no artificial length limits. Whether it is a 15-second Short or a 3-hour podcast, you can fetch formats and download seamlessly.',
    },
  ];

  return (
    <div id="guide" className="w-full space-y-12 pt-6">
      {/* 3-Step Guide */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl font-bold tracking-tight text-white">
            How to Download YouTube Videos in 3 Simple Steps
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Fast, free, and no software installation required. Works on all desktop and mobile browsers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/20 text-rose-400 font-mono text-xs font-bold">
              01
            </div>
            <h3 className="text-sm font-semibold text-white">Copy the Video Link</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open YouTube, find the video or Short you wish to save, and copy its link from the address bar or via the Share button.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/20 text-rose-400 font-mono text-xs font-bold">
              02
            </div>
            <h3 className="text-sm font-semibold text-white">Paste URL into ClipStream</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste the link into the search box above. ClipStream instantly analyzes the stream, extracts cover art, and prepares format options.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/20 text-rose-400 font-mono text-xs font-bold">
              03
            </div>
            <h3 className="text-sm font-semibold text-white">Select Format & Save</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick your preferred video quality (1080p, 720p) or audio format (MP3 320k) and click Download to save the file to your device.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
          <Zap className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-white">High-Speed Processing</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Ultra-fast stream parsing with zero waiting queues.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
          <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-white">Clean & Safe</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">No malware, no spyware, and no mandatory app installs.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
          <FileCheck className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-white">Multi-Format Suite</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">MP4, MP3, M4A, WEBM, SRT subtitles, and 1080p thumbnails.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
          <Layers className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-white">Full Device Support</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Works on Windows, macOS, Linux, iOS Safari, and Android.</p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs font-medium text-white hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
