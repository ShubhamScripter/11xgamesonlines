import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../utils/axiosInstance";

function AprofitCasino() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Initialize dates to last one day (yesterday to today)
  const getDefaultDates = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return {
      startDate: yesterday.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  // Get user data from localStorage
  const getUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  };

  // Fetch casino profit/loss data by date
  const fetchCasinoProfitLoss = useCallback(async (dateFilters = {}) => {
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

    const startDateParam = dateFilters.startDate || startDate;
    const endDateParam = dateFilters.endDate || endDate;

    if (!startDateParam || !endDateParam) {
      console.error("Start date and end date are required");
      return;
    }

    setLoading(true);
    try {
      const url = `/casino/profit-loss-by-date/${userId}?startDate=${startDateParam}&endDate=${endDateParam}`;
      const response = await axiosInstance.get(url);
      
      if (response.data.success && response.data.data) {
        // Map API response to match table structure
        const mappedData = response.data.data.map((item) => ({
          uid: item.uid, // Date
          stake: item.stake || 0,
          downlinePL: item.downlinePL || 0,
          playerPL: item.playerPL || 0,
          commission: item.commission || 0,
          totalPL: item.uplinePL || 0, // Map uplinePL to totalPL
        }));

        // Add totals row
        if (response.data.total) {
          mappedData.push({
            uid: "Total",
            stake: response.data.total.stake || 0,
            downlinePL: response.data.total.downlinePL || 0,
            playerPL: response.data.total.playerPL || 0,
            commission: response.data.total.commission || 0,
            totalPL: response.data.total.uplinePL || 0,
            isTotal: true,
          });
        }

        setData(mappedData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching casino profit/loss by date:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

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
    if (startDate && endDate) {
      fetchCasinoProfitLoss({ startDate, endDate });
    }
  };

  const handleReset = () => {
    const defaultDates = getDefaultDates();
    setStartDate(defaultDates.startDate);
    setEndDate(defaultDates.endDate);
    fetchCasinoProfitLoss(defaultDates);
  };

  // Initialize dates and load data on mount
  useEffect(() => {
    const defaultDates = getDefaultDates();
    setStartDate(defaultDates.startDate);
    setEndDate(defaultDates.endDate);
    fetchCasinoProfitLoss(defaultDates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatNumber = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className='text-[#243a48] text-[16px] font-[700]'>
        Profit/Loss Report by Market
      </h2>

      {/* Filters */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-sm font-[700]">Data Source:</span>
        <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
          <select className=" text-sm bg-white w-40 outline-0 ">
            <option value="All">DB</option>
          </select>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-2 mt-4">
        <div className="flex items-center gap-4 mt-3">
          {/* Sports filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-[700]">Sports:</span>
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
              <select className=" text-sm bg-white w-40 outline-0 ">
                <option value="All">All</option>
                <option value="Casino">Casino</option>
              </select>
            </div>
          </div>

          {/* Time Zone filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-[700]">Time Zone:</span>
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
              <select className=" text-sm bg-white w-40 outline-0">
                <option value="Bangalore/Bombay">IST(Bangalore/Bombay)</option>
              </select>
            </div>
          </div>

          {/* From Date */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-[700]">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
            />
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">00:00</div>
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
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">00:00</div>
          </div>
        </div>

        {/* Action Buttons */}
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
                <th className="px-2 py-2">Downline P/L</th>
                <th className="px-2 py-2">Player P/L</th>
                <th className="px-2 py-2">Comm.</th>
                <th className="px-2 py-2">Upline/Total P/L</th>
              </tr>
            </thead>
            <tbody>
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
                data.map((row, index) => {
                  const isTotal = row.isTotal;
                  return (
                    <tr
                      key={index}
                      className={`${isTotal ? "bg-[#e4e4e4] font-[700]" : index % 2 === 0 ? "bg-[#0000000d]" : "bg-white"} border-y border-y-[#7e97a7]`}
                    >
                      <td className="px-2 py-2">{row.uid}</td>
                      <td className="px-2 py-2">{formatNumber(row.stake)}</td>
                      <td className={`px-2 py-2 ${row.downlinePL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                        ({formatNumber(Math.abs(row.downlinePL))})
                      </td>
                      <td className={`px-2 py-2 ${row.playerPL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                        ({formatNumber(Math.abs(row.playerPL))})
                      </td>
                      <td className="px-2 py-2">{formatNumber(row.commission)}</td>
                      <td className={`px-2 py-2 ${row.totalPL < 0 ? 'text-[#dc3545]' : 'text-[#198754]'}`}>
                        ({formatNumber(Math.abs(row.totalPL))})
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AprofitCasino;