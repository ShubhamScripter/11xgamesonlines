import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HeaderLogin from "../../components/Header/HeaderLogin";
import { MdArrowBackIos, MdPlayArrow, MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import Exchange from "./Exchange";
import Parlay from "./Parlay";
import { getBetHistory } from "../../features/sports/betReducer";
const parlaybet=[]
function Bets() {
  const dispatch = useDispatch();
  const { betHistory, loading, errorMessage } = useSelector((state) => state.bet);
  
  const [selected, setselected] = useState("Exchange");
  const [showdetails, setshowdetails] = useState(false);
  const [betdata, setBetdata] = useState([]);

  // Function to map API response to UI format for current bets
  const mapCurrentBetData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];
    
    return apiData.map((bet) => ({
      id: bet._id || bet.id || Math.random().toString(36).substr(2, 9),
      match: bet.eventName || 'Unknown Match',
      market: bet.marketName || 'Unknown Market',
      type: bet.otype === 'back' ? 'BACK' : 'LAY',
      selection: bet.teamName || 'Unknown Selection',
      odds: bet.xValue || 0,
      stake: bet.price || 0,
      profit: bet.betAmount || 0,
      placed: new Date(bet.createdAt).toLocaleString()
    }));
  };

  // Function to fetch current bets (unsettled)
  const fetchCurrentBets = () => {
    const currentDate = new Date();
    const startDate = currentDate.toISOString().split('T')[0];
    const endDate = currentDate.toISOString().split('T')[0];
    
    dispatch(getBetHistory({ 
      
      page: 1, 
      selectedGame: '', 
      selectedVoid: 'unsettle', 
      limit: 50 
    }));
  };

  // Update betdata when betHistory changes
  useEffect(() => {
    if (betHistory && betHistory.length > 0) {
      const mappedData = mapCurrentBetData(betHistory);
      setBetdata(mappedData);
    } else {
      setBetdata([]);
    }
  }, [betHistory]);

  // Fetch current bets on component mount
  useEffect(() => {
    fetchCurrentBets();
  }, []);

  return (
    <div>
      <HeaderLogin />
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-2xl font-semibold" />
        </div>
        <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">
          My Bets
        </span>
      </div>

      <div className="bg-[#d4e0e5] p-2 flex items-center justify-around">
        <div
          className={`${
            selected === "Exchange" ? "border-b-2 font-semibold" : ""
          } flex gap-2 cursor-pointer`}
          onClick={() => setselected("Exchange")}
        >
          <span>Exchange</span>
          <span className="bg-black text-white rounded-lg px-1 mb-1">{betdata.length}</span>
        </div>
        <div
          className={`${
            selected === "Parlay" ? "border-b-2 font-semibold" : ""
          } flex gap-2 cursor-pointer`}
          onClick={() => setselected("Parlay")}
        >
          <span>Parly</span>
          <span className="bg-black text-white rounded-lg px-1 mb-1">0</span>
        </div>
      </div>

      {/* Bets List */}
      <div className="bg-[#f1f7ff] min-h-[70vh]">
        <div className=" flex flex-col gap-4 justify-center p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg font-semibold text-gray-600">Loading current bets...</div>
            </div>
          ) : errorMessage ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg font-semibold text-red-600">Error: {errorMessage}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {`${selected}` ==="Exchange"?<Exchange betdata={betdata}/>:<Parlay betdata={parlaybet}/>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Bets;