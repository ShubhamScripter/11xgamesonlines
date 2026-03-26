import React, { useState } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';

const matchData = [
  {
    sport: "soccer",
    date: "7/25/2025, 3:00:00 PM",
    event: "Karpaty v Leicester",
    odds: [
      { team: "Karpaty", back: "--", lay: "--" },
      { team: "Leicester", back: "--", lay: "--" },
      { team: "The Draw", back: "--", lay: "--" },
    ],
    playerPL: { one: -59.0, x: 20.0, two: 20.0 },
    downlineUrl: "#",
  },
  {
    sport: "soccer",
    date: "7/25/2025, 2:30:00 PM",
    event: "Vietnam U23 v Philippines U23",
    odds: [
      { team: "Karpaty", back: "--", lay: "--" },
      { team: "Leicester", back: "--", lay: "--" },
      { team: "The Draw", back: "--", lay: "--" },
    ],
    playerPL: { one: -4.14, x: 6.0, two: 6.0 },
    downlineUrl: "#",
  },
  {
    sport: "cricket",
    date: "7/25/2025, 3:30:00 PM",
    event: "England v India",
    odds: [
      { team: "Karpaty", back: "--", lay: "--" },
      { team: "Leicester", back: "--", lay: "--" },
      { team: "The Draw", back: "--", lay: "--" },
    ],
    playerPL: { one: 690.85, x: -4608.5, two: 222.25 },
    downlineUrl: "#",
  },
  {
    sport: "cricket",
    date: "7/25/2025, 3:30:00 PM",
    event: "Hampshire v Nottinghamshire",
    odds: [
      { team: "Karpaty", back: "--", lay: "--" },
      { team: "Leicester", back: "--", lay: "--" },
      { team: "The Draw", back: "--", lay: "--" },
    ],
    playerPL: { one: -69.6, x: 15.0, two: 4.38 },
    downlineUrl: "#",
  },
];

function MatchOdds() {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div
      className="mt-4 bg-[#dddcd7] rounded-[5px]"
      style={{ boxShadow: "0 2px 0 0 #fff, inset 0 2px 0 0 #0000001a" }}
    >
      <h2 className="text-[#243a48] text-base font-bold p-2 mx-2">Match Odds</h2>
      <div className="mx-2 p-2">
        <table className="min-w-full text-xs text-left bg-white">
          <thead>
            <tr>
              <th rowSpan={2} className="px-2 py-2">Sports</th>
              <th rowSpan={2} className="px-2 py-2">Market Date</th>
              <th rowSpan={2} className="px-2 py-2">Event/Market Name</th>
              <th colSpan={3} className="bg-[#f3dfb0] px-2 py-2 border-y border-[#7e97a7] text-center">Player P/L</th>
              <th rowSpan={2} className="px-2 py-2">Downline P/L</th>
            </tr>
            <tr>
              <th className="bg-[#f3dfb0] px-2 py-2">1</th>
              <th className="bg-[#f3dfb0] px-2 py-2">X</th>
              <th className="bg-[#f3dfb0] px-2 py-2">2</th>
            </tr>
          </thead>
          <tbody className="border-y border-[#7e97a7]">
            {matchData.map((match, i) => (
              <React.Fragment key={i}>
                <tr className="border-y border-[#7e97a7] ">
                  <td className="px-2 py-2 border-r border-r-[#7e97a7]">{match.sport}</td>
                  <td className="px-2 py-2 border-r border-r-[#7e97a7]">{match.date}</td>
                  <td className="px-2 py-2 border-r border-r-[#7e97a7]">
                    <button
                      onClick={() => toggleRow(i)}
                      type="button"
                      className="btn btn-primary angle-up down-up mr-2 rounded-sm border border-[#bbb] bg-gradient-to-b from-white to-gray-100 p-1"
                    >
                      <i className={`fas fa-angle-${expandedRows[i] ? "up" : "down"}`}></i>
                    </button>
                    <strong>{match.event}</strong>{" "}
                    <span className="ml-2 text-xs text-[#568bc8]">Match Odds</span>
                  </td>
                  <td className={`px-2 py-2 border-r border-r-[#7e97a7] ${match.playerPL.one < 0 ? "text-red-600" : "text-green-600"}`}>
                    ({match.playerPL.one})
                  </td>
                  <td className={`px-2 py-2 border-r border-r-[#7e97a7] ${match.playerPL.x < 0 ? "text-red-600" : "text-green-600"}`}>
                    ({match.playerPL.x})
                  </td>
                  <td className={`px-2 py-2 border-r border-r-[#7e97a7] ${match.playerPL.two < 0 ? "text-red-600" : "text-green-600"}`}>
                    ({match.playerPL.two})
                  </td>
                  <td className="px-2 py-2 border-r border-r-[#7e97a7] text-center">
                    <button
                      className="bg-[#ffcc2f] border border-[#cb8009] text-black px-3 py-1 rounded shadow"
                    >
                      View
                    </button>
                  </td>
                </tr>
                {expandedRows[i] && match.odds.length > 0 && (
                  <tr className="bg-[#e9ecef]">
                    <td className="border-r border-r-[#7e97a7] bg-white"></td>
                    <td className="border-r border-r-[#7e97a7] bg-white"></td>
                    <td colSpan={4} className="border-r border-r-[#7e97a7] pl-8 pb-2">
                      
                      <table className="w-full text-xs ">
                        <thead >
                          <tr>
                            <th className="text-left px-2 py-1" colSpan={2}>3 selections Selections</th>
                            <th className="text-center px-2 py-1">100.8%</th>
                            <th className="text-center px-2 py-1 ">   </th>
                            <th className="text-center px-2 py-1 bg-[#72bbef] rounded-t-[10px]">Back all</th>
                            <th className="text-center px-2 py-1 bg-[#faa9ba] rounded-t-[10px]">Lay all</th>
                            <th className="text-center px-2 py-1 ">99.5%</th>
                          </tr>
                        </thead>
                        <tbody className="border border-y border-y-[#7e97a7] ">
                          {match.odds.map((o, j) => (
                            <tr key={j} className="border-y border-y-[#7e97a7] ">
                              <td className="px-2 py-1 border-r border-r-[#7e97a7] bg-white" colSpan={2}>
                                <span className="text-xs font-[700]">{o.team}</span>
                                
                              </td>
                              <td className="text-center px-2 py-1 border-r border-r-[#7e97a7] bg-[#72bbef]" >
                                <div>--</div>
                                <div>--</div>
                              </td>
                              <td className="text-center px-2 py-1 border-r border-r-[#7e97a7] bg-[#72bbef]">
                                <div>--</div>
                                <div>--</div>
                              </td>
                             
                              
                              <td className="text-center px-2 py-1 border-r border-r-[#7e97a7] bg-[#72bbef]">
                                <div>{o.back}</div>
                                <div>{o.back}</div>
                              </td>
                              <td className="text-center px-2 py-1 border-r border-r-[#7e97a7] bg-[#faa9ba]">
                                <div>{o.lay}</div>
                                <div>{o.lay}</div>
                              </td>
                              <td className="border-r border-r-[#7e97a7] bg-[#faa9ba]">
                             
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MatchOdds;
