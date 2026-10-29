import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VideoFormat {
  id: string;
  quality: string;
  format: string;
  resolution: string;
  type: 'video' | 'audio';
  fps?: number;
  bitrate?: string;
  filesizeEstimate?: string;
  audioBitrate?: string;
  isPopular?: boolean;
}

// Extract YouTube ID from various URL patterns
export function extractVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  // If user pasted just the 11 character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  const patterns = [
    /(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i,
  ];

  for (const regex of patterns) {
    const match = cleanUrl.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatViews(views: number): string {
  if (!views || isNaN(views)) return 'N/A';
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B views`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  return `${views.toLocaleString()} views`;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API 1: Fetch YouTube video information
  app.get('/api/video-info', async (req: Request, res: Response): Promise<void> => {
    try {
      const rawUrl = req.query.url as string;
      if (!rawUrl) {
        res.status(400).json({ error: 'YouTube URL or Video ID is required' });
        return;
      }

      const videoId = extractVideoId(rawUrl);
      if (!videoId) {
        res.status(400).json({
          error: 'Invalid YouTube link. Please provide a valid YouTube watch, shorts, or share link.'
        });
        return;
      }

      const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // 1. Fetch oEmbed metadata
      let oembedData: { title?: string; author_name?: string; author_url?: string; thumbnail_url?: string } = {};
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(standardUrl)}&format=json`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (oembedRes.ok) {
          oembedData = await oembedRes.json();
        }
      } catch (err) {
        console.warn('oEmbed fetch error:', (err as Error).message);
      }

      // 2. Fetch page HTML for deeper metadata (duration, views, captions, etc.)
      let approxDuration = 0;
      let viewCount = 0;
      let publishedDate = '';
      let descriptionSnippet = '';
      let isShort = rawUrl.includes('/shorts/');
      let captionTracks: Array<{ languageCode: string; name: string; baseUrl: string }> = [];

      try {
        const pageRes = await fetch(standardUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: AbortSignal.timeout(6000),
        });

        if (pageRes.ok) {
          const html = await pageRes.text();

          // Extract ytInitialPlayerResponse
          const matchPlayer = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});(?:var|<\/script)/s);
          if (matchPlayer) {
            try {
              const playerJson = JSON.parse(matchPlayer[1]);
              const details = playerJson.videoDetails;
              if (details) {
                if (details.lengthSeconds) approxDuration = parseInt(details.lengthSeconds, 10);
                if (details.viewCount) viewCount = parseInt(details.viewCount, 10);
                if (details.shortDescription) descriptionSnippet = details.shortDescription.slice(0, 300);
                if (!oembedData.title && details.title) oembedData.title = details.title;
                if (!oembedData.author_name && details.author) oembedData.author_name = details.author;
              }

              // Extract captions
              const captionsList =
                playerJson.captions?.playerCaptionsTracklistRenderer?.captionTracks;
              if (Array.isArray(captionsList)) {
                captionTracks = captionsList.map((c: any) => ({
                  languageCode: c.languageCode || 'en',
                  name: c.name?.simpleText || c.name?.runs?.[0]?.text || c.languageCode || 'English',
                  baseUrl: c.baseUrl || '',
                }));
              }
            } catch (e) {
              console.warn('Could not parse player json:', (e as Error).message);
            }
          }

          // Fallback duration extraction from microformat
          if (!approxDuration) {
            const durationMatch = html.match(/"approxDurationMs":"(\d+)"/);
            if (durationMatch) {
              approxDuration = Math.round(parseInt(durationMatch[1], 10) / 1000);
            }
          }

          // Fallback view count
          if (!viewCount) {
            const viewsMatch = html.match(/"viewCount":"(\d+)"/);
            if (viewsMatch) {
              viewCount = parseInt(viewsMatch[1], 10);
            }
          }

          // Published date
          const dateMatch = html.match(/"publishDate":"([^"]+)"/) || html.match(/"uploadDate":"([^"]+)"/);
          if (dateMatch) {
            publishedDate = dateMatch[1];
          }
        }
      } catch (err) {
        console.warn('Page fetch metadata error:', (err as Error).message);
      }

      const title = oembedData.title || `YouTube Video (${videoId})`;
      const author = oembedData.author_name || 'YouTube Creator';
      const authorUrl = oembedData.author_url || `https://www.youtube.com/channel/${videoId}`;

      // Calculate estimate file sizes based on duration (or default 3.5 mins if unknown)
      const durationSecs = approxDuration || 210;

      // Bitrate in kbps -> MB: (kbps * seconds) / (8 * 1024)
      const calcSize = (videoBitrateKbps: number, audioBitrateKbps = 128) => {
        const totalKbps = videoBitrateKbps + audioBitrateKbps;
        const mb = (totalKbps * durationSecs) / 8192;
        return `${mb.toFixed(1)} MB`;
      };

      const calcAudioSize = (audioBitrateKbps: number) => {
        const mb = (audioBitrateKbps * durationSecs) / 8192;
        return `${mb.toFixed(1)} MB`;
      };

      // Comprehensive standard formats
      const videoFormats: VideoFormat[] = [
        {
          id: 'mp4-1080p',
          quality: '1080p Full HD',
          format: 'MP4',
          resolution: '1920x1080',
          type: 'video',
          fps: 60,
          bitrate: '4.5 Mbps',
          filesizeEstimate: calcSize(4500, 160),
          isPopular: true,
        },
        {
          id: 'mp4-720p',
          quality: '720p HD',
          format: 'MP4',
          resolution: '1280x720',
          type: 'video',
          fps: 60,
          bitrate: '2.5 Mbps',
          filesizeEstimate: calcSize(2500, 128),
          isPopular: true,
        },
        {
          id: 'mp4-480p',
          quality: '480p SD',
          format: 'MP4',
          resolution: '854x480',
          type: 'video',
          fps: 30,
          bitrate: '1.2 Mbps',
          filesizeEstimate: calcSize(1200, 128),
        },
        {
          id: 'mp4-360p',
          quality: '360p Mobile',
          format: 'MP4',
          resolution: '640x360',
          type: 'video',
          fps: 30,
          bitrate: '700 Kbps',
          filesizeEstimate: calcSize(700, 96),
        },
      ];

      const audioFormats: VideoFormat[] = [
        {
          id: 'mp3-320',
          quality: 'HQ Audio 320 kbps',
          format: 'MP3',
          resolution: 'Audio',
          type: 'audio',
          audioBitrate: '320 kbps',
          filesizeEstimate: calcAudioSize(320),
          isPopular: true,
        },
        {
          id: 'mp3-192',
          quality: 'Standard Audio 192 kbps',
          format: 'MP3',
          resolution: 'Audio',
          type: 'audio',
          audioBitrate: '192 kbps',
          filesizeEstimate: calcAudioSize(192),
        },
        {
          id: 'm4a-128',
          quality: 'Apple M4A / AAC',
          format: 'M4A',
          resolution: 'Audio',
          type: 'audio',
          audioBitrate: '128 kbps',
          filesizeEstimate: calcAudioSize(128),
        },
      ];

      // Clean title for file naming
      const safeFilename = title.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 100);

      // Helper external one-click download URLs
      const downloadMirrors = {
        savefrom: `https://en.savefrom.net/1-youtube-video-downloader-395/?url=${encodeURIComponent(standardUrl)}`,
        y2mate: `https://www.y2mate.com/youtube/${videoId}`,
        ssyoutube: `https://ssyoutube.com/en105/youtube-video-downloader?url=${encodeURIComponent(standardUrl)}`,
        cobalt: `https://cobalt.tools/`,
        tenDownloader: `https://10downloader.com/download?v=${encodeURIComponent(standardUrl)}`,
      };

      res.json({
        id: videoId,
        title,
        safeFilename,
        author,
        authorUrl,
        duration: approxDuration,
        durationFormatted: formatDuration(approxDuration),
        views: viewCount,
        viewsFormatted: formatViews(viewCount),
        publishedDate: publishedDate || undefined,
        description: descriptionSnippet,
        isShort,
        url: standardUrl,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        thumbnails: {
          maxres: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          hq: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          mq: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          default: `https://i.ytimg.com/vi/${videoId}/default.jpg`,
        },
        videoFormats,
        audioFormats,
        captions: captionTracks,
        mirrors: downloadMirrors,
      });
    } catch (err: any) {
      console.error('Video info error:', err);
      res.status(500).json({
        error: 'Failed to process YouTube link. Please check the URL and try again.',
        details: err?.message || String(err),
      });
    }
  });

  // API 2: Proxy thumbnail download with attachment header
  app.get('/api/download-thumbnail', async (req: Request, res: Response): Promise<void> => {
    try {
      const videoId = req.query.id as string;
      const quality = (req.query.quality as string) || 'maxres';
      const filename = (req.query.filename as string) || `${videoId}_thumbnail.jpg`;

      if (!videoId) {
        res.status(400).json({ error: 'Video ID is required' });
        return;
      }

      const thumbUrl =
        quality === 'maxres'
          ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
          : quality === 'hq'
          ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          : `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

      const response = await fetch(thumbUrl);
      if (!response.ok) {
        // Fallback to hqdefault if maxres doesn't exist
        const fallback = await fetch(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
        if (!fallback.ok) {
          res.status(404).send('Thumbnail not found');
          return;
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        const buffer = await fallback.arrayBuffer();
        res.send(Buffer.from(buffer));
        return;
      }

      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error('Thumbnail proxy error:', err);
      res.status(500).send('Error downloading thumbnail');
    }
  });

  // API 3: Download Subtitles in SRT, VTT, or TXT
  app.get('/api/subtitles', async (req: Request, res: Response): Promise<void> => {
    try {
      const { baseUrl, format = 'srt', filename = 'subtitles' } = req.query;
      if (!baseUrl || typeof baseUrl !== 'string') {
        res.status(400).json({ error: 'baseUrl is required' });
        return;
      }

      // Fetch timedtext XML from YouTube
      const subRes = await fetch(baseUrl);
      if (!subRes.ok) {
        res.status(502).json({ error: 'Could not retrieve subtitles from YouTube' });
        return;
      }

      const xmlText = await subRes.text();

      // Parse XML <text start="1.23" dur="4.56">...</text>
      const regex = /<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/gi;
      let match;
      let index = 1;
      let srtContent = '';
      let vttContent = 'WEBVTT\n\n';
      let txtContent = '';

      const formatTimeSRT = (sec: number) => {
        const ms = Math.floor((sec % 1) * 1000);
        const s = Math.floor(sec) % 60;
        const m = Math.floor(sec / 60) % 60;
        const h = Math.floor(sec / 3600);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
      };

      const formatTimeVTT = (sec: number) => {
        const ms = Math.floor((sec % 1) * 1000);
        const s = Math.floor(sec) % 60;
        const m = Math.floor(sec / 60) % 60;
        const h = Math.floor(sec / 3600);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
      };

      const cleanHtml = (str: string) => {
        return str
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
      };

      while ((match = regex.exec(xmlText)) !== null) {
        const start = parseFloat(match[1]);
        const dur = match[2] ? parseFloat(match[2]) : 3.0;
        const end = start + dur;
        const text = cleanHtml(match[3]);

        srtContent += `${index}\n${formatTimeSRT(start)} --> ${formatTimeSRT(end)}\n${text}\n\n`;
        vttContent += `${formatTimeVTT(start)} --> ${formatTimeVTT(end)}\n${text}\n\n`;
        txtContent += `${text}\n`;
        index++;
      }

      const outFormat = (format as string).toLowerCase();
      if (outFormat === 'vtt') {
        res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.vtt"`);
        res.send(vttContent);
      } else if (outFormat === 'txt') {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
        res.send(txtContent);
      } else {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.srt"`);
        res.send(srtContent);
      }
    } catch (err: any) {
      console.error('Subtitle error:', err);
      res.status(500).json({ error: 'Subtitle extraction failed', details: err?.message });
    }
  });

  // In development, mount Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClipStream server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
