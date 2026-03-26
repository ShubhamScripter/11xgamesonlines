import React, { useState } from "react";
import { MdPlayArrow } from "react-icons/md";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
function ProfitLossCard({data}) {
  console.log("data is:",data);
      const [expandedIndex, setExpandedIndex] = useState(null);
    
      const toggleDetails = (index) => {
        setExpandedIndex((prev) => (prev === index ? null : index));
      };
  return (
    <div className="bg-[#f1f7ff] flex flex-col gap-4 justify-center p-4">
            {data.length ===0 &&(
              <div className="bg-[#f1f7ff] min-h-[300px] flex flex-col gap-4 pt-4">
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
                    <th colSpan={4} className="p-2">
                      <div className="flex gap-1 items-center">
                        <span className="md:text-sm font-semibold">{bet.gameName}</span>
                        <MdPlayArrow className="text-2xl" />
                        <span className="font-semibold md:text-sm">{bet.match}</span>
                        <MdPlayArrow className="text-2xl" />
                        <span className="font-semibold md:text-sm">{bet.market}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                    <tr className="border-b">
                    <td colSpan={2} className="p-2">
                      <span className="text-gray-600 md:text-lg">Start Time</span>
                      <div className="font-semibold md:text-base">{bet.placed}</div>
                    </td>
                    <td colSpan={2} className="p-2">
                      <span className="text-gray-600 md:text-lg">Profit/Loss (BDT)</span>
                      <div className="font-semibold md:text-base text-[#198754]">{bet.matched}</div>
                    </td>
                    </tr>
                  {expandedIndex === index && (
                    <>
                      <tr className="bg-[#9cb1bd] font-semibold">
                        <td colSpan={2} className="p-2 text-black text-sm">{bet.id}</td>
                        <td colSpan={2} className="p-2 text-xs md:text-sm text-black">
                          <span className="font-light text-xs md:text-base">Bet Placed</span>
                          <span className="text-xs md:text-sm ml-1">{bet.taken}</span>
                        </td>
                      </tr>
                      <tr className="border-b bg-[#e2eaef]">
                      <td colSpan={4} className="px-4 py-2">
                      <div className="flex items-center gap-2 ">
                      <span className="bg-[#a1d2f4] text-sm font-semibold px-3 py-1 rounded-xl text-blue-900">
                      {bet.type}
                      </span>
                      <span className="font-semibold text-base md:text-lg">{bet.selection}</span>
                      </div>
                      </td>
                      </tr>
                      <tr className="border-b  bg-[#e2eaef]">
                        <td className="p-2">
                          <span className="text-gray-600 md:text-lg">Odds</span>
                          <div className="font-semibold md:text-base">{bet.oddsReq}</div>
                        </td>
                        <td className="p-2">
                          <span className="text-gray-600 md:text-lg">Stake</span>
                          <div className="font-semibold md:text-base">{bet.stake}</div>
                        </td>
                        <td className="p-2">
                          <span className="text-gray-600 md:text-lg">Profit/Loss (BDT)</span>
                          <div className="font-semibold md:text-base text-[#198754]">{bet.matched}</div>
                        </td>
                      </tr>
                      <tr className="">
                        <td colSpan={2} className="p-2">
                               <span>Back subtotal</span>
                        </td>
                        <td colSpan={2}>
                            <span className="font-semibold text-lg text-[#198754]">{bet.backsubtotal}</span>
                        </td>
                      </tr>
                      <tr className="">
                        <td colSpan={2} className="p-2">
                            <span>Lay subtotal</span>
                        </td>
                        <td colSpan={2}>
                            <span className="font-semibold text-lg text-red-500">{bet.laysubtotal}</span>
                        </td>
                      </tr>
                      <tr className="">
                        <td colSpan={2} className="p-2">
                            <span>Market subtotal</span>
                        </td>
                        <td colSpan={2}>
                            <span className="font-semibold text-lg text-[#198754]">{bet.oddsReq}</span>
                        </td>
                      </tr>
                      <tr className=" border-b">
                        <td colSpan={2} className="p-2">
                            <span>Commission</span>
                        </td>
                        <td colSpan={2}>
                            <span className="font-semibold text-lg ">{bet.commission}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="p-2 md:text-base text-gray-700">Net Market Total</td>
                        <td colSpan={2} className=" text-lg">
                          <span className="text-green-600 font-semibold">{bet.oddsReq}</span>
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
  )
}

export default ProfitLossCard