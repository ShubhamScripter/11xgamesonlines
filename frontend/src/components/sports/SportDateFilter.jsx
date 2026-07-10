import React, { useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { getSportDateTabs } from '../../i18n/i18nHelpers';

function SportDateFilter({ activeTab, onChange, counts = {} }) {
  const { t } = useTranslation();
  const tabs = useMemo(() => getSportDateTabs(t), [t]);

  return (
    <div
      className="flex gap-2 px-2 sm:px-3 py-2.5 overflow-x-auto no-scrollbar border-b border-[#2a313a] bg-[#141515]"
      role="tablist"
      aria-label="Match date filter"
    >
      {tabs.map(({ id, label }) => {
        const isActive = activeTab === id;
        const count = counts[id];
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
              isActive
                ? 'bg-[#2c5af2] text-white'
                : 'bg-[#1b1f23] text-[#9ca3af] hover:bg-[#252a30] hover:text-white'
            }`}
          >
            {label}
            {typeof count === 'number' ? (
              <span className="ml-1.5 opacity-80">({count})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default SportDateFilter;
