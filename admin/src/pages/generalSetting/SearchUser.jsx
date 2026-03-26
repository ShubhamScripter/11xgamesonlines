import React, { useState, useEffect } from "react";
import ChangePassword from "./changePassword";
import ChangeStatusPopup from "./ChangeStatusPopup";
import { IoSearchSharp } from "react-icons/io5";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { fetchDownlineTree } from "../../store/downlineSlice";
import { fetchAccountSummary } from "../../store/accountSummarySlice";
import { useSelector, useDispatch } from "react-redux";
function SearchUser() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeStatusPopupOpen, setIsChangeStatusPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentType, setPaymentType] = useState("deposite");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const openModal = () => setIsChangePasswordOpen(true);
  const closeModal = () => setIsChangePasswordOpen(false);
  const openChangeStatusPopup = () => setIsChangeStatusPopupOpen(true);
  const closeChangeStatusPopup = () => setIsChangeStatusPopupOpen(false);
  const [statusChangeUserId, setStatusChangeUserId] = useState(null);
  const [statusChangeDetails, setStatusChangeDetails] = useState(null);

  const refreshBalances = () => {
    if (user?.id) {
      dispatch(fetchDownlineTree(user.id));
      dispatch(fetchAccountSummary(user.id)); // refresh own summary too
    }
  };
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDownlineTree(user.id));
      dispatch(fetchAccountSummary(user.id)); // refresh own summary too
    }
  }, [user?.id, dispatch]);
  const handleSearch = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/users-including-subadmins", {
        params: { page: 1, limit: 10, searchQuery: searchQuery.trim() },
      });
      const apiUsers = Array.isArray(data?.data) ? data.data : [];
      setUsers(apiUsers);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch users";
      setError(msg);
      toast.error(msg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  const firstUser = users[0];
  const submitPayment = async () => {
    if (!firstUser?._id) {
      const msg = "No user selected";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!amount || Number(amount) <= 0) {
      const msg = "Enter a valid amount";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!masterPassword) {
      const msg = "Enter master password";
      setError(msg);
      toast.error(msg);
      return;
    }
    setError("");
    setPaymentLoading(true);
    try {
      const payload = {
        userId: firstUser._id,
        formData: {
          balance: Number(amount),
          masterPassword,
          remark,
        },
        type: paymentType,
      };
      await axiosInstance.put("/withdrowal-deposite", payload);
      setError("");
      toast.success("Transaction successful");
      refreshBalances();
      // optional reset
      setAmount("");
      setRemark("");
      setMasterPassword("");
      // refresh the table data to reflect updated balances
      await handleSearch();
    } catch (e) {
      const msg = e?.response?.data?.message || "Transaction failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setPaymentLoading(false);
    }
  };
  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Search Users</h2>
      <div className="mt-4 flex gap-2 items-center">
        <div className="bg-white border border-[#aaa] flex items-center gap-2 px-2 py-1 p-4 shadow-[inset_0_2px_0_0_#0000001a]">
          <IoSearchSharp />
          <input
            type="text"
            placeholder="Enter User Name...."
            name="findMember"
            className="outline-0 text-sm "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSearch} className="bg-gradient-to-b from-white to-[#eee] px-3 py-1 rounded-[5px] border border-[#bbb] text-[13px] text-[#1e1e1e] font-[700]">
            Search
          </button>
          <button 
          onClick={() =>{
            if(firstUser?.role && firstUser?._id){
              navigate(`/transaction-history2/${firstUser?.role}/${firstUser?._id}`);
            }
          }}
          className="bg-gradient-to-b from-white to-[#eee] px-3 py-1 rounded-[5px] border border-[#bbb] text-[13px] text-[#1e1e1e] font-[700]">
            Statement
          </button>
          <button className="bg-gradient-to-b from-white to-[#eee] px-3 py-1 rounded-[5px] border border-[#bbb] text-[13px] text-[#1e1e1e] font-[700]">
            Block For Cheat
          </button>
        </div>
      </div>
      {loading && (
        <div className="mt-2 text-sm">Loading...</div>
      )}
      <div className="mt-4">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">Super Admin</th>
              <th className="px-2 py-2">Admin </th>
              <th className="px-2 py-2">Sub Admin</th>
              <th className="px-2 py-2">Senior Super</th>
              <th className="px-2 py-2">Super Agent</th>
              <th className="px-2 py-2">Agent</th>
              <th className="px-2 py-2">User</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-y border-y-[#7e97a7]">
              <td className="px-2 py-2">-</td>
              <td className="px-2 py-2">-</td>
              <td className="px-2 py-2">-</td>
              <td className="px-2 py-2">-</td>
              <td className="px-2 py-2">-</td>
              <td className="px-2 py-2">-</td>
              <td className="px-2 py-2">{firstUser?.userName || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">Username </th>
              <th className="px-2 py-2">Balance</th>
              <th className="px-2 py-2">Available D/W</th>
              <th className="px-2 py-2">Exposure</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Action</th>
              <th className="px-2 py-2">Deposit / Withdraw</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isActive = (user?.status || "").toLowerCase() === "active";
              return (
                <tr key={user?._id || user?.userName} className="bg-white border-y border-y-[#7e97a7]">
                  <td className="px-2 py-2">{user?.userName || "-"}</td>
                  <td className="px-2 py-2">{user?.avbalance ?? 0}</td>
                  <td className="px-2 py-2">{user?.avbalance ?? 0}</td>
                  <td className="px-2 py-2">{user?.exposure ?? 0}</td>
                  <td className="px-2 py-2">
                    <div className={`${isActive ? "bg-[#e5f1dc] text-[#508d0e] border border-[#bedca7]" : "bg-[#ebb7b7] text-[#db2828] border border-[#c68585]"}  px-2 py-1  rounded-lg text-[12px] font-semibold flex gap-1 items-center`}>
                      <span className={`${isActive ? "text-[#4cbb17]" : "text-[#921313]"}`}>●</span>
                      <span>{user?.status ?? "N/A"}</span>
                    </div>
                    {user.role === "user"&&(
                      <div className="flex items-center gap-2">
                      <div className="border border-[#aaa] mt-2">
                        <select value="" onChange={e => setStatusChangeDetails({ userId: user._id, status: e.target.value })} className="text-sm bg-white outline-none">
                          <option value="">Change</option>
                          <option value="active">Active</option>
                          <option value="suspended">Suspend</option>
                          <option value="locked">Locked</option>
                          <option value="cheater">Cheater</option>
                        </select>
                      </div>
                    </div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <button 
                      onClick={openModal}
                      className="bg-gray-200 p-1 border border-[#bbb] rounded"
                    >
                      Change Password
                    </button>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <div className="flex gap-2 mb-1">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            checked={paymentType === "deposite"}
                            onChange={() => setPaymentType("deposite")}
                          />
                          <span className="bg-green-200 px-1">D</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            checked={paymentType === "withdrawal"}
                            onChange={() => setPaymentType("withdrawal")}
                          />
                          <span className="bg-red-200 px-1">W</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="px-1 w-15 border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]"
                        />
                        <button
                          type="button"
                          className="px-2 py-1 bg-gradient-to-b from-white to-gray-100 font-[700] text-sm border border-[#bbb] rounded"
                          onClick={() => setAmount(String(user?.balance ?? 0))}
                        >
                          Full
                        </button>
                        <input
                          type="text"
                          placeholder="Remark"
                          value={remark}
                          onChange={(e) => setRemark(e.target.value)}
                          className="px-1 border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] p-2"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && users.length === 0 && (
              <tr>
                <td className="px-2 py-4" colSpan="7">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-8">
        <div className="bg-[#fff] mt-4 p-4 flex justify-center items-center gap-2">
        {/* <button className="bg-[#f3f3f3] border border-[#e1e1e1] px-3 py-1 rounded-sm">Clear All</button> */}
        <input
          type="password"
          placeholder="password"
          className="px-1  border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] p-2 rounded-sm"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
        />
        <button
          onClick={submitPayment}
          disabled={paymentLoading}
          className="bg-[#ffcc2f] border-[#cb8009] text-[#333] px-3 py-2 text-xs font-[700] rounded-sm "
        >
            Submit
            <span className="mx-2 bg-[#ffe9a5] rounded-full p-1 px-2">0</span>
            Payment
        </button>
      </div>
      {/* toast handled by react-hot-toast Toaster at app root */}
      </div>
        {isChangePasswordOpen && firstUser && (
          <ChangePassword onClose={closeModal} userId={firstUser?._id} />
        )}
        {isChangeStatusPopupOpen && firstUser && (
          <ChangeStatusPopup onClose={closeChangeStatusPopup} userId={firstUser?._id} />
        )}
        {statusChangeDetails && (
          <ChangeStatusPopup
            onClose={() => setStatusChangeDetails(null)}
            userId={statusChangeDetails.userId}
            status={statusChangeDetails.status}
            onSuccess={() => {
              setStatusChangeDetails(null);
              handleSearch();
            }}
          />
        )}
      </div>
  );
}

export default SearchUser;
