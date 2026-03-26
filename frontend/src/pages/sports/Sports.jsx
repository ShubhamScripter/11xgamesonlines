import React ,{useState,useEffect} from 'react'
import Header from '../../components/Header/Header'
import HeaderLogin from '../../components/Header/HeaderLogin'
import { FaSearch } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import Header1 from '../../components/Header/Header1';
import All from './All';
import Cricket from './Cricket';
import Soccer from './Soccer';
import Tennis from './Tennis';
import { useLocation } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { fetchSoccerInplayData } from "../../features/sports/soccerSlice";
import { fetchCricketInplayData } from "../../features/sports/cricketSlice";
import { fetchTennisInplayData } from "../../features/sports/tennisSlice";
function Sports() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [parlay, setParlay] = useState(false);
  const [Filter,setFilter] = useState("All")
  const [selected, setSelected] = useState(null);
  const [Active, setActive] = useState("InPlay")

  useEffect(() => {
    if (location.state && location.state.filter) {
      setFilter(location.state.filter);
      setActive(location.state.active);
    }
  }, [location.state]);

  useEffect(() => {
    if (Active === "InPlay") {
      dispatch(fetchCricketInplayData());
      dispatch(fetchSoccerInplayData());
      dispatch(fetchTennisInplayData());
    }
  }, [Active, dispatch]);

  let content;
    if (Filter === "All") {
        content = <All selected={selected} setSelected={setSelected} />;
    } else if (Filter === "Cricket") {
        content = <Cricket selected={selected} setSelected={setSelected} activeTab={Active}/>;
    } else if (Filter === "Soccer") {
        content = <Soccer selected={selected} setSelected={setSelected} activeTab={Active}/>;
    } else if (Filter === "Tennis") {
        content = <Tennis selected={selected} setSelected={setSelected} activeTab={Active}/>;
    }
     else {
        content = <div className="p-4">No component for {Filter}</div>;
    }
  return (
    <div>
        <HeaderLogin/>
        <div className='bg-black md:h-15 flex gap-5 pr-2'>
          <div className='flex justify-between items-center bg-[#1b1f23] p-2  md:h-15 w-fit'>
            <label className="flex items-center cursor-pointer">
            <div className="relative">
            <input
              type="checkbox"
              checked={parlay}
              onChange={() => setParlay(!parlay)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${parlay ? 'bg-[#17934e]' : 'bg-[#374151]'}`}></div>
            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${parlay ? 'translate-x-6' : ''}`}></div>
            </div>
            <span className={`ml-3 text-lg font-semibold ${parlay ? 'text-[#17934e]' : 'text-gray-400'}`}>Parlay</span>
            </label>
          </div>
          <div className='flex gap-3 md:gap-10 justify-center items-center'>
            <div className='flex gap-3 justify-center items-center '>
              <span className={`text-gray-400 text-sm md:text-xl font-semibold cursor-pointer ${Active==="InPlay" ? 'border-b-2 text-white' :" "}`}
              onClick={()=>setActive("InPlay")}
              >InPlay</span>
              <span className={`text-gray-400 text-sm md:text-xl font-semibold cursor-pointer ${Active==="Today" ? 'border-b-2 text-white' :" "}`}
              onClick={()=>setActive("Today")}
              >Today</span>
              <span className={`text-gray-400 text-sm md:text-xl font-semibold cursor-pointer ${Active==="Tomorrow" ? 'border-b-2 text-white' :" "}`}
              onClick={()=>setActive("Tomorrow")}
              >Tomorrow</span>
            </div>
            <IoIosSearch className='text-white text-3xl mt-3'/>
          </div>
        </div>
        <Header1 Filter={Filter} setFilter={setFilter}/>
        {content}
    </div>
  )
}

export default Sports