import React ,{useState, useMemo} from 'react'

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

function MatchedTable({ bettingData }) {
    const [currentPage, setCurrentPage] = useState(1);
          const rowsPerPage = 10;

          const totalPages = Math.max(1, Math.ceil(bettingData.length / rowsPerPage));

          const handlePrev = () => {
            if (currentPage > 1) setCurrentPage((p) => p - 1);
          };

          const handleNext = () => {
            if (currentPage < totalPages) setCurrentPage((p) => p + 1);
          };

          const currentdata = useMemo(() => {
            const start = (currentPage - 1) * rowsPerPage;
            return bettingData.slice(start, start + rowsPerPage);
          }, [bettingData, currentPage, rowsPerPage]);

          const pageButtons = useMemo(() => getPageNumbers(currentPage, totalPages, 9), [currentPage, totalPages]);

  const formatTwoDecimals = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return value;
    return num.toFixed(2);
  };

  const formatDateTime = (value) => {
    if (!value) return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString('en-US', {
      month: 'numeric', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    });
  };
    
  return (
    <div className="">
      <div className='bg-[#3b5160] border-b border-b-[#7e97a7] text-[#fff] min-w-full pl-2 text-sm'>Matched</div>
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
            <th className="px-2 py-2">Liability</th>
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
                <td className="px-2 py-2">{formatDateTime(bet.date)}</td>
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
                <td className="px-2 py-2">{bet.liability}</td>
                <td className="px-2 py-2">
                  <span>{formatTwoDecimals(bet.profitLoss)}</span>
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
  )
}

export default MatchedTable