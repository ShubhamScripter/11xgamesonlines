import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

function ACdownlinesportspl() {
  const title = {
    subadmin: "SAD",
    seniorSuper: "SSM",
    superAgent: "SA",
    agent: "AG",
    user: "CL",
  };
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize dates to last one month
  const getDefaultDates = () => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return {
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  const [startDate, setStartDate] = useState(() => {
    const dates = getDefaultDates();
    return dates.startDate;
  });
  const [endDate, setEndDate] = useState(() => {
    const dates = getDefaultDates();
    return dates.endDate;
  });

  // Get user data from localStorage
  const getUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  };

  // Fetch casino profit/loss data
  const fetchCasinoProfitLoss = async (dateFilters = {}) => {
    const user = getUser();
    if (!user) {
      console.error("User not found");
      return;
    }

    const userId = user.id || user._id;
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (dateFilters.startDate) {
        params.append('startDate', dateFilters.startDate);
      }
      if (dateFilters.endDate) {
        params.append('endDate', dateFilters.endDate);
      }

      const queryString = params.toString();
      const url = `/casino/profit-loss/${userId}${queryString ? `?${queryString}` : ''}`;
      const response = await axiosInstance.get(url);
      
      if (response.data.success && response.data.data) {
        // Map API response to match table structure
        // Each item now has its own userName and role
        const mappedData = response.data.data.map((item) => ({
          userId: item.userId,
          role: item.role,
          uid: item.userName || item.userId || "",
          tag: title[item.role] || item.role?.substring(0, 2).toUpperCase() || "",
          stake: item.stake || 0,
          casinoPL: item.casinoPL || 0,
          internationalCasinoPL: item.internationalCasinoPL || 0,
          commission: 0,
          uplinePL: item.uplinePL || 0,
        }));
        setData(mappedData);
      }
    } catch (error) {
      console.error("Error fetching casino profit/loss:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for date changes
  const handleSearch = () => {
    fetchCasinoProfitLoss({ startDate, endDate });
  };

  const handleReset = () => {
    const defaultDates = getDefaultDates();
    setStartDate(defaultDates.startDate);
    setEndDate(defaultDates.endDate);
    fetchCasinoProfitLoss(defaultDates);
  };

  const handleJustForToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    fetchCasinoProfitLoss({ startDate: today, endDate: today });
  };

  const handleFromYesterday = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    
    setStartDate(yesterdayStr);
    setEndDate(todayStr);
    fetchCasinoProfitLoss({ startDate: yesterdayStr, endDate: todayStr });
  };

  // Load data on component mount with default dates (last one month)
  useEffect(() => {
    const defaultDates = getDefaultDates();
    fetchCasinoProfitLoss({ startDate: defaultDates.startDate, endDate: defaultDates.endDate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate totals
  const totals = data.reduce(
    (acc, curr) => {
      acc.stake += curr.stake;
      acc.casinoPL += curr.casinoPL;
      acc.internationalCasinoPL += curr.internationalCasinoPL;
      acc.commission += curr.commission;
      acc.uplinePL += curr.uplinePL;
      return acc;
    },
    { stake: 0, casinoPL: 0, internationalCasinoPL: 0, commission: 0, uplinePL: 0 }
  );

  const formatNumber = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className='text-[#243a48] text-[16px] font-[700] font-["Times_New_Roman"]'>
        All Casino Profit/Loss Report
      </h2>
      {/* Filter Section */}
      <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-2 mt-4">
        <div className="flex items-center gap-4 mt-3">
          {/* From Date */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-[700]">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
            />
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">
              00:00
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2 pb-2">
          <button 
            onClick={handleJustForToday}
            className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
          >
            Just For Today
          </button>
          <button 
            onClick={handleFromYesterday}
            className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
          >
            From Yesterday
          </button>
          <button 
            onClick={handleSearch}
            className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] p-2 rounded-sm hover:bg-[#ffa00c] cursor-pointer"
          >
            Search
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
        {loading ? (
          <div className="text-center py-8 text-[#3b5160]">
            Loading...
          </div>
        ) : (
          <table className="min-w-full text-xs text-left">
            <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
              <tr>
                <th className="px-2 py-2">UID</th>
                <th className="px-2 py-2">Stake</th>
                <th className="px-2 py-2">Casino P/L</th>
                <th className="px-2 py-2">International Casino P/L</th>
                <th className="px-2 py-2">Comm.</th>
                <th className="px-2 py-2">Upline/Total P/L</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="bg-white border-y border-y-[#7e97a7]">
                  <td className="px-2 py-2">
                    <a>
                      <span className="bg-[#568bc8] p-1 rounded-sm text-[10px] text-white">
                        {row.tag}
                      </span>{" "}
                      <span
                        className="underline cursor-pointer ml-2"
                        onClick={() => navigate(`/ACdownlinesportspl/${row.role}/${row.userId}`)}
                      >
                        {row.uid}
                      </span>
                    </a>
                  </td>
                  <td className="px-2 py-2">{formatNumber(row.stake)}</td>
                  <td className={`px-2 py-2 ${row.casinoPL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                    {formatNumber(row.casinoPL)}
                  </td>
                  <td className={`px-2 py-2 ${row.internationalCasinoPL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                    {row.internationalCasinoPL < 0 ? `(${formatNumber(Math.abs(row.internationalCasinoPL))})` : formatNumber(row.internationalCasinoPL)}
                  </td>
                  <td className="px-2 py-2">{formatNumber(row.commission)}</td>
                  <td className={`px-2 py-2 ${row.uplinePL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                    {formatNumber(row.uplinePL)}
                  </td>
                </tr>
              ))}
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
                  >
                    You have no bets in this time period.
                  </td>
                </tr>
              ) : (
                <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7] font-[700]">
                  <td className="px-2 py-2">Total</td>
                  <td className="px-2 py-2">{formatNumber(totals.stake)}</td>
                  <td className={`px-2 py-2 ${totals.casinoPL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                    {formatNumber(totals.casinoPL)}
                  </td>
                  <td className={`px-2 py-2 ${totals.internationalCasinoPL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                    {totals.internationalCasinoPL < 0 ? `(${formatNumber(Math.abs(totals.internationalCasinoPL))})` : formatNumber(totals.internationalCasinoPL)}
                  </td>
                  <td className="px-2 py-2">{formatNumber(totals.commission)}</td>
                  <td className={`px-2 py-2 ${totals.uplinePL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                    {formatNumber(totals.uplinePL)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ACdownlinesportspl;
