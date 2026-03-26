import React, { useState, useEffect } from "react";
import Navigation from "../../../components/downListComp/admin/Navigation";
import ProfitLossTable from "./ProfitLossTable";
import ProfitLossTableCasino from "./ProfitLossTableCasino";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../../utils/axiosInstance";
const ExchangeData = [
  {
    sport: "Cricket",
    match: "England v India",
    settled: "7/14/2025, 10:30:00 AM",
    profitLoss: -20,
    expanded: true,
    bets: [
      {
        username: "bakitestuser",
        betId: "mcx8bu1m",
        selection: "India",
        odds: 3.05,
        stake: 10,
        type: "back",
        placed: "7/10/2025, 3:42:51 PM",
        pnl: -10,
      },
      {
        username: "bakitestuser",
        betId: "mcx8h5rb",
        selection: "India",
        odds: 3.05,
        stake: 10,
        type: "back",
        placed: "7/10/2025, 3:46:59 PM",
        pnl: -10,
      },
    ],
  },
  {
    sport: "Cricket",
    match: "Central Stags v Dubai Capitals",
    settled: "7/10/2025, 7:30:00 PM",
    profitLoss: 0,
    expanded: false,
    bets: [],
  },
  {
    sport: "Soccer",
    match: "Kobe v Hiroshima",
    settled: "7/2/2025, 3:30:00 PM",
    profitLoss: 1.5,
    expanded: false,
    bets: [
      {
        username: "bakitestuser",
        betId: "mclwb7zm",
        selection: "Kobe",
        odds: 1.15,
        stake: 10,
        type: "back",
        placed: "7/2/2025, 5:20:59 PM",
        pnl: 1.5,
      },
    ],
  },
  {
    sport: "Cricket",
    match: "Sri Lanka v Bangladesh",
    settled: "7/2/2025, 2:30:00 PM",
    profitLoss: 5.2,
    expanded: false,
    bets: [
      {
        username: "bakitestuser",
        betId: "mclw6evp",
        selection: "Sri Lanka",
        odds: 1.52,
        stake: 10,
        type: "back",
        placed: "7/2/2025, 5:17:14 PM",
        pnl: 5.2,
      },
    ],
  },
  {
    sport: "Soccer",
    match: "Germany v Tanzania",
    settled: "7/7/2025, 1:00:00 PM",
    profitLoss: 5.7,
    expanded: false,
    bets: [
      {
        username: "bakitestuser",
        betId: "mcsqenbv",
        selection: "Germany",
        odds: 1.57,
        stake: 10,
        type: "back",
        placed: "7/7/2025, 12:10:04 PM",
        pnl: 5.7,
      },
    ],
  },
];
const Fancydata = [];

const sportsbookdata = [];
const bookmakerdata = [];

const casinodata = [
  {
    sport: "Casino",
    match: "",
    settled: "7/2/2025, 2:30:00 PM",
    profitLoss: 5.2,
    expanded: false,
    bets: [
      {
        sport: "Casino",
        validTurnover: 0,
        winLoss: 0,
        ptComm: 0,
        profitLoss: 0,
      },
    ],
  }
];
const tossdata = [];
const tiedata = [];

function BettingProfitLoss() {
  const { userId, role } = useParams();
  const [userData, setUserData] = useState(null);
  const [bettingData, setbettingData] = useState(ExchangeData);
  const [selected, setselected] = useState("ProfitLoss");
  const [selectedType, setselectedType] = useState("Exchange");
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [UserInfo, setUserInfo] = useState([]);
    
    const title = {
      superadmin: "SUD",
      admin: "AD",
      subadmin: "SAD",
      seniorSuper: "SSM",
      superAgent: "SA",
      agent: "AG",
      user: "CL",
    };
   const user = useSelector(state => state.auth.user);
    useEffect(() => {
      if (!userId) return;
      const fetchUserInfo = async () => {
        try {
          const response = await axiosInstance.get(`/get/user-profile/${userId}`);
          setUserInfo(response.data.data);
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      };
      fetchUserInfo();
      
    }, [userId]);

  // Initialize dates to last one day (yesterday to today)
  const getDefaultDates = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return {
      startDate: yesterday.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  const [startDate, setStartDate] = useState(() => {
    const dates = getDefaultDates();
    return dates.startDate;
  });
  const [endDate, setEndDate] = useState(() => {
    const dates = getDefaultDates();
    return dates.endDate;
  });

  // Function to fetch data from API
  const fetchExchangeData = async (customStartDate = null, customEndDate = null) => {
    try {
      setLoading(true);
      
      // Use custom dates if provided, otherwise use state dates
      const useStartDate = customStartDate || startDate;
      const useEndDate = customEndDate || endDate;
      
      // Use dates from state, fallback to default if not set
      const dateParams = useStartDate && useEndDate 
        ? `&startDate=${useStartDate}&endDate=${useEndDate}`
        : '';
      
      const response = await axiosInstance.get(
        `/get/profit-loss-by-downline-reports-userData?page=1&limit=10&targetUserId=${userId}${dateParams}`
      );

      if (response.data.success) {
        // Transform API data to match the expected format
        const transformedData = response.data.data.map(item => ({
          sport: item.gameName,
          match: item.eventName,
          settled: new Date(item.settledDate).toLocaleString(),
          profitLoss: item.totalProfitLoss,
          expanded: false,
          bets: item.bets.map(bet => ({
            username: bet.userName,
            betId: bet.betId,
            selection: bet.selection,
            odds: bet.odds,
            stake: bet.stake,
            type: bet.type,
            placed: new Date(bet.placedAt).toLocaleString(),
            pnl: bet.profitLoss,
          }))
        }));

        setApiData(transformedData);
        setbettingData(transformedData);
      }
    } catch (error) {
      console.error('Error fetching exchange data:', error);
      // Fallback to static data on error
      setbettingData(ExchangeData);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch casino data from API
  const fetchCasinoData = async (customStartDate = null, customEndDate = null) => {
    try {
      setLoading(true);
      
      // Use custom dates if provided, otherwise use state dates
      const useStartDate = customStartDate || startDate;
      const useEndDate = customEndDate || endDate;
      
      // Build query parameters
      let queryParams = `id=${userId}&page=1&limit=100`;
      
      // Only add date parameters if both dates are available
      if (useStartDate && useEndDate) {
        queryParams += `&startDate=${useStartDate}&endDate=${useEndDate}`;
      }
      
      const response = await axiosInstance.get(
        `/casino/all-bet-history?${queryParams}`
      );

      if (response.data.success && response.data.data.length > 0) {
        // Group bets by game_uid and game_round
        const groupedData = {};
        
        response.data.data.forEach(bet => {
          const key = `${bet.game_uid}_${bet.game_round}`;
          
          if (!groupedData[key]) {
            groupedData[key] = {
              sport: "Casino",
              match: bet.game_uid || "Unknown Game",
              settled: new Date(bet.provider_timestamp || bet.createdAt).toLocaleString(),
              profitLoss: 0,
              expanded: false,
              bets: []
            };
          }
          
          // Add individual bet details
          groupedData[key].bets.push({
            sport: bet.game_uid || "Casino",
            validTurnover: bet.bet_amount || 0,
            winLoss: bet.win_amount || 0,
            ptComm: 0,
            profitLoss: bet.change || 0
          });
          
          // Update total profit/loss for this game round
          groupedData[key].profitLoss += bet.change || 0;
        });

        // Convert grouped object to array
        const transformedData = Object.values(groupedData);
        
        setApiData(transformedData);
        setbettingData(transformedData);
      } else {
        // No data found, set empty array
        setbettingData([]);
      }
    } catch (error) {
      console.error('Error fetching casino data:', error);
      // Fallback to static data on error
      setbettingData(casinodata);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedType === "Exchange") {
      // Fetch real data from API for Exchange
      fetchExchangeData();
    } else if (selectedType === "Casino") {
      // Fetch real data from API for Casino
      fetchCasinoData();
    } else if (selectedType === "FancyBet") {
      setbettingData(Fancydata);
    } else if (selectedType === "SportsBook") {
      setbettingData(sportsbookdata);
    } else if (selectedType === "BookMaker") {
      setbettingData(bookmakerdata);
    } else if (selectedType === "Toss") {
      setbettingData(tossdata);
    } else if (selectedType === "Tie") {
      setbettingData(tiedata);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, userId]);
  return (
    <div className="p-2 mt-4 font-['Times_New_Roman']">
      <div
        className="flex gap-4 border border-[#bbb] rounded shadow-inner px-4 py-2 w-fit"
        style={{
          background: "linear-gradient(180deg, #fff, #eee)",
          boxShadow: "inset 0 2px 0 0 #ffffff80",
        }}
      >
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            {title[user?.role] || ""}
          </span>
          <span className="text-sm font-bold">{user?.userName}</span>
        </div>
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            {title[UserInfo?.role] || ""}
          </span>
          <span className="text-sm font-bold">{UserInfo?.userName}</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected={selected} userId={userId} role={role} />
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">
            Betting Profit Loss
          </h2>
          <div className="mt-4">
            <div className="border-b-2 border-b-[#060316]">
              <ul className='flex gap-1'>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'Exchange' ? 'bg-[#ffa00c]' : 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                  onClick={() => setselectedType("Exchange")}
                >
                  Exhange</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'FancyBet' ? 'bg-[#ffa00c]' : 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                  onClick={() => setselectedType("FancyBet")}
                >
                  FancyBet</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'SportsBook' ? 'bg-[#ffa00c]' : 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                  onClick={() => setselectedType("SportsBook")}
                >
                  SportsBook</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'BookMaker' ? 'bg-[#ffa00c]' : 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                  onClick={() => setselectedType("BookMaker")}
                >
                  BookMaker</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'Casino' ? 'bg-[#ffa00c]' : 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                  onClick={() => setselectedType("Casino")}
                >
                  Casino</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'Toss' ? 'bg-[#ffa00c]' : 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                  onClick={() => setselectedType("Toss")}
                >
                  Toss</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'Tie' ? 'bg-[#ffa00c]' : 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                  onClick={() => setselectedType("Tie")}
                >
                  Tie</li>
              </ul>
            </div>
            <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-2">
              <div className="flex justify-between items-center gap-2 mt-3">
                <div className="flex justify-center items-center gap-2">
                  <label htmlFor="betStatus" className="text-xs font-[700]">
                    Bet Status
                  </label>
                  <select
                    name=""
                    id=""
                    className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
                  >
                    <option value="Unmatched">Unmatched</option>
                    <option value="Matched">Matched</option>
                    <option value="Settled">Settled</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Voided">Voided</option>
                  </select>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <label htmlFor="startDate" className="text-xs font-[700]">
                    From
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
                  />
                  <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">
                    00:00
                  </div>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <label htmlFor="endDate" className="text-xs font-[700]">
                    To
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
                  />
                  <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">
                    00:00
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 pb-2">
                <button 
                  className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setStartDate(today);
                    setEndDate(today);
                    // Fetch with new dates
                    if (selectedType === "Exchange") {
                      fetchExchangeData(today, today);
                    } else if (selectedType === "Casino") {
                      fetchCasinoData(today, today);
                    }
                  }}
                >
                  Just For Today
                </button>
                <button 
                  className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];
                    setStartDate(yesterdayStr);
                    setEndDate(yesterdayStr);
                    // Fetch with new dates
                    if (selectedType === "Exchange") {
                      fetchExchangeData(yesterdayStr, yesterdayStr);
                    } else if (selectedType === "Casino") {
                      fetchCasinoData(yesterdayStr, yesterdayStr);
                    }
                  }}
                >
                  From Yesterday
                </button>
                <button
                  className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] p-2 rounded-sm hover:bg-[#ffa00c] cursor-pointer"
                  onClick={() => {
                    if (selectedType === "Exchange") {
                      fetchExchangeData();
                    } else if (selectedType === "Casino") {
                      fetchCasinoData();
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Get History"}
                </button>
                <button 
                  className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] p-2 rounded-sm hover:bg-[#ffa00c] cursor-pointer"
                  onClick={() => {
                    const defaultDates = getDefaultDates();
                    setStartDate(defaultDates.startDate);
                    setEndDate(defaultDates.endDate);
                    // Fetch with default dates
                    if (selectedType === "Exchange") {
                      fetchExchangeData(defaultDates.startDate, defaultDates.endDate);
                    } else if (selectedType === "Casino") {
                      fetchCasinoData(defaultDates.startDate, defaultDates.endDate);
                    }
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-[14px]">
                Betting History enables you to review the bets you have placed.
                Specify the time period during which your bets were placed, the
                type of markets on which the bets were placed, and the sport.
              </p>
              <p className="text-[14px] mt-2">
                Betting History is available online for the past 30 days.
              </p>
            </div>
            <div className="mt-4">
              {(loading && selectedType === "Exchange") || (loading && selectedType === "Casino") ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm">Loading data...</span>
                </div>
              ) : selectedType === "Casino" ? (
                <ProfitLossTableCasino bettingData={bettingData} />
              ) : (
                <ProfitLossTable bettingData={bettingData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BettingProfitLoss;
