import React, { useState } from 'react';
import Logo from '../../assets/logo.png';
import { BiRefresh } from "react-icons/bi";
import { motion } from "motion/react"
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUser } from '../../features/auth/authSlice';
function HeaderLoginBack() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getUser());
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <div className="bg-[#17934e] h-10 relative z-30">
      <div className="flex justify-between items-center h-full px-4">
        <div className="flex items-center justify-center gap-3">
          < MdArrowBackIosNew
            className="text-white text-2xl"
            onClick={() => window.history.back()}
          />
          <img src={Logo} alt="Logo" className="w-20 h-10 mt-2" />
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex flex-col">
            <span className="text-white text-[8px] md:text-sm leading-none">{user?.userName || '-'}</span>
            <span className="text-white text-[10px] md:text-base font-semibold">BDT <span className="font-normal">{Number(user?.avbalance || 0).toFixed(2)}</span>&nbsp; Exp (<span className="text-[#e52219]">
                    {Number(user?.exposure).toFixed(2)}
                  </span>)</span>
          </div>
           <motion.div
             animate={{ rotate: refreshing ? 360 : 0 }}
             transition={{ duration: refreshing ? 1 : 3, delay: refreshing ? 0 : 1 }}
           >
             <BiRefresh 
               className={`text-white text-2xl cursor-pointer ${refreshing ? 'opacity-70' : ''}`}
               onClick={handleRefresh}
             />
           </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HeaderLoginBack