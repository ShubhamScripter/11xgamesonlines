import React, { useEffect, useRef, useState } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import {
  LANGUAGE_FULL_NAMES,
  LANGUAGE_LABELS,
  USER_LANGUAGES,
} from './translations';
import { useTranslation } from './LanguageContext';

export default function LanguageSwitcher({ compact = false }) {
  const { language, changeLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelect = (code) => {
    changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1 rounded-md border border-gray-600 bg-[#1e2428] font-bold text-white transition-colors hover:bg-[#303232] ${
          compact ? 'min-h-[32px] px-2 py-1 text-[10px]' : 'min-h-[36px] px-2.5 py-1.5 text-xs'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        <span>{LANGUAGE_LABELS[language]}</span>
        <IoChevronDown
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${
            compact ? 'text-sm' : 'text-base'
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language options"
          className={`absolute right-0 z-[60] mt-1 min-w-[120px] overflow-hidden rounded-md border border-gray-600 bg-[#1e2428] py-1 shadow-lg ${
            compact ? 'text-[11px]' : 'text-xs'
          }`}
        >
          {USER_LANGUAGES.map((code) => {
            const selected = language === code;
            return (
              <li key={code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => handleSelect(code)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-semibold transition-colors ${
                    selected
                      ? 'bg-[#14805e] text-white'
                      : 'text-gray-300 hover:bg-[#303232] hover:text-white'
                  }`}
                >
                  <span>{LANGUAGE_FULL_NAMES[code]}</span>
                  <span className="text-[10px] opacity-80">{LANGUAGE_LABELS[code]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
