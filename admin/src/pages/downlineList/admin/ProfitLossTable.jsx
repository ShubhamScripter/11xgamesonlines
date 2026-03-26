import { useState, Fragment, useEffect, useMemo } from "react";
import { FaPlusSquare, FaMinusSquare } from "react-icons/fa";


const ProfitLossTable = ({ bettingData }) => {
  const [data, setData] = useState(bettingData);

  // Sync local state when bettingData prop changes
  useEffect(() => {
    setData(bettingData);
    setCurrentPage(1); // Reset to first page when data changes
  }, [bettingData]);

  const toggleExpand = (index) => {
    const newData = [...data];
    newData[index].expanded = !newData[index].expanded;
    setData(newData);
  };

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

  return (
    <div>
        <table className="min-w-full   text-sm text-left text-black">
      <thead className="bg-[#e4e4e4] text-gray-700 border-y border-y-[#7e97a7]">
        <tr>
          <th className="px-4 py-2">Market</th>
          <th className="px-4 py-2">Settled Date</th>
          <th className="px-4 py-2">Profit / Loss</th>
        </tr>
      </thead>
      <tbody className="text-xs">
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
          currentdata.map((match, i) => (
            <Fragment key={i}>
              <tr
                className={
                  i % 2 === 0
                    ? "bg-[#0000000d] border-y border-[#7e97a7]"
                    : "bg-[#fff] border-y border-[#7e97a7]"
                }
              >
                <td className="px-4 py-2 ">
                  {match.sport} <span className="mx-1">▸</span>
                  <strong className="font-semibold">{match.match}</strong>{" "}
                  <span className="mx-1">▸</span>
                </td>
                <td className="px-4 py-2">{match.settled}</td>
                <td className="px-4 py-2 flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      match.profitLoss < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ({match.profitLoss})
                  </span>
                  <button onClick={() => toggleExpand(i)}>
                    {match.expanded ? <FaMinusSquare /> : <FaPlusSquare />}
                  </button>
                </td>
              </tr>

              {match.expanded && (
                <tr className="bg-[#e2e8ed] border-t  ">
                  <td colSpan="3" className="px-4  ">
                    <div className="flex justify-end pr-4">
                      <table className=" text-xs border-r border-r-[#7e97a7]">
                        <thead>
                          <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
                            <th className="px-2 py-1">User Name</th>
                            <th className="px-2 py-1">Bet ID</th>
                            <th className="px-2 py-1">Selection</th>
                            <th className="px-2 py-1">Odds</th>
                            <th className="px-2 py-1">Stake</th>
                            <th className="px-2 py-1">Type</th>
                            <th className="px-2 py-1">Placed</th>
                            <th className="px-2 py-1">Profit/Loss</th>
                          </tr>
                        </thead>
                        <tbody>
                          {match.bets.map((bet, j) => (
                            <tr
                              key={j}
                              className="border-t text-gray-800 bg-[#f2f4f7]"
                            >
                              <td className="px-2 py-1">{bet.username}</td>
                              <td className="px-2 py-1">{bet.betId}</td>
                              <td className="px-2 py-1">{bet.selection}</td>
                              <td className="px-2 py-1">{bet.odds}</td>
                              <td className="px-2 py-1">{bet.stake}</td>
                              <td className="px-2 py-1">{bet.type}</td>
                              <td className="px-2 py-1">{bet.placed}</td>
                              <td
                                className={`px-2 py-1 ${
                                  bet.pnl < 0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                ({bet.pnl})
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t bg-[#d9e4ec] font-medium">
                            <td colSpan="8" className="px-2 py-2">
                              <div className="flex justify-end pr-4">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 ">
                                  <div className="flex justify-between gap-10">
                                    <dt>Total Stakes</dt>
                                    <dd>
                                      {match.bets.reduce(
                                        (a, b) => a + b.stake,
                                        0
                                      )}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between gap-10">
                                    <dt>Back subtotal</dt>
                                    <dd className="text-red-600">
                                      (
                                      {match.bets.reduce(
                                        (a, b) => a + b.pnl,
                                        0
                                      )}
                                      )
                                    </dd>
                                  </div>
                                  <div className="flex justify-between gap-10">
                                    <dt>Lay subtotal</dt>
                                    <dd className="text-red-600">
                                    (-0)
                                    </dd>
                                  </div>
                                  <div className="flex justify-between gap-10">
                                    <dt>Market subtotal</dt>
                                    <dd className="text-red-600">
                                      (
                                      {match.bets.reduce(
                                        (a, b) => a + b.pnl,
                                        0
                                      )}
                                      )
                                    </dd>
                                  </div>
                                  <div className="flex justify-between gap-10">
                                    <dt>Commission</dt>
                                    <dd>0</dd>
                                  </div>
                                  <div className="flex justify-between gap-10">
                                    <dt>Net Market Total</dt>
                                    <dd
                                      className={`${
                                        match.profitLoss < 0
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      ({match.profitLoss})
                                    </dd>
                                  </div>
                                </dl>
                              </div>
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
          className="bg-gray-200 px-2  rounded border border-gray-400 disabled:opacity-50"
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
              className={`px-2 border rounded ${
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
          className="bg-gray-200 px-2  rounded border border-gray-400 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default ProfitLossTable;
