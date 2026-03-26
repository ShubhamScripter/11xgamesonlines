// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { FaUser } from "react-icons/fa";
// import { BiSolidPencil } from "react-icons/bi";
// import EditPopup from "../../../components/downListComp/admin/EditPopup";
// import Navigation from "../../../components/downListComp/admin/Navigation";
// import axios from "../../../utils/axiosInstance";

// function AccountSummary() {
//   const { userId,role } = useParams();
//   const [userData, setUserData] = useState(null); 
//   const [isEditPopupOpen, setEditPopupOpen] = useState(false);
//   const [selected, setselected] = useState("AccountSummary");
//   const [loading, setLoading] = useState(true);

//   const openModal = () => setEditPopupOpen(true);
//   const closeModal = () => setEditPopupOpen(false);

//   useEffect(() => {
//     fetchUserData();
//   }, [userId]);

//   const fetchUserData = async () => {
//     setLoading(true);
//     try {
//       const { data } = await axios.get(`/users/account-summary/${userId}`);
//       if (!data || !data.user) {
//         console.warn("No user found with ID:", userId);
//         setLoading(false);
//         return;
//       }
//       setUserData(data.user); 
//       setLoading(false);
//     } catch (error) {
//       console.error("Failed to fetch user:", error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     console.log("UserData updated:", userData);
//   }, [userData]);

//   if (loading) return <div className="p-4">Loading...</div>;
//   if (!userData) return <div className="p-4 text-red-500">User not found.</div>;

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
//             AD
//           </span>
//           <span className="text-sm font-bold">bajivaiadminbdt</span>
//         </div>
//         <div className="flex font-['Times_New_Roman'] gap-2">
//           <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
//             SAD
//           </span>
//           <span className="text-sm font-bold">bajitest1</span>
//         </div>
//       </div>

//       <div className="flex mt-4 gap-4">
//         <Navigation selected={selected} userId={userId} role={role} />
//         <div className="font-['Times_New_Roman'] flex-1 mb-5">
//           <h2 className="text-[#243a48] text-[16px] font-[700]">Account Summary</h2>
//           <div className="mt-4">
//             <FaUser />
//           </div>
//           <div className="mt-4 flex">
//             <table className="min-w-full text-xs text-left">
//               <thead>
//                 <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
//                   <th className="px-2 py-2">Wallet</th>
//                   <th className="px-2 py-2">Available to Bet </th>
//                   <th className="px-2 py-2">Funds available to withdraw </th>
//                   <th className="px-2 py-2">Current exposure</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-[#fff] border-y border-y-[#7e97a7]">
//                 <tr>
//                   <td className="px-2 py-2">Main wallet</td>
//                   <td className="px-2 py-2">{userData?.availableBalance ?? 0}</td>
//                   <td className="px-2 py-2">{userData?.totalAvailableBalance ?? 0}</td>
//                   <td className="px-2 py-2">{userData?.totalExposure ?? 0}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           <div className="">
//             <h2 className="text-[#243a48] text-[16px] font-[700] mt-2">Profile</h2>
//             <div className="mt-4">
//               <table className="text-xs text-left bg-[#fff] w-[70%]">
//                 <thead className="bg-[#e4e4e4]">
//                   <tr className="border-y border-y-[#7e97a7]">
//                     <th className="px-2 py-2" colSpan={3}>
//                       About You
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="border-y border-y-[#7e97a7]">
//                   <tr className="border-y border-y-[#7e97a7]">
//                     <td className="px-2 py-2">First Name</td>
//                     <td className="px-2 py-2">—</td>
//                   </tr>
//                   <tr className="border-y border-y-[#7e97a7]">
//                     <td className="px-2 py-2">Last Name</td>
//                     <td className="px-2 py-2">—</td>
//                   </tr>
//                   <tr className="border-y border-y-[#7e97a7]">
//                     <td className="px-2 py-2">Birthday</td>
//                     <td className="px-2 py-2">—</td>
//                   </tr>
//                   <tr className="border-y border-y-[#7e97a7]">
//                     <td className="px-2 py-2">Email</td>
//                     <td className="px-2 py-2">{userData?.email ?? "-"}</td>
//                   </tr>
//                   <tr className="border-y border-y-[#7e97a7]">
//                     <td className="px-2 py-2">Password</td>
//                     <td className="px-2 py-2">************</td>
//                     <td className="px-2 py-2">
//                       <button
//                         className="flex gap-1 text-[#2789ce] border border-[#bbb] rounded-sm px-2 py-1"
//                         style={{
//                           background: "linear-gradient(180deg, #fff, #eee)",
//                         }}
//                         onClick={() => setEditPopupOpen(true)}
//                       >
//                         <span>Edit</span>
//                         <BiSolidPencil className="text-sm" />
//                       </button>
//                     </td>
//                   </tr>
//                   <tr className="border-y border-y-[#7e97a7]">
//                     <td className="px-2 py-2">Time Zone</td>
//                     <td className="px-2 py-2">{userData?.timezone ?? "-"}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <div className="mt-4">
//             <table className="text-xs text-left bg-[#fff] w-[70%]">
//               <thead>
//                 <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
//                   <th className="px-2 py-2" colSpan={2}>
//                     Contact Details
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr className="border-y border-y-[#7e97a7]">
//                   <td className="px-2 py-2">Primary Number</td>
//                   <td className="px-2 py-2">—</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Edit Password Popup */}
//       {isEditPopupOpen && <EditPopup onClose={closeModal} userId={userId}/>}
//     </div>
//   );
// }

// export default AccountSummary;

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import EditPopup from "../../../components/downListComp/admin/EditPopup";
import Navigation from "../../../components/downListComp/admin/Navigation";
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector } from "react-redux";

function AccountSummary() {
  const title = {
    superadmin: "SUD",
    admin: "AD",
    subadmin: "SAD",
    seniorSuper: "SSM",
    superAgent: "SA",
    agent: "AG",
    user: "CL",
  };

  const user = useSelector(state => state.auth.user);
  // console.log("Logged in user in AccountSummary:", user);
  const { userId, role } = useParams();
  const [userData, setUserData] = useState(null);
  const [data, setData] = useState(null);
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [selected, setSelected] = useState("AccountSummary");
  const [loading, setLoading] = useState(true);

  const openModal = () => setEditPopupOpen(true);
  const closeModal = () => setEditPopupOpen(false);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/sub-admin/profile-data", { userId });

      if (!data?.success || !data.data) {
        console.warn("No user found with ID:", userId);
        setLoading(false);
        return;
      }
      setData(data.data);
      console.log("Fetched user data:", data);

      // Map API response to component's expected structure
      const mappedUserData = {
        email: data.data.basicInfo?.userName ?? "-",
        firstName: data.data.basicInfo?.name ?? "-",
        role: data.data.basicInfo?.role ?? "-",
        lastName: "-", // API does not provide separate lastName
        balance: data.data.financialInfo?.balance ?? 0,
        availableBalance: data.data.financialInfo?.avbalance ?? 0,
        totalAvailableBalance: data.data.financialInfo?.totalAvbalance ?? 0,
        totalExposure: data.data.financialInfo?.totalExposure ?? 0,
        creditReference: data.data.financialInfo?.creditReference ?? 0,
        profitLoss: data.data.financialInfo?.profitLoss ?? 0,
        timezone: data.data.settings?.timezone ?? "-",
        phone: data.data.basicInfo?.phone ?? "-",
      };

      setUserData(mappedUserData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!userData) return <div className="p-4 text-red-500">User not found.</div>;

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
            {title[user?.role] || ""}
          </span>
          <span className="text-sm font-bold">{user?.name}</span>
        </div>
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            {title[userData?.role] || ""}
          </span>
          <span className="text-sm font-bold">{userData?.firstName}</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected={selected} userId={userId} role={role} />
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">Account Summary</h2>

          <div className="mt-4">
            <FaUser />
          </div>

          {/* Financial Table */}
          <div className="mt-4 flex">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
                  <th className="px-2 py-2">Wallet</th>
                  <th className="px-2 py-2">Available to Bet</th>
                  <th className="px-2 py-2">Funds available to withdraw</th>
                  <th className="px-2 py-2">Current exposure</th>
                </tr>
              </thead>
              <tbody className="bg-[#fff] border-y border-y-[#7e97a7]">
                <tr>
                  <td className="px-2 py-2">Main wallet</td>
                  <td className="px-2 py-2">{userData.balance}</td>
                  <td className="px-2 py-2">{userData.balance}</td>
                  <td className="px-2 py-2">{userData.totalExposure}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Profile Table */}
          <div className="mt-4">
            <h2 className="text-[#243a48] text-[16px] font-[700]">Profile</h2>
            <div className="mt-4">
              <table className="text-xs text-left bg-[#fff] w-[70%]">
                <thead className="bg-[#e4e4e4]">
                  <tr className="border-y border-y-[#7e97a7]">
                    <th className="px-2 py-2" colSpan={3}>
                      About You
                    </th>
                  </tr>
                </thead>
                <tbody className="border-y border-y-[#7e97a7]">
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">First Name</td>
                    <td className="px-2 py-2">{userData.firstName}</td>
                  </tr>
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">Last Name</td>
                    <td className="px-2 py-2">{userData.lastName}</td>
                  </tr>
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">Email</td>
                    <td className="px-2 py-2">{userData.email}</td>
                  </tr>
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">Password</td>
                    <td className="px-2 py-2">************</td>
                    <td className="px-2 py-2">
                      <button
                        className="flex gap-1 text-[#2789ce] border border-[#bbb] rounded-sm px-2 py-1"
                        style={{ background: "linear-gradient(180deg, #fff, #eee)" }}
                        onClick={openModal}
                      >
                        <span>Edit</span>
                        <BiSolidPencil className="text-sm" />
                      </button>
                    </td>
                  </tr>
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">Time Zone</td>
                    <td className="px-2 py-2">{userData.timezone}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Contact Details Table */}
          <div className="mt-4">
            <table className="text-xs text-left bg-[#fff] w-[70%]">
              <thead>
                <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
                  <th className="px-2 py-2" colSpan={2}>
                    Contact Details
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-y border-y-[#7e97a7]">
                  <td className="px-2 py-2">Primary Number</td>
                  <td className="px-2 py-2">{userData.phone}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Password Popup */}
      {isEditPopupOpen && <EditPopup onClose={closeModal} userId={userId} />}
    </div>
  );
}

export default AccountSummary;
