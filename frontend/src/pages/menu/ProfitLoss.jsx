// import React, { useState, useRef, useEffect, useMemo } from 'react'
// import { useDispatch, useSelector } from 'react-redux';
// import { MdArrowBackIos } from "react-icons/md";
// import HeaderLogin from '../../components/Header/HeaderLogin'
// import { DateRange } from 'react-date-range';
// import 'react-date-range/dist/styles.css';
// import 'react-date-range/dist/theme/default.css';
// import { AiFillCalendar } from "react-icons/ai";
// import ProfitLossCard from '../../components/menucomp/ProfitLossCard';
// import { getProLoss } from '../../features/sports/betReducer';
// function ProfitLoss() {
//   const dispatch = useDispatch();
//   const { proLossHistory, loading, errorMessage } = useSelector((state) => state.bet);
  
//   const [state, setState] = useState([
//       {
//         startDate: new Date(),
//         endDate: new Date(),
//         key: 'selection'
//       }
//     ]);
//     const [showCalendar, setShowCalendar] = useState(false);
//     const [selectedStatus, setSelectedStatus] = useState('Completed');
  
//     const calendarRef = useRef(null);

//     // Function to map API response to UI format for ProfitLoss
//     const mapProfitLossData = (apiData) => {
//       if (!apiData || !Array.isArray(apiData)) return [];
      
//       return apiData.map((bet, idx) => ({
//         id: bet._id || bet.id || `profit-loss-${idx}`,
//         match: bet.eventName || 'Unknown Match',
//         market: bet.marketName || 'Unknown Market',
//         type: bet.otype === 'back' ? 'Back' : 'Lay',
//         selection: bet.teamName || 'Unknown Selection',
//         oddsReq: bet.xValue || 0,
//         avgOdds: bet.xValue || 0,
//         matched: bet.myProfit || 0, // Using myProfit as the main profit/loss value
//         placed: bet.date ? new Date(bet.date).toLocaleString() : '',
//         taken: bet.date ? new Date(bet.date).toLocaleString() : '',
//         profit: bet.myProfit || 0,
//         status: getStatusFromProfit(bet.myProfit),
//         date: bet.date ? new Date(bet.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
//         // Additional fields from API response
//         winAmount: bet.WinAmount || 0,
//         lossAmount: bet.LossAmount || 0,
//         gameName: bet.gameName || 'Unknown Game'
//       }));
//     };

//     // Helper function to determine status based on profit
//     const getStatusFromProfit = (profit) => {
//       if (profit > 0) return 'Completed';
//       if (profit < 0) return 'Loss';
//       return 'Cancelled';
//     };

//     const [filteredBets, setFilteredBets] = useState([]);
  
//     // Function to fetch profit/loss data from API
//     const fetchProfitLoss = () => {
//       const { startDate, endDate } = state[0];
//       const startDateStr = startDate.toISOString().split('T')[0];
//       const endDateStr = endDate.toISOString().split('T')[0];
      
//       dispatch(getProLoss({ 
//         startDate: startDateStr, 
//         endDate: endDateStr, 
//         page: 1, 
//         limit: 50,
//         gameName: '',
//         eventName: '',
//         marketName: ''
//       }));
//     };

//     const handleFilter = () => {
//       fetchProfitLoss();
//     };
  
//     // Update filteredBets when proLossHistory changes
//     useEffect(() => {
//       if (proLossHistory && proLossHistory.length > 0) {
//         const mappedData = mapProfitLossData(proLossHistory);
//         setFilteredBets(mappedData);
//       } else {
//         setFilteredBets([]);
//       }
//     }, [proLossHistory]);

//     // Initial fetch on component mount
//     useEffect(() => {
//       fetchProfitLoss();
//     }, []);
    
//     // Close calendar when clicking outside
//     useEffect(() => {
//       function handleClickOutside(event) {
//         if (calendarRef.current && !calendarRef.current.contains(event.target)) {
//           setShowCalendar(false);
//         }
//       }
//       if (showCalendar) {
//         document.addEventListener("mousedown", handleClickOutside);
//       }
//       return () => {
//         document.removeEventListener("mousedown", handleClickOutside);
//       };
//     }, [showCalendar]);
//   return (
//     <div>
//       <HeaderLogin/>
//       <div className="bg-[#000] h-10 flex items-center px-5 relative">
//         <div
//         onClick={() => window.history.back()} 
//         >
//           <MdArrowBackIos className='text-white text-2xl font-semibold' />
//         </div>
//         <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">Profit & Loss</span>
//       </div>
//       <div className='bg-[#eef6fb] p-2 flex items-center justify-around'>
//         <span className='text-sm font-semibold'>Exchange</span>
//         <span className='text-sm font-semibold'>Bookmaker</span>
//         <span className='text-sm font-semibold'>FancyBet</span>
//         <span className='text-sm font-semibold'>SportsBook</span>
//       </div>
//       <div className='bg-[#262c32] p-2'>
//         {/* Search Section */}
//         <div className='flex items-center gap-5 '>
//                 {/* Date Range Picker */}
//                 <div className="relative w-max">
//                   <button
//                     className="flex items-center gap-2 px-4 py-2 border border-green-600 rounded text-green-500 bg-transparent"
//                     onClick={() => setShowCalendar(!showCalendar)}
//                   >
//                     <span className="material-icons text-green-500"><AiFillCalendar /></span>
//                     {state[0].startDate.toLocaleDateString()} - {state[0].endDate.toLocaleDateString()}
//                   </button>
//                   {showCalendar && (
//                     <div ref={calendarRef} className="absolute z-50 mt-2">
//                       <DateRange
//                         editableDateInputs={true}
//                         onChange={item => {
//                           setState([item.selection]);
//                           setShowCalendar(false); // Close after first select
//                         }}
//                         moveRangeOnFirstSelection={false}
//                         ranges={state}
//                       />
//                     </div>
//                   )}
//                 </div>
      
//                 {/* Submit Button */}
//                 <div>
//                   <button
//                     className='bg-[#17934e] p-2 rounded-lg text-xl font-semibold'
//                     onClick={handleFilter}
//                   >
//                     Submit
//                   </button>
//                 </div>
//         </div>
//       </div>
//       <div className='bg-[#f1f7ff] min-h-[70vh]'>
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="text-lg font-semibold text-gray-600">Loading profit/loss data...</div>
//           </div>
//         ) : errorMessage ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="text-lg font-semibold text-red-600">Error: {errorMessage}</div>
//           </div>
//         ) : (
//           <ProfitLossCard data={filteredBets}/>
//         )}
//       </div>
//     </div>
//   )
// }

// export default ProfitLoss

import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { MdArrowBackIos } from "react-icons/md";
import HeaderLogin from '../../components/Header/HeaderLogin';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { AiFillCalendar } from "react-icons/ai";
import ProfitLossCard from '../../components/menucomp/ProfitLossCard';
import { getProLoss } from '../../features/sports/betReducer';

function ProfitLoss() {
  const dispatch = useDispatch();
  const { proLossHistory, loading, errorMessage } = useSelector((state) => state.bet);

  // ----------------------- STATE -------------------------
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filteredBets, setFilteredBets] = useState([]);

  const calendarRef = useRef(null);

  // ----------------------- HELPER FUNCTIONS -------------------------
  // Format date to YYYY-MM-DD (local timezone, no UTC shift)
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get status based on profit
  const getStatusFromProfit = (profit) => {
    if (profit > 0) return 'Completed';
    if (profit < 0) return 'Loss';
    return 'Cancelled';
  };

  // Map API data to card format
  const mapProfitLossData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];

    return apiData.map((bet, idx) => ({
      id: bet.betId || bet._id || bet.id || `profit-loss-${idx}`,
      gameName: bet.gameName || 'Unknown Game',
      match: bet.eventName || 'Unknown Match',
      market: bet.marketName || 'Unknown Market',
      type: bet.otype === 'back' ? 'Back' : bet.otype === 'lay' ? 'Lay' : bet.otype || 'Unknown',
      selection: bet.teamName || 'Unknown Selection',
      oddsReq: bet.odds || 0, // Not available in new API response
      stake: bet.stake || 0,
      backsubtotal: bet.otype === 'back'|| bet.otype === 'Yes' ? bet.stake : 0,
      laysubtotal: bet.otype === 'lay'|| bet.otype === 'No' ? bet.stake : 0,
      commission: bet.commission || 0, // Not available in new API response
      avgOdds: 0, // Not available in new API response
      matched: bet.profit || 0,
      placed: bet.date ? new Date(bet.date).toLocaleString() : '',
      taken: bet.date ? new Date(bet.date).toLocaleString() : '',
      profit: bet.profit || 0,
      status: getStatusFromProfit(bet.profit),
      date: bet.date
        ? new Date(bet.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      winAmount: bet.winAmount || 0,
      lossAmount: bet.lossAmount || 0,
    }));
  };

  // ----------------------- API CALL -------------------------
  const fetchProfitLoss = () => {
    const { startDate, endDate } = state[0];
    const startDateStr = formatDateLocal(startDate);
    const endDateStr = formatDateLocal(endDate);

    console.log("📅 Sending date range:", startDateStr, "→", endDateStr);

    dispatch(getProLoss({
      startDate: startDateStr,
      endDate: endDateStr,
      page: 1,
      limit: 50,
      gameName: '',
      eventName: '',
      marketName: ''
    }));
  };

  const handleFilter = () => {
    fetchProfitLoss();
  };

  // ----------------------- EFFECTS -------------------------
  // Map API data to filteredBets
  useEffect(() => {
    if (proLossHistory && proLossHistory.length > 0) {
      const mappedData = mapProfitLossData(proLossHistory);
      setFilteredBets(mappedData);
    } else {
      setFilteredBets([]);
    }
  }, [proLossHistory]);

  // Initial fetch
  useEffect(() => {
    fetchProfitLoss();
  }, []);

  // Close calendar on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  // ----------------------- RENDER -------------------------
  return (
    <div>
      <HeaderLogin />
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className='text-white text-2xl font-semibold' />
        </div>
        <span className="text-white text-sm md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">
          Profit & Loss
        </span>
      </div>

      <div className='bg-[#eef6fb] p-2 flex items-center justify-around'>
        <span className='text-sm font-semibold'>Exchange</span>
        <span className='text-sm font-semibold'>Bookmaker</span>
        <span className='text-sm font-semibold'>FancyBet</span>
        <span className='text-sm font-semibold'>SportsBook</span>
      </div>

      <div className='bg-[#262c32] p-2'>
        {/* Search Section */}
        <div className='flex items-center gap-5'>
          {/* Date Range Picker */}
          <div className="relative w-max">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-green-600 rounded text-green-500 bg-transparent"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <AiFillCalendar className="text-green-500" />
              {state[0].startDate.toLocaleDateString()} - {state[0].endDate.toLocaleDateString()}
            </button>

            {showCalendar && (
              <div ref={calendarRef} className="absolute z-50 mt-2">
                <DateRange
                  editableDateInputs={true}
                  onChange={item => setState([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={state}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              className='bg-[#17934e] p-1 rounded-lg text-lg font-semibold'
              onClick={handleFilter}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Profit & Loss Table */}
      <div className='bg-[#f1f7ff] min-h-[70vh]'>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg font-semibold text-gray-600">
              Loading profit/loss data...
            </div>
          </div>
        ) : errorMessage ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg font-semibold text-red-600">
              Error: {errorMessage}
            </div>
          </div>
        ) : (
          <ProfitLossCard data={filteredBets} />
        )}
      </div>
    </div>
  );
}

export default ProfitLoss;
