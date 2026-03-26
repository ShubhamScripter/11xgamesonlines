import React,{useState} from "react";
import { GiPlainCircle } from "react-icons/gi";
import MatchedTable from "./MatchedTable";
import UnMatchedTable from "./UnMatchedTable";
const MatchedData = []

const UnMatchedData=[]

function ViewBets() {
    const [matchType, setmatchType] = useState("Cricket")
    const [matchSubType, setmatchSubType] = useState("BetFair")
  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Bet List</h2>

      

      {/* Filter Section */}
      <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-2 mt-4">
        {/* Filters */}
      <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-4 mb-4">
                <div className="flex gap-1 justify-center items-center">
                <div id="Cricket" className={`${matchSubType==="BetFair" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("BetFair")}
                >
                   <GiPlainCircle className={`${matchSubType==="BetFair" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="BetFair">Bet Fair</label>
                </div>

                <div className="flex gap-1 justify-center items-center">
                <div id="Cricket" className={`${matchSubType==="Bookmaker" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("Bookmaker")}
                >
                   <GiPlainCircle className={`${matchSubType==="Bookmaker" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Bookmaker">Bookmaker</label>
                </div>

                <div className="flex gap-1 justify-center items-center">
                <div id="Fancy" className={`${matchSubType==="Fancy" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("Fancy")}
                >
                   <GiPlainCircle className={`${matchSubType==="Fancy" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Fancy">Fancy</label>
                </div>

                <div className="flex gap-1 justify-center items-center">
                <div id="SportsBook" className={`${matchSubType==="SportsBook" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("SportsBook")}
                >
                   <GiPlainCircle className={`${matchSubType==="SportsBook" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="SportsBook">SportsBook</label>
                </div>

                <div className="flex gap-1 justify-center items-center">
                <div id="Tie" className={`${matchSubType==="Tie" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("Tie")}
                >
                   <GiPlainCircle className={`${matchSubType==="Tie" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Tie">Tie</label>
                </div>

                <div className="flex gap-1 justify-center items-center">
                <div id="Toss" className={`${matchSubType==="Toss" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("Toss")}
                >
                   <GiPlainCircle className={`${matchSubType==="Toss" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Toss">Toss</label>
                </div>

            </div>
      </div>
      </div>
      {/* Table Section */}
      <div className="mt-4">
        <UnMatchedTable bettingData={UnMatchedData}/>
      </div>
      <div className="mt-4">
        <MatchedTable bettingData={MatchedData}/>
      </div>
    </div>
  )
}

export default ViewBets