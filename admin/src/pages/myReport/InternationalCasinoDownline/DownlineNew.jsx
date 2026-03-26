import React from "react";

function DownlineNew() {
  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className='text-[#243a48] text-[16px] font-[700] font-["Times_New_Roman"]'>
        International Casino Profit/Loss Report by Downline
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
            <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
              <th className="px-2 py-2">Total</th>
              <th className="px-2 py-2"> 0.00</th>
              <th className="px-2 py-2">
                <span className="text-[#dc3545]">(-0.00)</span>
              </th>
              <th className="px-2 py-2">
                <span className="text-[#198754]" >0.00</span>
              </th>
              <th className="px-2 py-2 "> 0.00</th>
              <th className="px-2 py-2">
                <span className="text-[#dc3545]">(-0.00)</span>
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DownlineNew;
