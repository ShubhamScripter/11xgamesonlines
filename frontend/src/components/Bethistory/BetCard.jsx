import React, { useState } from "react";
import { MdPlayArrow } from "react-icons/md";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { div } from "motion/react-client";

const BetCard = ({ data }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleDetails = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const getSignedColorClass = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount === 0) return "";
    return amount < 0 ? "text-red-600" : "text-green-600";
  };

  return (
    <div className=" flex flex-col gap-4 justify-center p-4">
        {data.length ===0 &&(
          <div className="flex flex-col gap-4 pt-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Bet Details</h2>
            <p className="text-gray-700">No current bets available.</p>
          </div>
          {/* Add more bet cards as needed */}
          </div>
        )}
      {data.map((bet, index) => (
        <div
          key={bet.id}
          className="shadow-md overflow-hidden w-full max-w-md rounded-2xl bg-white mx-auto"
        >
          <table className="table-auto w-full text-sm bg-white">
            <thead className="bg-[#d4e0e5] text-gray-800">
              <tr>
                <th colSpan={3} className="p-2">
                  <div className="flex gap-1 items-center">
                    <span className="md:text-lg font-normal">Soccer</span>
                    <MdPlayArrow className="text-2xl" />
                    <span className="font-semibold md:text-lg">{bet.match}</span>
                    <MdPlayArrow className="text-2xl" />
                    <span className="font-semibold md:text-lg">{bet.market}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td colSpan={3} className="flex items-center gap-2 px-4 py-2">
                  <span className="bg-[#a1d2f4] text-sm font-semibold px-3 py-1 rounded-xl text-blue-900">
                    {bet.type}
                  </span>
                  <span className="font-semibold md:text-lg">{bet.selection}</span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">Odds req.</span>
                  <div className="font-semibold md:text-base">{bet.oddsReq}</div>
                </td>
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">Avg. Odds</span>
                  <div className="font-semibold md:text-base">{bet.avgOdds}</div>
                </td>
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">Matched (PKU)</span>
                  <div className={`font-semibold md:text-base ${getSignedColorClass(bet.matched)}`}>
                    {bet.matched}
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-gray-700 md:text-lg">Bet ID</td>
                <td colSpan={2} className="p-2 font-medium md:text-base">
                  {bet.id}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-gray-700 md:text-lg">Bet Placed</td>
                <td colSpan={2} className="p-2 font-medium md:text-base">
                  {bet.placed}
                </td>
              </tr>
              {expandedIndex === index && (
                <>
                  <tr className="bg-[#9cb1bd] font-semibold">
                    <td className="p-2 text-black md:text-lg">Bet Taken</td>
                    <td colSpan={2} className="p-2 md:text-base text-black">
                      {bet.taken}
                    </td>
                  </tr>
                  <tr className="border-b">
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">Odds req.</span>
                  <div className="font-semibold md:text-base">{bet.oddsReq}</div>
                </td>
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">Avg. Odds</span>
                  <div className="font-semibold md:text-base">{bet.avgOdds}</div>
                </td>
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">Matched (PKU)</span>
                  <div className={`font-semibold md:text-base ${getSignedColorClass(bet.matched)}`}>
                    {bet.matched}
                  </div>
                </td>
                  </tr>
                  <tr>
                    <td className="p-2 md:text-lg font-semibold text-gray-700">
                      {bet.possibleProfit !== undefined || bet.possibleLoss !== undefined
                        ? "Expected Profit / Loss:"
                        : "Profit (PKU):"}
                    </td>
                    <td colSpan={2} className="p-2 md:text-lg">
                      {bet.possibleProfit !== undefined || bet.possibleLoss !== undefined ? (
                        <>
                          <span className="font-semibold text-green-600">
                            +{Number(bet.possibleProfit || 0)}
                          </span>
                          <span className="mx-2 text-gray-500">/</span>
                          <span className="font-semibold text-red-600">
                            -{Number(bet.possibleLoss || 0)}
                          </span>
                        </>
                      ) : (
                        <span className={`font-semibold ${getSignedColorClass(bet.profit)}`}>
                          {bet.profit}
                        </span>
                      )}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          <div
            className="bg-[#9cb1bd] py-1 flex justify-center items-center cursor-pointer rounded-b-xl"
            onClick={() => toggleDetails(index)}
          >
            {expandedIndex === index ? (
              <IoChevronUp className="text-black" size={24} />
            ) : (
              <IoChevronDown className="text-black" size={24} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BetCard;
