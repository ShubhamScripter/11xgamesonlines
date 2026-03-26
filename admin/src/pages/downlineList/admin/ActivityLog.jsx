import React, {useState, useEffect } from "react";
import Navigation from "../../../components/downListComp/admin/Navigation";
import ActivityLogTable from "./ActivityLogTable";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchActivityLogs } from "../../../store/activityLogSlice";
import axiosInstance from '../../../utils/axiosInstance';

function ActivityLog() {
  const { userId, role } = useParams();
  const [selected, setselected] = useState("ActivityLog");
  const dispatch = useDispatch();
  const { logs: activityLogs, loading, error } = useSelector(state => state.activityLog);
  const [UserInfo, setUserInfo] = useState([]);

  const title = {
      superadmin: "SUD",
      admin: "AD",
      subadmin: "SAD",
      seniorSuper: "SSM",
      superAgent: "SA",
      agent: "AG",
      user: "CL",
    };
   const user = useSelector(state => state.auth.user);
    useEffect(() => {
      if (!userId) return;
      const fetchUserInfo = async () => {
        try {
          const response = await axiosInstance.get(`/get/user-profile/${userId}`);
          setUserInfo(response.data.data);
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      };
      fetchUserInfo();
      
    }, [userId]);

  useEffect(() => {
    if (userId) dispatch(fetchActivityLogs(userId));
  }, [userId, dispatch]);

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
            {title[user?.role] || ""}
          </span>
          <span className="text-sm font-bold">{user?.userName}</span>
        </div>
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            {title[UserInfo?.role] || ""}
          </span>
          <span className="text-sm font-bold">{UserInfo?.userName}</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected={selected} userId={userId} role={role} />
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">
            Activity Log
          </h2>
          <div className="mt-4">
            {loading ? (
              <p>Loading activity logs...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <ActivityLogTable activityLogs={activityLogs} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;