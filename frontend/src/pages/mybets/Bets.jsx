import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HeaderLogin from "../../components/Header/HeaderLogin";
import { MdArrowBackIos, MdPlayArrow, MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import Exchange from "./Exchange";
import { getBetHistory } from "../../features/sports/betReducer";
import api from "../../utils/axiosConfig";
const parlaybet=[]
function Bets() {
  const dispatch = useDispatch();
  const { betHistory, loading, errorMessage } = useSelector((state) => state.bet);
  const { user } = useSelector((state) => state.auth);
  
  const [selected, setselected] = useState("Sports");
  const [showdetails, setshowdetails] = useState(false);
  const [betdata, setBetdata] = useState([]);
  const [casinoBetdata, setCasinoBetdata] = useState([]);
  const [casinoLoading, setCasinoLoading] = useState(false);
  const [casinoError, setCasinoError] = useState("");

  // Function to map API response to UI format for current bets
  const mapCurrentBetData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];
    
    return apiData
      .filter((bet) => Number(bet?.status) === 0)
      .map((bet) => ({
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
      startDate,
      endDate,
      page: 1, 
      selectedGame: '', 
      selectedVoid: 'unsettle', 
      limit: 50 
    }));
  };

  const mapCasinoBetData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];

    return apiData.map((bet, idx) => ({
      id: bet._id || bet.game_round || `casino-${idx}`,
      match: bet.game_uid || "Casino",
      market: "Casino",
      type: "CASINO",
      selection: bet.game_round || "-",
      odds: "-",
      stake: Number(bet.bet_amount || 0),
      profit: Number(bet.change || 0),
      placed: bet.createdAt ? new Date(bet.createdAt).toLocaleString() : "",
    }));
  };

  const fetchCasinoBets = async () => {
    try {
      setCasinoLoading(true);
      setCasinoError("");

      let userId = user?._id || user?.id;
      if (!userId) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userData = JSON.parse(userStr);
          userId = userData._id || userData.id;
        }
      }
      if (!userId) return;

      const response = await api.get(`/casino/bet-history/${userId}`, {
        withCredentials: true,
      });

      const list = response?.data?.data || [];
      setCasinoBetdata(mapCasinoBetData(list));
    } catch (e) {
      console.error("Error fetching casino bets:", e);
      setCasinoError(e?.response?.data?.message || "Failed to load casino bets");
      setCasinoBetdata([]);
    } finally {
      setCasinoLoading(false);
    }
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
    fetchCasinoBets();
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
            selected === "Sports" ? "border-b-2 font-semibold" : ""
          } flex gap-2 cursor-pointer`}
          onClick={() => setselected("Sports")}
        >
          <span>Sports</span>
          <span className="bg-black text-white rounded-lg px-1 mb-1">{betdata.length}</span>
        </div>
        <div
          className={`${
            selected === "Casino" ? "border-b-2 font-semibold" : ""
          } flex gap-2 cursor-pointer`}
          onClick={() => setselected("Casino")}
        >
          <span>Casino</span>
          <span className="bg-black text-white rounded-lg px-1 mb-1">{casinoBetdata.length}</span>
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
              {selected === "Sports" ? (
                <Exchange betdata={betdata} />
              ) : casinoLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-lg font-semibold text-gray-600">Loading casino bets...</div>
                </div>
              ) : casinoError ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-lg font-semibold text-red-600">Error: {casinoError}</div>
                </div>
              ) : (
                <Exchange betdata={casinoBetdata} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Bets;