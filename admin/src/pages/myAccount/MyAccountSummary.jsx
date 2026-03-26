// import React, { useEffect, useState } from "react";
// import Navigation from "../../components/myAccount/Navigation";
// import axios from "../../utils/axiosInstance";
// import { useSelector } from "react-redux";

// function MyAccountSummary() {
//   const [selected, setselected] = useState("AccountSummary");
//   const [account, setAccount] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const user = useSelector(state => state.auth.user);
//   const userId = user?.id;

//   useEffect(() => {
//     if (userId) fetchAccountSummary();
//     // eslint-disable-next-line
//   }, [userId]);

//   const fetchAccountSummary = async () => {
//     try {
//       const { data } = await axios.get(`/users/account-summary/${userId}`);
//       setAccount(data.user);
//     } catch (err) {
//       console.error("Failed to fetch account summary", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-2 mt-4">
//       <div
//         className="flex gap-4 border border-[#bbb] rounded shadow-inner px-4 py-2 w-fit"
//         style={{
//           background: "linear-gradient(180deg, #fff, #eee)",
//           boxShadow: "inset 0 2px 0 0 #ffffff80",
//         }}
//       >
//         <div className="flex font-['Times_New_Roman'] gap-2">
//           <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
//             {account?.role?.slice(0, 2)?.toUpperCase() || "AD"}
//           </span>
//           <span className="text-sm font-bold">{account?.username || "..."}</span>
//         </div>
//       </div>

//       <div className="flex mt-4 gap-4">
//         <Navigation selected={selected} />
//         <div className="font-['Times_New_Roman'] flex-1 mb-5">
//           <h2 className="text-[#243a48] text-[16px] font-[700]">
//             Account Summary
//           </h2>

//           {loading ? (
//             <p className="text-gray-500 mt-4">Loading...</p>
//           ) : (
//             <div className="border-b border-b-[#7e97a7] bg-white">
//               <div className="flex flex-col border-r border-r-[#ddd] w-fit p-2 mt-4">
//                 <span className="text-[15px] font-[700]">Total Balance</span>
//                 <strong className="text-[#2789ce] text-[30px] font-[700]">
//                   {Number(account?.balance || 0).toLocaleString(undefined, {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}{" "}
//                   <sub className="text-[#7e97a7] text-[15px] font-[400]">PBU</sub>
//                 </strong>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MyAccountSummary;

import React, { useEffect, useState } from "react";
import Navigation from "../../components/myAccount/Navigation";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";

function MyAccountSummary() {
  const [selected, setSelected] = useState("AccountSummary");
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = useSelector(state => state.auth.user);
  const userId = user?.id;

  useEffect(() => {
    if (userId) fetchAccountSummary();
    // eslint-disable-next-line
  }, [userId]);

  const fetchAccountSummary = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/sub-admin/profile-data", { userId });

      if (!data?.success || !data.data) {
        console.warn("No account data found for userId:", userId);
        setAccount(null);
        return;
      }

      // Map API response to your UI structure
      const mappedAccount = {
        username: data.data.basicInfo?.userName ?? "...",
        role: data.data.basicInfo?.role ?? "user",
        balance: data.data.financialInfo?.avbalance ?? 0,
      };

      setAccount(mappedAccount);
    } catch (err) {
      console.error("Failed to fetch account summary", err);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 mt-4">
      <div
        className="flex gap-4 border border-[#bbb] rounded shadow-inner px-4 py-2 w-fit"
        style={{
          background: "linear-gradient(180deg, #fff, #eee)",
          boxShadow: "inset 0 2px 0 0 #ffffff80",
        }}
      >
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            {account?.role?.slice(0, 2)?.toUpperCase() || "AD"}
          </span>
          <span className="text-sm font-bold">{account?.username || "..."}</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected={selected} />
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">
            Account Summary
          </h2>

          {loading ? (
            <p className="text-gray-500 mt-4">Loading...</p>
          ) : (
            <div className="border-b border-b-[#7e97a7] bg-white">
              <div className="flex flex-col border-r border-r-[#ddd] w-fit p-2 mt-4">
                <span className="text-[15px] font-[700]">Total Balance</span>
                <strong className="text-[#2789ce] text-[30px] font-[700]">
                  {Number(account?.balance || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <sub className="text-[#7e97a7] text-[15px] font-[400]">PBU</sub>
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyAccountSummary;
