import React, { useState, useEffect } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { GrStarOutline } from "react-icons/gr";
import { GoGraph } from "react-icons/go";
import { MdArrowForwardIos } from "react-icons/md";
import b from '../../assets/icon/b.png';
import f from '../../assets/icon/f.png';
import s from '../../assets/icon/s.png';
import y from '../../assets/icon/youtube.png';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { fetchCricketData, fetchCricketInplayData } from '../../features/sports/cricketSlice';

function Cricket({ activeTab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { matches, inplayMatches, loader, error } = useSelector((state) => state.cricket);
  const [openIndexes, setOpenIndexes] = useState([0]);

  const sourceMatches = activeTab === "InPlay" ? inplayMatches : matches;

  // Filter matches based on activeTab (InPlay, Today, Tomorrow)
  const filteredMatches = sourceMatches.filter(match => {
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
  console.log("groupedArray",groupedArray);

  const handleToggle = idx => {
    setOpenIndexes(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  useEffect(() => {
    dispatch(fetchCricketData());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === "InPlay") {
      dispatch(fetchCricketInplayData());
    }
  }, [activeTab, dispatch]);

  const handleClick = (match) => {
    navigate(`/sports/fullmarket/${match.match}/${match.id}`);
  };

  return (
    <div className="bg-[#eef6fb] min-h-screen py-4 px-2 md:py-4 md:px-4">
      {groupedArray.map((comp, idx) => (
        <div key={idx} className="mb-4">
          {/* Title Header */}
          <div
            className="flex items-center justify-between px-4 py-2 rounded-t-xl font-bold text-xl cursor-pointer bg-black text-white"
            onClick={() => handleToggle(idx)}
          >
            <div className="flex items-center gap-2 text-sm md:text-lg">
              <span className="bg-green-700 text-white rounded-full px-3 text-xs md:text-sm font-semibold">
                {comp.matches.length}
              </span>
              {comp.title}
            </div>
            <span className="text-2xl">
              {openIndexes.includes(idx) ? <IoIosArrowDown /> : <IoIosArrowUp />}
            </span>
          </div>

          {/* Matches list */}
          <div
            className={`transition-all duration-300 overflow-hidden rounded-b-xl ${
              openIndexes.includes(idx) ? 'max-h-[1000px]' : 'max-h-0'
            }`}
          >
            {comp.matches.map((m, i) => (
              <div
                key={i}
                onClick={() => handleClick(m)}
                className="flex items-center justify-between px-2 py-1 border-b last:border-b-0 cursor-pointer bg-gradient-to-b from-[#d4e0e5] to-[#eef6fb]"
              >
                <div className="flex items-center gap-4">
                  <GrStarOutline />
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <img src={y} alt="YouTube" className="w-2 h-2" />
                        <img src={b} alt="B" className="w-2 h-2" />
                        <img src={f} alt="F" className="w-2 h-2" />
                        <img src={s} alt="S" className="w-2 h-2" />
                      </div>
                      <span className="bg-yellow-200 text-black rounded font-bold px-1 text-[8px] md:text-xs">
                        {m.date}
                      </span>
                      {m.inplay && (
                        <span className="bg-[#52bf05] text-white rounded font-bold px-1 h-fit text-xs">
                          Inplay
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium md:text-[16px] md:font-semibold">
                      {m.match}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-yellow-600 font-bold md:text-2xl">
                    0-0
                  </span>
                  <GoGraph />
                  <MdArrowForwardIos className="text-xl font-bold" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Cricket;
