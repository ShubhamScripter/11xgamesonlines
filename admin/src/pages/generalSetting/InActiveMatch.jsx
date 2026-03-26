// import React, { useState } from "react";
// import { IoSearchSharp } from "react-icons/io5";

// // JSON data
// const matchData = []

// function InActiveMatch() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedSport, setSelectedSport] = useState("all");

//   const filteredMatches = matchData.filter((match) => {
//     const matchName = match.match.toLowerCase();
//     const search = searchTerm.toLowerCase();
//     const sportMatch =
//       selectedSport === "all" || match.sport === selectedSport;

//     return matchName.includes(search) && sportMatch;
//   });

//   return (
//     <div className='mt-4 p-2 font-["Times_New_Roman"]'>
//       <h2 className="text-[#243a48] text-[16px] font-[700]">Active Matches</h2>

//       {/* Search and Filter */}
//       <div className="mt-4 flex gap-2 items-center">
//         <div className="bg-white border border-[#aaa] flex items-center gap-2 px-2 py-1 p-4 shadow-[inset_0_2px_0_0_#0000001a]">
//           <IoSearchSharp />
//           <input
//             type="text"
//             placeholder="Enter Match Name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="outline-0 text-sm"
//           />
//         </div>

//         <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
//           <select
//             className="text-sm bg-white w-40 outline-0"
//             value={selectedSport}
//             onChange={(e) => setSelectedSport(e.target.value)}
//           >
//             <option value="all">All Sports</option>
//             <option value="cricket">Cricket</option>
//             <option value="tennis">Tennis</option>
//             <option value="soccer">Soccer</option>
//             <option value="casino">Casino</option>
//           </select>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="mt-4">
//         <table className="min-w-full text-xs text-left">
//           <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
//             <tr>
//               <th className="px-2 py-2">Sport</th>
//               <th className="px-2 py-2">Event Id</th>
//               <th className="px-2 py-2">Market Id</th>
//               <th className="px-2 py-2">Match</th>
//               <th className="px-2 py-2">Date</th>
//               <th className="px-2 py-2">Status</th>
//               <th className="px-2 py-2">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredMatches.length > 0 ? (
//               filteredMatches.map((match, index) => (
//                 <tr
//                   key={index}
//                   className="bg-white border-y border-y-[#7e97a7]"
//                 >
//                   <td className="px-2 py-2 capitalize">{match.sport}</td>
//                   <td className="px-2 py-2">{match.eventId}</td>
//                   <td className="px-2 py-2">{match.marketId}</td>
//                   <td className="px-2 py-2">{match.match}</td>
//                   <td className="px-2 py-2">{match.date}</td>
//                   <td className="px-2 py-2">{match.status}</td>
//                   <td className="px-2 py-2"></td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td className="px-2 py-2 text-center bg-white border-y border-y-[#7e97a7]" colSpan="7">
//                   No records found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default InActiveMatch;

import React, { useState, useEffect, useCallback } from "react";
import { IoSearchSharp } from "react-icons/io5";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

function InActiveMatch() {
  const user = useSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [matchData, setMatchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMatchId, setActionMatchId] = useState(null);

  const fetchInactiveMatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/inactivematches");
      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        const transformedData = data.data.map((match) => ({
          sport: match.sport || "",
          eventId: match.matchId || "",
          marketId: match.matchId || "",
          match: match.matchName || `Match ${match.matchId}`,
          date: match.suspendedAt
            ? new Date(match.suspendedAt).toLocaleString()
            : new Date().toLocaleString(),
          status: "Suspended",
          reason: match.reason || "",
          _id: match._id,
        }));

        setMatchData(transformedData);
      } else {
        setMatchData([]);
      }
    } catch (error) {
      console.error("Error fetching inactive matches:", error);
      toast.error("Failed to fetch inactive matches");
      setMatchData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInactiveMatches();
  }, [fetchInactiveMatches]);

  const handleMatchActivate = useCallback(
    async (match) => {
      if (!match?.eventId) return;

      try {
        setActionMatchId(match.eventId);
        await axiosInstance.patch(`/matches/${match.eventId}/status`, {
          sport: match.sport,
          action: "activate",
        });

        toast.success("Match activated successfully");
        await fetchInactiveMatches();
      } catch (error) {
        console.error("Error activating match:", error);
        toast.error("Failed to activate match");
      } finally {
        setActionMatchId(null);
      }
    },
    [fetchInactiveMatches]
  );

  const filteredMatches = matchData.filter((match) => {
    const matchName = match.match.toLowerCase();
    const search = searchTerm.toLowerCase();
    const sportMatch =
      selectedSport === "all" || match.sport === selectedSport;

    return matchName.includes(search) && sportMatch;
  });

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Inactive Matches</h2>

      {/* Search and Filter */}
      <div className="mt-4 flex gap-2 items-center">
        <div className="bg-white border border-[#aaa] flex items-center gap-2 px-2 py-1 p-4 shadow-[inset_0_2px_0_0_#0000001a]">
          <IoSearchSharp />
          <input
            type="text"
            placeholder="Enter Match Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-0 text-sm"
          />
        </div>

        <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
          <select
            className="text-sm bg-white w-40 outline-0"
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
          >
            <option value="all">All Sports</option>
            <option value="cricket">Cricket</option>
            <option value="tennis">Tennis</option>
            <option value="soccer">Soccer</option>
            <option value="casino">Casino</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">Sport</th>
              <th className="px-2 py-2">Event Id</th>
              <th className="px-2 py-2">Market Id</th>
              <th className="px-2 py-2">Match</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-2 py-4 text-center" colSpan="7">
                  Loading...
                </td>
              </tr>
            ) : filteredMatches.length > 0 ? (
              filteredMatches.map((match, index) => (
                <tr
                  key={match._id || index}
                  className="bg-white border-y border-y-[#7e97a7]"
                >
                  <td className="px-2 py-2 capitalize">{match.sport}</td>
                  <td className="px-2 py-2">{match.eventId}</td>
                  <td className="px-2 py-2">{match.marketId}</td>
                  <td className="px-2 py-2">{match.match}</td>
                  <td className="px-2 py-2">{match.date}</td>
                  <td className="px-2 py-2">{match.status}</td>
                  <td className="px-2 py-2">
                    {user.role === "superadmin" && (
                      <button
                        className="border border-[#28a745] text-xs font-[700] bg-[#28a745] text-white px-2 py-1 rounded-sm hover:bg-[#218838] cursor-pointer disabled:opacity-50"
                        onClick={() => handleMatchActivate(match)}
                        disabled={actionMatchId === match.eventId}
                      >
                        {actionMatchId === match.eventId ? "Activating..." : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-2 py-4 text-center" colSpan="7">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InActiveMatch;