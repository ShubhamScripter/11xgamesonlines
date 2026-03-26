import React, { useState, useEffect, useCallback } from "react";
import { IoSearchSharp } from "react-icons/io5";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector, useDispatch } from "react-redux";
function ActiveMatch() {
  const user = useSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [matchData, setMatchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMatchId, setActionMatchId] = useState(null);

  const fetchSportData = useCallback(async (sport) => {
    try {
      setLoading(true);
      let endpoint = "";
      
      switch (sport) {
        case "cricket":
          endpoint = "/cricket/matches";
          break;
        case "soccer":
          endpoint = "/soccer";
          break;
        case "tennis":
          endpoint = "/tennis";
          break;
        default:
          setLoading(false);
          return;
      }

      const response = await axiosInstance.get(endpoint);
      const data = response.data;
      
      console.log(`API Response for ${sport}:`, data);
      
      // Transform data based on sport
      let transformedData = [];
      
      if (sport === "cricket" && data.matches && Array.isArray(data.matches)) {
        console.log("Processing cricket matches:", data.matches.length);
        transformedData = data.matches.map((match) => ({
          sport: "cricket",
          eventId: match.id || "",
          marketId: match.id || "",
          match: match.match || "",
          date: match.date || new Date().toLocaleString(),
          status: match.inplay ? "In Play" : "Active",
        }));
      } else if (sport === "soccer" && data.data && Array.isArray(data.data)) {
        console.log("Processing soccer matches:", data.data.length);
        transformedData = data.data.map((match) => ({
          sport: "soccer",
          eventId: match.id || "",
          marketId: match.id || "",
          match: match.match || "",
          date: match.date || new Date().toLocaleString(),
          status: match.inplay ? "In Play" : "Active",
        }));
      } else if (sport === "tennis" && data.data && Array.isArray(data.data)) {
        console.log("Processing tennis matches:", data.data.length);
        transformedData = data.data.map((match) => ({
          sport: "tennis",
          eventId: match.id || "",
          marketId: match.id || "",
          match: match.match || "",
          date: match.date || new Date().toLocaleString(),
          status: match.inplay ? "In Play" : "Active",
        }));
      }
      
      console.log("Transformed data:", transformedData);
      setMatchData(transformedData);
    } catch (error) {
      console.error(`Error fetching ${sport} data:`, error);
      setMatchData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllSportsData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all three sports in parallel
      const [cricketRes, soccerRes, tennisRes] = await Promise.all([
        axiosInstance.get("/cricket/matches").catch(() => ({ data: { matches: [] } })),
        axiosInstance.get("/soccer").catch(() => ({ data: { data: [] } })),
        axiosInstance.get("/tennis").catch(() => ({ data: { data: [] } }))
      ]);

      const transformedData = [];
      
      // Transform cricket data
      if (cricketRes.data.matches) {
        cricketRes.data.matches.forEach((match) => {
          transformedData.push({
            sport: "cricket",
            eventId: match.id || "",
            marketId: match.id || "",
            match: match.match || "",
            date: match.date || new Date().toLocaleString(),
            status: match.inplay ? "In Play" : "Active",
          });
        });
      }
      
      // Transform soccer data
      if (soccerRes.data.data) {
        soccerRes.data.data.forEach((match) => {
          transformedData.push({
            sport: "soccer",
            eventId: match.id || "",
            marketId: match.id || "",
            match: match.match || "",
            date: match.date || new Date().toLocaleString(),
            status: match.inplay ? "In Play" : "Active",
          });
        });
      }
      
      // Transform tennis data
      if (tennisRes.data.data) {
        tennisRes.data.data.forEach((match) => {
          transformedData.push({
            sport: "tennis",
            eventId: match.id || "",
            marketId: match.id || "",
            match: match.match || "",
            date: match.date || new Date().toLocaleString(),
            status: match.inplay ? "In Play" : "Active",
          });
        });
      }
      
      setMatchData(transformedData);
    } catch (error) {
      console.error("Error fetching all sports data:", error);
      setMatchData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data based on selected sport
  useEffect(() => {
    const fetchData = async () => {
      if (selectedSport === "all") {
        await fetchAllSportsData();
      } else {
        await fetchSportData(selectedSport);
      }
    };

    fetchData();
  }, [selectedSport, fetchSportData, fetchAllSportsData]);

  const handleMatchAction = useCallback(
    async (match) => {
      if (!match?.eventId) {
        return;
      }

      try {
        setActionMatchId(match.eventId);
        await axiosInstance.patch(`/matches/${match.eventId}/status`, {
          sport: match.sport,
          action: "suspend",
          matchName: match.match,
        });

        if (selectedSport === "all") {
          await fetchAllSportsData();
        } else {
          await fetchSportData(selectedSport);
        }

        toast.success("Match status updated.");
        setSearchTerm("");
      } catch (error) {
        console.error("Error updating match status:", error);
        toast.error("Failed to update match status.");
      } finally {
        setActionMatchId(null);
      }
    },
    [fetchAllSportsData, fetchSportData, selectedSport]
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
      <h2 className="text-[#243a48] text-[16px] font-[700]">Active Matches</h2>

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
                  key={index}
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
                        className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] px-2 py-1 rounded-sm hover:bg-[#ffa00c] cursor-pointer disabled:opacity-50"
                        onClick={() => handleMatchAction(match)}
                        disabled={actionMatchId === match.eventId}
                      >
                        {actionMatchId === match.eventId ? "Updating..." : "Inactive"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-2 py-4 text-center" colSpan="7">
                  No matches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ActiveMatch;
