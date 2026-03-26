import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navigation from "../../../components/downListComp/admin/Navigation";
import TransactionHistoryTable from "./TransactionHistoryTable";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
// Sample JSON data
const sampleTransactions = [
  {
    datetime: "7/2/2025, 5:02:00 PM",
    depositFromUpline: "-",
    depositToDownline: "200.00",
    withdrawByUpline: "-",
    withdrawFromDownline: "-",
    balance: "0.00",
    remark: "test",
    fromTo: "bajitest1 -> testseniorsuper",
  },
  {
    datetime: "7/2/2025, 4:55:15 PM",
    depositFromUpline: "200.00",
    depositToDownline: "-",
    withdrawByUpline: "-",
    withdrawFromDownline: "-",
    balance: "200.00",
    remark: "test",
    fromTo: "admin -> bajitest1",
  },
];

function TransactionHistory2() {
  const { userId, role } = useParams();
  const [userData, setUserData] = useState(null); 
  const [selected, setselected] = useState("TransactionHistory2");

  const [transactions, setTransactions] = useState(sampleTransactions);
  const [loading, setLoading] = useState(true);
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
    if (!userId) return;
    setLoading(true);
    axiosInstance.post("/get/agent-trantionhistory2", { id: userId })
      .then(({ data }) => {
        if (Array.isArray(data?.data)) {
          const mapped = data.data.map(item => ({
            datetime: item.date ? new Date(item.date).toLocaleString() : '-',
            depositFromUpline: item.deposite > 0 ? item.deposite : '-',
            depositToDownline: item.withdrawl === 0 && item.deposite > 0 ? item.deposite : '-',
            withdrawByUpline: item.withdrawl > 0 ? item.withdrawl : '-',
            withdrawFromDownline: '-',
            balance: item.amount,
            remark: item.remark,
            fromTo: `${item.from || ''} -> ${item.to || ''}`,
          }));
          setTransactions(mapped);
        } else {
          setTransactions([]);
        }
      })
      .catch(err => {
        toast.error(
          err?.response?.data?.message || "Failed to fetch transaction history."
        );
        setTransactions(sampleTransactions);
      })
      .finally(() => setLoading(false));
  }, [userId]);

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
        <Navigation selected={selected} userId={userId} role={role}/>
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">
            Transaction History
          </h2>
          <div className="mt-4">
            <TransactionHistoryTable transactions={transactions}/>
            {loading && <div className="mt-2 text-sm">Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionHistory2;
