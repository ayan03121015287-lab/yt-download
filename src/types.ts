export interface VideoFormat {
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

export interface CaptionTrack {
  languageCode: string;
  name: string;
  baseUrl: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  safeFilename: string;
  author: string;
  authorUrl: string;
  duration: number;
  durationFormatted: string;
  views: number;
  viewsFormatted: string;
  publishedDate?: string;
  description: string;
  isShort: boolean;
  url: string;
  embedUrl: string;
  thumbnails: {
    maxres: string;
    hq: string;
    mq: string;
    default: string;
  };
  videoFormats: VideoFormat[];
  audioFormats: VideoFormat[];
  captions: CaptionTrack[];
  mirrors: {
    savefrom: string;
    y2mate: string;
    ssyoutube: string;
    cobalt: string;
    tenDownloader: string;
  };
}

export interface DownloadHistoryItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  format: string;
  quality: string;
  filesize: string;
  downloadedAt: number;
  url: string;
}
