import React, { useState } from 'react';

function ImageLightbox({ url, alt, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex flex-col items-center max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="mb-3 text-white text-sm px-4 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={onClose}
        >
          Close
        </button>
        <img
          src={url}
          alt={alt}
          className="max-h-[80vh] max-w-full object-contain rounded-lg border border-gray-600"
          onError={onClose}
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 text-blue-400 text-sm underline"
        >
          Open in new tab
        </a>
      </div>
    </div>
  );
}

/** Opens images in a modal (works when pop-ups are blocked). */
export default function ImagePreviewLink({
  href,
  label = 'View',
  className = '',
  thumbnail = false,
  thumbnailClassName = 'rounded-lg object-cover cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-[#19A044] transition',
  alt = 'Image preview',
}) {
  const [open, setOpen] = useState(false);
  const url = String(href ?? '').trim();

  if (!url) return <span>-</span>;

  if (thumbnail) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-block p-0 border-0 bg-transparent"
          title="Tap to view full image"
        >
          <img src={url} alt={alt} className={thumbnailClassName} />
        </button>
        {open && <ImageLightbox url={url} alt={alt} onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className || 'text-blue-400 underline cursor-pointer'}
      >
        {label}
      </button>
      {open && <ImageLightbox url={url} alt={label} onClose={() => setOpen(false)} />}
    </>
  );
}
