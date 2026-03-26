import React, { useState, useMemo } from "react";

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

function TransactionHistoryTable({ transactions = [], rowsPerPage = 6 }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(transactions.length / rowsPerPage));

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return transactions.slice(start, start + rowsPerPage);
  }, [transactions, currentPage, rowsPerPage]);

  const pageButtons = useMemo(() => getPageNumbers(currentPage, totalPages, 9), [currentPage, totalPages]);

  return (
    <div>
      <table className="min-w-full text-xs text-left">
        <thead className="bg-[#e4e4e4] border-y border-[#7e97a7]">
          <tr>
            <th className="px-2 py-2">Date/Time</th>
            <th className="px-2 py-2">Deposit From Upline</th>
            <th className="px-2 py-2">Deposit to Downline</th>
            <th className="px-2 py-2">WihtDraw By Upline</th>
            <th className="px-2 py-2">WithDraw From Downline</th>
            <th className="px-2 py-2">Balance</th>
            <th className="px-2 py-2">Remark</th>
            <th className="px-2 py-2">From/To</th>
          </tr>
        </thead>
        <tbody className="bg-[#fff]">
          {transactions.length === 0 ? (
            <tr>
              <td
                colSpan="10"
                className="text-center py-4 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
              >
                You have no bets in this time period.
              </td>
            </tr>
          ) : (
            currentData.map((tx, index) => (
              <tr key={index} className="border-y border-y-[#7e97a7]">
                <td className="px-2 py-2">{tx.datetime}</td>
                <td className="px-2 py-2">{tx.depositFromUpline}</td>
                <td className="px-2 py-2">{tx.depositToDownline}</td>
                <td className="px-2 py-2">{tx.withdrawByUpline}</td>
                <td className="px-2 py-2">{tx.withdrawFromDownline}</td>
                <td className="px-2 py-2">{tx.balance}</td>
                <td className="px-2 py-2">{tx.remark}</td>
                <td className="px-2 py-2">{tx.fromTo}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Ellipsis Pagination Controls */}
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
              className={`px-2  border rounded ${
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
}

export default TransactionHistoryTable;
