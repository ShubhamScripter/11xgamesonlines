import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { displayUserCurrency } from "../../utils/userCurrency";

const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function BetLockedUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchLockedUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/users-locked", {
        params: { page: 1, limit: 100 },
      });
      const items = Array.isArray(data?.data) ? data.data : [];
      setRows(items);
      setTotalRecords(data?.totalRecords ?? items.length);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to fetch locked users");
      setRows([]);
      setTotalRecords(0);
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
      superAdmin: map.superadmin || map.superAdmin || "-",
      admin: map.admin || "-",
      subAdmin: map.subadmin || map.subAdmin || "-",
      seniorSuper: map.seniorSuper || "-",
      superAgent: map.superAgent || "-",
      agent: map.agent || "-",
    };
  };

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <div className="flex justify-between items-center">
        <h2 className="text-[#243a48] text-[16px] font-[700]">Bet Locked Users</h2>
        {!loading && (
          <span className="text-xs text-[#3b5160]">Total: {totalRecords}</span>
        )}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">Username</th>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Role</th>
              <th className="px-2 py-2">Currency</th>
              <th className="px-2 py-2">Balance</th>
              <th className="px-2 py-2">Avail. Bal.</th>
              <th className="px-2 py-2">Exposure</th>
              <th className="px-2 py-2">Credit Ref.</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Remark</th>
              <th className="px-2 py-2">Super Admin</th>
              <th className="px-2 py-2">Admin</th>
              <th className="px-2 py-2">Sub Admin</th>
              <th className="px-2 py-2">Senior Super</th>
              <th className="px-2 py-2">Super Agent</th>
              <th className="px-2 py-2">Agent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const up = renderUpperline(row.upperline);
              return (
                <tr key={row._id} className="bg-white border-y border-y-[#7e97a7]">
                  <td className="px-2 py-2 font-semibold">{row.userName || "-"}</td>
                  <td className="px-2 py-2">{row.name || "-"}</td>
                  <td className="px-2 py-2 capitalize">{row.role || "-"}</td>
                  <td className="px-2 py-2 font-semibold">
                    {displayUserCurrency(row.currency)}
                  </td>
                  <td className="px-2 py-2">{formatAmount(row.balance)}</td>
                  <td className="px-2 py-2">{formatAmount(row.avbalance)}</td>
                  <td className="px-2 py-2">{formatAmount(row.exposure)}</td>
                  <td className="px-2 py-2">{formatAmount(row.creditReference)}</td>
                  <td className="px-2 py-2 capitalize text-[#536174] font-semibold">
                    {row.status || "locked"}
                  </td>
                  <td className="px-2 py-2">{row.remark || "-"}</td>
                  <td className="px-2 py-2">{up.superAdmin}</td>
                  <td className="px-2 py-2">{up.admin}</td>
                  <td className="px-2 py-2">{up.subAdmin}</td>
                  <td className="px-2 py-2">{up.seniorSuper}</td>
                  <td className="px-2 py-2">{up.superAgent}</td>
                  <td className="px-2 py-2">{up.agent}</td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-2 py-4 text-center" colSpan="15">
                  No locked users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <div className="mt-2 text-sm">Loading...</div>}
      </div>
    </div>
  );
}

export default BetLockedUsers;
