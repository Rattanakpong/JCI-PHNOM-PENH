"use client";

import { useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const SWIPE_THRESHOLD_PX = 40;

// Full-screen photo viewer. `index` is the open photo, or null when closed;
// Radix handles Esc, focus trapping and scroll locking.
export function Lightbox({
  photos,
  index,
  onIndexChange,
  alt,
}: {
  photos: Array<{ id: string; url: string }>;
  index: number | null;
  onIndexChange: (index: number | null) => void;
  alt: string;
}) {
  const touchStartX = useRef<number | null>(null);
  const open = index !== null && photos.length > 0;
  const current = open ? photos[index] : null;
  const multiple = photos.length > 1;

  const step = (delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + photos.length) % photos.length);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onIndexChange(null)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex items-center justify-center focus:outline-none"
          onKeyDown={(e) => {
            if (!multiple) return;
            if (e.key === "ArrowLeft") step(-1);
            if (e.key === "ArrowRight") step(1);
          }}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null || !multiple) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) > SWIPE_THRESHOLD_PX) step(dx < 0 ? 1 : -1);
          }}
          // Clicking the empty area around the photo closes the viewer.
          onClick={(e) => {
            if (e.target === e.currentTarget) onIndexChange(null);
          }}
        >
          <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>

          {current && (
            // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded local file, not worth next/image config
            <img
              key={current.id}
              src={current.url}
              alt={alt}
              className="max-h-[calc(100vh-6rem)] max-w-[calc(100vw-1rem)] select-none object-contain sm:max-w-[calc(100vw-8rem)]"
            />
          )}

          {multiple && index !== null && (
            <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
              {index + 1} / {photos.length}
            </div>
          )}

          <DialogPrimitive.Close className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {multiple && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => step(-1)}
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:left-4 sm:h-12 sm:w-12"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => step(1)}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:right-4 sm:h-12 sm:w-12"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
