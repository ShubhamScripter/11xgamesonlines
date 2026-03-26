import React, { useState } from "react";

function ProfitLossReportTable({ reportData }) {
  const [data, setData] = useState(reportData);

  // Calculate totals
  const totals = data.reduce(
    (acc, curr) => {
      acc.stake += curr.stake;
      acc.downlinePL += curr.downlinePL;
      acc.playerPL += curr.playerPL;
      acc.commission += curr.commission;
      acc.uplinePL += curr.uplinePL;
      return acc;
    },
    { stake: 0, downlinePL: 0, playerPL: 0, commission: 0, uplinePL: 0 }
  );

  const formatNumber = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <div className="mt-4">
      <table className="min-w-full text-xs text-left">
        <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
          <tr>
            <th className="px-2 py-2">UID</th>
            <th className="px-2 py-2">Stake</th>
            <th className="px-2 py-2">Downline P/L</th>
            <th className="px-2 py-2">Player P/L</th>
            <th className="px-2 py-2">Comm.</th>
            <th className="px-2 py-2">Upline/Total P/L</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="bg-white border-y border-y-[#7e97a7]">
              <td className="px-2 py-2">
                <i className="bg-[#3db39e] text-white px-1 rounded-sm text-[14px] mr-1 font-[900]">
                  +
                </i>
                <a>
                  <span className="bg-[#568bc8] p-1 rounded-sm text-[10px] text-white">
                    {row.tag}
                  </span>{" "}
                  <span className="underline cursor-pointer">{row.uid}</span>
                </a>
              </td>
              <td className="px-2 py-2">{formatNumber(row.stake)}</td>
              <td className="px-2 py-2 text-[#198754]">
                {formatNumber(row.downlinePL)}
              </td>
              <td className="px-2 py-2 text-[#dc3545]">
                ({formatNumber(Math.abs(row.playerPL))})
              </td>
              <td className="px-2 py-2">{formatNumber(row.commission)}</td>
              <td className="px-2 py-2 text-[#198754]">
                {formatNumber(row.uplinePL)}
              </td>
            </tr>
          ))}
          {data.length === 0 ? (
            <tr>
              <td
                colSpan="10"
                className="text-center py-4 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
              >
                You have no bets in this time period.
              </td>
            </tr>
          ) : (
            <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7] font-[700]">
              <td className="px-2 py-2">Total</td>
              <td className="px-2 py-2">{formatNumber(totals.stake)}</td>
              <td className="px-2 py-2 text-[#198754]">
                {formatNumber(totals.downlinePL)}
              </td>
              <td className="px-2 py-2 text-[#dc3545]">
                ({formatNumber(Math.abs(totals.playerPL))})
              </td>
              <td className="px-2 py-2">{formatNumber(totals.commission)}</td>
              <td className="px-2 py-2 text-[#198754]">
                {formatNumber(totals.uplinePL)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProfitLossReportTable;
