import React, { useState } from 'react';

export default function ImagePreviewLink({ href, label = 'View', className = '' }) {
  const [open, setOpen] = useState(false);
  const url = String(href ?? '').trim();

  if (!url) return <span>-</span>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className || 'text-blue-600 underline cursor-pointer'}
      >
        {label}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex flex-col items-center max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="mb-3 text-white text-sm px-4 py-1 rounded bg-gray-700"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
            <img
              src={url}
              alt={label}
              className="max-h-[80vh] max-w-full object-contain rounded border"
            />
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 text-blue-600 text-sm underline"
            >
              Open in new tab
            </a>
          </div>
        </div>
      )}
    </>
  );
}
