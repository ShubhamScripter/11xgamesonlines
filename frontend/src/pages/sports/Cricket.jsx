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
import { fetchCricketData } from '../../features/sports/cricketSlice';

import MatchRow from '../../components/sports/MatchRow';
import { SPORT_LIST_META } from '../../components/sports/sportSidebarAssets';

function Cricket({ activeTab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { matches } = useSelector((state) => state.cricket);
  const [openIndexes, setOpenIndexes] = useState([0]);

  const selectedLeague = location.state?.selectedLeague;

  const sourceMatches = matches || [];

  // Filter matches based on activeTab and selectedLeague
  const filteredMatches = sourceMatches.filter(match => {
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

    if (activeTab === "InPlay") {
      return match.inplay === true;
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

  // Group matches by title
  const groupedMatches = filteredMatches.reduce((acc, match) => {
    if (!acc[match.title]) {
      acc[match.title] = [];
    }
    acc[match.title].push(match);
    return acc;
  }, {});

  // Convert grouped object into array for rendering
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
    dispatch(fetchCricketData());
  }, [dispatch]);

  const sportMeta = SPORT_LIST_META.cricket;

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
                  {comp.matches.map((m, i) => (
                    <MatchRow key={`${m.id}-${i}`} match={m} sportType="cricket" hideOdds />
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

export default Cricket;
