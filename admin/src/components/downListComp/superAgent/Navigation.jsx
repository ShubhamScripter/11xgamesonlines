import React ,{useState} from "react";
import { useNavigate } from "react-router-dom";
function Navigation({selected}) {
    const navigate=useNavigate()
    

  return (
    <div>
      <ul className="bg-[#fff] font-['Times_New_Roman'] ">
        <li className="bg-[#243a48] border-b border-b-[#0000002b] px-2 py-1 text-xs text-white leading-[25px] pr-30 ">
          Position
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px]  ${selected==="AccountSummary"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={()=>{
            
            navigate('/account-summary/super_agent')
        }}
        >
          Account Summary
        </li>
        <li className="bg-[#243a48] border-b border-b-[#0000002b] px-2 py-1 text-xs text-white leading-[25px] pr-30 ">
          Performance
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px] pr-30 ${selected==="CurrentBets"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={()=>{
            navigate("/current-bets/super_agent")
        }}
        >
          Current Bets
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px] pr-30 ${selected==="BettingHistory"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={()=>{
            navigate("/betting-history/super_agent")
        }}
        >
          Betting History
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px] ${selected==="ProfitLoss"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={()=>{
            navigate("/betting-profit-loss/super_agent")
        }}
        >
          Betting Profit & Loss
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px]  ${selected==="TransactionHistory"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={()=>{
            navigate("/transaction-history/super_agent")
        }}
        >
          Transaction History
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px] pr-30 ${selected==="ActivityLog"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={()=>{
            navigate("/activity-log/super_agent")
        }}
        >
          Activity Log
        </li>
      </ul>
    </div>
  );
}

export default Navigation;
