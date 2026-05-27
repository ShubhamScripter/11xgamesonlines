// import React ,{useState,useEffect} from 'react'
// import { useDispatch, useSelector } from "react-redux";
// import {getBetHistory} from '../../features/sports/betReducer';
// import { MdArrowBackIos } from "react-icons/md";
// import HeaderLogin from '../../components/Header/HeaderLogin'
// import BetCard from '../../components/Bethistory/BetCard';

// const allBetData = [
//   {
//     id: "mclwb7zm",
//     match: "Kobe v Hiroshima",
//     market: "Match Odds",
//     type: "Back",
//     selection: "Kobe",
//     oddsReq: 1.15,
//     avgOdds: 1.15,
//     matched: 10,
//     placed: "7/7/2025, 5:20:59 PM",
//     taken: "7/7/2025, 5:20:59 PM",
//     profit: 1.5,
//     status: "Completed",
//     date: "2025-10-11"
//   }
// ];
// function CurrentBets() {
//   const dispatch = useDispatch();
//   const { betHistory, loading, successMessage } = useSelector(
//     (state) => state.bet
//   );
//   console.log("betHistory", betHistory);
//   const [selectedStatus, setSelectedStatus] = useState('Completed');
//   const currentDate = new Date();
//   const oneMonthAgo = new Date();
//   oneMonthAgo.setMonth(currentDate.getMonth() - 1);
//   const formatDate = (date) => date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
//   const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
//   const [endDate, setEndDate] = useState(formatDate(currentDate));
//   const [page, setPage] = useState(1);
//   const [selectedOption, setSelectedOption] = useState("LIVE DATA");
//   const [selectedGame, setSelectedGame] = useState("");
//   const [selectedVoid, setSelectedVoid] = useState("unsettle");
//   const [pages, setPages] = useState(10);

//   useEffect(() => {
//     const currentDate = new Date();
//     const twoDaysAgo = new Date();
//     twoDaysAgo.setDate(currentDate.getDate() - 1);

//     const oneMonthAgo = new Date();
//     oneMonthAgo.setMonth(currentDate.getMonth() - 1);
//     const fiveMonthAgo = new Date();
//     fiveMonthAgo.setMonth(currentDate.getMonth() - 12);

//     if (selectedOption === "LIVE DATA") {
//       setStartDate(formatDate(currentDate));
//       setEndDate(formatDate(currentDate));
//     } else if (selectedOption === "BACKUP DATA") {
//       setStartDate(formatDate(oneMonthAgo));
//       setEndDate(formatDate(twoDaysAgo));
//     } else if (selectedOption === "OLD DATA") {
//       setStartDate(formatDate(fiveMonthAgo));
//       setEndDate(formatDate(currentDate));
//     }
//   }, [selectedOption]);
//   const handleOptionChange = (event) => {
//     setSelectedOption(event.target.value);
//   };

//   const fetchBets = () => {
//     if (!startDate || !endDate) return;
//     dispatch(getBetHistory({ startDate, endDate, page, selectedGame, selectedVoid, limit: pages }));
//   };

//   useEffect(() => {
//     if (startDate && endDate) fetchBets();
//   }, [page, startDate, endDate, selectedGame, selectedVoid, pages]);

//   useEffect(() => {
//     if (pages) fetchBets();
//   }, [pages]);

//   return (
//     <div>
//       <HeaderLogin/>
//       <div className="bg-[#000] h-10 flex items-center px-5 relative">
//         <div
//         onClick={() => window.history.back()} 
//         >
//           <MdArrowBackIos className='text-white text-2xl font-semibold' />
//         </div>
//         <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">Current Bets</span>
//       </div>
//       <div className='bg-[#eef6fb] h-15 flex items-center justify-around'>
//         <span>Exchange</span>
//         <span>Bookmaker</span>
//         <span>FancyBet</span>
//         <span>SportsBook</span>
//       </div>
//       <div className='bg-[#262c32] p-4'>
//           {/* Bet Status Dropdown */}
//           <div className='flex items-center justify-between relative'>
//             <select
//               name="Bet Status"
//               className='bg-[#1b1f23] text-white pl-20 py-2 rounded-lg w-full'
//               value={selectedStatus}
//               onChange={(e) => setSelectedStatus(e.target.value)}
//             >
//               <option value="Completed">Matched</option>
//               <option value="Cancelled">UnMatched</option>
//             </select>
//             <span className='absolute left-0 text-white pl-2'>Bet Status</span>
//           </div>
//           <div className='flex items-center mt-4 justify-end gap-5'>
//             <span className='text-xl font-bold text-[#17934e]'>Order By</span>
//             <div className='flex items-center gap-2 text-white'>
//               <input type="checkbox" name="BetPlaced" id="betPlaced" />
//               <label htmlFor="BetPlaced">Bet Placed</label>
              
//             </div>
//             <div className='flex items-center gap-2 text-white'>
//               <input type="checkbox" name="Market" id="Market" />
//               <label htmlFor="BetPlaced">Market</label>
//             </div>
//           </div>
//       </div>
//       {/* Main Section */}
//       <div className='bg-[#f1f7ff] min-h-[70vh] '>
//         <BetCard data={allBetData} />
//       </div>
//     </div>
//   )
// }

// export default CurrentBets


// ...existing imports...
import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { getBetHistory } from '../../features/sports/betReducer';
import { MdArrowBackIos } from "react-icons/md";
import BetCard from '../../components/Bethistory/BetCard';

// Remove the hardcoded allBetData array

function CurrentBets() {
  const dispatch = useDispatch();
  const { betHistory, loading, successMessage } = useSelector(
    (state) => state.bet
  );
  const [selectedStatus, setSelectedStatus] = useState('Completed');
  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const formatDate = (date) => date.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState("LIVE DATA");
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedVoid, setSelectedVoid] = useState("unsettle");
  const [pages, setPages] = useState(10);

  useEffect(() => {
    const currentDate = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(currentDate.getDate() - 1);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    const fiveMonthAgo = new Date();
    fiveMonthAgo.setMonth(currentDate.getMonth() - 12);

    if (selectedOption === "LIVE DATA") {
      setStartDate(formatDate(currentDate));
      setEndDate(formatDate(currentDate));
    } else if (selectedOption === "BACKUP DATA") {
      setStartDate(formatDate(oneMonthAgo));
      setEndDate(formatDate(twoDaysAgo));
    } else if (selectedOption === "OLD DATA") {
      setStartDate(formatDate(fiveMonthAgo));
      setEndDate(formatDate(currentDate));
    }
  }, [selectedOption]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const fetchBets = () => {
    if (!startDate || !endDate) return;
    dispatch(getBetHistory({ startDate, endDate, page, selectedGame, selectedVoid, limit: pages }));
  };

  useEffect(() => {
    if (startDate && endDate) fetchBets();
  }, [page, startDate, endDate, selectedGame, selectedVoid, pages]);

  useEffect(() => {
    if (pages) fetchBets();
  }, [pages]);

  // Current bets = unsettled bets (status: 0)
  // Show Expected Profit/Loss from betAmount & price (as requested).
  const mappedBetData = useMemo(() => {
    if (!Array.isArray(betHistory)) return [];
    return betHistory
      .filter((bet) => Number(bet?.status) === 0)
      .map((bet, idx) => {
        const created = bet.createdAt ? new Date(bet.createdAt) : new Date();
        return {
          betKind: 'sports',
          id: bet._id || bet.id || `bet-${idx}`,
          marketName: bet.marketName || '—',
          gameName: bet.gameName || '—',
          eventName: bet.eventName || '—',
          odd:
            bet.xValue != null && bet.xValue !== ''
              ? Number(bet.xValue)
              : Number(bet.price ?? 0),
          stake: Number(bet.betAmount ?? 0),
          // Expected P/L for current (unsettled) bets:
          // - expected profit = betAmount
          // - expected loss = price
          possibleProfit: Number(bet.betAmount ?? 0),
          possibleLoss: Number(bet.price ?? 0),
          profitLoss: Number(bet.profitLossChange ?? 0),
          time: created.toLocaleString(),
          placedTs: created.getTime(),
          selection: bet.teamName || '',
          otype: bet.otype === 'back' ? 'Back' : 'Lay',
          fancyScore: bet.fancyScore ?? bet.fancy_score ?? null,
        };
      });
  }, [betHistory]);

  return (
    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full pb-24">
      <div className="bg-[#000] h-10 flex items-center">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-md font-semibold" />
        </div>
        <span className="text-[18px] font-bold">
         Current Bet
        </span>
      </div>
      <div className='grid grid-cols-4 gap-3'>
        <span className='col-span-1 text-center bg-gray-800 py-2 rounded-sm'>Exchange</span>
        <span className='col-span-1 text-center bg-gray-800 py-2 rounded-sm'>Bookmaker</span>
        <span className='col-span-1 text-center bg-gray-800 py-2 rounded-sm'>FancyBet</span>
        <span className='col-span-1 text-center bg-gray-800 py-2 rounded-sm'>SportsBook</span>
      </div>
      <div className='bg-[#262c32] p-4'>
        {/* Bet Status Dropdown */}
        <div className='flex items-center justify-between relative'>
          <select
            name="Bet Status"
            className='bg-[#1b1f23] text-white py-2 pl-1 rounded-lg w-full'
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="Completed">Matched</option>
            <option value="Cancelled">UnMatched</option>
          </select>
          {/* <span className='absolute left-0 text-white pl-2'>Bet Status</span> */}
        </div>
        <div className='flex items-center mt-4 justify-end gap-5'>
          <span className='text-xl font-bold text-[#17934e]'>Order By</span>
          <div className='flex items-center gap-2 text-white'>
            <input type="checkbox" name="BetPlaced" id="betPlaced" />
            <label htmlFor="BetPlaced">Bet Placed</label>
          </div>
          <div className='flex items-center gap-2 text-white'>
            <input type="checkbox" name="Market" id="Market" />
            <label htmlFor="BetPlaced">Market</label>
          </div>
        </div>
      </div>
      {/* Main Section */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg font-semibold text-gray-600">Loading current bets...</div>
          </div>
        ) : (
          <BetCard data={mappedBetData} />
        )}
      </div>
    </div>
  )
}

export default CurrentBets