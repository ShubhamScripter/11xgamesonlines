import React, { useEffect, useState } from "react";
import * as Icons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAsync } from "../../store/authSlice";
import axiosInstance from "../../utils/axiosInstance";

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
    path: "/manual-deposit-requests",
    badgeKey: "depositPending",
  },
  {
    label: "Withdraw Requests",
    icon: "FaMoneyBillWave",
    path: "/manual-withdraw-requests",
    badgeKey: "withdrawPending",
  },
  {
    label: "Customer support",
    icon: "FaWhatsapp",
    path: "/customer-support"
  },
  {
    label: "Bet Lock",
    icon: "FaLock",
    children: [
      {
        label: "Overview",
        icon: "FaThLarge",
        path: "/bet-lock"
      },
      {
        label: "Lock Application",
        icon: "FaLock",
        path: "/lock-application"
      },
      {
        label: "Bet Locked Users",
        icon: "FaUserLock",
        path: "/BetLockUser"
      }
    ]
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

const SidebarItem = ({ item, badges, depth = 0 }) => {
  const [open, setOpen] = useState(false);
  const Icon = Icons[item.icon] || Icons.FaQuestionCircle;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const badgeValue = item.badgeKey ? Number(badges?.[item.badgeKey] || 0) : 0;
  const paddingLeft = depth > 0 ? { paddingLeft: `${12 + depth * 12}px` } : undefined;

  const handleClick = async () => {
    if (item.label === "Logout") {
      await dispatch(logoutAsync());
      navigate("/admin/login", { replace: true });
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
        style={paddingLeft}
        className="flex items-center justify-between cursor-pointer p-2 py-3 border-b-[1px] border-b-solid border-b-[#ffffff4d] hover:bg-[#4a4e42] hover:font-semibold"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="text-[14px] opacity-90" />
          <span className="text-[13px] truncate">{item.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {badgeValue > 0 ? (
            <span className="text-[11px] font-bold bg-red-600 text-white px-2 py-[2px] rounded-full">
              {badgeValue}
            </span>
          ) : null}
          {item.children && <span>{open ? "▲" : "▼"}</span>}
        </div>
      </div>

      {item.children && open && (
        <div className="mt-1">
          {item.children.map((child) => (
            <SidebarItem
              key={child.path || child.label}
              item={child}
              badges={badges}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [badges, setBadges] = useState({ depositPending: 0, withdrawPending: 0 });

  useEffect(() => {
    let mounted = true;

    const fetchBadges = async () => {
      try {
        const [depositRes, withdrawRes] = await Promise.all([
          axiosInstance.get("/admin/deposit-requests", {
            params: { status: "pending", requestType: "deposit" },
          }),
          axiosInstance.get("/admin/deposit-requests", {
            params: { status: "pending", requestType: "withdraw" },
          }),
        ]);

        const depositList = Array.isArray(depositRes?.data?.data) ? depositRes.data.data : [];
        const withdrawList = Array.isArray(withdrawRes?.data?.data) ? withdrawRes.data.data : [];
        if (mounted) {
          setBadges((prev) => ({
            ...prev,
            depositPending: depositList.length,
            withdrawPending: withdrawList.length,
          }));
        }
      } catch {
        // keep last value if API fails
      }
    };

    fetchBadges();
    const id = setInterval(fetchBadges, 15000);
    window.addEventListener("focus", fetchBadges);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchBadges();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      mounted = false;
      clearInterval(id);
      window.removeEventListener("focus", fetchBadges);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div className="w-64 bg-black text-white shadow-lg h-[calc(100vh-80px)] overflow-y-auto hide-scrollbar">
      {navData.map((item) => (
        <SidebarItem key={item.path || item.label} item={item} badges={badges} />
      ))}
    </div>
  );
};

export default Navbar;