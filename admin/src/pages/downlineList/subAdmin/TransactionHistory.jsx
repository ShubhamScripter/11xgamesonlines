import React, { useState } from "react";
import Navigation from "../../../components/downListComp/subAdmin/Navigation";
import TransactionHistoryTable from "./TransactionHistoryTable";
// Sample JSON data
const transactions = [
  {
    datetime: "7/2/2025, 5:02:00 PM",
    depositFromUpline: "-",
    depositToDownline: "200.00",
    withdrawByUpline: "-",
    withdrawFromDownline: "-",
    balance: "0.00",
    remark: "test",
    fromTo: "bajitest1 -> testseniorsuper",
  },
  {
    datetime: "7/2/2025, 4:55:15 PM",
    depositFromUpline: "200.00",
    depositToDownline: "-",
    withdrawByUpline: "-",
    withdrawFromDownline: "-",
    balance: "200.00",
    remark: "test",
    fromTo: "admin -> bajitest1",
  },
];

function TransactionHistory() {
  const [selected, setselected] = useState("TransactionHistory");

  return (
    <div className="p-2 mt-4 font-['Times_New_Roman']">
      <div
        className="flex gap-4 border border-[#bbb] rounded shadow-inner px-4 py-2 w-fit"
        style={{
          background: "linear-gradient(180deg, #fff, #eee)",
          boxShadow: "inset 0 2px 0 0 #ffffff80",
        }}
      >
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            AD
          </span>
          <span className="text-sm font-bold">bajivaiadminbdt</span>
        </div>
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            SSM
          </span>
          <span className="text-sm font-bold">testseniorsuper</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected={selected} />
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">
            Transaction History
          </h2>
          <div className="mt-4">
            <TransactionHistoryTable transactions={transactions}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionHistory;
