import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import BetCard from "../../components/Bethistory/BetCard";
import BetTypeFilters from "../../components/Bethistory/BetTypeFilters";
import { getBetHistory } from "../../features/sports/betReducer";
import api from "../../utils/axiosConfig";
import {
  buildBetFilterCounts,
  filterBetsByCategory,
  mapCasinoBetForCard,
  mapSportsBetForCard,
  sortBetsByTimeDesc,
} from "../../utils/betCategory";

const PAGE_SIZE = 5;
const FETCH_LIMIT = 500;

function Bets() {
  const dispatch = useDispatch();
  const { betHistory, loading, errorMessage } = useSelector((state) => state.bet);
  const { user } = useSelector((state) => state.auth);

  const [settlementFilter, setSettlementFilter] = useState("unsettle");
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState(["all"]);
  const [casinoBets, setCasinoBets] = useState([]);
  const [casinoLoading, setCasinoLoading] = useState(false);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const fetchSportsBets = () => {
    const end = new Date();
    const start = new Date();

    if (settlementFilter === "unsettle") {
      start.setMonth(end.getMonth() - 3);
    } else {
      start.setDate(end.getDate() - 30);
    }

    dispatch(
      getBetHistory({
        startDate: formatDate(start),
        endDate: formatDate(end),
        page: 1,
        selectedGame: "",
        selectedVoid: settlementFilter,
        limit: FETCH_LIMIT,
      })
    );
  };

  const fetchCasinoBets = async () => {
    if (settlementFilter !== "settel") {
      setCasinoBets([]);
      setCasinoLoading(false);
      return;
    }

    try {
      const userId = user?._id || user?.id;
      if (!userId) return;

      setCasinoLoading(true);
      const response = await api.get(
        `/casino/bet-history/${userId}?page=1&limit=${FETCH_LIMIT}`,
        { withCredentials: true }
      );
      setCasinoBets(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching casino bet history:", error);
      setCasinoBets([]);
    } finally {
      setCasinoLoading(false);
    }
  };

  useEffect(() => {
    fetchSportsBets();
    fetchCasinoBets();
  }, [settlementFilter, user]);

  const allBets = useMemo(() => {
    if (settlementFilter === "unsettle") {
      const sports = (betHistory || [])
        .map((b) => mapSportsBetForCard(b, { unsettledOnly: true }))
        .filter(Boolean);
      return sortBetsByTimeDesc(sports);
    }

    const sports = (betHistory || [])
      .map((b) => mapSportsBetForCard(b))
      .filter(Boolean);
    const casino = (casinoBets || [])
      .map((b, idx) => mapCasinoBetForCard(b, idx))
      .filter(Boolean);
    return sortBetsByTimeDesc([...sports, ...casino]);
  }, [betHistory, casinoBets, settlementFilter]);

  const filterCounts = useMemo(() => buildBetFilterCounts(allBets), [allBets]);

  const filteredBets = useMemo(
    () => filterBetsByCategory(allBets, typeFilter),
    [allBets, typeFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredBets.length / PAGE_SIZE));

  const paginatedBets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBets.slice(start, start + PAGE_SIZE);
  }, [filteredBets, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    setTypeFilter(["all"]);
  }, [settlementFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, filteredBets.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const isLoading = loading || (settlementFilter === "settel" && casinoLoading);

  let betsContent = null;
  if (isLoading) {
    betsContent = (
      <div className="flex justify-center items-center h-40">
        <div className="text-sm font-semibold text-gray-400">
          {settlementFilter === "unsettle"
            ? "Loading current bets..."
            : "Loading bet history..."}
        </div>
      </div>
    );
  } else if (errorMessage) {
    betsContent = (
      <div className="flex justify-center items-center h-40">
        <div className="text-sm font-semibold text-red-400">
          Error: {errorMessage}
        </div>
      </div>
    );
  } else {
    betsContent = (
      <>
        <BetCard data={paginatedBets} compact />
        {filteredBets.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-3 mt-4 mb-6 text-sm text-gray-300">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 border border-gray-600 rounded bg-[#262c32] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages} · {filteredBets.length} bets
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              className="px-3 py-1.5 border border-gray-600 rounded bg-[#262c32] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div>
      <div className="px-3 py-2 border-b border-gray-600">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettlementFilter("unsettle")}
            className={`px-3 py-1 rounded-md text-sm font-medium uppercase ${
              settlementFilter === "unsettle"
                ? "bg-[#17934e] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Unsettled
          </button>
          <button
            onClick={() => setSettlementFilter("settel")}
            className={`px-3 py-1 rounded-md text-sm font-medium uppercase ${
              settlementFilter === "settel"
                ? "bg-[#17934e] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Settled
          </button>
        </div>
      </div>

      <div className="px-2 text-white pb-30 pt-3 space-y-3">
        <BetTypeFilters
          value={typeFilter}
          onChange={setTypeFilter}
          counts={filterCounts}
        />
        {betsContent}
      </div>
    </div>
  );
}

export default Bets;
