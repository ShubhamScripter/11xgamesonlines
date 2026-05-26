import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  
    // Sports bet history → fields for BetCard (betKind: 'sports')
    const mapBetData = (apiData) => {
      if (!apiData || !Array.isArray(apiData)) return [];

      return apiData.map((bet) => {
        const created = bet.createdAt ? new Date(bet.createdAt) : new Date();
        return {
          betKind: 'sports',
          id: bet._id || bet.id || Math.random().toString(36).substr(2, 9),
          marketName: bet.marketName || '—',
          gameName: bet.gameName || '—',
          eventName: bet.eventName || '—',
          odd:
            bet.xValue != null && bet.xValue !== ''
              ? Number(bet.xValue)
              : Number(bet.price ?? 0),
          stake: Number(bet.betAmount ?? 0),
          profitLoss: Number(bet.profitLossChange ?? bet.resultAmount ?? 0),
          time: created.toLocaleString(),
          placedTs: created.getTime(),
          selection: bet.teamName || '',
          otype: bet.otype === 'back' ? 'Back' : 'Lay',
          betResult: bet.betResult || '—',
          fancyScore: bet.fancyScore ?? bet.fancy_score ?? null,
        };
      });
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
            `/casino/bet-history/${userId}?page=1&limit=500`,
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
      const casinoMapped = (casinoBets || []).map((bet, idx) => {
        const created = bet.createdAt ? new Date(bet.createdAt) : null;
        const ts = created ? created.getTime() : 0;
        return {
          betKind: 'casino',
          id: bet._id || bet.game_round || `casino-${idx}`,
          gameName:
            (bet.game_name && String(bet.game_name).trim()) ||
            bet.game_uid ||
            'Casino',
          betAmount: Number(bet.bet_amount ?? 0),
          profitLoss: bet?.change>=0?Number(bet.change-bet.bet_amount) : Number(bet.change),
          time: created ? created.toLocaleString() : '',
          placedTs: ts,
        };
      });

      const merged = [...sportsMapped, ...casinoMapped].sort(
        (a, b) => (b.placedTs || 0) - (a.placedTs || 0)
      );
      setFilteredBets(merged);
    }, [betHistory, casinoBets]);
  
  return (
    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full z-20 h-screen">
      <div className="bg-[#000] h-10 flex items-center">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-md font-semibold" />
        </div>
        <span className="text-[18px] font-bold">
          My Bets
        </span>
      </div>

      {/* Filters removed as requested */}

      {/* Bets List */}
      <div>
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