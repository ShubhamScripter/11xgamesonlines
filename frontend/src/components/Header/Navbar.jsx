import React, { useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import {
  RiExchangeDollarFill, RiWhatsappFill, RiWallet3Fill, RiFileList3Fill, RiHandCoinFill,
  RiHistoryFill, RiBarChart2Fill, RiEyeLine, RiUser3Fill, RiTeamFill,
  RiListCheck3, RiSettings3Fill, RiLogoutBoxRFill, RiBankCardFill
} from 'react-icons/ri';
import { HiOutlineChevronRight } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../features/auth/authSlice';
import { getCurrentBetCount } from '../../features/sports/betReducer';

function Navbar({ onClose, open }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentBetCount } = useSelector((state) => state.bet);

  // Fetch current bet count when component mounts
  useEffect(() => {
    dispatch(getCurrentBetCount());
  }, [dispatch]);

  const data = [
    { label: "Payment Transfer log", icon: <RiExchangeDollarFill />, path: "/user/payment-transfer-log" },
    { label: "Upline Whatsapp Number", icon: <RiWhatsappFill />, path: "/user/upline-whatsapp" },
    { label: "Balance Overview", icon: <RiWallet3Fill />, path: "/user/balance-overview" },
    { label: "Account Statement", icon: <RiFileList3Fill />, path: "/user/account-statement" },
    { label: "Current Bets", icon: <RiHandCoinFill />, path: "/user/current-bets", badge: currentBetCount },
    { label: "Bets History", icon: <RiHistoryFill />, path: "/user/bet-history" },
    { label: "Profit & Loss", icon: <RiBarChart2Fill />, path: "/user/profit-loss" },
    { label: "Active Log", icon: <RiEyeLine />, path: "/user/active-log" },
    { label: "My Profile", icon: <RiUser3Fill />, path: "/user/profile" },
    { label: "Self Deposit / Withdraw", icon: <RiBankCardFill />, path: "/user/manual-deposit" },
    { label: "P2P Transfer", icon: <RiTeamFill />, path: "/user/p2p-transfer" },
    { label: "P2P Transfer log", icon: <RiListCheck3 />, path: "/user/p2p-transfer-log" },
    { label: "Setting", icon: <RiSettings3Fill />, path: "/user/setting" },
    { label: "Logout", icon: <RiLogoutBoxRFill />, action: "logout" }
  ];

  const handleItemClick = (item) => {
    if (item.action === "logout") {
      dispatch(logout());
      dispatch(reset());
      // navigate("/login");
      return;
    }
    navigate(item.path);
    onClose();
  };

  return (
    <div
      className={`absolute top-0 left-0 h-full w-[70%] bg-[#f4faff] shadow-2xl rounded-r-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300">
        <h2 className="text-lg font-semibold text-gray-700">Menu</h2>
        <IoClose className="text-2xl text-gray-700" onClick={onClose} />
      </div>

      {/* Menu List */}
      <ul className="p-3 space-y-2 overflow-y-auto h-[calc(100%-60px)] pb-5 hide-scrollbar">
        {data.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleItemClick(item)}
          >
            <div className="flex items-center gap-3 text-[#17934e]">
              <div className="text-2xl">{item.icon}</div>
              <span className="text-sm font-medium text-black">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge !== undefined && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
              <HiOutlineChevronRight className="text-lg text-gray-400" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Navbar;
