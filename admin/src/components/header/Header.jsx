// // import React, { useEffect } from 'react';
// // import Logo from '../../assets/logo.png';
// // import { IoMdRefresh } from "react-icons/io";
// // import { useSelector, useDispatch } from 'react-redux';
// // import { fetchAccountSummary } from '../../store/accountSummarySlice';

// // function Header() {
// //   const user = useSelector(state => state.auth.user);
// //   const { summary, loading } = useSelector(state => state.accountSummary);
// //   const dispatch = useDispatch();

// //   const fetchSummary = () => {
// //     if (user?.id) dispatch(fetchAccountSummary(user.id));
// //   };

// //   useEffect(() => {
// //     fetchSummary();
// //     // eslint-disable-next-line
// //   }, [user?.id]);

// //   if (!user || loading || !summary) return null; // Or show a loading spinner

// //   return (
// //     <div className='bg-[#17934e] h-20 flex items-center justify-between px-2 fixed w-full z-50'>
// //       <div>
// //         <img src={Logo} alt="Logo" className='h-15' />
// //       </div>
// //       <div className='flex gap-5'>
// //         <div>
// //           <span className='bg-black rounded-lg p-1 m-2 text-sm text-white'>{summary.role}</span>
// //           <span className='text-white text-sm '>{summary.username}</span>
// //         </div>
// //         <div>
// //           <span className='bg-black rounded-lg p-1 m-2 text-sm text-white'>Main</span>
// //           <span className='text-white text-sm '>INR {summary.balance?.toFixed(2)}</span>
// //         </div>
// //         <div
// //           className='rounded-sm p-1 border border-[#0000004d] shadow-[#0000004d] cursor-pointer'
// //           onClick={fetchSummary}
// //           title="Refresh"
// //         >
// //           <IoMdRefresh className='text-white font-bold text-xl' />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Header;

// import React, { useEffect } from 'react';
// import Logo from '../../assets/logo.png';
// import { IoMdRefresh } from "react-icons/io";
// import { useSelector, useDispatch } from 'react-redux';
// import { fetchAccountSummary } from '../../store/accountSummarySlice';

// function Header() {

// <span className="text-white text-sm">
//   INR {summary?.avbalance?.toFixed(2) ?? user.avbalance?.toFixed(2)}
// </span>

//   const user = useSelector(state => state.auth.user); // user info from login
//   const { summary, loading } = useSelector(state => state.accountSummary);
//   const dispatch = useDispatch();

//   const fetchSummary = () => {
//     if (user?._id) dispatch(fetchAccountSummary(user._id));
//   };

//   useEffect(() => {
//     fetchSummary();
//   }, [user?._id]);

//   if (!user || loading) return null; // Or show a loading spinner

//   return (
//     <div className='bg-[#17934e] h-20 flex items-center justify-between px-2 fixed w-full z-50'>
//       <div>
//         <img src={Logo} alt="Logo" className='h-15' />
//       </div>
//       <div className='flex gap-5'>
//         <div>
//           <span className='bg-black rounded-lg p-1 m-2 text-sm text-white'>{user.role}</span>
//           <span className='text-white text-sm '>{user.userName}</span>
//         </div>
//         <div>
//           <span className='bg-black rounded-lg p-1 m-2 text-sm text-white'>Main</span>
//           <span className='text-white text-sm '>INR {user.avbalance?.toFixed(2)}</span>
//         </div>
//         <div
//           className='rounded-sm p-1 border border-[#0000004d] shadow-[#0000004d] cursor-pointer'
//           onClick={fetchSummary}
//           title="Refresh"
//         >
//           <IoMdRefresh className='text-white font-bold text-xl' />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Header;

// import React, { useEffect } from 'react';
// import Logo from '../../assets/logo.png';
// import { IoMdRefresh } from "react-icons/io";
// import { useSelector, useDispatch } from 'react-redux';
// import { fetchAccountSummary } from '../../store/accountSummarySlice';

// function Header() {
//   const user = useSelector(state => state.auth.user); // user info from login
//   const { summary, loading } = useSelector(state => state.accountSummary);
//   const dispatch = useDispatch();

//   const fetchSummary = () => {
//     if (user?._id) dispatch(fetchAccountSummary(user._id));
//   };

//   useEffect(() => {
//     fetchSummary();
//   }, [user?._id]);

//   if (!user) return null; // Or show a loading spinner

//   // Use the live balance from accountSummary if available, fallback to login balance
//   const balance = summary?.avbalance ?? user.avbalance ?? 0;

//   return (
//     <div className='bg-[#17934e] h-20 flex items-center justify-between px-2 fixed w-full z-50'>
//       <div>
//         <img src={Logo} alt="Logo" className='h-15' />
//       </div>
//       <div className='flex gap-5'>
//         <div>
//           <span className='bg-black rounded-lg p-1 m-2 text-sm text-white'>{user.role}</span>
//           <span className='text-white text-sm '>{user.userName}</span>
//         </div>
//         <div>
//           <span className='bg-black rounded-lg p-1 m-2 text-sm text-white'>Main</span>
//           <span className='text-white text-sm '>INR {balance.toFixed(2)}</span>
//         </div>
//         <div
//           className='rounded-sm p-1 border border-[#0000004d] shadow-[#0000004d] cursor-pointer'
//           onClick={fetchSummary}
//           title="Refresh"
//         >
//           <IoMdRefresh className='text-white font-bold text-xl' />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Header;

import React, { useEffect, useCallback } from 'react';
import Logo from '../../assets/logodbdb.png';
import { IoMdRefresh } from "react-icons/io";
import { useSelector, useDispatch } from 'react-redux';
import { fetchAccountSummary } from '../../store/accountSummarySlice';

const BALANCE_REFRESH_MS = 5_000;

function Header() {
  const user = useSelector(state => state.auth.user); // login info
  const { summary } = useSelector(state => state.accountSummary);
  const dispatch = useDispatch();
  const sessionUserId = user?._id || user?.id;

  const fetchSummary = useCallback(() => {
    if (sessionUserId) dispatch(fetchAccountSummary(sessionUserId));
  }, [sessionUserId, dispatch]);

  useEffect(() => {
    if (!sessionUserId) return;
    fetchSummary();
    const intervalId = setInterval(fetchSummary, BALANCE_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [sessionUserId, fetchSummary]);

  if (!user) return null; // or a loading placeholder
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
          <span className='text-white text-sm'>INR {balance.toFixed(2)}</span>
        </div>
        <div
          className='rounded-sm p-1 border border-[#0000004d] shadow-[#0000004d] cursor-pointer'
          onClick={fetchSummary}
          title="Refresh"
        >
          <IoMdRefresh className='text-white font-bold text-xl' />
        </div>
      </div>
    </div>
  );
}

export default Header;
