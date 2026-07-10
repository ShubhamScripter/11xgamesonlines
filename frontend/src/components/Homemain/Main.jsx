import React, { useState, useEffect } from 'react';
import { IoAlarmSharp } from "react-icons/io5";
import { FaCalendar, FaCalendarAlt } from "react-icons/fa";
import { HiTrophy } from "react-icons/hi2";
import { ImShield } from "react-icons/im";
import { useSelector, useDispatch } from "react-redux";
import { fetchCricketData } from "../../features/sports/cricketSlice";
import { fetchSoccerData } from "../../features/sports/soccerSlice";
import { fetchTennisData } from "../../features/sports/tennisSlice";
import { useNavigate } from 'react-router-dom';
import Inplay from './Inplay';
import Today from './Today';
import Tomorrow from './Tomorrow';
import Spinner from '../Spinner';
import { useTranslation } from '../../i18n/LanguageContext';

const normalizeDate = (dateString) => {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split("T")[0];
  } catch {
    return null;
  }
};

const filterMatches = (matches, filterType) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  if (filterType === "In Play") {
    return matches.filter(m => m.inplay === true);
  } else if (filterType === "Today") {
    return matches.filter(m => normalizeDate(m.date) === todayStr);
  } else if (filterType === "Tomorrow") {
    return matches.filter(m => normalizeDate(m.date) === tomorrowStr);
  }
  return matches;
};

function Main() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const cricket = useSelector(state => state.cricket.matches || []);
  const soccer = useSelector(state => state.soccer.soccerData || []);
  const tennis = useSelector(state => state.tennis.data || []);

  const [Filter, setFilter] = useState("In Play");

  const categories = [
    { id: "In Play", labelKey: "home.inPlay", icon: <IoAlarmSharp size={35} /> },
    { id: "Today", labelKey: "home.today", icon: <FaCalendar size={35} /> },
    { id: "Tomorrow", labelKey: "home.tomorrow", icon: <FaCalendarAlt size={35} /> },
    { id: "League", labelKey: "home.league", icon: <HiTrophy size={35} /> },
    { id: "Parlay", labelKey: "home.parlay", icon: <ImShield size={35} /> },
  ];

  useEffect(() => {
    dispatch(fetchCricketData());
    dispatch(fetchSoccerData());
    dispatch(fetchTennisData());
  }, [dispatch]);

  if (
    !cricket.length &&
    !soccer.length &&
    !tennis.length
  ) {
    return <div className="text-center py-4"><Spinner/></div>;
  }

  const allSports = [...cricket, ...soccer, ...tennis];
  const cricketInplay = cricket.filter(m => m?.inplay === true);
  const soccerInplay = soccer.filter(m => m?.inplay === true || m?.iplay === true);
  const tennisInplay = tennis.filter(m => m?.inplay === true || m?.iplay === true);
  const allInplaySports = [
    ...cricketInplay,
    ...soccerInplay,
    ...tennisInplay,
  ];

  const filteredData = {
    all: Filter === "In Play" ? allInplaySports : filterMatches(allSports, Filter),
    cricket: Filter === "In Play" ? cricketInplay : filterMatches(cricket, Filter),
    soccer: Filter === "In Play" ? soccerInplay : filterMatches(soccer, Filter),
    tennis: Filter === "In Play" ? tennisInplay : filterMatches(tennis, Filter),
  };

  let content;
  if (Filter === "In Play") {
    content = <Inplay data={filteredData} />;
  } else if (Filter === "Today") {
    content = <Today data={filteredData} />;
  } else if (Filter === "Tomorrow") {
    content = <Tomorrow data={filteredData} />;
  } else if (Filter === "League") {
    navigate('/leagues');
  } else if (Filter === "Parlay") {
    navigate('/sports');
  }

  return (
    <div className='bg-[#f0f8ff] w-full flex gap-1'>
      <div className='bg-white flex flex-col p-1 ml-2 mt-2 rounded-2xl gap-4 h-fit'>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`flex flex-col items-center justify-center p-1 rounded-md cursor-pointer
            ${Filter === cat.id ? 'bg-[#19A044] text-white' : ''}`}
            onClick={() => setFilter(cat.id)}
          >
            {cat.icon}
            <span className='text-[10px]'>{t(cat.labelKey)}</span>
          </div>
        ))}
      </div>

      <div className='flex-1 h-full flex-col p-1 mt-1 mb-2 rounded-2xl gap-4'>
        {content}
      </div>
    </div>
  );
}

export default Main;
