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
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px]  ${selected==="MyAccountStatement"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={()=>{
            
            navigate('/my-account-statement')
        }}
        >
          Account Statement
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px]  ${selected==="AccountSummary"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={()=>{
            
            navigate('/my-account-summary')
        }}
        >
          Account Summary
        </li>
        <li className="bg-[#243a48] border-b border-b-[#0000002b] px-2 py-1 text-xs text-white leading-[25px] pr-30 ">
          Account Details
        </li>
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px] pr-30 ${selected==="myProfile"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={()=>{
            navigate("/my-profile")
        }}
        >
          Profile
        </li>
        
        <li className={`border-b border-b-[#0000002b] px-2 py-1 text-xs   hover:text-[#243a48] cursor-pointer leading-[25px] pr-30 ${selected==="MyActivityLog"? "bg-[#f2dca7] text-[#333]":" bg-[#fff] text-[#2789ce]"}`}
        onClick={()=>{
            navigate("/my-activity-log")
        }}
        >
          Activity Log
        </li>
      </ul>
    </div>
  );
}

export default Navigation;
