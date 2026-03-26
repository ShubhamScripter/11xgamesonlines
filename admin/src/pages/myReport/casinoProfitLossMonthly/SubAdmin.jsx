import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const title = {
  subadmin: "SAD",
  seniorSuper: "SSM",
  superAgent: "SA",
  agent: "AG",
  user: "CL",
};

function SubAdmin() {
  const navigate = useNavigate();
  const { role, userId } = useParams();
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

  // Fetch casino profit/loss data
  const fetchCasinoProfitLoss = useCallback(async (dateFilters = {}) => {
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
        // Map API response to match existing column structure
        // stake → stake
        // casinoPL → downlinePL
        // internationalCasinoPL → playerPL
        // uplinePL → uplinePL
        // commission → 0 (not in API)
        const mappedData = response.data.data.map((item) => ({
          userId: item.userId,
          uid: item.userName || item.userId || "",
          tag: title[item.role] || item.role?.substring(0, 2).toUpperCase() || "",
          role: item.role || "",
          stake: item.stake || 0,
          downlinePL: item.casinoPL || 0,
          playerPL: item.casinoPL || 0,
          commission: 0,
          uplinePL: item.uplinePL || 0,
        }));
        
        setData(mappedData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching casino profit/loss:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Date filter handlers
  const handleJustForToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    fetchCasinoProfitLoss({ startDate: today, endDate: today });
  };

  const handleFromYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    setStartDate(yesterdayStr);
    setEndDate(yesterdayStr);
    fetchCasinoProfitLoss({ startDate: yesterdayStr, endDate: yesterdayStr });
  };

  const handleSearch = () => {
    fetchCasinoProfitLoss({ startDate, endDate });
  };

  const handleReset = () => {
    const defaultDates = getDefaultDates();
    setStartDate(defaultDates.startDate);
    setEndDate(defaultDates.endDate);
    fetchCasinoProfitLoss(defaultDates);
  };

  // Load data on component mount and when userId changes with default dates (last one month)
  useEffect(() => {
    if (userId) {
      const defaultDates = getDefaultDates();
      fetchCasinoProfitLoss({ startDate: defaultDates.startDate, endDate: defaultDates.endDate });
    }
  }, [userId, fetchCasinoProfitLoss]);

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
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-4 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-4 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
                >
                  You have no bets in this time period.
                </td>
              </tr>
            ) : (
              <>
                {data.map((row, idx) => {
                  // Map role to route path
                  const roleRouteMap = {
                    subadmin: "sub_admin",
                    seniorSuper: "senior_super",
                    superAgent: "super_agent",
                    agent: "agent",
                    user: "user",
                  };
                  const roleRoute = roleRouteMap[row.role] || "sub_admin";
                  
                  return (
                    <tr key={idx} className="bg-white border-y border-y-[#7e97a7]">
                      <td className="px-2 py-2">
                        <a>
                          <span className="bg-[#568bc8] p-1 rounded-sm text-[10px] text-white">
                            {row.tag}
                          </span>{" "}
                          <span
                            className="underline cursor-pointer ml-2"
                            onClick={() => navigate(`/ACasinoprofitAndLossDownlineNew/${roleRoute}/${row.userId}`)}
                          >
                            {row.uid}
                          </span>
                        </a>
                      </td>
                      <td className="px-2 py-2">{formatNumber(row.stake)}</td>
                      <td className={`px-2 py-2 ${row.downlinePL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                        {formatNumber(row.downlinePL)}
                      </td>
                      <td className={`px-2 py-2 ${row.playerPL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                        {row.playerPL < 0 ? `(${formatNumber(Math.abs(row.playerPL))})` : formatNumber(row.playerPL)}
                      </td>
                      <td className="px-2 py-2">{formatNumber(row.commission)}</td>
                      <td className={`px-2 py-2 ${row.uplinePL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                        {formatNumber(row.uplinePL)}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}
            {!loading && data.length > 0 && (
              <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7] font-[700]">
                <td className="px-2 py-2">Total</td>
                <td className="px-2 py-2">{formatNumber(totals.stake)}</td>
                <td className={`px-2 py-2 ${totals.downlinePL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                  {formatNumber(totals.downlinePL)}
                </td>
                <td className={`px-2 py-2 ${totals.playerPL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                  {totals.playerPL < 0 ? `(${formatNumber(Math.abs(totals.playerPL))})` : formatNumber(totals.playerPL)}
                </td>
                <td className="px-2 py-2">{formatNumber(totals.commission)}</td>
                <td className={`px-2 py-2 ${totals.uplinePL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
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

export default SubAdmin;
