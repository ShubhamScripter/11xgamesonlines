import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HeaderLogin from '../../components/Header/HeaderLogin';
import { MdArrowBackIos } from "react-icons/md";
import BetCard from '../../components/Bethistory/BetCard';
import { getBetHistory } from '../../features/sports/betReducer';
import api from '../../utils/axiosConfig';

function BetHistory() {
  const dispatch = useDispatch();
  const { betHistory, loading, errorMessage } = useSelector((state) => state.bet);
  const { user } = useSelector((state) => state.auth);
  
  const [page, setPage] = useState(1);
  const [selectedGame, setSelectedGame] = useState('');
  const [limit, setLimit] = useState(10);
  const [casinoBets, setCasinoBets] = useState([]);
  
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
        profit: Number(bet.profitLossChange ?? bet.resultAmount ?? 0),
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
      const endDateStr = new Date().toISOString().split('T')[0];
      const startDateStr = new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split('T')[0];
      
      dispatch(getBetHistory({ 
        startDate: startDateStr, 
        endDate: endDateStr, 
        page, 
        selectedGame, 
        selectedVoid: 'settel', 
        limit 
      }));
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

    // Fetch casino bet history and merge
    useEffect(() => {
      const fetchCasinoBets = async () => {
        try {
          const userId = user?._id || user?.id;
          if (!userId) return;
          const response = await api.get(
            `/casino/all-bet-history?id=${userId}&page=1&limit=500`,
            { withCredentials: true }
          );
          setCasinoBets(response?.data?.data || []);
        } catch (error) {
          console.error('Error fetching casino bet history:', error);
          setCasinoBets([]);
        }
      };
      fetchCasinoBets();
    }, [user]);

    useEffect(() => {
      const sportsMapped = mapBetData(betHistory || []);
      const casinoMapped = (casinoBets || []).map((bet, idx) => ({
        id: bet._id || bet.game_round || `casino-${idx}`,
        gameName: 'Casino',
        match: bet.game_uid || 'Casino',
        market: 'Casino',
        type: 'Casino',
        selection: bet.game_round || 'Casino Bet',
        oddsReq: '-',
        avgOdds: '-',
        matched: Number(bet.bet_amount || 0),
        placed: bet.createdAt ? new Date(bet.createdAt).toLocaleString() : '',
        taken: bet.provider_timestamp
          ? new Date(bet.provider_timestamp).toLocaleString()
          : (bet.createdAt ? new Date(bet.createdAt).toLocaleString() : ''),
        profit: Number(bet.change || 0),
        status: 'Casino',
        date: bet.createdAt
          ? new Date(bet.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      }));

      const merged = [...sportsMapped, ...casinoMapped].sort(
        (a, b) => new Date(b.placed).getTime() - new Date(a.placed).getTime()
      );
      setFilteredBets(merged);
    }, [betHistory, casinoBets]);
  
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

      {/* Filters removed as requested */}

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