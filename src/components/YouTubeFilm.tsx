"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { youTubeEmbedUrl, youTubeThumbnail } from "@/lib/youtube";

/**
 * A YouTube film that loads only when the visitor presses play.
 *
 * Until then the page shows a still and a play button, so a project page with
 * a film costs no third-party requests, cookies or player JavaScript on load.
 * The still is the project's own image when one is given, otherwise the
 * thumbnail YouTube made for the video.
 */
export default function YouTubeFilm({
  id,
  title,
  playLabel,
  poster,
  priority = false,
}: {
  id: string;
  title: string;
  playLabel: string;
  poster?: string;
  priority?: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-[#111]">
      {playing ? (
        <iframe
          src={`${youTubeEmbedUrl(id)}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${playLabel}: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {poster ? (
            <Image src={poster} alt="" fill priority={priority} sizes="(max-width: 1152px) 100vw, 1152px" className="object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={youTubeThumbnail(id)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <span className="absolute inset-0 bg-black/30 transition-colors duration-300 group-hover:bg-black/15" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fafafa] text-[#0a0a0a] transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20">
              <Play className="ml-1 h-6 w-6 fill-current md:h-8 md:w-8" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
