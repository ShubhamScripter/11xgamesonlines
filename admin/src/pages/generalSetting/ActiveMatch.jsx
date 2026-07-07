import React, { useState, useEffect, useCallback } from "react";
import { IoSearchSharp } from "react-icons/io5";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import { formatIST } from "../../utils/time";

const MATCH_SECTIONS = [
  { id: "match_odds", label: "Match Odds" },
  { id: "bookmaker", label: "Bookmaker" },
  { id: "fancy", label: "Fancy" },
  { id: "premium", label: "Premium" },
];

const DEFAULT_SECTIONS = Object.fromEntries(
  MATCH_SECTIONS.map((s) => [s.id, true])
);

function ActiveMatch() {
  const user = useSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [matchData, setMatchData] = useState([]);
  const [sectionSettingsMap, setSectionSettingsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionMatchId, setActionMatchId] = useState(null);
  const [sectionActionKey, setSectionActionKey] = useState(null);

  const fetchSectionSettings = useCallback(async (sport) => {
    try {
      const response = await axiosInstance.get("/admin/match-section-settings", {
        params: sport && sport !== "all" ? { sport } : undefined,
      });
      setSectionSettingsMap(response.data?.data || {});
    } catch (error) {
      console.error("Error fetching match section settings:", error);
      setSectionSettingsMap({});
    }
  }, []);

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

      const [response] = await Promise.all([
        axiosInstance.get(endpoint),
        fetchSectionSettings(sport),
      ]);
      const data = response.data;

      let transformedData = [];

      if (sport === "cricket" && data.matches && Array.isArray(data.matches)) {
        transformedData = data.matches.map((match) => ({
          sport: "cricket",
          eventId: match.id || "",
          marketId: match.id || "",
          match: match.match || "",
          date: match.date || formatIST(new Date()),
          status: match.inplay ? "In Play" : "Active",
        }));
      } else if (sport === "soccer" && data.data && Array.isArray(data.data)) {
        transformedData = data.data.map((match) => ({
          sport: "soccer",
          eventId: match.id || "",
          marketId: match.id || "",
          match: match.match || "",
          date: match.date || formatIST(new Date()),
          status: match.inplay ? "In Play" : "Active",
        }));
      } else if (sport === "tennis" && data.data && Array.isArray(data.data)) {
        transformedData = data.data.map((match) => ({
          sport: "tennis",
          eventId: match.id || "",
          marketId: match.id || "",
          match: match.match || "",
          date: match.date || formatIST(new Date()),
          status: match.inplay ? "In Play" : "Active",
        }));
      }

      setMatchData(transformedData);
    } catch (error) {
      console.error(`Error fetching ${sport} data:`, error);
      setMatchData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchSectionSettings]);

  const fetchAllSportsData = useCallback(async () => {
    try {
      setLoading(true);
      const [cricketRes, soccerRes, tennisRes] = await Promise.all([
        axiosInstance.get("/cricket/matches").catch(() => ({ data: { matches: [] } })),
        axiosInstance.get("/soccer").catch(() => ({ data: { data: [] } })),
        axiosInstance.get("/tennis").catch(() => ({ data: { data: [] } })),
        fetchSectionSettings("all"),
      ]);

      const transformedData = [];

      if (cricketRes.data.matches) {
        cricketRes.data.matches.forEach((match) => {
          transformedData.push({
            sport: "cricket",
            eventId: match.id || "",
            marketId: match.id || "",
            match: match.match || "",
            date: match.date || formatIST(new Date()),
            status: match.inplay ? "In Play" : "Active",
          });
        });
      }

      if (soccerRes.data.data) {
        soccerRes.data.data.forEach((match) => {
          transformedData.push({
            sport: "soccer",
            eventId: match.id || "",
            marketId: match.id || "",
            match: match.match || "",
            date: match.date || formatIST(new Date()),
            status: match.inplay ? "In Play" : "Active",
          });
        });
      }

      if (tennisRes.data.data) {
        tennisRes.data.data.forEach((match) => {
          transformedData.push({
            sport: "tennis",
            eventId: match.id || "",
            marketId: match.id || "",
            match: match.match || "",
            date: match.date || formatIST(new Date()),
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
  }, [fetchSectionSettings]);

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

  const getMatchSections = useCallback(
    (eventId) => {
      const settings = sectionSettingsMap[String(eventId)];
      if (!settings || settings.matchDisabled) {
        return { ...DEFAULT_SECTIONS };
      }
      return { ...DEFAULT_SECTIONS, ...(settings.sections || {}) };
    },
    [sectionSettingsMap]
  );

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

        toast.success("Match deactivated.");
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

  const handleSectionToggle = useCallback(
    async (match, sectionId, currentlyEnabled) => {
      if (!match?.eventId) return;

      const actionKey = `${match.eventId}-${sectionId}`;
      const settings = sectionSettingsMap[String(match.eventId)] || {};
      const currentDisabled = Array.isArray(settings.disabledSections)
        ? [...settings.disabledSections]
        : [];

      const nextDisabled = currentlyEnabled
        ? [...new Set([...currentDisabled, sectionId])]
        : currentDisabled.filter((s) => s !== sectionId);

      try {
        setSectionActionKey(actionKey);
        await axiosInstance.patch(`/matches/${match.eventId}/sections`, {
          sport: match.sport,
          matchName: match.match,
          disabledSections: nextDisabled,
        });

        await fetchSectionSettings(selectedSport);
        toast.success(
          currentlyEnabled
            ? `${MATCH_SECTIONS.find((s) => s.id === sectionId)?.label || sectionId} disabled`
            : `${MATCH_SECTIONS.find((s) => s.id === sectionId)?.label || sectionId} enabled`
        );
      } catch (error) {
        console.error("Error updating match section:", error);
        toast.error("Failed to update section.");
      } finally {
        setSectionActionKey(null);
      }
    },
    [fetchSectionSettings, sectionSettingsMap, selectedSport]
  );

  const filteredMatches = matchData.filter((match) => {
    const matchName = match.match.toLowerCase();
    const search = searchTerm.toLowerCase();
    const sportMatch =
      selectedSport === "all" || match.sport === selectedSport;

    return matchName.includes(search) && sportMatch;
  });

  const colSpan = 7 + MATCH_SECTIONS.length;

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Active Matches</h2>
      <p className="text-xs text-[#555] mt-1">
        Disable whole match or individual sections (Match Odds, Bookmaker, Fancy, Premium). Disabled items are hidden on user site.
      </p>

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
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">Sport</th>
              <th className="px-2 py-2">Event Id</th>
              <th className="px-2 py-2">Match</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Status</th>
              {MATCH_SECTIONS.map((section) => (
                <th key={section.id} className="px-2 py-2 whitespace-nowrap">
                  {section.label}
                </th>
              ))}
              <th className="px-2 py-2">Match</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-2 py-4 text-center" colSpan={colSpan}>
                  Loading...
                </td>
              </tr>
            ) : filteredMatches.length > 0 ? (
              filteredMatches.map((match, index) => {
                const sections = getMatchSections(match.eventId);
                const isSuperAdmin = user?.role === "superadmin";

                return (
                  <tr
                    key={`${match.eventId}-${index}`}
                    className="bg-white border-y border-y-[#7e97a7]"
                  >
                    <td className="px-2 py-2 capitalize">{match.sport}</td>
                    <td className="px-2 py-2">{match.eventId}</td>
                    <td className="px-2 py-2 max-w-[200px]">{match.match}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{match.date}</td>
                    <td className="px-2 py-2">{match.status}</td>
                    {MATCH_SECTIONS.map((section) => {
                      const enabled = sections[section.id] !== false;
                      const actionKey = `${match.eventId}-${section.id}`;
                      const isUpdating = sectionActionKey === actionKey;

                      return (
                        <td key={section.id} className="px-2 py-2">
                          {isSuperAdmin ? (
                            <button
                              type="button"
                              className={`text-[10px] font-[700] px-2 py-1 rounded-sm border disabled:opacity-50 ${
                                enabled
                                  ? "bg-[#28a745] text-white border-[#28a745]"
                                  : "bg-[#dc3545] text-white border-[#dc3545]"
                              }`}
                              disabled={isUpdating || actionMatchId === match.eventId}
                              onClick={() =>
                                handleSectionToggle(match, section.id, enabled)
                              }
                            >
                              {isUpdating ? "..." : enabled ? "ON" : "OFF"}
                            </button>
                          ) : (
                            <span className={enabled ? "text-green-700" : "text-red-600"}>
                              {enabled ? "ON" : "OFF"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2">
                      {isSuperAdmin && (
                        <button
                          className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] px-2 py-1 rounded-sm hover:bg-[#ffa00c] cursor-pointer disabled:opacity-50 whitespace-nowrap"
                          onClick={() => handleMatchAction(match)}
                          disabled={actionMatchId === match.eventId}
                        >
                          {actionMatchId === match.eventId ? "Updating..." : "Disable Match"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-2 py-4 text-center" colSpan={colSpan}>
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
