import React from "react";
import { MdKeyboardArrowLeft, MdPlayArrow } from "react-icons/md";
import { IoClose } from "react-icons/io5";

function DetailsCard({ showdetails, setshowdetails, data }) {
  if (!showdetails || !data) return null;

  return (
    <div className="bg-white">
      <div className="bg-black flex justify-around items-center py-2 rounded-t-xl">
        <MdKeyboardArrowLeft
          className="text-white text-2xl"
          onClick={() => setshowdetails(false)}
        />
        <div className="flex gap-1 items-center">
          <span className="text-sm md:text-lg font-semibold text-white">
            {data.match}
          </span>
          <MdPlayArrow className="text-sm md:text-2xl text-gray-500" />
          <span className="text-sm font-semibold md:text-base text-white">
            {data.market}
          </span>
        </div>
        <IoClose
          className="text-white text-2xl"
          onClick={() => setshowdetails(false)}
        />
      </div>

      <table className="w-full">
        <colgroup>
          <col style={{ width: "33.33%" }} />
          <col style={{ width: "33.33%" }} />
          <col style={{ width: "33.33%" }} />
        </colgroup>
        <tbody>
          <tr className="border-b">
            <td colSpan={3} className="px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#a1d2f4] text-sm font-semibold px-3 py-1 rounded-xl text-blue-900">
                  {data.type.toLowerCase()}
                </span>
                <span className="font-semibold md:text-lg">
                  {data.selection}
                </span>
              </div>
            </td>
          </tr>
          <tr className="border-b">
            <td className="p-2">
              <span className="text-gray-600 md:text-lg">Odds.</span>
              <div className="font-semibold md:text-base">{data.odds}</div>
            </td>
            <td className="p-2">
              <span className="text-gray-600 md:text-lg">Stake (BDT)</span>
              <div className="font-semibold md:text-base">{data.stake}</div>
            </td>
            <td className="p-2">
              <span className="text-gray-600 md:text-lg">Profit (BDT)</span>
              <div className="font-semibold md:text-base">{data.profit}</div>
            </td>
          </tr>
          <tr className="p-2">
            <td className="p-2">
              <div className="text-[14px] md:text-base font-semibold">
                Ref: {data.id}
              </div>
            </td>
            <td colSpan={2}>
              <div className="text-[14px] md:text-base font-semibold">
                {data.placed}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default DetailsCard;
