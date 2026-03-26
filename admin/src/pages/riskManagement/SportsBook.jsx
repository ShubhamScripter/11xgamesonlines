import React, { useState } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';

const matchData = []

function SportsBook() {
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
      <h2 className="text-[#243a48] text-base font-bold p-2 mx-2">Sports Book</h2>
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
              <th className="bg-[#f3dfb0] px-2 py-2 w-[60px]">Min</th>
              <th className="bg-[#f3dfb0] px-2 py-2 w-[60px]"></th>
              <th className="bg-[#f3dfb0] px-2 py-2 w-[60px]">Max</th>
            </tr>
          </thead>
          <tbody className="border-y border-[#7e97a7]">
            {matchData.map((match, i) => (
              <React.Fragment key={i}>
                <tr className="border-y border-[#7e97a7] ">
                  <td className="px-2 py-2 border-r border-r-[#7e97a7]">{match.sport}</td>
                  <td className="px-2 py-2 border-r border-r-[#7e97a7]">{match.marketDate}</td>
                  <td className="px-2 py-2 border-r border-r-[#7e97a7]">
                    <button
                      onClick={() => toggleRow(i)}
                      type="button"
                      className="btn btn-primary angle-up down-up mr-2 rounded-sm border border-[#bbb] bg-gradient-to-b from-white to-gray-100 p-1"
                    >
                      <i className={`fas fa-angle-${expandedRows[i] ? "up" : "down"}`}></i>
                    </button>
                    <strong>{match.event}</strong>{" "}
                    <span className="ml-2 text-xs text-[#568bc8]">{match.marketName}</span>
                  </td>
                  <td className={`px-2 py-2 border-r border-r-[#7e97a7] ${match.playerPL.min < 0 ? "text-red-600" : "text-green-600"}`}>
                    ({match.playerPL.min})
                  </td>
                  <td className={`px-2 py-2 border-r border-r-[#7e97a7] `}>
                    
                  </td>
                  <td className={`px-2 py-2 border-r border-r-[#7e97a7] ${match.playerPL.max < 0 ? "text-red-600" : "text-green-600"}`}>
                    ({match.playerPL.max})
                  </td>
                  <td className="px-2 py-2 border-r border-r-[#7e97a7] text-center">
                    <button
                      className="bg-[#ffcc2f] border border-[#cb8009] text-black px-3 py-1 rounded shadow"
                    >
                      Book
                    </button>
                  </td>
                </tr>
                {expandedRows[i] && (
                  <tr className="">
                    <td className="border-r border-r-[#7e97a7]  bg-white"></td>
                    <td className="border-r border-r-[#7e97a7] bg-white"></td>
                    <td className="border-r border-r-[#7e97a7] pl-8 pb-2">
                     
                    </td>
                    <td className="bg-[#72bbef] text-center border-r border-r-[#7e97a7]">
                        <div>--</div>
                        <div>--</div>
                    </td>
                    <td className="border-r border-r-[#7e97a7]"></td>
                    <td className="bg-[#ffb6c1] text-center border-r border-r-[#7e97a7]">
                        <div>--</div>
                        <div>--</div>
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

export default SportsBook;
