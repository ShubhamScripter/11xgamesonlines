import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTennisData } from '../../features/sports/tennisSlice';
import { useLocation } from 'react-router-dom';
import SportsListLoading from '../../components/sports/SportsListLoading';
import SportDateFilter from '../../components/sports/SportDateFilter';
import SportListBody from '../../components/sports/SportListBody';
import { SPORT_ICONS } from '../../components/sports/sportSidebarAssets';
import { getSportListMeta } from '../../i18n/i18nHelpers';
import { useTranslation } from '../../i18n/LanguageContext';
import useProgressiveSportList from '../../hooks/useProgressiveSportList';
import {
  buildSportListSections,
  filterMatchesByDateTab,
  isValidListMatch,
  resolveInitialDateTab,
  SPORT_DATE_TABS,
} from '../../utils/sportMatchFilters';

const SPORT = 'tennis';

function Tennis() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { t } = useTranslation();

  const { data: tennisData, loading: tennisLoading } = useSelector(
    (state) => state.tennis || {}
  );
  const [openIndexes, setOpenIndexes] = useState([0]);
  const [activeTab, setActiveTab] = useState(() =>
    resolveInitialDateTab(location.state)
  );

  const selectedLeague = location.state?.selectedLeague;
  const sourceMatches = tennisData ?? [];

  useEffect(() => {
    if (location.state?.active) {
      setActiveTab(resolveInitialDateTab(location.state));
    }
  }, [location.state?.active]);

  const tabCounts = useMemo(() => {
    const base = sourceMatches.filter((m) => {
      if (!isValidListMatch(m)) return false;
      if (selectedLeague && m.title !== selectedLeague) return false;
      return true;
    });
    return SPORT_DATE_TABS.reduce((acc, { id }) => {
      acc[id] = filterMatchesByDateTab(base, id, SPORT).length;
      return acc;
    }, {});
  }, [sourceMatches, selectedLeague]);

  const groupedArray = useMemo(() => {
    const byTab = filterMatchesByDateTab(sourceMatches, activeTab, SPORT);
    const scoped = selectedLeague
      ? byTab.filter((match) => match.title === selectedLeague)
      : byTab;
    return buildSportListSections(scoped, { activeTab, sport: SPORT });
  }, [sourceMatches, activeTab, selectedLeague]);

  const { visibleSections, hasMore, shownRest, totalRest } =
    useProgressiveSportList(groupedArray, activeTab);

  const handleToggle = (idx) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  useEffect(() => {
    if (visibleSections.length > 0) {
      setOpenIndexes(visibleSections.map((_, i) => i));
    }
  }, [visibleSections.length, activeTab, sectionSignatureFrom(visibleSections)]);

  useEffect(() => {
    dispatch(fetchTennisData({ withOdds: true, oddsScope: 'eligible', force: true }));
  }, [dispatch]);

  const sportMeta = { ...getSportListMeta(t).tennis, icon: SPORT_ICONS.tennis };
  const showLeagueHeaders =
    visibleSections.length > 1 ||
    (visibleSections.length === 1 && !visibleSections[0]?.isLiveSection);

  if (tennisLoading && sourceMatches.length === 0) {
    return <SportsListLoading message={t('sports.loadingTennis')} />;
  }

  return (
    <div className="min-h-screen pb-8 w-full min-w-0 overflow-x-hidden">
      <SportDateFilter
        activeTab={activeTab}
        onChange={setActiveTab}
        counts={tabCounts}
      />
      <div className="w-full">
        <div className="overflow-hidden rounded-none sm:rounded-lg border-y sm:border border-[#2a313a] bg-[#0b0e11] shadow-sm">
          {groupedArray.length === 0 ? (
            <p className="text-center text-[#8b949e] text-sm py-10 px-4">
              {sportMeta.emptyMessage}
            </p>
          ) : (
            <SportListBody
              sections={visibleSections}
              sportType="tennis"
              openIndexes={openIndexes}
              onToggle={handleToggle}
              showLeagueHeaders={showLeagueHeaders}
              hasMore={hasMore}
              shownRest={shownRest}
              totalRest={totalRest}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function sectionSignatureFrom(sections) {
  return (sections || [])
    .map((s) => `${s.title}:${s.matches?.length ?? 0}`)
    .join('|');
}

export default Tennis;
