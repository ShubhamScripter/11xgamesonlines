import React, { useState, useEffect, useRef, useCallback } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { useSelector, useDispatch } from "react-redux";
import { getUser, setLiveBalance } from "../../features/auth/authSlice";
import Logo from "../../assets/bajiLogo.png";
import { wsClient } from "../../utils/wsClient";
import { useLocation, useNavigate } from "react-router-dom";
import { GoPlus } from "react-icons/go";
import { TfiReload } from "react-icons/tfi";
import { currencySymbol } from "../../utils/currency";
import { motion } from "framer-motion";
import LanguageSwitcher from "../../i18n/LanguageSwitcher";
import { useTranslation } from "../../i18n/LanguageContext";

function HeaderLogin({
  setSidebarOpen = () => {},
  closeMenu = () => {},
  showActions = false,
  setShowActions = () => {},
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const socketRef = useRef(null);
  const balanceSyncTimer = useRef(null);
  const refreshNeededTimer = useRef(null);
  const currentUserId = user?._id || user?.id || null;

  const handleRefresh = useCallback(async (force = true) => {
    setRefreshing(true);
    try {
      await dispatch(getUser({ force }));
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Mount once — TTL in getUser prevents StrictMode double-hit from issuing 2 network calls
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getUser());
    }
  }, [dispatch]);

  // WebSocket: trust live balance; only re-fetch on explicit refresh_needed (debounced)
  useEffect(() => {
    const unsubscribe = wsClient.subscribe((data) => {
      if (data?.type === "balance_update") {
        if (data?.userId && currentUserId && String(data.userId) !== String(currentUserId)) {
          return;
        }
        if (typeof data?.newBalance !== "undefined") {
          dispatch(setLiveBalance(data.newBalance));
        }
        // Optional light sync for exposure — debounced, uses cache if recent
        if (balanceSyncTimer.current) clearTimeout(balanceSyncTimer.current);
        balanceSyncTimer.current = setTimeout(() => {
          dispatch(getUser());
        }, 2500);
      } else if (data?.type === "user_refresh_needed") {
        if (data?.userId && currentUserId && String(data.userId) !== String(currentUserId)) {
          return;
        }
        if (refreshNeededTimer.current) clearTimeout(refreshNeededTimer.current);
        refreshNeededTimer.current = setTimeout(() => {
          dispatch(getUser({ force: true }));
        }, 400);
      }
    });

    if (currentUserId) {
      wsClient.send({ type: "register", userId: currentUserId });
    }

    socketRef.current = { unsubscribe };

    return () => {
      try {
        socketRef.current?.unsubscribe?.();
      } catch {
        // ignore
      }
      if (balanceSyncTimer.current) clearTimeout(balanceSyncTimer.current);
      if (refreshNeededTimer.current) clearTimeout(refreshNeededTimer.current);
      socketRef.current = null;
    };
  }, [currentUserId, dispatch]);

  useEffect(() => {
    setShowActions(false);
  }, [location.pathname, setShowActions]);

  const toggleActions = () => {
    closeMenu();
    setShowActions((prev) => !prev);
  };

  const handleClick = () => {
    navigate('/');
    closeMenu();
  };

  return (
      <>
        <div className="bg-[#141515] fixed top-0 left-0 w-full shadow-sm h-[65px] z-50 flex justify-between items-center py-3 px-2 border-b border-gray-700">
            <div className="flex items-center justify-center h-[65px] py-2.5">
              <div className="bg-[#303232] p-3 rounded-[4px] mr-6 hidden md:block" onClick={() => setSidebarOpen(prev => !prev)}>
                <GiHamburgerMenu className="text-yellow-200 text-[20px]" />
              </div>
              <img src={Logo} alt="" className="h-full" onClick={handleClick}/>
            </div>

            {user ? (
              <div className="flex items-center gap-2 h-full py-1">
                <div className="hidden sm:flex items-center gap-2 min-w-0">
                  <span className="text-white text-xs md:text-sm font-medium max-w-[100px] md:max-w-[120px] truncate">
                    {user?.userName || '—'}
                  </span>
                  <LanguageSwitcher compact />
                </div>
                <div className="flex sm:hidden items-center gap-1">
                  <LanguageSwitcher compact />
                </div>
                <div className="flex bg-[#303232] pl-2 sm:pl-3 items-center h-full rounded-sm gap-1 sm:gap-2 min-w-0 flex-1 max-w-[58vw] sm:max-w-none">
                  <span className="text-white text-[11px] sm:text-sm font-semibold min-w-0 truncate">
                    {currencySymbol(user?.currency)}{" "}
                      <span className="font-normal border-r border-gray-500 pr-1">{Number(user?.avbalance || 0).toFixed(2)}</span>
                    <span className="hidden sm:inline">
                    &nbsp; {t('nav.exposure')} (
                      <span className="text-[#e52219]">
                      {Number(user?.exposure || 0).toFixed(2)}
                    </span>
                    )
                    </span>
                  </span>
                    <TfiReload
                      className={`text-white text-md cursor-pointer md:mr-3 ${refreshing ? 'animate-spin' : ''}`}
                      onClick={() => handleRefresh(true)}
                    />
                  <button
                    type="button"
                    className="bg-[#14805e] text-white h-full min-w-[44px] w-[44px] flex md:hidden items-center justify-center rounded-r-sm shrink-0"
                    onClick={toggleActions}
                    aria-expanded={showActions}
                    aria-label="Deposit and withdrawal"
                  >
                    <GoPlus size={30} className={showActions ? "rotate-45 transition-transform" : "transition-transform"} />
                  </button>
                </div>
                <div className="hidden md:flex items-center gap-2 h-full">
                  <button
                    type="button"
                    onClick={() => navigate("/user/manual-deposit?type=withdraw")}
                    className="px-3 py-1 text-white bg-[#303232] flex items-center rounded-[3px] h-full font-bold"
                  >
                    {t('nav.withdraw')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => navigate("/user/manual-deposit?type=deposit")}
                    className="px-3 py-1 text-white bg-[#14805e] flex items-center rounded-[3px] h-full font-bold"
                  >
                    {t('nav.deposit')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-1 text-white text-[14px] font-semibold h-full py-1">
                <div className="border border-gray-600 rounded-sm flex justify-center items-center px-5 text-gray-400" onClick={()=>navigate('/login')}>{t('nav.login')}</div>
                <div className="bg-[#14805e] rounded-sm flex justify-center items-center px-5 text-gray-200" onClick={()=>navigate('/register')}>{t('nav.signup')}</div>
              </div>
            )}
        </div>
        {showActions ? (
          <>
            <button
              type="button"
              aria-label="Close deposit menu"
              className="fixed inset-0 top-[65px] bottom-0 bg-black/50 z-[45] md:hidden border-0 p-0"
              onClick={() => setShowActions(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[65px] left-0 right-0 z-[46] md:hidden bg-[#141515] border-b border-gray-700 p-3 grid grid-cols-2 gap-2 shadow-lg"
            >
              <button
                type="button"
                onClick={() => {
                  navigate("/user/manual-deposit?type=withdraw");
                  setShowActions(false);
                }}
                className="h-14 justify-center text-white text-[18px] bg-[#303232] flex items-center rounded-[3px] font-bold"
              >
                {t('nav.withdrawal')}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/user/manual-deposit?type=deposit");
                  setShowActions(false);
                }}
                className="h-14 justify-center text-white text-[18px] bg-[#14805e] flex items-center rounded-[3px] font-bold"
              >
                {t('nav.deposit')}
              </button>
            </motion.div>
          </>
        ) : null}
      </>
  );
}

export default HeaderLogin;
