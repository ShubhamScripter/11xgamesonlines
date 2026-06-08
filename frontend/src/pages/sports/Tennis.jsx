import React, { useState, useEffect } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { GrStarOutline } from "react-icons/gr";
import { GoGraph } from "react-icons/go";
import { MdArrowForwardIos } from "react-icons/md";
import b from '../../assets/icon/b.png';
import f from '../../assets/icon/f.png';
import s from '../../assets/icon/s.png';
import y from '../../assets/icon/youtube.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { fetchTennisData } from '../../features/sports/tennisSlice';

import MatchRow from '../../components/sports/MatchRow';
import { SPORT_LIST_META } from '../../components/sports/sportSidebarAssets';

function Tennis({ activeTab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { data } = useSelector((state) => state.tennis);
  const [openIndexes, setOpenIndexes] = useState([0]);

  const selectedLeague = location.state?.selectedLeague;

  const sourceMatches = data ?? [];

  // Filter matches based on activeTab (support both iplay and inplay from API)
  const filteredMatches = (Array.isArray(sourceMatches) ? sourceMatches : []).filter(match => {
    const isMatch = match.match.toLowerCase().includes(' v ') || 
                    match.match.toLowerCase().includes(' vs ') || 
                    match.match.includes(' - ');
    
    if (!isMatch) return false;

    // Filter by league if one is selected in sidebar
    if (selectedLeague && match.title !== selectedLeague) {
        return false;
    }

    const matchDate = new Date(match.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isInplay = match.inplay === true || match.iplay === true;

    if (activeTab === "InPlay") {
      return isInplay;
    } 
    else if (activeTab === "Today") {
      return matchDate.toDateString() === today.toDateString();
    } 
    else if (activeTab === "Tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return matchDate.toDateString() === tomorrow.toDateString();
    }
    return true;
  });

  // Group matches by title (fallback "Tennis" if API doesn't send title)
  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const title = match.title || 'Tennis';
    if (!acc[title]) acc[title] = [];
    acc[title].push(match);
    return acc;
  }, {});

  const groupedArray = Object.keys(groupedMatches).map(title => ({
    title,
    matches: groupedMatches[title]
  }));

  const handleToggle = idx => {
    setOpenIndexes(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  useEffect(() => {
    if (groupedArray.length > 0) {
      setOpenIndexes(groupedArray.map((_, i) => i));
    }
  }, [groupedArray.length]);

  useEffect(() => {
    dispatch(fetchTennisData());
  }, [dispatch]);

  const sportMeta = SPORT_LIST_META.tennis;

  return (
    <div className="min-h-screen pb-6">
      <div className="w-full max-w-md mx-auto px-2 sm:px-0">
        <div className="overflow-hidden rounded-md border border-[#2a313a] bg-[#0b0e11] shadow-sm">
          {groupedArray.length === 0 ? (
            <p className="text-center text-[#8b949e] text-sm py-8 px-4">
              {sportMeta.emptyMessage}
            </p>
          ) : (
            groupedArray.map((comp, idx) => (
              <div key={idx}>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndexes.includes(idx) ? 'max-h-full' : 'max-h-0'
                  }`}
                >
                  {comp.matches.map((match, i) => (
                    <MatchRow
                      key={`${match.id}-${i}`}
                      match={match}
                      sportType="tennis"
                      hideOdds
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Tennis;
