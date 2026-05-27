import React from "react";

function formatOdd(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return String(n);
}

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

const BetCard = ({ data, compact = false }) => {
  const getSignedColorClass = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount === 0) return "text-gray-700";
    return amount < 0 ? "text-red-600" : "text-green-600";
  };

  const rowLabelCls = compact
    ? "p-1.5 text-[11px] text-gray-400 w-[38%] align-top"
    : "p-2 text-gray-400 md:text-base w-[40%]";
  const rowValueCls = compact
    ? "p-1.5 text-xs font-medium"
    : "p-2 font-medium md:text-base";

  const Row = ({ label, children, valueClassName = "" }) => (
    <tr className="border-b border-gray-600 last:border-0">
      <td className={rowLabelCls}>{label}</td>
      <td className={`${rowValueCls} ${valueClassName}`}>{children}</td>
    </tr>
  );

  return (
    <div className={`flex flex-col justify-center ${compact ? "gap-2" : "gap-4"}`}>
      {data.length === 0 && (
        <div className={`bg-[#262c32] ${compact ? "p-3 rounded-lg" : "p-4"}`}>
          <div className="rounded-lg shadow-md mx-auto w-full">
            <h2 className={compact ? "text-sm font-semibold" : "text-lg font-semibold"}>
              Bet Details
            </h2>
            <p className="text-gray-400 text-xs">No current bets.</p>
          </div>
        </div>
      )}
      {data.map((bet) => {
        const isCasino = bet.betKind === "casino";

        return (
          <div
            key={bet.id}
            className={`shadow-md overflow-hidden w-full mx-auto bg-[#1b1f23] ${
              compact ? "rounded-lg" : "rounded-2xl"
            }`}
          >
            <table className={`table-auto w-full ${compact ? "text-xs" : "text-sm"}`}>
              <thead className="bg-[#262c32] text-gray-200">
                <tr>
                  <th colSpan={2} className={compact ? "p-2 text-left" : "p-3 text-left"}>
                    <span className={compact ? "text-sm font-semibold" : "md:text-lg font-semibold"}>
                      {isCasino ? "Casino" : "Sports"}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isCasino ? (
                  <>
                    <Row label="Game name">{bet.gameName}</Row>
                    <Row label="Bet amount">{formatMoney(bet.betAmount)}</Row>
                    <Row
                      label="Profit / Loss"
                      valueClassName={getSignedColorClass(bet.profitLoss)}
                    >
                      {formatMoney(bet.profitLoss)}
                    </Row>
                    <Row label="Time">{bet.time}</Row>
                  </>
                ) : (
                  <>
                    <Row label="Market name">{bet.marketName}</Row>
                    <Row label="Game name">
                      {[bet.gameName, bet.eventName].filter(Boolean).join(" · ")}
                    </Row>
                    <Row label="Odd">
                      <div className="flex flex-col">
                        <span>{formatOdd(bet.odd)}</span>
                        {(() => {
                          const fancy = bet.fancyScore;
                          const fancyStr = fancy === undefined || fancy === null ? "" : String(fancy).trim();
                          if (!fancyStr || fancyStr === "0") return null;
                          return (
                            <span className="text-xs text-blue-600 font-semibold">
                              Fancy {fancyStr}
                            </span>
                          );
                        })()}
                      </div>
                    </Row>
                    <Row label="Odd type">{bet.otype || "—"}</Row>
                    <Row label="Team name">{bet.selection || "—"}</Row>
                    <Row label="Stake">{formatMoney(bet.stake)}</Row>
                    {(bet.possibleProfit !== undefined ||
                      bet.possibleLoss !== undefined) ? (
                      <tr className="border-b border-gray-600 last:border-0">
                        <td className={`${rowLabelCls} text-gray-500`}>
                          Expected Profit / Loss
                        </td>
                        <td className={rowValueCls}>
                          <span className="text-green-600 font-semibold">
                            +{formatMoney(bet.possibleProfit)}
                          </span>
                          <span className="mx-2 text-gray-500">/</span>
                          <span className="text-red-600 font-semibold">
                            -{formatMoney(bet.possibleLoss)}
                          </span>
                        </td>
                      </tr>
                    ) : (
                      <Row
                        label="Profit / Loss"
                        valueClassName={getSignedColorClass(bet.profitLoss)}
                      >
                        {formatMoney(bet.profitLoss)}
                      </Row>
                    )}
                    <Row label="Bet result">{bet.betResult || "—"}</Row>
                    <Row label="Time">{bet.time}</Row>
                  </>
                )}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default BetCard;
