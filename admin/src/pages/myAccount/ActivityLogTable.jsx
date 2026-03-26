import React, { useState, useMemo } from "react";

function ActivityLogTable({ activityLogs }) {
  // console.log("Activity Logs:", activityLogs);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(activityLogs.length / rowsPerPage);
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

  // const totalPages = Math.max(1, Math.ceil(activityLogs.length / rowsPerPage));

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const currentdata = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return activityLogs.slice(start, start + rowsPerPage);
  }, [activityLogs, currentPage, rowsPerPage]);

  const pageButtons = useMemo(() => getPageNumbers(currentPage, totalPages, 9), [currentPage, totalPages]);

  return (
    <div>
      <table className="min-w-full text-xs text-left">
        <thead className="bg-[#e4e4e4] border-y border-[#7e97a7]">
          <tr>
            <th className="px-2 py-2">Login Date &amp; Time</th>
            <th className="px-2 py-2">Login Status</th>
            <th className="px-2 py-2">IP Address</th>
            <th className="px-2 py-2">ISP</th>
            <th className="px-2 py-2">City/State/Country</th>
            <th className="px-2 py-2">User Agent Type</th>
          </tr>
        </thead>
        <tbody className="bg-[#fff]">
          {activityLogs.length === 0 ? (
            <tr>
              <td
                colSpan="10"
                className="text-center py-4 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
              >
                No login activity found.
              </td>
            </tr>
          ) : (
            currentdata.map((log, index) => (
              <tr key={index} className="border-y border-y-[#7e97a7]">
                <td className="px-2 py-2">
                  {log.dateTime}
                </td>
                <td className="px-2 py-2">{log.status}</td>
                <td className="px-2 py-2">{log.ip}</td>
                <td className="px-2 py-2">{log.isp || "N/A"}</td>
                <td className="px-2 py-2">
                  {log.city || "-"} / {log.region || "-"} / {log.country || "-"}
                </td>
                <td className="px-2 py-2">
                  {log.userAgent ? log.userAgent.slice(0, 50) + '...' : "-"}
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

export default ActivityLogTable;
