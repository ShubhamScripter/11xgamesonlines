import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

// Sample JSON data (fallback)
const reportData = [
  {
    uid: "saif420",
    tag: "AG",
    stake: 0.0,
    downlinePL: 2295.14,
    playerPL: -2295.14,
    commission: 56.03,
    uplinePL: 2295.14,
  },
  {
    uid: "bdfahad",
    tag: "AG",
    stake: 0.0,
    downlinePL: -29469.6,
    playerPL: 29469.6,
    commission: 0.0,
    uplinePL: -29469.6,
  },
  {
    uid: "bdasad 678",
    tag: "AG",
    stake: 0.0,
    downlinePL: 4065.72,
    playerPL: -4065.72,
    commission: 11.86,
    uplinePL: 4065.72,
  },
];

function SuperAgent() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [data, setData] = useState(reportData);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    gameName: '',
    eventName: '',
    marketName: '',
    userName: '',
    targetUserId: userId || '', // Use the userId from params
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [overallProfit, setOverallProfit] = useState({
    totalWin: 0,
    totalLoss: 0,
    netProfit: 0
  });

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

  // API function to fetch profit/loss reports for specific user
  const fetchProfitLossReports = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: params.page || filters.page,
        limit: params.limit || filters.limit,
        gameName: params.gameName || filters.gameName,
        eventName: params.eventName || filters.eventName,
        marketName: params.marketName || filters.marketName,
        userName: params.userName || filters.userName,
        targetUserId: params.targetUserId || filters.targetUserId,
        startDate: params.startDate || filters.startDate,
        endDate: params.endDate || filters.endDate
      });

      const response = await axiosInstance.get(`/get/profit-loss-by-downline-reports?${queryParams}`);
      
      if (response.data.success) {
        const { downlineProfitReport, pagination: paginationData, overallProfit: overallData } = response.data.data;
        
        // Map API response to UI format
        const mappedData = downlineProfitReport.map(item => ({
          uid: item.userName,
          tag: item.role?.toUpperCase() || 'USER',
          stake: 0, // Not provided in API response
          downlinePL: item.hierarchicalPL || 0,
          playerPL: item.netProfit || 0,
          commission: 0, // Not provided in API response
          uplinePL: item.netProfit || 0,
          // Additional fields from API
          userId: item.userId,
          totalWin: item.totalWin || 0,
          totalLoss: item.totalLoss || 0,
          netProfit: item.netProfit || 0
        }));

        setData(mappedData);
        setPagination(paginationData);
        setOverallProfit(overallData);
      }
    } catch (error) {
      console.error('Error fetching profit/loss reports:', error);
      // Keep fallback data on error
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (userId) {
      fetchProfitLossReports();
    }
  }, [userId]);

  // Handle search
  const handleSearch = () => {
    fetchProfitLossReports();
  };

  // Handle reset
  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      gameName: '',
      eventName: '',
      marketName: '',
      userName: '',
      targetUserId: userId || '',
      startDate: '',
      endDate: ''
    });
    fetchProfitLossReports({
      page: 1,
      limit: 10,
      gameName: '',
      eventName: '',
      marketName: '',
      userName: '',
      targetUserId: userId || '',
      startDate: '',
      endDate: ''
    });
  };

  // Handle quick date filters
  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const newFilters = { ...filters, startDate: today, endDate: today };
    setFilters(newFilters);
    fetchProfitLossReports(newFilters);
  };

  const handleYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const newFilters = { ...filters, startDate: yesterdayStr, endDate: yesterdayStr };
    setFilters(newFilters);
    fetchProfitLossReports(newFilters);
  };
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
                <td className="px-2 py-2">
                  <i className="bg-[#3db39e] text-white px-1 rounded-sm text-[14px] mr-1 font-[900]">
                    +
                  </i>
                  <a>
                    <span className="bg-[#568bc8] p-1 rounded-sm text-[10px] text-white">
                      {row.tag}
                    </span>{" "}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => navigate(`/AprofitDownline/agent/${row.userId}`)}
                    >
                      {row.uid}
                    </span>
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

export default SuperAgent;
