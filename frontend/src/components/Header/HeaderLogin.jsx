import React, { useState, useEffect, useRef } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { BiRefresh } from "react-icons/bi";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { getUser, setLiveBalance } from "../../features/auth/authSlice";
import Header from "./Header";
import Logo from "../../assets/bajiLogo.png";

// import Logonew from '../../assets/newdiamondlogo.png'
import { wsClient } from "../../utils/wsClient";
import { useLocation, useNavigate } from "react-router-dom";
import { RiBankCardFill, RiWallet3Fill } from "react-icons/ri";
import { HiOutlineChevronRight } from "react-icons/hi";
import { GoPlus } from "react-icons/go";
import { TfiReload } from "react-icons/tfi";
import { currencySymbol } from "../../utils/currency";

function HeaderLogin({ setSidebarOpen = () => {}, closeMenu = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const currentUserId = user?._id || user?.id || null;
  const [showActions, setShowActions] = useState(false);
  // 🔁 Refresh handler
  const handleRefresh = async () => {
    
    setRefreshing(true);
    try {
      await dispatch(getUser());
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      handleRefresh();
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && user) {
      handleRefresh();
    }
  }, [location.pathname]);

  // 🔗 Setup WebSocket connection (shared singleton)
  useEffect(() => {
    // if (!user) return;

    // Register listener and keep socket alive
    const unsubscribe = wsClient.subscribe((data) => {
      console.log('[WS][HeaderLogin] message received', data);
      if (data?.type === "balance_update") {
        if (data?.userId && currentUserId && String(data.userId) !== String(currentUserId)) {
          return;
        }
        console.log("balance update received in header login", data);
        if (typeof data?.newBalance !== "undefined") {
          dispatch(setLiveBalance(data.newBalance));
        }
        // Keep UI instant via WS; sync from API shortly after.
        setTimeout(() => {
          handleRefresh();
        }, 400);
      } else if (data?.type === "user_refresh_needed") {
        // Backend asks the client to re-fetch user details (balance/exposure/open bets)
        if (data?.userId && currentUserId && String(data.userId) !== String(currentUserId)) {
          return;
        }
        // Avoid hammering API: small debounce
        console.log('[WS][HeaderLogin] user_refresh_needed received. Triggering refresh...');
        setTimeout(() => {
          handleRefresh();
        }, 250);
      }
    });

    // Prefer registering by userId for backend targeting when available
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
      socketRef.current = null;
    };
  }, [currentUserId]);

  const handleClick = () => {
    navigate('/');
    closeMenu();
  }

  return (
      <>
        <div className="bg-[#141515] fixed top-0 left-0 w-full shadow-sm h-[65px] z-20 flex justify-between items-center py-3 px-2 border-b border-gray-700">
            <div className="flex items-center justify-center h-[65px] py-2.5">
              <div className="bg-[#303232] p-3 rounded-[4px] mr-6 hidden md:block" onClick={() => setSidebarOpen(prev => !prev)}>
                <GiHamburgerMenu className="text-yellow-200 text-[20px]" />
              </div>
              <img src={Logo} alt="" className="h-full" onClick={handleClick}/>
            </div>

            {user ? (
              <div className="flex items-center gap-2 h-full py-1">
                <span className="text-white text-xs md:text-sm font-medium max-w-[100px] md:max-w-[140px] truncate hidden sm:block">
                  {user?.userName || '—'}
                </span>
                <div className="flex bg-[#303232] pl-3 items-center h-full rounded-sm gap-2">
                  <span className="text-white text-[14px] md:text-[12px] md:text-base font-semibold">
                    {currencySymbol(user?.currency)}{" "}
                      <span className="font-normal border-r border-gray-500 pr-1">{Number(user?.avbalance || 0).toFixed(2)}</span>
                    &nbsp; Exp (
                      <span className="text-[#e52219]">
                      {Number(user?.exposure || 0).toFixed(2)}
                    </span>
                    )
                  </span>
                    <TfiReload className="text-white text-md cursor-pointer md:mr-3"
                        onClick={handleRefresh}
                    />
                  <span
                    className="bg-[#14805e] text-white h-full w-[40px] flex md:hidden items-center justify-center rounded-r-sm"
                    onClick={() => setShowActions(prev => !prev)}
                  >
                    <GoPlus size={30}/>
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-2 h-full">
                  <button
                    type="button"
                    onClick={() => navigate("/user/manual-deposit?type=withdraw")}
                    className="px-3 py-1 text-white bg-[#303232] flex items-center rounded-[3px] h-full font-bold"
                  >
                    Withdraw
                  </button>
                  <button 
                    type="button"
                    onClick={() => navigate("/user/manual-deposit?type=deposit")}
                    className="px-3 py-1 text-white bg-[#14805e] flex items-center rounded-[3px] h-full font-bold"
                  >
                    Deposit
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-1 text-white text-[14px] font-semibold h-full py-1">
                <div className="border border-gray-600 rounded-sm flex justify-center items-center px-5 text-gray-400" onClick={()=>navigate('/login')}>Log in</div>
                <div className="bg-[#14805e] rounded-sm flex justify-center items-center px-5 text-gray-200" onClick={()=>navigate('/register')}>Sign up</div>
              </div>
            )}



        </div>
        {showActions && (
            <div
                className="fixed inset-0 bg-black/50 bg-opacity-50 z-12"
                onClick={() => setShowActions(false)}
            />
        )}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.2 }}
            className='flex md:hidden bg-[#141515] items-center grid grid-cols-2 gap-2 w-full absolute top-[65px] left-0 z-12 p-4'
          >
            <button
              type="button"
              onClick={() => {
                navigate("/user/manual-deposit?type=withdraw");
                setShowActions(false);
              }}
              className="h-14 justify-center text-white text-[20px] bg-[#303232] flex items-center rounded-[3px] font-bold"
            >
              Withdrawal
            </button>

            <button 
              type="button"
              onClick={() => {
                navigate("/user/manual-deposit?type=deposit");
                setShowActions(false);
              }}
              className="h-14 justify-center text-white text-[20px] bg-[#14805e] flex items-center rounded-[3px] font-bold"
            >
              Deposit
            </button>
          </motion.div>
        )}

      </>
  );
}

export default HeaderLogin;