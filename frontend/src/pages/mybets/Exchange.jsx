import React, { useState } from "react";
import { MdPlayArrow, MdKeyboardArrowRight } from "react-icons/md";
import DetailsCard from "./DetailsCard";

function Exchange({ betdata }) {
  const [showdetails, setshowdetails] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null);

  return (
    <div>
      {betdata.length === 0 && (
        <div className="flex flex-col gap-4 pt-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Bet Details</h2>
            <p className="text-gray-700">No current bets available.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {!showdetails &&
          betdata.map((data, idx) => (
            <div
              key={data.id}
              onClick={() => {
                setSelectedBet(data);
                setshowdetails(true);
              }}
              className="flex justify-between items-center bg-white px-2 py-3 rounded-lg"
            >
              <div className="flex items-center gap-3 cursor-pointer">
                <span className="bg-[#17934e] rounded-lg px-2 text-sm md:text-base font-bold text-white h-fit">
                  {1}
                </span>
                <div className="flex gap-1 items-center justify-between flex-1">
                  <div className="text-[13px] md:text-base font-semibold flex justify-center items-center">
                    {data.match}
                    <MdPlayArrow className="text-sm md:text-2xl text-gray-500" />
                    {data.market}
                    
                  </div> 
                </div>
                
              </div>
              <div className="flex items-center">
                <MdKeyboardArrowRight className="text-2xl bg-[#d4e0e5] rounded-lg" />
              </div>
              
            </div>
          ))}

        <DetailsCard
          showdetails={showdetails}
          setshowdetails={setshowdetails}
          data={selectedBet}
        />
      </div>
    </div>
  );
}

export default Exchange;
