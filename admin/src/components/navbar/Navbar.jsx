import React, { useState } from "react";
import * as Icons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";

const navData = [
  {
    label: "Downline List",
    icon: "FaUsers",
    path: "/"
  },
  {
    label: "My Account",
    icon: "FaUserCircle",
    path: "/my-account-summary"
  },
  // {
  //   label: "My Report",
  //   icon: "FaChartBar",
  //   children: [
  //     {
  //       label: "Profit/Loss Report by Downline",
  //       icon: "FaFileAlt",
  //       path: "/AprofitByDownline"
  //     },
  //     {
  //       label: "Profit/Loss by Downline",
  //       icon: "FaFileInvoiceDollar",
  //       path: "/AprofitDownline"
  //     },
  //     {
  //       label: "Profit/Loss Report by Market",
  //       icon: "FaChartPie",
  //       path: "/AprofitMarket"
  //     },
  //     {
  //       label: "Profit/Loss Sports Wise",
  //       icon: "FaFutbol",
  //       path: "/Adownlinesportspl"
  //     },
  //     {
  //       label: "All Casino Profit/Loss",
  //       icon: "FaDice",
  //       path: "/ACdownlinesportspl"
  //     },
  //     {
  //       label: "Casino Profit/Loss Report by Date",
  //       icon: "FaCalendarAlt",
  //       path: "/AprofitCasino"
  //     },
  //     {
  //       label: "Casino P/L Downline Monthly",
  //       icon: "FaCalendar",
  //       path: "/ACasinoprofitAndLossDownlineNew"
  //     },
  //     {
  //       label: "International Casino P/L Downline Monthly",
  //       icon: "FaGlobe",
  //       path: "/ICasinoprofitAndLossDownlineNew"
  //     }
  //   ]
  // },
  // {
  //   label: "BetList",
  //   icon: "FaListUl",
  //   path: "/Betlist"
  // },
  // {
  //   label: "BetListLive",
  //   icon: "FaBroadcastTower",
  //   path: "/BetListLive"
  // },
  // {
  //   label: "Risk Management",
  //   icon: "FaShieldAlt",
  //   path: "/RiskManagement"
  // },
  {
    label: "Banking",
    icon: "FaCreditCard",
    path: "/banking"
  },
  {
    label: "Deposit Accounts",
    icon: "FaUniversity",
    path: "/manual-deposit-accounts"
  },
  {
    label: "Deposit Requests",
    icon: "FaInbox",
    path: "/manual-deposit-requests"
  },
  {
    label: "Withdraw Requests",
    icon: "FaMoneyBillWave",
    path: "/manual-withdraw-requests"
  },
  {
    label: "Customer support",
    icon: "FaWhatsapp",
    path: "/customer-support"
  },
  // {
  //   label: "Block Market",
  //   icon: "FaBan",
  //   path: "/block-market"
  // },
  {
    label: "Admin Setting",
    icon: "FaCogs",
    path: "/general-setting"
  },
  // {
  //   label: "Time Zone : GMT+6:00",
  //   icon: "FaClock"
  // },
  {
    label: "Logout",
    icon: "FaSignOutAlt",
    path: "/logout"
  }
];

const SidebarItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  const Icon = Icons[item.icon] || Icons.FaQuestionCircle;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => {
    if (item.label === "Logout") {
      dispatch(logout());
      navigate("/admin/login");
      return;
    }

    if (item.children) {
      setOpen(!open);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="hide-scrollbar">
      <div
        onClick={handleClick}
        className="flex items-center justify-between cursor-pointer p-2 py-3 border-b-[1px] border-b-solid border-b-[#ffffff4d] hover:bg-[#4a4e42] hover:font-semibold"
      >
        <div className="flex items-center gap-2">
         
          <span className="text-[13px]">{item.label}</span>
        </div>
        {item.children && (
          <span>{open ? "▲" : "▼"}</span>
        )}
      </div>

      {item.children && open && (
        <div className="mt-1">
          {item.children.map((child) => (
            <SidebarItem key={child.path} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  return (
    <div className="w-64 bg-black text-white shadow-lg h-[calc(100vh-80px)] overflow-y-auto hide-scrollbar">
      {navData.map((item) => (
        <SidebarItem key={item.path || item.label} item={item} />
      ))}
    </div>
  );
};

export default Navbar;