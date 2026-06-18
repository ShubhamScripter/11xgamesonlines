import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCricketData } from '../../features/sports/cricketSlice';
import MatchListSection from '../../components/sports/MatchListSection';
import SportsListLoading from '../../components/sports/SportsListLoading';
import { SPORT_LIST_META } from '../../components/sports/sportSidebarAssets';

function Cricket({ activeTab }) {
  const dispatch = useDispatch();
  const location = useLocation();

  const { matches, loader } = useSelector((state) => state.cricket);
  const [openIndexes, setOpenIndexes] = useState([0]);

  const selectedLeague = location.state?.selectedLeague;
  const sourceMatches = matches || [];

  const filteredMatches = sourceMatches.filter((match) => {
    const isMatch =
      match.match.toLowerCase().includes(' v ') ||
      match.match.toLowerCase().includes(' vs ') ||
      match.match.includes(' - ');

    if (!isMatch) return false;

    if (selectedLeague && match.title !== selectedLeague) {
      return false;
    }

    const matchDate = new Date(match.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === 'InPlay') {
      return match.inplay === true;
    }
    if (activeTab === 'Today') {
      return matchDate.toDateString() === today.toDateString();
    }
    if (activeTab === 'Tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return matchDate.toDateString() === tomorrow.toDateString();
    }
    return true;
  });

  const groupedMatches = filteredMatches.reduce((acc, match) => {
    if (!acc[match.title]) {
      acc[match.title] = [];
    }
    acc[match.title].push(match);
    return acc;
  }, {});

  const groupedArray = Object.keys(groupedMatches).map((title) => ({
    title,
    matches: groupedMatches[title],
  }));

  const handleToggle = (idx) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  useEffect(() => {
    if (groupedArray.length > 0) {
      setOpenIndexes(groupedArray.map((_, i) => i));
    }
  }, [groupedArray.length]);

  useEffect(() => {
    dispatch(fetchCricketData());
  }, [dispatch]);

  const sportMeta = SPORT_LIST_META.cricket;
  const showLeagueHeaders = groupedArray.length > 1;

  if (loader && sourceMatches.length === 0) {
    return <SportsListLoading message="Loading cricket matches..." />;
  }

  return (
    <div className="min-h-screen pb-6 w-full">
      <div className="w-full">
        <div className="overflow-hidden rounded-none sm:rounded-lg border-y sm:border border-[#2a313a] bg-[#0b0e11] shadow-sm">
          {groupedArray.length === 0 ? (
            <p className="text-center text-[#8b949e] text-sm py-10 px-4">
              {sportMeta.emptyMessage}
            </p>
          ) : (
            groupedArray.map((comp, idx) => (
              <MatchListSection
                key={comp.title || idx}
                title={comp.title}
                matches={comp.matches}
                sportType="cricket"
                isOpen={openIndexes.includes(idx)}
                onToggle={() => handleToggle(idx)}
                showLeagueHeader={showLeagueHeaders}
                hideOdds
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Cricket;
