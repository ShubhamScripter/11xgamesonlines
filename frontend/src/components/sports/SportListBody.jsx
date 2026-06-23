import React from 'react';
import MatchListSection from './MatchListSection';

function SportListProgressFooter({ hasMore, shownRest, totalRest }) {
  if (!hasMore && shownRest >= totalRest) return null;

  return (
    <div className="py-3 px-4 text-center border-t border-[#2a313a] bg-[#141515]">
      {hasMore ? (
        <p className="text-[#8b949e] text-xs animate-pulse">
          Loading more matches… ({shownRest} / {totalRest})
        </p>
      ) : null}
    </div>
  );
}

function SportListBody({
  sections,
  sportType,
  openIndexes,
  onToggle,
  showLeagueHeaders,
  hasMore,
  shownRest,
  totalRest,
}) {
  if (!sections.length) return null;

  return (
    <>
      {sections.map((comp, idx) => (
        <MatchListSection
          key={`${comp.title}-${idx}`}
          title={comp.title}
          matches={comp.matches}
          sportType={sportType}
          isOpen={openIndexes.includes(idx)}
          onToggle={() => onToggle(idx)}
          showLeagueHeader={showLeagueHeaders && !comp.isLiveSection}
          isLiveSection={comp.isLiveSection}
        />
      ))}
      <SportListProgressFooter
        hasMore={hasMore}
        shownRest={shownRest}
        totalRest={totalRest}
      />
    </>
  );
}

export default SportListBody;
