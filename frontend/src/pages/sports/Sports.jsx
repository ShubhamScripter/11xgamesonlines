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
function Sports({ sport }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const [Filter, setFilter] = useState(sport || "All")
  const [selected, setSelected] = useState(null);
  const [Active, setActive] = useState("All")

  useEffect(() => {
    if (sport) {
      setFilter(sport);
    } else if (location.state && location.state.filter) {
      setFilter(location.state.filter);
    }
    setActive("All");
  }, [location.state, sport]);

  useEffect(() => {
    // Fetch all data to ensure we have matches for the listing
    dispatch(fetchCricketData());
    dispatch(fetchSoccerData());
    dispatch(fetchTennisData());
    
    // Also fetch inplay specifically if needed by components
    dispatch(fetchCricketInplayData());
    dispatch(fetchSoccerInplayData());
    dispatch(fetchTennisInplayData());
  }, [dispatch]);

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
        {content}
    </div>
  )
}

export default Sports