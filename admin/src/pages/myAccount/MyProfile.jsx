import React, { useState, useEffect, useMemo } from "react";
import { BiSolidPencil } from "react-icons/bi";
import { useOutletContext } from "react-router-dom";
import EditPopup from "../../components/myAccount/EditPopup";
import { useDispatch, useSelector } from "react-redux";
import { getPasswordHistory } from "../../store/subadminSlice";
import { formatIST } from "../../utils/time";

function MyProfile() {
  const { profile, profileLoading, userId } = useOutletContext();
  const [passwordHistoryLoading, setPasswordHistoryLoading] = useState(false);
  const [passwordHistoryError, setPasswordHistoryError] = useState(null);
  const [passwordHistoryFetched, setPasswordHistoryFetched] = useState(false);
  const dispatch = useDispatch();
  const { passwordHistoryData } = useSelector((state) => state.subadmin);
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);

  const userData = useMemo(() => {
    if (!profile?.basicInfo) return null;
    const basic = profile.basicInfo;
    return {
      firstName: basic.name ?? "",
      lastName: "-",
      email: basic.userName ?? "-",
      timezone: "Asia/Dhaka",
      phone: basic.phone ?? "-",
      role: basic.role ?? "user",
      username: basic.userName ?? "-",
      currency: basic.currency ?? profile?.financialInfo?.currency ?? "BDT",
    };
  }, [profile]);

  useEffect(() => {
    if (!userId || passwordHistoryFetched) return;
    setPasswordHistoryLoading(true);
    setPasswordHistoryError(null);

    dispatch(getPasswordHistory({ page: 1, limit: 5, searchQuery: "" }))
      .unwrap()
      .catch((err) => {
        setPasswordHistoryError(err || "Failed to load password history");
      })
      .finally(() => {
        setPasswordHistoryLoading(false);
        setPasswordHistoryFetched(true);
      });
  }, [dispatch, userId, passwordHistoryFetched]);

  const lastPasswordHistory = passwordHistoryData?.[0];
  const lastChangedAt = lastPasswordHistory?.createdAt
    ? formatIST(lastPasswordHistory.createdAt)
    : null;

  if (profileLoading && !userData) {
    return <div className="p-4">Loading...</div>;
  }
  if (!userData) {
    return <div className="p-4 text-red-500">User not found.</div>;
  }

  return (
    <>
      <h2 className="text-[#243a48] text-[16px] font-[700]">profile</h2>

      <div className="mt-4">
        <table className="text-xs text-left w-[70%]">
          <thead className="bg-[#e4e4e4]">
            <tr className="border-y border-y-[#7e97a7]">
              <th className="px-2 py-2" colSpan={3}>
                About You
              </th>
            </tr>
          </thead>
          <tbody className="border-y border-y-[#7e97a7]">
            <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
              <td className="px-2 py-2">First Name</td>
              <td colSpan={2} className="px-2 py-2">{userData.firstName}</td>
            </tr>
            <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
              <td className="px-2 py-2">Last Name</td>
              <td colSpan={2} className="px-2 py-2">{userData.lastName}</td>
            </tr>
            <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
              <td className="px-2 py-2">Birthday</td>
              <td colSpan={2} className="px-2 py-2">-----</td>
            </tr>
            <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
              <td className="px-2 py-2">Email</td>
              <td colSpan={2} className="px-2 py-2">{userData.email}</td>
            </tr>
            <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
              <td className="px-2 py-2">Currency</td>
              <td colSpan={2} className="px-2 py-2 font-semibold">
                {(userData.currency || "BDT").toUpperCase()}
              </td>
            </tr>
            <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
              <td className="px-2 py-2">Password</td>
              <td className="px-2 py-2">************</td>
              <td className="px-2 py-2">
                <button
                  className="flex gap-1 text-[#2789ce] border border-[#bbb] rounded-sm px-2 py-1"
                  style={{ background: "linear-gradient(180deg, #fff, #eee)" }}
                  onClick={() => setEditPopupOpen(true)}
                >
                  <span>Edit</span>
                  <BiSolidPencil className="text-sm" />
                </button>
              </td>
            </tr>
            <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
              <td className="px-2 py-2" colSpan={3}>
                <div className="mt-2">
                  <div className="text-[13px] font-[700] text-[#243a48]">
                    Password History
                  </div>

                  {passwordHistoryLoading ? (
                    <div className="text-xs text-gray-700 mt-2">Loading...</div>
                  ) : passwordHistoryError ? (
                    <div className="text-xs text-red-600 mt-2">{passwordHistoryError}</div>
                  ) : (
                    <>
                      <div className="text-xs text-gray-700 mt-2">
                        Last changed:{" "}
                        <span className="font-bold">{lastChangedAt || "-"}</span>
                      </div>

                      <div className="mt-3 overflow-auto">
                        <table className="text-xs text-left w-full">
                          <thead>
                            <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
                              <th className="px-2 py-2">Date & Time</th>
                              <th className="px-2 py-2">Remark</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(passwordHistoryData || []).length === 0 ? (
                              <tr>
                                <td
                                  colSpan={2}
                                  className="text-center py-3 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
                                >
                                  No password history found.
                                </td>
                              </tr>
                            ) : (
                              (passwordHistoryData || []).map((row, idx) => (
                                <tr
                                  key={row?._id || `${row?.createdAt || idx}-${idx}`}
                                  className="border-y border-y-[#7e97a7]"
                                >
                                  <td className="px-2 py-2">
                                    {formatIST(row?.createdAt)}
                                  </td>
                                  <td className="px-2 py-2">{row?.remark || "-"}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
            <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
              <td className="px-2 py-2">Time Zone</td>
              <td colSpan={2} className="px-2 py-2">{userData.timezone}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <table className="text-xs text-left w-[70%]">
          <thead>
            <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
              <th className="px-2 py-2" colSpan={2}>
                Contact Details
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-y border-y-[#7e97a7] bg-[#0000000d]">
              <td className="px-2 py-2">Primary Number</td>
              <td className="px-2 py-2">{userData.phone}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {isEditPopupOpen && (
        <EditPopup onClose={() => setEditPopupOpen(false)} userId={userId} />
      )}
    </>
  );
}

export default MyProfile;
