import React from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import MatchListHeader from './MatchListHeader';
import MatchRow from './MatchRow';
import { getListColumnLabels } from './matchListUtils';

function MatchListSection({
  title,
  matches,
  sportType,
  isOpen,
  onToggle,
  showLeagueHeader = true,
  hideOdds = false,
  isLiveSection = false,
}) {
  const columnLabels = hideOdds ? [] : getListColumnLabels(sportType, matches?.[0]);

  return (
    <section className="border-b border-[#2a313a] last:border-b-0">
      {(showLeagueHeader || isLiveSection) && title && (
        <button
          type="button"
          onClick={onToggle}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 transition-colors text-left ${
            isLiveSection
              ? 'bg-[#2a1518] hover:bg-[#351a1f] border-l-4 border-l-[#e53935]'
              : 'bg-[#1a1f24] hover:bg-[#22282e]'
          }`}
        >
          <span
            className={`text-[12px] font-bold truncate ${
              isLiveSection ? 'text-[#ff6b6b]' : 'text-[#e5e7eb]'
            }`}
          >
            {isLiveSection ? `● ${title}` : title}
          </span>
          <span className="shrink-0 text-[#6b7280]">
            {isOpen ? <IoIosArrowUp size={16} /> : <IoIosArrowDown size={16} />}
          </span>
        </button>
      )}

      {isOpen && (
        <>
          {!hideOdds && <MatchListHeader columnLabels={columnLabels} />}
          <div>
            {matches.map((match, i) => (
              <MatchRow
                key={`${match.id}-${i}`}
                match={match}
                sportType={sportType}
                columnLabels={columnLabels}
                hideOdds={hideOdds}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default MatchListSection;
