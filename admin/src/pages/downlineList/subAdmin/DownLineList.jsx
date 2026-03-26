import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaMicrophone } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";
import { MdPersonAddAlt1 } from "react-icons/md";
import { IoMdRefresh } from "react-icons/io";
import { FaExchangeAlt, FaUser, FaCog, FaLock, FaList } from "react-icons/fa";
import BalanceCard from "../../../components/downListComp/subAdmin/BalanceCard";
import AccountTable from "../../../components/downListComp/subAdmin/AccountTable";
import AddSubAdmin from "../../../components/downListComp/admin/AddSubAdmin";
import axios from '../../../utils/axiosInstance';

function DownLineList() {
  const { userId } = useParams();
  const [userData, setUserData] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [downlines, setDownlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    fetchUserAndDownlines(); // refresh data
  };
  const fetchUserAndDownlines = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/users/downline-tree/${userId}`);
    //   const user = data?.downlines?.[0];
     const user = data; 
      console.log("Current viewed user's data:", user);

      if (!user) {
        console.warn('No user found with ID:', userId);
        setLoading(false);
        return;
      }

      setUserRole(user.role); // capture current user's role for dynamic add
      console.log("Current viewed user's role:", user.role);


      setUserData([
        { label: 'Total Balance', value: `BDT ${(user.totalBalance ?? 0).toFixed(2)}` },
        { label: 'Total Exposure', value: `BDT ${(user.totalExposure ?? 0).toFixed(2)}`, highlight: true },
        { label: 'Total Avail. bal.', value: `BDT ${(user.totalAvailableBalance ?? 0).toFixed(2)}` },
        { label: 'Balance', value: `BDT ${(user.balance ?? 0).toFixed(2)}` },
        { label: 'Available Balance', value: `BDT ${(user.availableBalance ?? 0).toFixed(2)}` },
        { label: 'Total Player Balance', value: `BDT ${(user.totalPlayerBalance ?? 0).toFixed(2)}` },
      ]);

      const formattedDownlines = (user.downlines || []).map((u, i) => ({
        id: i + 1,
        _id: u._id,
        role: u.role,
        username: u.username,
        creditRef: u.creditRef || 0,
        balance: u.balance || 0,
        exposure: u.totalExposure || 0,
        availBal: u.totalAvailableBalance || 0,
        playerBal: u.totalPlayerBalance || 0,
        refPL: 0,
        status: u.status === 'active' ? 'Active' : 'Inactive',
      }));

      setDownlines(formattedDownlines);
    } catch (err) {
      console.error('Error fetching downline data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUserAndDownlines();
  }, [userId]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  return (
    <div>
      <div className="p-1 rounded-lg flex items-center justify-start gap-1 bg-gradient-to-b from-[#2a3a43] via-[#2a3a43] via-27% to-[#1c282d] to-83%">
        <FaMicrophone className="text-white text-sm" />
        <span className="text-white text-sm">News</span>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2">
          <div className="bg-white border border-[#aaa] flex items-center gap-2 px-2 py-1 shadow-[inset_0_2px_0_0_#0000001a]">
            <IoSearchSharp />
            <input
              type="text"
              placeholder="Find Member...."
              name="findMember"
              className="outline-0 text-sm "
            />
            <button className="bg-[#fdb72f] rounded-sm p-1 font-serif text-sm">
              Search
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-light">Status</span>
            <div className="border border-[#aaa]">
              <select name="" id="" className=" text-sm bg-white w-40">
                <option value="active">Active</option>
                <option value="suspended">Suspend</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex  gap-2">
          <div className="flex justify-center items-center border border-[#bbb] shadow-[inset_0_2px_0_0_#ffffff80] bg-gradient-to-b from-white to-[#eee] px-2 py-1 gap-2 cursor-pointer"
          onClick={openModal}
          >
            <MdPersonAddAlt1 className="text-xl" />
            <span className="text-sm font-medium">Add Senior Super</span>
          </div>
          <div className="rounded-sm p-1 border border-[#bbb] shadow-[inset_0_2px_0_0_#ffffff80] bg-gradient-to-b from-white to-[#eee]">
            <IoMdRefresh className=" font-bold text-xl" />
          </div>
        </div>
      </div>

      <div
        className="flex gap-4 border border-[#bbb] rounded shadow-inner px-4 py-2 w-fit mt-2"
        style={{
          background: "linear-gradient(180deg, #fff, #eee)",
          boxShadow: "inset 0 2px 0 0 #ffffff80",
        }}
      >
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d65d5d] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            SAD
          </span>
          <span className="text-sm font-bold">bajitest1</span>
        </div>
      </div>

      <BalanceCard balanceData={userData}/>
      <AccountTable users={downlines}/>

      {/* add sub admin popup */}
      {isModalOpen && <AddSubAdmin onClose={closeModal} />}
    </div>
  );
}

export default DownLineList;
