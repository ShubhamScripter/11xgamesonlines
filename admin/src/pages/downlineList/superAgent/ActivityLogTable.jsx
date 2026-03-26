import React,{useState} from "react";

function ActivityLogTable({ activityLogs }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const totalPages = Math.ceil(activityLogs.length / rowsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const currentdata = activityLogs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
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
                You have no bets in this time period.
              </td>
            </tr>
          ) : (
            currentdata.map((log, index) => (
              <tr key={index} className="border-y border-y-[#7e97a7]">
                <td className="px-2 py-2">{log.loginDateTime}</td>
                <td className="px-2 py-2">
                  <span>{log.status}</span>
                </td>
                <td className="px-2 py-2">{log.ipAddress}</td>
                <td className="px-2 py-2">{log.isp}</td>
                <td className="px-2 py-2">{log.location}</td>
                <td className="px-2 py-2">{log.userAgent}</td>
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

export default ActivityLogTable;
