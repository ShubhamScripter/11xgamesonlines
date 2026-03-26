import React, { useState } from "react";

function TransactionHistoryTable({ transactions }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const totalPages = Math.ceil(transactions.length / rowsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const currentdata = transactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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
            currentdata.map((tx, index) => (
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
      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="bg-gray-200 px-2  rounded border border-gray-400 disabled:opacity-50"
        >
          &lt;
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-2 border rounded ${
              currentPage === i + 1
                ? "bg-[#ffa00c] text-white border-[#cb8009]"
                : "bg-gray-200 border-gray-400"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="bg-gray-200 px-2 rounded border border-gray-400 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default TransactionHistoryTable;
