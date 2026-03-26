import React ,{useState} from "react";
import { useNavigate } from "react-router-dom";
function Navigation({selected, userId,role}) {
    const navigate=useNavigate()
    

  return (
    <div>
      <ul className="bg-[#fff] font-['Times_New_Roman'] ">
        <li className="bg-[#243a48] border-b border-b-[#0000002b] px-2 py-1 text-xs text-white leading-[25px] pr-30 ">
          Position
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px]  ${selected==="AccountSummary"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
         onClick={() => {
              if (role && userId) {
                navigate(`/account-summary/${role}/${userId}`)
              } else {
                console.warn("Missing role or ID in user", user);
                  }
           }}
        >
          Account Summary
        </li>
        <li className="bg-[#243a48] border-b border-b-[#0000002b] px-2 py-1 text-xs text-white leading-[25px] pr-30 ">
          Performance
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px] pr-30 ${selected==="CurrentBets"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={() => {
          if (role && userId) {
            navigate(`/current-bets/${role}/${userId}`)
            } else {
            console.warn("Missing role or ID in user", user);
           }
          }}
        >
          Current Bets
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px] pr-30 ${selected==="BettingHistory"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={() => {
          if (role && userId) {
            navigate(`/betting-history/${role}/${userId}`)
            } else {
            console.warn("Missing role or ID in user", user);
           }
          }}
        >
          Betting History
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px] ${selected==="ProfitLoss"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={() => {
          if (role && userId) {
            navigate(`/betting-profit-loss/${role}/${userId}`)
            } else {
            console.warn("Missing role or ID in user", user);
           }
          }}
        
        >
          Betting Profit & Loss
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px]  ${selected==="TransactionHistory"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={() => {
          if (role && userId) {
            navigate(`/transaction-history/${role}/${userId}`)
            } else {
            console.warn("Missing role or ID in user", user);
           }
          }}
        >
          Transaction History
        </li>
        {
          role === "user" &&(
            <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px]  ${selected==="TransactionHistory2"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={() => {
          if (role && userId) {
            navigate(`/transaction-history2/${role}/${userId}`)
            } else {
            console.warn("Missing role or ID in user", user);
           }
          }}
        >
          Transaction History2
        </li>
          )
        }
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px] pr-30 ${selected==="ActivityLog"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={() => {
          if (role && userId) {
            navigate(`/activity-log/${role}/${userId}`)
            } else {
            console.warn("Missing role or ID in user", user);
           }
          }}
        >
          Activity Log
        </li>
      </ul>
    </div>
  );
}

export default Navigation;
