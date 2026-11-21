"use client";

import { useState } from "react";
import { Lightbox } from "@/components/ui/lightbox";

// Photo grid for news articles and event pages; clicking a photo opens it
// full screen with previous/next navigation.
export function PhotoGallery({
  photos,
  alt,
}: {
  photos: Array<{ id: string; url: string; caption: string | null }>;
  alt: string;
}) {
  const [viewing, setViewing] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, i) => (
          <figure key={photo.id}>
            <button
              type="button"
              onClick={() => setViewing(i)}
              aria-label={`View photo ${i + 1} full screen`}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded URL, not worth next/image config */}
              <img
                src={photo.url}
                alt={photo.caption ?? alt}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
            {photo.caption && <figcaption className="mt-1.5 text-xs text-brand-navy/50">{photo.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <Lightbox photos={photos} index={viewing} onIndexChange={setViewing} alt={alt} />
    </>
  );
}
