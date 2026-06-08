import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ActivityLogTable from "./ActivityLogTable";
import { fetchActivityLogs } from "../../store/activityLogSlice";

function MyActivityLog() {
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id;
  const dispatch = useDispatch();
  const { logs: activityLogs, loading, error } = useSelector(
    (state) => state.activityLog
  );

  useEffect(() => {
    if (userId) dispatch(fetchActivityLogs(userId));
  }, [userId, dispatch]);

  return (
    <>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Activity Log</h2>
      <div className="mt-4">
        {loading && activityLogs.length === 0 ? (
          <p>Loading activity logs...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ActivityLogTable activityLogs={activityLogs} />
        )}
      </div>
    </>
  );
}

export default MyActivityLog;
