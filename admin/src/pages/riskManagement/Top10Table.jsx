import React, { useState } from "react";
import { useNavigate } from "react-router";

function Top10Table({combinedMatched ,combinedExposure}) {
    const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("matched");

  const activeData = activeTab === "matched" ? combinedMatched : combinedExposure;

  // Split for two-column layout
  const leftData = activeData.slice(0, 5);
  const rightData = activeData.slice(5, 10);

  const formatAmount = (amount) =>
    amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  return (
    <div className="max-w-[80%] bg-white mt-4">
        {/* Tabs */}
        <ul className="bg-[#273e4d] flex">
          <li
            className={`p-2 text-xs font-[700] cursor-pointer ${
              activeTab === "matched"
                ? "bg-[#4e7893] text-white"
                : "bg-[#d1d8dd] text-[#254d6a]"
            }`}
            onClick={() => setActiveTab("matched")}
          >
            Top 10 Matched Amount Player
          </li>
          <li
            className={`p-2 text-xs font-[700] cursor-pointer ${
              activeTab === "exposure"
                ? "bg-[#4e7893] text-white"
                : "bg-[#d1d8dd] text-[#254d6a]"
            }`}
            onClick={() => setActiveTab("exposure")}
          >
            Top 10 Exposure Player
          </li>
        </ul>

        {/* Two side-by-side tables */}
        <div className="flex">
          {/* Left Table */}
          <div className="min-w-[50%]">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
                <tr>
                  <th className="px-2 py-2">UID</th>
                  <th className="px-2 py-2">Exposure</th>
                  <th className="px-2 py-2">Matched Amount</th>
                </tr>
              </thead>
              <tbody>
                {leftData.map((player) => (
                  <tr key={player.id} className="bg-white border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">
                      {player.id} <span className="ml-2 underline">{player.uid}</span>
                    </td>
                    <td className="px-2 py-2 text-[#dc3545]">
                      <strong>({formatAmount(player.exposure)})</strong>
                    </td>
                    <td className="px-2 py-2">{formatAmount(player.matchedAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Table */}
          <div className="min-w-[50%] border-l border-l-[#7e97a7]">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
                <tr>
                  <th className="px-2 py-2">UID</th>
                  <th className="px-2 py-2">Exposure</th>
                  <th className="px-2 py-2">Matched Amount</th>
                </tr>
              </thead>
              <tbody>
                {rightData.map((player) => (
                  <tr key={player.id} className="bg-white border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">
                      {player.id} <span className="ml-2 underline">{player.uid}</span>
                    </td>
                    <td className="px-2 py-2 text-[#dc3545]">
                      <strong>({formatAmount(player.exposure)})</strong>
                    </td>
                    <td className="px-2 py-2">{formatAmount(player.matchedAmount)}</td>
                  </tr>
                ))}
                <tr className="bg-white">
                  <td colSpan={3} className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => navigate("/matchedAll")}
                      className="bg-[#ffcc2f] border border-[#cb8009] px-2 py-1 text-xs font-[700] rounded-[5px] hover:bg-[#cb8009]"
                    >
                      View All
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  )
}

export default Top10Table