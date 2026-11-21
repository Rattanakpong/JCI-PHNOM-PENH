"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaTile } from "@/components/ui/media-placeholder";
import { Lightbox } from "@/components/ui/lightbox";

export type GalleryYear = {
  year: number;
  photos: Array<{ id: string; url: string }>;
};

// Most JCI projects run every year, so the gallery shows one year at a time
// (most recent first) with a dropdown to switch years. Photos are framed at
// 4:3 landscape; activity photos are usually 3:2, so the sides trim slightly.
export function ProjectYearGallery({
  title,
  heading,
  years,
}: {
  title: string;
  heading: string;
  years: GalleryYear[]; // sorted most recent first, never empty
}) {
  const [year, setYear] = useState(String(years[0].year));
  const current = years.find((y) => String(y.year) === year) ?? years[0];
  // Index into current.photos of the photo open full screen, or null.
  const [viewing, setViewing] = useState<number | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-brand-navy">{heading}</h2>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-32 font-semibold" aria-label={heading}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y.year} value={String(y.year)}>
                {y.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {current.photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            aria-label={`View ${title} ${current.year} photo ${i + 1} full screen`}
            onClick={() => setViewing(i)}
            className="block cursor-zoom-in overflow-hidden rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            <MediaTile
              src={photo.url}
              alt={`${title} ${current.year}`}
              seed={photo.id}
              aspect="aspect-[4/3]"
            />
          </button>
        ))}
      </div>

      <Lightbox
        photos={current.photos}
        index={viewing}
        onIndexChange={setViewing}
        alt={`${title} ${current.year}`}
      />
    </div>
  );
}
