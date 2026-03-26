import React,{useState} from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { TbCancel } from "react-icons/tb";
import { FaLock } from "react-icons/fa";
function ChangeStatus({ onClose }) {
    const [status, setstatus] = useState("Active")
  return (
    <div className="fixed inset-0 bg-[rgba(17,17,17,0.49)]  flex justify-center items-start pt-10 z-50 overflow-auto">
      <div className="bg-[#eee] p-6 rounded-lg w-[400px] relative shadow-lg font-['Times_New_Roman']">
        <button
          onClick={onClose}
          className="absolute right-3 top-2 text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-lg font-['Times_New_Roman'] font-semibold mb-4 text-[#3b5160] ">
          Change Status
        </h2>
        <div className="flex justify-between items-center border-b pb-3 border-b-[#00000014]">
            <div className="flex gap-1">
                <span className="bg-[#568bc8] rounded-sm p-1 text-white text-xs">sub_admin</span>
                <span>bajitest1</span>
            </div>
            <div className="flex justify-center items-center gap-1">
                <span className="text-green-700 text-lg">●</span>
                <span className="text-green-600 text-xs">Active</span>
            </div>
        </div>
        <div className="flex  items-center justify-between mt-4 mx-4">
            <div className={`${status === "Active" ? "bg-[#4cbb17] text-white" : "bg-[linear-gradient(358deg,_rgb(217,217,217),_rgb(255,255,255))]"}  border border-[#d9d9d9] rounded-[8px] flex flex-col justify-center items-center p-4 px-6 cursor-pointer`}
            onClick={()=>setstatus("Active")}
            >
                <FaRegCheckCircle/>
                <span>Active</span>
            </div>
            <div className={`${status === "Suspend" ? "bg-[linear-gradient(-180deg,_rgb(219,40,40),_rgb(146,19,19))] text-white" : "bg-[linear-gradient(358deg,_rgb(217,217,217),_rgb(255,255,255))]"}  border border-[#d9d9d9] rounded-[8px] flex flex-col justify-center items-center p-4 px-6 cursor-pointer`}
            onClick={()=>setstatus("Suspend")}
            >
                <TbCancel/>
                <span>Suspend</span>
            </div>
            <div className={`${status === "Locked" ? "bg-[linear-gradient(-180deg,_rgb(154,182,206),_rgb(83,97,116))] text-white" : "bg-[linear-gradient(358deg,_rgb(217,217,217),_rgb(255,255,255))]"}  border border-[#d9d9d9] rounded-[8px] flex flex-col justify-center items-center p-4 px-6 cursor-pointer`}
            onClick={()=>setstatus("Locked")}
            >
                <FaLock/>
                <span>Locked</span>
            </div>
        </div>
        <div className="mt-4 mx-4 flex gap-1 justify-center items-center">
            <div className="flex gap-2">
                <label htmlFor="password">Password</label>
                <input type="password" name="password" placeholder="Enter Password" className="p-1 outline-none border border-[#aaaaaa] rounded-[2px] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)]" />
            </div>
            <button className="bg-[#ffcc2f] border border-[#cb8009] text-xs font-semibold rounded-sm p-1">Change</button>
        </div>
      </div>
    </div>
  );
}

export default ChangeStatus;
