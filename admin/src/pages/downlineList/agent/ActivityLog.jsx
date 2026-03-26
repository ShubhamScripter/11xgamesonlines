import React, { useState } from "react";
import Navigation from "../../../components/downListComp/agent/Navigation";
import ActivityLogTable from "./ActivityLogTable";
// Sample JSON data
const activityLogs = [
  {
    loginDateTime: "7/2/2025, 5:00:45 PM",
    status: "Login Success",
    ipAddress: "45.251.50.30",
    isp: "N/A",
    location: "undefined undefined//undefined",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  },
  {
    loginDateTime: "6/20/2025, 2:42:45 PM",
    status: "Login Success",
    ipAddress: "119.252.206.166",
    isp: "N/A",
    location: "undefined undefined//undefined",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  },
  {
    loginDateTime: "6/19/2025, 12:38:54 PM",
    status: "Login Success",
    ipAddress: "119.252.206.48",
    isp: "N/A",
    location: "undefined undefined//undefined",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  },
];

function ActivityLog() {
  const [selected, setselected] = useState("ActivityLog");

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
            AG
          </span>
          <span className="text-sm font-bold">testbajiuser</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected={selected} />
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">Activity Log</h2>
          <div className="mt-4">
            <ActivityLogTable activityLogs={activityLogs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;
