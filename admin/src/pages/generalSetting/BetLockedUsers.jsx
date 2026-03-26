import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

function BetLockedUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLockedUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/users-locked", {
        params: { page: 1, limit: 10 },
      });
      const items = Array.isArray(data?.data) ? data.data : [];
      setRows(items);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to fetch locked users");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLockedUsers();
  }, []);

  const renderUpperline = (upperline = []) => {
    const map = upperline.reduce((acc, u) => {
      acc[u.role] = u.userName;
      return acc;
    }, {});
    return {
      superAdmin: map.superAdmin || "-",
      admin: map.admin || "-",
      subAdmin: map.subadmin || map.subAdmin || "-",
      seniorSuper: map.seniorSuper || "-",
      superAgent: map.superAgent || "-",
      agent: map.agent || "-",
    };
  };

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">In Active Users</h2>
      <div className="mt-4">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">User</th>
              <th className="px-2 py-2">Reason</th>
              <th className="px-2 py-2">Super Admin</th>
              <th className="px-2 py-2">Admin </th>
              <th className="px-2 py-2">Sub Admin</th>
              <th className="px-2 py-2">Senior Super</th>
              <th className="px-2 py-2">Super Agent</th>
              <th className="px-2 py-2">Agent</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const up = renderUpperline(row.upperline);
              return (
                <tr key={row._id} className="bg-white border-y border-y-[#7e97a7]">
                  <td className="px-2 py-2">{row.userName}</td>
                  <td className="px-2 py-2">-</td>
                  <td className="px-2 py-2">{up.superAdmin}</td>
                  <td className="px-2 py-2">{up.admin}</td>
                  <td className="px-2 py-2">{up.subAdmin}</td>
                  <td className="px-2 py-2">{up.seniorSuper}</td>
                  <td className="px-2 py-2">{up.superAgent}</td>
                  <td className="px-2 py-2">{up.agent}</td>
                  <td className="px-2 py-2"></td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-2 py-4" colSpan="9">No locked users found</td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && (
          <div className="mt-2 text-sm">Loading...</div>
        )}
      </div>
    </div>
  );
}

export default BetLockedUsers;
