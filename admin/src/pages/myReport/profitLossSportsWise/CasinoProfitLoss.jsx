import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";

function CasinoProfitLoss() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState({
    downlineWinAmount: 0,
    downlineLossAmount: 0,
    myProfit: 0
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    startDate: '',
    endDate: ''
  });

  // API function to fetch casino profit/loss reports
  const fetchCasinoReports = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: params.page || filters.page,
        limit: params.limit || filters.limit,
        startDate: params.startDate || filters.startDate,
        endDate: params.endDate || filters.endDate
      });

      const response = await axiosInstance.get(`/get/my-reports/by-events?${queryParams}`);
      
      if (response.data.success) {
        const { report, total: totalData } = response.data.data;
        
        // Map API response to UI format
        const mappedData = report.map(item => ({
          name: item.name,
          stake: 0, // Not provided in API response
          downlinePL: item.downlineWinAmount - item.downlineLossAmount,
          playerPL: item.myProfit,
          commission: 0, // Not provided in API response
          uplinePL: item.downlineWinAmount - item.downlineLossAmount,
          // Additional fields from API
          eventName: item.eventName,
          gameName: item.gameName,
          marketName: item.marketName,
          userName: item.userName,
          date: item.date,
          result: item.result,
          marketId: item.marketId,
          downlineWinAmount: item.downlineWinAmount,
          downlineLossAmount: item.downlineLossAmount
        }));

        setData(mappedData);
        setTotal({
          downlineWinAmount: totalData.downlineWinAmount,
          downlineLossAmount: totalData.downlineLossAmount,
          myProfit: totalData.myProfit
        });
      }
    } catch (error) {
      console.error('Error fetching casino reports:', error);
      // Keep empty data on error
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCasinoReports();
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchCasinoReports();
  };

  // Handle reset
  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      startDate: '',
      endDate: ''
    });
    fetchCasinoReports({
      page: 1,
      limit: 10,
      startDate: '',
      endDate: ''
    });
  };

  // Handle quick date filters
  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const newFilters = { ...filters, startDate: today, endDate: today };
    setFilters(newFilters);
    fetchCasinoReports(newFilters);
  };

  const handleYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const newFilters = { ...filters, startDate: yesterdayStr, endDate: yesterdayStr };
    setFilters(newFilters);
    fetchCasinoReports(newFilters);
  };

  const formatNumber = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className='text-[#243a48] text-[16px] font-[700] font-["Times_New_Roman"]'>
        Casino Profit/Loss Report
      </h2>
      {/* Filter Section */}
      <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-2 mt-4">
        <div className="flex items-center gap-4 mt-3">
          {/* From Date */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-[700]">From</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
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
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
            />
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">
              00:00
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2 pb-2">
          <button 
            onClick={handleToday}
            className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
          >
            Just For Today
          </button>
          <button 
            onClick={handleYesterday}
            className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
          >
            From Yesterday
          </button>
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] p-2 rounded-sm hover:bg-[#ffa00c] cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
          <button 
            onClick={handleReset}
            className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
          >
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
            {data.map((row, idx) => (
              <tr key={idx} className="bg-white border-y border-y-[#7e97a7]">
                <td className="px-2 py-2">{row.name}</td>
                <td className="px-2 py-2">{formatNumber(row.stake)}</td>
                <td className="px-2 py-2">
                  <span className="text-[#198754]">{formatNumber(row.downlinePL)}</span>
                </td>
                <td className="px-2 py-2">
                  <span className="text-[#dc3545]">({formatNumber(Math.abs(row.playerPL))})</span>
                </td>
                <td className="px-2 py-2">{formatNumber(row.commission)}</td>
                <td className="px-2 py-2">
                  <span>{formatNumber(row.uplinePL)}</span>
                </td>
              </tr>
            ))}
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-4 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
                >
                  {loading ? 'Loading...' : 'No data available for this time period.'}
                </td>
              </tr>
            ) : (
              <tr className="bg-white border-y border-y-[#7e97a7] font-[700]">
                <td className="px-2 py-2">Total</td>
                <td className="px-2 py-2">0.00</td>
                <td className="px-2 py-2">
                  <span className="text-[#198754]">{formatNumber(total.downlineWinAmount - total.downlineLossAmount)}</span>
                </td>
                <td className="px-2 py-2">
                  <span className="text-[#dc3545]">({formatNumber(Math.abs(total.myProfit))})</span>
                </td>
                <td className="px-2 py-2">0.00</td>
                <td className="px-2 py-2">
                  <span>{formatNumber(total.downlineWinAmount - total.downlineLossAmount)}</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CasinoProfitLoss;
