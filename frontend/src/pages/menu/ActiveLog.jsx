// import React from 'react'
// import { MdArrowBackIos } from "react-icons/md";
// import HeaderLogin from '../../components/Header/HeaderLogin'
// import ActivelogCard from '../../components/menucomp/ActivelogCard';

// const logDataList = [
//   {
//     date: "7/7/2025, 10:22:00 AM",
//     status: "Login Success",
//     ip: "103.164.24.92",
//     isp: "--",
//     location: "Dhaka, Bangladesh"
//   },
//   {
//     date: "7/6/2025, 8:15:30 PM",
//     status: "Login Failed",
//     ip: "103.164.24.93",
//     isp: "ISP Ltd.",
//     location: "Chittagong, Bangladesh"
//   },
//   {
//     date: "7/5/2025, 6:45:10 AM",
//     status: "Logout",
//     ip: "103.164.24.94",
//     isp: "NetProvider",
//     location: "Sylhet, Bangladesh"
//   }
// ];
// function ActiveLog() {
//   return (
//     <div><HeaderLogin/>
//       <div className="bg-[#000] h-10 flex items-center px-5 relative">
//         <div
//         onClick={() => window.history.back()} 
//         >
//           <MdArrowBackIos className='text-white text-2xl font-semibold' />
//         </div>
//         <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">Active Log</span>
//       </div>
//       <div className='bg-[#f1f7ff] min-h-[80vh]'>
//         {logDataList.length === 0 && (
//           <div className='bg-[#f1f7ff] min-h-[80vh] flex flex-col pb-5 '>
//           <div className='px-2 mx-2'>
           
//             <div className='bg-white p-4 rounded-lg shadow-md'>
//               <h2 className='text-xl font-semibold mb-4'>Active Log</h2>
//               <p className='text-gray-600'>No active logs available at the moment.</p>
//             </div>
//           </div>
//         </div>
//         )}
//         <ActivelogCard logdata={logDataList}/>
//       </div>
//     </div>
//   )
// }

// export default ActiveLog

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdArrowBackIos } from "react-icons/md";
import ActivelogCard from "../../components/menucomp/ActivelogCard";
import api from "../../utils/axiosConfig";
import { getUser } from "../../features/auth/authSlice";

function ActiveLog() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    const uid = user?._id;
    if (!uid) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchLoginHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/get/user-login-history/${uid}`);
        if (!cancelled) {
          setLogs(res.data?.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message ||
            err.message ||
            "Failed to fetch logs";
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLoginHistory();
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  return (
    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full z-20 h-screen">
      <div className="h-10 flex items-center">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-md font-semibold" />
        </div>
        <span className="text-[18px] font-bold">
          Active Log
        </span>
      </div>

      <div className="py-2">
        {loading && <p className="text-center mt-5">Loading...</p>}
        {error && !loading && (
          <p className="text-center text-red-600 mt-5">{error}</p>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="rounded-lg shadow-md mt-4">
            <p className="text-gray-600 text-center">No active logs available at the moment.</p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <ActivelogCard logdata={logs} />
        )}
      </div>
    </div>
  );
}

export default ActiveLog;
