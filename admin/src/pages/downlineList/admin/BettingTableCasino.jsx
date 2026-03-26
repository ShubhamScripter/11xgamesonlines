import React,{useState, useEffect, Fragment, useMemo} from "react";
import { FaPlusSquare, FaMinusSquare } from "react-icons/fa";

function BettingTableCasino({ bettingData }) {

    const [data, setData] = useState(bettingData);
    const [currentPage, setCurrentPage] = useState(1);
      const rowsPerPage = 6;
    
      const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
    
      const handlePrev = () => {
        if (currentPage > 1) setCurrentPage((p) => p - 1);
      };
    
      const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
      };
    
      const currentdata = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return data.slice(start, start + rowsPerPage);
      }, [data, currentPage, rowsPerPage]);

      function getPageNumbers(current, total, maxButtons = 7) {
        const pages = [];
        if (total <= maxButtons) {
          for (let i = 1; i <= total; i++) pages.push(i);
          return pages;
        }

        const left = 2;
        const right = total - 1;
        const side = Math.floor((maxButtons - 3) / 2);

        let start = Math.max(left, current - side);
        let end = Math.min(right, current + side);

        if (current - 1 <= side) {
          start = left;
          end = maxButtons - 2;
        }

        if (total - current <= side) {
          start = total - (maxButtons - 3);
          end = right;
        }

        pages.push(1);
        if (start > left) pages.push("left-ellipsis");

        for (let i = start; i <= end; i++) pages.push(i);

        if (end < right) pages.push("right-ellipsis");
        pages.push(total);

        return pages;
      }

      const pageButtons = useMemo(() => getPageNumbers(currentPage, totalPages, 9), [currentPage, totalPages]);

      // Sync local state when bettingData prop changes
      useEffect(() => {
        setData(bettingData);
        setCurrentPage(1); // Reset to first page when data changes
      }, [bettingData]);

      const toggleExpand = (betIndex) => {
        const newData = [...data];
        const realIndex = (currentPage - 1) * rowsPerPage + betIndex;
        if (newData[realIndex]) {
          newData[realIndex].expanded = !newData[realIndex].expanded;
          setData(newData);
        }
      };

      const formatTwoDecimals = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return value;
        return num.toFixed(2);
      };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs text-left">
        <thead className="bg-[#e4e4e4] border-y border-[#7e97a7]">
          <tr>
            <th className="px-2 py-2">Bet ID</th>
            <th className="px-2 py-2">PL ID</th>
            <th className="px-2 py-2">Market</th>
            <th className="px-2 py-2">Bet Placed</th>
            <th className="px-2 py-2">Stake</th>
            <th className="px-2 py-2">Profit / Loss</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]">
                You have no bets in this time period.
              </td>
            </tr>
          ) : (
             currentdata.map((bet, index) => (
              <Fragment key={index}>
              <tr
                className={
                  index % 2 === 0
                    ? "bg-[#0000000d] border-y border-[#7e97a7]"
                    : "bg-[#fff] border-y border-[#7e97a7]"
                }
              >
                <td className="px-2 py-2">
                  <button onClick={() => toggleExpand(index)}>
                    {bet.expanded ? <FaMinusSquare /> : <FaPlusSquare />}
                  </button>
                  {" "}{bet.betId}
                </td>
                <td className="px-2 py-2">{bet.plId || bet.userName}</td>
                <td className="px-2 py-2">
                  {bet.market}
                  <span> ▸ </span>
                  <strong>{bet.match}</strong>
                </td>
                <td className="px-2 py-2">{bet.date}</td>
                <td className="px-2 py-2">{bet.stake}</td>
                <td className="px-2 py-2">
                  <span className={bet.profitLoss < 0 ? "text-red-600" : "text-green-600"}>
                    ({formatTwoDecimals(Math.abs(bet.profitLoss))})
                  </span>
                </td>
              </tr>
              
              {bet.expanded && (
                <tr className="bg-[#f2f4f7]">
                  <td colSpan="6" className="px-2 py-2">
                    <div className="flex justify-end pr-4">
                      <table className="text-xs border-r border-r-[#7e97a7]">
                        <thead>
                          <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
                            <th className="px-2 py-1">Bet Taken</th>
                            <th className="px-2 py-1">Odds Req.</th>
                            <th className="px-2 py-1">Stake</th>
                            <th className="px-2 py-1">Liability</th>
                            <th className="px-2 py-1">Odds Matched</th>
                            <th className="px-2 py-1">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t text-gray-800 bg-[#f2f4f7]">
                            <td className="px-2 py-1">{bet.date}</td>
                            <td className="px-2 py-1">0.00</td>
                            <td className="px-2 py-1">{bet.stake}</td>
                            <td className="px-2 py-1">-</td>
                            <td className="px-2 py-1">0.00</td>
                            <td className="px-2 py-1">
                              <button className="px-2 py-1 bg-[#ffcc2f] rounded-md">Get Result</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
              </Fragment>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="bg-gray-200 px-3 py-1 rounded border border-gray-400 disabled:opacity-50"
        >
          &lt;
        </button>

        {pageButtons.map((p, idx) => {
          if (p === "left-ellipsis" || p === "right-ellipsis") {
            return (
              <span key={p + idx} className="px-3 text-gray-500">
                ...
              </span>
            );
          }

          return (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1 border rounded ${
                currentPage === p
                  ? "bg-[#ffa00c] text-white border-[#cb8009] scale-105"
                  : "bg-gray-200 border-gray-400"
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="bg-gray-200 px-3 py-1 rounded border border-gray-400 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default BettingTableCasino;
