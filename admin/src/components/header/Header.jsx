import React, { useEffect, useCallback } from 'react';
import Logo from '../../assets/logodbdb.png';
import { IoMdRefresh } from "react-icons/io";
import { useSelector, useDispatch } from 'react-redux';
import { fetchAccountSummary } from '../../store/accountSummarySlice';

const BALANCE_REFRESH_MS = 45_000;

function Header() {
  const user = useSelector(state => state.auth.user);
  const { summary } = useSelector(state => state.accountSummary);
  const dispatch = useDispatch();
  const sessionUserId = user?._id || user?.id;

  const fetchSummary = useCallback((force = false) => {
    if (!sessionUserId) return;
    if (typeof document !== 'undefined' && document.hidden && !force) return;
    dispatch(fetchAccountSummary({ userId: sessionUserId, force }));
  }, [sessionUserId, dispatch]);

  useEffect(() => {
    if (!sessionUserId) return;

    fetchSummary(false);

    const intervalId = setInterval(() => fetchSummary(false), BALANCE_REFRESH_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchSummary(false);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [sessionUserId, fetchSummary]);

  if (!user) return null;
  const balance = Number(
    summary?.financialInfo?.avbalance ??
      summary?.avbalance ??
      user.avbalance ??
      0
  );

  return (
    <div className='bg-[#17934e] h-20 flex items-center justify-between px-2 fixed w-full z-50'>
      <div>
        <img src={Logo} alt="Logo" className='h-15' />
      </div>
      <div className='flex gap-5'>
        <div>
          <span className='bg-black rounded-lg p-1 m-2 text-sm text-white'>{user.role}</span>
          <span className='text-white text-sm'>{user.userName}</span>
        </div>
        <div>
          <span className='bg-black rounded-lg p-1 m-2 text-sm text-white'>Main</span>
          <span className='text-white text-sm'>BDT {balance.toFixed(2)}</span>
        </div>
        <div
          className='rounded-sm p-1 border border-[#0000004d] shadow-[#0000004d] cursor-pointer'
          onClick={() => fetchSummary(true)}
          title="Refresh"
        >
          <IoMdRefresh className='text-white font-bold text-xl' />
        </div>
      </div>
    </div>
  );
}

export default Header;
