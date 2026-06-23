import React from "react";
import { useSelector } from "react-redux";
import { IoInformationCircle } from "react-icons/io5";
import { FaCrown } from "react-icons/fa6";
import {
  blockingStatusLabel,
  isSelectionBetBlocked,
} from "../../utils/bettingGstatus";

function PremiumFancy({
  openBetSlip,
  premiumFancyData,
  gameid,
  match,
  sportSid = 4,
  gameName = "Cricket Game",
  providerCGameId,
}) {
  const { pendingBet } = useSelector((state) => state.bet);

  const fancyMarkets = Array.isArray(premiumFancyData)
    ? premiumFancyData.map((item) => {
        const back1 = item.odds?.find((o) => o.oname === "back1");
        const lay1 = item.odds?.find((o) => o.oname === "lay1");

        return {
          marketid: item.marketid,
          selectionId:
            item.sid ??
            (item.marketid?.includes("_")
              ? String(item.marketid).split("_").pop()
              : null),
          event_id: item.event_id,
          title: item.team || "-",
          gameType: item.gameType || "Normal",
          gtype: item.gtype,
          values: [
            { value: lay1?.odds ?? 0, odds: lay1?.size ?? 0 },
            { value: back1?.odds ?? 0, odds: back1?.size ?? 0 },
          ],
          min: item.min ?? 0,
          max: item.max ?? 0,
          gstatus: item.gstatus != null ? item.gstatus : item.status,
          marketStatus:
            item.marketStatus != null ? item.marketStatus : item.status,
          statusLabel: item.statusLabel,
        };
      })
    : [];

  const formatToK = (num) => {
    if (!num || num < 1000) return num;
    const n = Number(num);
    return `${n / 1000}k`;
  };

  if (!fancyMarkets.length) {
    return (
      <div>
        <div className="bg-gradient-to-r from-[#b8860b] to-[#d4a017] h-10 p-2 pl-4 flex items-center gap-2">
          <FaCrown className="text-white text-sm" />
          <span className="text-white font-semibold text-sm">Premium Fancy</span>
        </div>
        <p className="text-gray-400 text-sm py-4 px-3">No premium markets available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-[#b8860b] to-[#d4a017] h-10 p-2 pl-4 flex items-center gap-2">
        <FaCrown className="text-white text-sm" />
        <span className="text-white font-semibold text-sm">Premium Fancy</span>
      </div>

      <div className="flex justify-end items-center gap-10 text-white py-2 pr-6">
        <span className="text-sm">No</span>
        <span className="text-sm">Yes</span>
      </div>

      <div>
        {fancyMarkets.map((market, idx) => {
          const ballRunning = market.statusLabel === "Ball Running";
          const rowBlocked =
            ballRunning ||
            isSelectionBetBlocked(
              { gstatus: market.gstatus },
              market.marketStatus
            );
          const overlayText = ballRunning
            ? "Ball Running"
            : blockingStatusLabel(
                { gstatus: market.gstatus },
                market.marketStatus
              ) || "Suspended";

          return (
            <React.Fragment key={`premium-${idx}`}>
              <div className="bg-[#2a2418] text-white flex justify-between items-center pl-2 mb-[2px] rounded-r-2xl border-l-2 border-[#d4a017]">
                <div className="flex-1 text-[14px] font-bold">
                  {market.title}
                  <p className="text-[#d4a017]">
                    {pendingBet
                      ?.filter(
                        (item) =>
                          item.betSource === "providerC" &&
                          item.gameType === market.gameType &&
                          item.teamName?.toLowerCase() ===
                            market.title?.toLowerCase()
                      )
                      .reduce((sum, item) => sum + (item.totalPrice || 0), "")}
                  </p>
                </div>

                <div className="relative flex gap-1">
                  {rowBlocked && (
                    <div
                      className="absolute inset-0 flex items-center justify-center 
                                 bg-gray-500/60 bg-opacity-40 backdrop-blur-sm 
                                 rounded-lg z-10 px-1"
                    >
                      <span className="text-white font-semibold text-[11px] text-center leading-tight">
                        {overlayText}
                      </span>
                    </div>
                  )}

                  {market.values.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        if (!rowBlocked) {
                          openBetSlip({
                            type: i === 0 ? "No" : "Yes",
                            selection: market.title,
                            odds: item.value,
                            xValue: item.odds,
                            otype: i === 0 ? "lay" : "back",
                            gameId: gameid,
                            eventName: match,
                            gameType: market.gameType || "Normal",
                            marketName: market.title,
                            min: market.min ?? 0,
                            max: market.max ?? 0,
                            sid: sportSid,
                            sportSid,
                            gameName,
                            marketId: market.marketid,
                            selectionId: market.selectionId,
                            fancyScore: item.value,
                            isFancy: true,
                            isPremium: true,
                            providerCGameId: providerCGameId || gameid,
                          });
                        }
                      }}
                      className={`flex flex-col justify-center items-center rounded-lg w-[60px] text-black py-1 transition
                        ${i === 0 ? "bg-[#72BBEF]" : "bg-[#FAA9BA]"}
                        ${
                          rowBlocked
                            ? "opacity-40 pointer-events-none"
                            : "cursor-pointer hover:opacity-90"
                        }
                      `}
                    >
                      <span className="text-[1.071rem] font-bold leading-none">
                        {formatToK(item.value)}
                      </span>
                      <span className="text-[.643rem]">{item.odds}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-1 justify-end mr-3 py-2">
                <IoInformationCircle className="text-gray-400" />
                <span className="text-xs text-gray-400">
                  min/max &nbsp;{market.min}/{formatToK(market.max)}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default PremiumFancy;
