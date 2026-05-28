import React from "react";
import { MdArrowBackIos } from "react-icons/md";
import MainBalanceCard from "../../components/menucomp/MainBalanceCard";

function BalanceOverview() {
  return (
    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full z-20 h-screen">
      <div className="bg-[#000] h-10 flex items-center">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-md font-semibold" />
        </div>
        <span className="text-[18px] font-bold">
          Balance Overview
        </span>
      </div>

      <div className="flex flex-col pb-5">
        <MainBalanceCard />
      </div>
    </div>
  );
}

export default BalanceOverview;
