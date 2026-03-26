import React,{useState} from "react";

function BettingTable({ bettingData }) {
    const [currentPage, setCurrentPage] = useState(1);
      const rowsPerPage = 6;
    
      const totalPages = Math.ceil(bettingData.length / rowsPerPage);
    
      const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
      };
    
      const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
      };
    
      const currentdata = bettingData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs text-left">
        <thead className="bg-[#e4e4e4] border-y border-[#7e97a7]">
          <tr>
            <th className="px-2 py-2">PL ID</th>
            <th className="px-2 py-2">Bet ID</th>
            <th className="px-2 py-2">Bet placed</th>
            <th className="px-2 py-2">IP Address</th>
            <th className="px-2 py-2">Market</th>
            <th className="px-2 py-2">Selection</th>
            <th className="px-2 py-2">Type</th>
            <th className="px-2 py-2">Odds req.</th>
            <th className="px-2 py-2">Stake</th>
            <th className="px-2 py-2">Profit/Loss</th>
          </tr>
        </thead>
        <tbody>
          {bettingData.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center py-4 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]">
                You have no bets in this time period.
              </td>
            </tr>
          ) : (
             currentdata.map((bet, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0
                    ? "bg-[#0000000d] border-y border-[#7e97a7]"
                    : "bg-[#fff] border-y border-[#7e97a7]"
                }
              >
                <td className="px-2 py-2">{bet.plId}</td>
                <td className="px-2 py-2">{bet.betId}</td>
                <td className="px-2 py-2">{bet.date}</td>
                <td className="px-2 py-2">{bet.ip}</td>
                <td className="px-2 py-2">
                  {bet.market}
                  <span> ▸ </span>
                  <strong>{bet.match}</strong>
                  <span> ▸ </span>
                </td>
                <td className="px-2 py-2">{bet.selection}</td>
                <td className="px-2 py-2">{bet.type}</td>
                <td className="px-2 py-2">{bet.odds}</td>
                <td className="px-2 py-2">{bet.stake}</td>
                <td className="px-2 py-2">
                  <span>{bet.profitLoss}</span>
                </td>
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

export default BettingTable;
