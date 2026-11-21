"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Each photo keeps its own tilt so the pile looks hand-placed; only the
// offset changes as photos move between the front and the back.
const TILTS_DEG = [-4, 3, -2, 5, -3];
const OFFSET_PX = 14;

// A loose pile of photos. Clicking sends the front photo to the back.
export function PhotoStack({
  photos,
  className,
}: {
  photos: Array<{ src: string; alt: string }>;
  className?: string;
}) {
  const [front, setFront] = useState(0);
  const count = photos.length;

  return (
    <button
      type="button"
      aria-label={`Show next photo (${front + 1} of ${count})`}
      onClick={() => setFront((f) => (f + 1) % count)}
      // Leave room top-right for the photos peeking out behind the front one.
      className={cn("group relative block w-full cursor-pointer pr-10 pt-10 text-left", className)}
    >
      <div className="relative aspect-[4/3]">
        {photos.map((photo, i) => {
          const depth = (i - front + count) % count; // 0 = front
          return (
            <div
              key={photo.src}
              aria-hidden={depth !== 0}
              className="absolute inset-0 rounded-lg bg-white p-2 shadow-card-hover transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{
                zIndex: count - depth,
                transform: `translate(${depth * OFFSET_PX}px, ${-depth * OFFSET_PX}px) rotate(${TILTS_DEG[i % TILTS_DEG.length]}deg)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local file, not worth next/image config */}
              <img src={photo.src} alt={photo.alt} className="h-full w-full rounded object-cover" />
            </div>
          );
        })}
      </div>
    </button>
  );
}
