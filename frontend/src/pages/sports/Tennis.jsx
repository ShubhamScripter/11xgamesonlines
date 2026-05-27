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

  return (
    <div className="min-h-screen">
      {/* Header Row (Static) */}
      <div className="grid grid-cols-12 bg-[#0b0e11] py-2 border-b border-[#2a313a] items-center sticky top-0 z-9">
        <div className="col-span-7 px-4">
          <span className="text-white font-bold text-sm">Tennis</span>
        </div>
        <div className="col-span-5 grid grid-cols-3 text-center pr-2">
          <span className="text-white text-[10px] font-bold">1</span>
          <span className="text-white text-[10px] font-bold">X</span>
          <span className="text-white text-[10px] font-bold">2</span>
        </div>
      </div>

      {groupedArray.map((comp, idx) => (
        <div key={idx} className="mb-0">
          {/* <div
            className="flex items-center justify-between px-4 py-1 bg-[#1b1f23] border-b border-[#2a313a] cursor-pointer"
            onClick={() => handleToggle(idx)}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
               {comp.title}
            </div>
            <span className="text-gray-400 text-xs">{openIndexes.includes(idx) ? <IoIosArrowDown /> : <IoIosArrowUp />}</span>
          </div> */}

          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndexes.includes(idx) ? 'max-h-full' : 'max-h-0'
            }`}
          >
            {comp.matches.map((match, i) => (
              <MatchRow key={i} match={match} sportType="tennis" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Tennis;
