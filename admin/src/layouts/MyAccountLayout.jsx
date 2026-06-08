import React, { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navigation from "../components/myAccount/Navigation";
import { fetchMyAccountProfile } from "../store/myAccountSlice";

function MyAccountLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const authUser = useSelector((state) => state.auth.user);
  const { profile, loading, error } = useSelector((state) => state.myAccount);

  const userId = authUser?.id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchMyAccountProfile(userId));
    }
  }, [userId, dispatch]);

  const selected = useMemo(() => {
    const path = location.pathname;
    if (path.includes("statement")) return "MyAccountStatement";
    if (path.includes("profile")) return "myProfile";
    if (path.includes("activity-log")) return "MyActivityLog";
    return "AccountSummary";
  }, [location.pathname]);

  const displayName =
    profile?.basicInfo?.userName || authUser?.userName || authUser?.username || "—";
  const displayRole =
    profile?.basicInfo?.role || authUser?.role || "admin";

  return (
    <div className="p-2 mt-4 font-['Times_New_Roman']">
      <div
        className="flex gap-4 border border-[#bbb] rounded shadow-inner px-4 py-2 w-fit"
        style={{
          background: "linear-gradient(180deg, #fff, #eee)",
          boxShadow: "inset 0 2px 0 0 #ffffff80",
        }}
      >
        <div className="flex gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            {displayRole?.slice(0, 2)?.toUpperCase() || "AD"}
          </span>
          <span className="text-sm font-bold">{displayName}</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected={selected} />
        <div className="flex-1 mb-5 min-w-0">
          {error && !profile ? (
            <p className="text-red-600 text-sm">{error}</p>
          ) : (
            <Outlet context={{ profile, profileLoading: loading, userId }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default MyAccountLayout;
