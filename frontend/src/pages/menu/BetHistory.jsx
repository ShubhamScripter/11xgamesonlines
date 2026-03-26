import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/Header/Header';
import HeaderLogin from '../../components/Header/HeaderLogin';
import { MdArrowBackIos } from "react-icons/md";
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { AiFillCalendar } from "react-icons/ai";
import BetCard from '../../components/Bethistory/BetCard';
import { getBetHistory } from '../../features/sports/betReducer';

function BetHistory() {
  const dispatch = useDispatch();
  const { betHistory, loading, errorMessage } = useSelector((state) => state.bet);
  
  const [state, setState] = useState([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
      }
    ]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('Completed');
    const [page, setPage] = useState(1);
    const [selectedGame, setSelectedGame] = useState('');
    const [selectedVoid, setSelectedVoid] = useState('settel');
    const [limit, setLimit] = useState(10);
  
    const calendarRef = useRef(null);
  
    // Function to map API response to UI format
    const mapBetData = (apiData) => {
      if (!apiData || !Array.isArray(apiData)) return [];
      
      return apiData.map((bet) => ({
        id: bet._id || bet.id || Math.random().toString(36).substr(2, 9),
        match: bet.eventName || 'Unknown Match',
        market: bet.marketName || 'Unknown Market',
        type: bet.otype === 'back' ? 'Back' : 'Lay',
        selection: bet.teamName || 'Unknown Selection',
        oddsReq: bet.xValue || 0,
        avgOdds: bet.xValue || 0, // Using same value as oddsReq since API doesn't provide avgOdds
        matched: bet.price || 0,
        placed: new Date(bet.createdAt).toLocaleString(),
        taken: new Date(bet.createdAt).toLocaleString(),
        profit: bet.resultAmount || 0,
        status: getStatusFromVoid(bet.void, bet.settled),
        date: new Date(bet.date || bet.createdAt).toISOString().split('T')[0]
      }));
    };

    // Helper function to determine status based on void and settled fields
    const getStatusFromVoid = (voidStatus, settled) => {
      if (voidStatus === 'void') return 'Voided';
      if (settled === 'settled') return 'Completed';
      return 'Cancelled';
    };

    const [filteredBets, setFilteredBets] = useState([]);
  
    // Function to fetch bet history from API
    const fetchBets = () => {
      const { startDate, endDate } = state[0];
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      dispatch(getBetHistory({ 
        startDate: startDateStr, 
        endDate: endDateStr, 
        page, 
        selectedGame, 
        selectedVoid, 
        limit 
      }));
    };

    const handleFilter = () => {
      fetchBets();
    };
  
    // Update filteredBets when betHistory changes
    useEffect(() => {
      if (betHistory && betHistory.length > 0) {
        const mappedData = mapBetData(betHistory);
        setFilteredBets(mappedData);
      } else {
        setFilteredBets([]);
      }
    }, [betHistory]);

    // Initial fetch on component mount
    useEffect(() => {
      fetchBets();
    }, []);

    // Refetch when selectedVoid changes
    useEffect(() => {
      fetchBets();
    }, [selectedVoid]);
    
    // Close calendar when clicking outside
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
  
  return (
    <div>
      <HeaderLogin />
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div
        onClick={() => window.history.back()} 
        >
          <MdArrowBackIos className='text-white text-2xl font-semibold' />
        </div>
        <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">My Bets</span>
      </div>

      <div className='bg-[#eef6fb] p-2 flex items-center justify-around'>
        <span  className='text-sm font-semibold'>Exchange</span>
        <span className='text-sm font-semibold'>Bookmaker</span>
        <span className='text-sm font-semibold'>FancyBet</span>
        <span className='text-sm font-semibold'>SportsBook</span>
      </div>

      <div className='bg-[#262c32] p-2'>
        {/* Bet Status Dropdown */}
        <div className='flex items-center justify-between relative'>
          <select
            name="Bet Status"
            className='bg-[#1b1f23] text-white pl-20 py-2 rounded-lg w-full'
            value={selectedVoid}
            onChange={(e) => setSelectedVoid(e.target.value)}
          >
            <option value="unsettle">Unsettled</option>
            <option value="settel">Settled</option>
            <option value="void">Void</option>
          </select>
          <span className='absolute left-0 text-white pl-2'>Bet Status</span>
        </div>

        {/* Search Section */}
        <div className='flex items-center gap-5 mt-1 md:mt-2'>
          {/* Date Range Picker */}
          <div className="relative w-max">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-green-600 rounded text-green-500 bg-transparent"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <span className="material-icons text-green-500"><AiFillCalendar /></span>
              {state[0].startDate.toLocaleDateString()} - {state[0].endDate.toLocaleDateString()}
            </button>
            {showCalendar && (
              <div ref={calendarRef} className="absolute z-50 mt-2">
                <DateRange
                  editableDateInputs={true}
                  onChange={item => {
                    setState([item.selection]);
                    // setShowCalendar(false); // Close after first select
                  }}
                  moveRangeOnFirstSelection={false}
                  ranges={state}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              className='bg-[#17934e] p-2 rounded-lg text-xl font-semibold'
              onClick={handleFilter}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Bets List */}
      <div className='bg-[#f1f7ff] min-h-[70vh]'>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg font-semibold text-gray-600">Loading bet history...</div>
          </div>
        ) : errorMessage ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg font-semibold text-red-600">Error: {errorMessage}</div>
          </div>
        ) : (
          <BetCard data={filteredBets} />
        )}
      </div>
    </div>
  )
}

export default BetHistory