import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { getBetHistory } from '../../features/sports/betReducer';
import { MdArrowBackIos } from "react-icons/md";
import BetCard from '../../components/Bethistory/BetCard';

const PAGE_SIZE = 5;

function CurrentBets() {
  const dispatch = useDispatch();
  const { betHistory, betHistoryPagination, loading } = useSelector(
    (state) => state.bet
  );
  const [page, setPage] = useState(1);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const fetchBets = (pageNum = page) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 3);

    dispatch(
      getBetHistory({
        startDate: formatDate(start),
        endDate: formatDate(end),
        page: pageNum,
        selectedGame: "",
        selectedVoid: "unsettle",
        limit: PAGE_SIZE,
      })
    );
  };

  useEffect(() => {
    fetchBets(page);
  }, [page]);

  const mappedBetData = useMemo(() => {
    if (!Array.isArray(betHistory)) return [];

    return betHistory
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
          possibleProfit: Number(bet.betAmount ?? 0),
          possibleLoss: Number(bet.price ?? 0),
          profitLoss: Number(bet.profitLossChange ?? 0),
          time: created.toLocaleString(),
          placedTs: created.getTime(),
          selection: bet.teamName || '',
          otype: bet.otype === 'back' ? 'Back' : 'Lay',
          fancyScore: bet.fancyScore ?? bet.fancy_score ?? null,
        };
      })
      .sort((a, b) => (b.placedTs ?? 0) - (a.placedTs ?? 0));
  }, [betHistory]);

  const totalPages = Math.max(1, betHistoryPagination?.pages ?? 1);
  const totalBets = betHistoryPagination?.total ?? mappedBetData.length;

  return (
    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full pb-24">
      <div className="bg-[#000] h-10 flex items-center gap-2">
        <button type="button" onClick={() => window.history.back()} aria-label="Go back">
          <MdArrowBackIos className="text-white text-md font-semibold" />
        </button>
        <span className="text-[18px] font-bold">Current Bet</span>
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-sm font-semibold text-gray-400">Loading current bets...</div>
          </div>
        ) : (
          <>
            <BetCard data={mappedBetData} compact />

            {totalBets > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-3 mt-4 text-sm text-gray-300">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-gray-600 rounded bg-[#262c32] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages} · {totalBets} bets
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-600 rounded bg-[#262c32] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CurrentBets;
