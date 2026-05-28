import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import BetCard from "../../components/Bethistory/BetCard";
import { getBetHistory } from "../../features/sports/betReducer";
import api from "../../utils/axiosConfig";

function Bets() {
  const dispatch = useDispatch();
  const { betHistory, loading, errorMessage } = useSelector((state) => state.bet);
  const { user } = useSelector((state) => state.auth);

  const [settlementFilter, setSettlementFilter] = useState("unsettle");
  const [casinoBetdata, setCasinoBetdata] = useState([]);
  const [casinoLoading, setCasinoLoading] = useState(false);
  const [casinoError, setCasinoError] = useState("");

  const mapSportsBetData = (apiData, filterValue) => {
    if (!apiData || !Array.isArray(apiData)) return [];

    return apiData
      .filter((bet) =>
        filterValue === "settel" ? Number(bet?.status) !== 0 : Number(bet?.status) === 0
      )
      .map((bet, idx) => {
        const created = bet.createdAt ? new Date(bet.createdAt) : new Date();
        const isUnsettled = Number(bet?.status) === 0;
        return {
          betKind: "sports",
          id: bet._id || bet.id || `sports-${idx}`,
          marketName: bet.marketName || "—",
          gameName: bet.gameName || "—",
          eventName: bet.eventName || "—",
          odd:
            bet.xValue != null && bet.xValue !== ""
              ? Number(bet.xValue)
              : Number(bet.price ?? 0),
          stake: Number(bet.betAmount ?? 0),
          profitLoss: Number(bet.profitLossChange ?? bet.resultAmount ?? 0),
          possibleProfit:
            isUnsettled ? Number(bet.betAmount ?? 0) : undefined,
          possibleLoss:
            isUnsettled ? Number(bet.price ?? 0) : undefined,
          time: created.toLocaleString(),
          placedTs: created.getTime(),
          selection: bet.teamName || "",
          otype: bet.otype === "back" ? "Back" : "Lay",
          betResult: bet.betResult || "—",
          fancyScore: bet.fancyScore ?? bet.fancy_score ?? null,
        };
      });
  };

  const fetchSportsBets = () => {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 30);
    const endDate = currentDate.toISOString().split("T")[0];

    dispatch(getBetHistory({ 
      startDate: startDate.toISOString().split("T")[0],
      endDate,
      page: 1, 
      selectedGame: '', 
      selectedVoid: settlementFilter,
      limit: 50 
    }));
  };

  const mapCasinoBetData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];

    return apiData.map((bet, idx) => {
      const created = bet.createdAt ? new Date(bet.createdAt) : null;
      return {
        betKind: "casino",
        id: bet._id || bet.game_round || `casino-${idx}`,
        gameName:
          (bet.game_name && String(bet.game_name).trim()) ||
          bet.game_uid ||
          "Casino",
        betAmount: Number(bet.bet_amount ?? 0),
        profitLoss:
          settlementFilter === "unsettle"
            ? Number(bet.bet_amount ?? 0)
            : Number(bet?.change ?? 0) - Number(bet.bet_amount ?? 0),
        time: created ? created.toLocaleString() : "",
        placedTs: created ? created.getTime() : 0,
      };
    });
  };

  const fetchCasinoBets = async () => {
    if (settlementFilter !== "settel") {
      setCasinoBetdata([]);
      setCasinoError("");
      setCasinoLoading(false);
      return;
    }

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

      const response = await api.get(`/casino/all-bet-history?id=${userId}&page=1&limit=500`, {
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

  const sportsBetData = useMemo(
    () => mapSportsBetData(betHistory, settlementFilter),
    [betHistory, settlementFilter]
  );
  const combinedBetData = useMemo(() => {
    return [...sportsBetData, ...casinoBetdata].sort(
      (a, b) => Number(b?.placedTs ?? 0) - Number(a?.placedTs ?? 0)
    );
  }, [sportsBetData, casinoBetdata]);

  useEffect(() => {
    fetchSportsBets();
    fetchCasinoBets();
  }, [settlementFilter, user]);

  let betsContent = null;
  if (loading || casinoLoading) {
    betsContent = (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold text-gray-600">Loading bets...</div>
      </div>
    );
  } else if (errorMessage || casinoError) {
    betsContent = (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold text-red-600">
          Error: {errorMessage || casinoError}
        </div>
      </div>
    );
  } else {
    betsContent = <BetCard data={combinedBetData} />;
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
      {/* Bets List */}
      <div className="px-2 text-white pb-30 pt-5">
        {betsContent}
      </div>
    </div>
  );
}

export default Bets;