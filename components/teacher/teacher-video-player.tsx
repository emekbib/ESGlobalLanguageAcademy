'use client';

import { useState } from 'react';
import { Play, AlertCircle } from 'lucide-react';

type TeacherVideoPlayerProps = {
  url: string;
  poster?: string;
  teacherName?: string;
};

function parseVideoSource(url: string): {
  type: 'youtube' | 'vimeo' | 'mp4';
  src: string;
} {
  if (!url) return { type: 'mp4', src: '' };

  const trimmed = url.trim();

  // YouTube detection
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo detection
  const vimeoMatch = trimmed.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i,
  );
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`,
    };
  }

  // Direct video file (MP4, WebM, or Supabase Storage URL)
  return {
    type: 'mp4',
    src: trimmed,
  };
}

export default function TeacherVideoPlayer({
  url,
  poster,
  teacherName = 'Educator',
}: TeacherVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { type, src } = parseVideoSource(url);

  // If YouTube or Vimeo, we can render an interactive thumbnail that transitions to the embed on click
  if (type === 'youtube' || type === 'vimeo') {
    if (isPlaying) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-stone-950 shadow-md">
          <iframe
            src={src}
            title={`${teacherName}'s Video Introduction`}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div
        onClick={() => setIsPlaying(true)}
        className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl bg-stone-950 shadow-md"
      >
        {poster && (
          <img
            src={poster}
            alt={`${teacherName} video thumbnail`}
            className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-95"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-stone-950 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-300 ring-4 ring-white/20">
            <Play className="h-7 w-7 translate-x-0.5 fill-stone-950 text-stone-950" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Watch Video Intro
          </p>
          <p className="text-sm font-semibold truncate">
            {teacherName} • 1–2 Min Lesson Preview
          </p>
        </div>
      </div>
    );
  }

  // HTML5 native video player for MP4 / Supabase storage
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-stone-950 shadow-md">
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-stone-400">
          <AlertCircle className="h-8 w-8 text-amber-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-stone-300">
            Video Format or Link Unavailable
          </p>
          <p className="text-xs text-stone-500 max-w-sm">
            This educator&apos;s video link could not be loaded. Please ensure the link is a valid YouTube, Vimeo, or direct MP4 URL.
          </p>
        </div>
      ) : (
        <video
          src={src}
          controls
          poster={poster}
          className="h-full w-full object-cover"
          playsInline
          onError={() => setHasError(true)}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
