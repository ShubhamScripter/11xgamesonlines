import React, { useEffect, useState } from 'react';
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

import { casinoData } from '../casinocomp/data/CasinoData';



import slotColor from '../../assets/icon/icon-slotColor.png'
import fishColor from '../../assets/icon/icon-fishColor.png'
import crashColor from '../../assets/icon/icon-crashColor.png'
import arcadeColor from '../../assets/icon/icon-arcadeColor.png'
import casinoColor from '../../assets/icon/icon-casinoColor.png'
import tableColor from '../../assets/icon/icon-tableColor.png'


function Navbar({ onClose = () => {}, sidebarOpen, setSidebarOpen }) {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentBetCount } = useSelector((state) => state.bet);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Fetch current bet count when component mounts
  // useEffect(() => {
  //   dispatch(getCurrentBetCount());
  // }, [dispatch]);

  // Close any open dropdown when the sidebar is collapsed
  useEffect(() => {
    if (!sidebarOpen) {
      setOpenDropdown(null);
    }
  }, [sidebarOpen]);

  const getProviders = (gameType) => {
    const providers = Object.entries(casinoData.providers)
      .filter(([_, games]) =>
        games.some((g) =>
          g.game_type?.toLowerCase().includes(gameType.toLowerCase())
        )
      )
      .map(([key]) => key);
    return ["all", ...providers];
  };

  const data = [
    // { label: "Payment Transfer log", icon: <RiExchangeDollarFill />, path: "/user/payment-transfer-log" },
    // { label: "Upline Whatsapp Number", icon: <RiWhatsappFill />, path: "/user/upline-whatsapp" },
    { label: "Casino", icon: casinoColor, gameType: "casino", subItems: getProviders("casino") },
    { label: "Crash", icon: crashColor, gameType: "crash", subItems: getProviders("crash") },
    { label: "Slot", icon: slotColor, gameType: "slot", subItems: getProviders("slot") },
    { label: "Table", icon: tableColor, gameType: "table", subItems: getProviders("table") },
    { label: "Fishing", icon: fishColor, gameType: "fishing", subItems: getProviders("fishing") },
    { label: "Arcade", icon: arcadeColor, gameType: "arcade", subItems: getProviders("arcade") },
    { label: "Balance Overview", icon: <RiWallet3Fill />, path: "/user/balance-overview" },
    { label: "Account Statement", icon: <RiFileList3Fill />, path: "/user/account-statement" },
    { label: "Current Bets", icon: <RiHandCoinFill />, path: "/user/current-bets", badge: currentBetCount },
    { label: "Bets History", icon: <RiHistoryFill />, path: "/user/bet-history" },
    { label: "Active Log", icon: <RiEyeLine />, path: "/user/active-log" },
    { label: "My Profile", icon: <RiUser3Fill />, path: "/user/profile" },
    { label: "Self Deposit / Withdraw", icon: <RiBankCardFill />, path: "/user/manual-deposit" },
    // { label: "P2P Transfer", icon: <RiTeamFill />, path: "/user/p2p-transfer" },
    // { label: "P2P Transfer log", icon: <RiListCheck3 />, path: "/user/p2p-transfer-log", },
    // { label: "Setting", icon: <RiSettings3Fill />, path: "/user/setting" },
    { label: "Logout", icon: <RiLogoutBoxRFill />, action: "logout" }
  ];

  const handleItemClick = async (item, index, subItem = null) => {
    if (item.disabled) {
      return;
    }
    if (subItem) {
      // provider clicked
      navigate(`/casino/${item.gameType}/${subItem}`);
      onClose();
      return;
    }
    if (item.action === "logout") {
      await dispatch(logout());
      dispatch(reset());
      onClose();
      navigate("/login", { replace: true });
      return;
    }
    if (item.subItems) {
      // toggle dropdown
      setOpenDropdown(openDropdown === index ? null : index);
      return;
    }
    if (item.path) {
      navigate(item.path);
      onClose();
    }
  };

  return (
    <div
      className='bg-[#141515] border-r border-gray-700  z-50 h-[calc(100vh-65px)] overflow-y-auto no-scrollbar'>
      {/* Menu List */}
      <ul className={`${sidebarOpen ? 'p-3':'px-5 py-3'} space-y-2`}>
        {data.map((item, i) => (
          <React.Fragment key={i}>
            <li
              className='flex items-center gap-2 py-3'
               onClick={() => {
                  if (!sidebarOpen) {
                    setSidebarOpen(true);
                  }
                  handleItemClick(item, i);
                }}
            >
              {typeof item.icon === "string" ? (
                <img src={item.icon} className="h-5 w-5" />
              ) : (
                <div className="text-xl text-green-400">{item.icon}</div>
              )}

              {sidebarOpen && (
                <div className="flex items-center gap-2 flex-1 justify-between">
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-gray-500'>
                      {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span className="bg-green-600 text-white w-5 h-5 text-[12px] flex justify-center items-center rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <HiOutlineChevronRight className={`text-lg text-gray-400 transition-all ${openDropdown === i && item.subItems ? "rotate-90":"-rotate-90"}`} />
                </div>
              )}
              

            </li>
            {openDropdown === i && item.subItems && (
              <ul className="space-y-1">
                {item.subItems.map((sub) => (
                  <li
                    key={`${item.gameType}-${sub}`}
                    className="py-2 px-4 text-sm text-gray-400 cursor-pointer hover:text-white bg-[#222424] capitalize"
                    onClick={() => handleItemClick(item, i, sub)}
                  >
                    {sub === "all" ? "All" : sub}
                  </li>
                ))}
              </ul>
            )}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
}

export default Navbar;
