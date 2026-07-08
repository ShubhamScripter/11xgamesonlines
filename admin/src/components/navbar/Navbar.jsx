import React, { useEffect, useMemo } from "react";
import * as Icons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutAsync } from "../../store/authSlice";
import { fetchAdminBadges } from "../../store/adminBadgesSlice";

const ADMIN_ROLES = new Set(["superadmin", "admin", "subadmin", "seniorSuper"]);

const BADGE_REFRESH_MS = 60_000;

const navData = [
  {
    label: "Agent Dashboard",
    icon: "FaChartLine",
    path: "/agent-dashboard",
    roles: ["agent", "superAgent"],
  },
  {
    label: "Downline List",
    icon: "FaUsers",
    path: "/",
    roles: ["superadmin", "admin", "subadmin", "seniorSuper", "superAgent"],
  },
  {
    label: "My Account",
    icon: "FaUserCircle",
    path: "/my-account-summary"
  },
  {
    label: "Banking",
    icon: "FaCreditCard",
    path: "/banking",
    roles: ["superadmin", "admin", "subadmin", "seniorSuper"],
  },
  {
    label: "Deposit Accounts",
    icon: "FaUniversity",
    path: "/manual-deposit-accounts",
    roles: ["superadmin", "admin", "subadmin", "seniorSuper"],
  },
  {
    label: "Deposit Requests",
    icon: "FaInbox",
    path: "/manual-deposit-requests",
    badgeKey: "depositPending",
    roles: ["superadmin", "admin", "subadmin", "seniorSuper"],
  },
  {
    label: "Withdraw Requests",
    icon: "FaMoneyBillWave",
    path: "/manual-withdraw-requests",
    badgeKey: "withdrawPending",
    roles: ["superadmin", "admin", "subadmin", "seniorSuper"],
  },
  {
    label: "Customer support",
    icon: "FaWhatsapp",
    path: "/customer-support"
  },
  {
    label: "Risk & Fraud",
    icon: "FaShieldAlt",
    path: "/risk-fraud",
    badgeKey: "deviceAlerts",
    roles: ["superadmin", "admin", "subadmin", "seniorSuper"],
  },
  {
    label: "Bet Lock",
    icon: "FaLock",
    roles: ["superadmin", "admin", "subadmin", "seniorSuper"],
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
  {
    label: "Admin Setting",
    icon: "FaCogs",
    path: "/general-setting",
    roles: ["superadmin", "admin", "subadmin", "seniorSuper"],
    children: [
      { label: "General Settings", icon: "FaCogs", path: "/general-setting" },
      { label: "Gift Coupons", icon: "FaGift", path: "/gift-coupons" },
      { label: "Affiliate / Agents", icon: "FaUsers", path: "/affiliate" },
    ]
  },
  {
    label: "Logout",
    icon: "FaSignOutAlt",
    path: "/logout"
  }
];

function filterNavByRole(items, role) {
  return items
    .filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(role);
    })
    .map((item) => {
      if (!item.children) return item;
      const children = filterNavByRole(item.children, role);
      if (!children.length) return null;
      return { ...item, children };
    })
    .filter(Boolean);
}

const SidebarItem = ({ item, badges, depth = 0 }) => {
  const [open, setOpen] = React.useState(false);
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
  const user = useSelector((state) => state.auth.user);
  const role = user?.role || "";
  const badges = useSelector((state) => state.adminBadges);
  const dispatch = useDispatch();

  const visibleNav = useMemo(() => filterNavByRole(navData, role), [role]);

  useEffect(() => {
    if (!ADMIN_ROLES.has(role)) return;

    const refresh = (force = false) => {
      if (typeof document !== "undefined" && document.hidden && !force) return;
      dispatch(fetchAdminBadges({ force }));
    };

    refresh(false);
    const id = setInterval(() => refresh(false), BADGE_REFRESH_MS);

    const onFocus = () => refresh(false);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh(false);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [role, dispatch]);

  return (
    <div className="w-64 bg-black text-white shadow-lg h-[calc(100vh-80px)] overflow-y-auto hide-scrollbar">
      {visibleNav.map((item) => (
        <SidebarItem key={item.path || item.label} item={item} badges={badges} />
      ))}
    </div>
  );
};

export default Navbar;
