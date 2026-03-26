import React, { useState } from "react";
import { useNavigate } from "react-router";
const sampleData = [
  {
    sport: "cricket",
    matchId: "34566741",
    matchName: "Manchester Originals v Southern Brave",
    market: "1.246138425",
    winner: "Not Declared",
    ip: "-",
    date: "8/6/2025, 11:00:00 PM",
  },
  {
    sport: "cricket",
    matchId: "34563517",
    matchName: "Ireland W v Pakistan W",
    market: "1.246106827",
    winner: "Not Declared",
    ip: "-",
    date: "8/6/2025, 8:30:00 PM",
  },
  {
    sport: "cricket",
    matchId: "34566304",
    matchName: "Worcestershire Rapids W v Kent W",
    market: "1.246133573",
    winner: "Not Declared",
    ip: "-",
    date: "8/3/2025, 3:00:00 PM",
  },
  {
    sport: "cricket",
    matchId: "34566366",
    matchName: "Glamorgan W v Leicestershire Foxes W",
    market: "1.246134669",
    winner: "Not Declared",
    ip: "-",
    date: "8/2/2025, 3:00:00 PM",
  },
  {
    sport: "cricket",
    matchId: "34566197",
    matchName: "Derbyshire Falcons W v Northamptonshire W",
    market: "1.246132126",
    winner: "Not Declared",
    ip: "-",
    date: "8/2/2025, 3:00:00 PM",
  },
  {
    sport: "cricket",
    matchId: "34572177",
    matchName: "Amo Sharks v Mis-E-Ainak Knights",
    market: "1.246181484",
    winner: "Not Declared",
    ip: "-",
    date: "7/31/2025, 11:00:00 AM",
  },
  {
    sport: "cricket",
    matchId: "34567360",
    matchName: "Zimbabwe v New Zealand",
    market: "1.246146757",
    winner: "Not Declared",
    ip: "-",
    date: "7/30/2025, 1:30:00 PM",
  },
];

function SuspendedMarketResult() {
  const navigate=useNavigate()
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");

  const filteredData = sampleData.filter(item => {
    const matchesSearch = item.matchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === "all" || item.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Suspended Market Result</h2>

      {/* Search and Filter */}
      <div className="mt-4 flex gap-2 items-center">
        <div className="bg-white border border-[#aaa] flex items-center gap-2 px-2 py-1 p-4 shadow-[inset_0_2px_0_0_#0000001a]">
          <input
            type="text"
            placeholder="Search..."
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
              <th className="px-2 py-2">Match ID</th>
              <th className="px-2 py-2">Match Name</th>
              <th className="px-2 py-2">Market</th>
              <th className="px-2 py-2">Winner</th>
              <th className="px-2 py-2">IP</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">No results found.</td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.matchId} className="bg-white border-y border-y-[#7e97a7]">
                  <td className="px-2 py-2">{item.sport}</td>
                  <td className="px-2 py-2">{item.matchId}</td>
                  <td className="px-2 py-2">{item.matchName}</td>
                  <td className="px-2 py-2">{item.market}</td>
                  <td className="px-2 py-2">{item.winner}</td>
                  <td className="px-2 py-2">{item.ip}</td>
                  <td className="px-2 py-2">{item.date}</td>
                  <td className="px-2 py-2">
                    <button className="btn theme_light_btn border border-[#bbb] px-3 text-[#000] font-[700] py-1 rounded-sm" style={{ background: "linear-gradient(180deg, #fff, #eee)" }}
                    onClick={()=>navigate('/viewBets')}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SuspendedMarketResult;
