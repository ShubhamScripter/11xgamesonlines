import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { fetchSoccerData, fetchSoccerInplayData } from '../../features/sports/soccerSlice';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { GrStarOutline } from "react-icons/gr";
import { GoGraph } from "react-icons/go";
import { MdArrowForwardIos } from "react-icons/md";
import b from '../../assets/icon/b.png';
import f from '../../assets/icon/f.png';
import s from '../../assets/icon/s.png';
import y from '../../assets/icon/youtube.png';
import { useNavigate } from 'react-router-dom';

function Soccer({ activeTab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { soccerData, soccerInplayData, soccerLoading, soccerError } = useSelector((state) => state.soccer || {});
  
  const [openIndexes, setOpenIndexes] = useState([0]);

  const sourceMatches = (activeTab === "InPlay" ? soccerInplayData : soccerData) ?? [];

  // Filter matches based on activeTab (support both iplay and inplay from API)
  const filteredMatches = (Array.isArray(sourceMatches) ? sourceMatches : []).filter(match => {
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

  // Group matches by title (fallback "Soccer" if API doesn't send title)
  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const title = match.title || 'Soccer';
    if (!acc[title]) acc[title] = [];
    acc[title].push(match);
    return acc;
  }, {});

  const groupedArray = Object.keys(groupedMatches).map(title => ({
    title,
    matches: groupedMatches[title]
  }));

  console.log('Grouped Matches soccer:', groupedArray);

  const handleToggle = idx => {
    setOpenIndexes(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  useEffect(() => {
    dispatch(fetchSoccerData());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === "InPlay") {
      dispatch(fetchSoccerInplayData());
    }
  }, [activeTab, dispatch]);

  const handleClick = (match) => {
    navigate(`/sports/soccer/${match.match}/${match.id}`);
  };
  return (
    <div className="bg-[#eef6fb] min-h-screen py-4 px-2 md:py-4 md:px-4">
      {groupedArray.map((comp, idx) => (
        <div key={idx} className="mb-4">
          {/* Competition Header */}
          <div
            className="flex items-center justify-between px-4 py-2 md:px-4 md:py-3 rounded-t-xl font-bold text-xl cursor-pointer bg-black text-white"
            onClick={() => handleToggle(idx)}
          >
            <div className="flex items-center gap-2 text-sm md:text-lg md:font-semibold">
              <span className="bg-green-700 text-white rounded-full px-3 flex items-center justify-center text-xs md:text-sm font-semibold">
                {comp.matches.length}
              </span>
              {comp.title}
            </div>
            <span className="text-2xl">{openIndexes.includes(idx) ? <IoIosArrowDown /> : <IoIosArrowUp />}</span>
          </div>

          {/* Matches Dropdown */}
          <div
            className={`transition-all duration-300 overflow-hidden bg-gradient-to-b from-[#d4e0e5] to-[#eef6fb] rounded-b-xl ${
              openIndexes.includes(idx) ? 'max-h-[1000px]' : 'max-h-0'
            }`}
          >
            {openIndexes.includes(idx) && comp.matches.map((match, i) => (
              <div
                key={i}
                onClick={() => handleClick(match)}
                className="flex items-center justify-between px-2 py-1 md:px-4 md:py-3 border-b last:border-b-0 bg-gradient-to-b from-[#d4e0e5] to-[#eef6fb]"
              >
                <div className='flex justify-center items-center gap-4'>
                  <GrStarOutline />
                  <div className="flex flex-col gap-1">
                    <div className='flex gap-2'>
                      <div className='flex items-center'>
                        <img src={y} alt="YouTube" className="w-2 h-2 inline-block" />
                        <img src={b} alt="B" className="w-2 h-2 inline-block" />
                        <img src={f} alt="F" className="w-2 h-2 inline-block " />
                        <img src={s} alt="S" className="w-2 h-2 inline-block" />
                      </div>
                      <span className="bg-yellow-200 text-black rounded font-bold px-1 text-xs">
                        {match.date}
                      </span>
                      {(match.inplay || match.iplay) && (
                        <span className="bg-[#52bf05] text-white rounded font-bold px-1 h-fit text-xs">
                          Inplay
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium md:text-[16px] md:font-semibold">{match.match}</span>
                  </div>
                </div>
                <div className='flex justify-center items-center gap-4'>
                  <span className="text-yellow-600 font-bold md:text-2xl">0-0</span>
                  <GoGraph />
                  <MdArrowForwardIos className='text-xl font-bold' />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Soccer;
