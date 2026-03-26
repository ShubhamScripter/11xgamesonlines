import React, { useState } from "react";
const reportData = [];
function AprofitByDownline() {
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

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const currentdata = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className='text-[#243a48] text-[16px] font-[700] font-["Times_New_Roman"]'>
        Profit/Loss Report by Downline
      </h2>
      {/* Filter Section */}
      <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-2 mt-4">
        <div className="flex items-center gap-4 mt-3">
          {/* From Date */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-[700]">From</label>
            <input
              type="date"
              className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
            />
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">
              00:00
            </div>
          </div>
          {/* To Date */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-[700]">To</label>
            <input
              type="date"
              className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
            />
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">
              00:00
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2 pb-2">
          <button className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer">
            Just For Today
          </button>
          <button className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer">
            From Yesterday
          </button>
          <button className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] p-2 rounded-sm hover:bg-[#ffa00c] cursor-pointer">
            Search
          </button>
          <button className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer">
            Reset
          </button>
        </div>
      </div>

      {/* Table Section */}
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
            {currentdata.map((row, idx) => (
              <tr key={idx} className="bg-white border-y border-y-[#7e97a7]">
                <td className="px-2 py-2">
                  <a>
                    <span className="bg-[#568bc8] p-1 rounded-sm text-[10px] text-white">
                      {row.tag}
                    </span>{" "}
                    <span className=" cursor-pointer">{row.uid}</span>
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
    </div>
  );
}

export default AprofitByDownline;
