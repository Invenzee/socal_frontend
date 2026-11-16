"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { RiArrowLeftSLine, RiArrowRightSLine, RiCloseLine } from "react-icons/ri";
import type { ListingImage } from "@/types/api";

export function orderedPhotos(images?: ListingImage[] | null) {
  const list = (images ?? []).filter((image) => Boolean(image?.url));
  return [...list].sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)));
}

export function PhotoLightbox({
  images,
  index,
  title,
  onClose,
  onIndex,
}: {
  images: ListingImage[];
  index: number;
  title: string;
  onClose: () => void;
  onIndex: (index: number) => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (event.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [images.length, index, onClose, onIndex]);

  const photo = images[index];
  if (!photo || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-6">
        <p className="min-w-0 truncate text-sm font-medium">{title}</p>
        <div className="flex shrink-0 items-center gap-3">
          <p className="text-xs text-white/70">
            {index + 1} / {images.length}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 cursor-pointer place-items-center rounded-full bg-white/10 text-2xl hover:bg-white/20"
            aria-label="Close gallery"
          >
            <RiCloseLine />
          </button>
        </div>
      </div>
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-6 sm:px-16"
        onClick={onClose}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={`${title} photo ${index + 1}`}
          className="max-h-full max-w-full object-contain"
          onClick={(event) => event.stopPropagation()}
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(event) => {
                event.stopPropagation();
                onIndex((index - 1 + images.length) % images.length);
              }}
              className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white text-2xl text-black sm:left-6"
            >
              <RiArrowLeftSLine />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(event) => {
                event.stopPropagation();
                onIndex((index + 1) % images.length);
              }}
              className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white text-2xl text-black sm:right-6"
            >
              <RiArrowRightSLine />
            </button>
          </>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function ListingPhotoButton({
  images,
  title,
  children,
  className,
  startIndex = 0,
}: {
  images?: ListingImage[] | null;
  title: string;
  children: ReactNode;
  className?: string;
  startIndex?: number;
}) {
  const photos = orderedPhotos(images);
  const [index, setIndex] = useState<number | null>(null);
  if (!photos.length) return <div className={className}>{children}</div>;
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIndex(startIndex);
        }}
      >
        {children}
      </button>
      {index !== null ? (
        <PhotoLightbox
          images={photos}
          index={index}
          title={title}
          onClose={() => setIndex(null)}
          onIndex={setIndex}
        />
      ) : null}
    </>
  );
}
