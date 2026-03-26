// import React, { useState, useEffect } from "react";
// import { BiSolidPencil } from "react-icons/bi";
// import Navigation from "../../components/myAccount/Navigation";
// import EditPopup from "../../components/myAccount/EditPopup";
// import axios from "../../utils/axiosInstance";
// import { useSelector } from "react-redux";

// const profileTableData = {
//   "First Name": "",
//   "Last Name": "",
//   "Birthday": "-----",
//   "Email": "bajitest1@gmail.com",
//   "Password": "************",
//   "Time Zone": "Asia/Kolkata",
//   "Primary Number": ""
// };

// function MyProfile() {
//   const [userData, setUserData] = useState(null); 
//   const [loading, setLoading] = useState(true);
//   const user = useSelector(state => state.auth.user);
//   const userId = user?.id;
//   const [isEditPopupOpen, setEditPopupOpen] = useState(false);
//   const [selected, setselected] = useState("myProfile");
//   const openModal = () => setEditPopupOpen(true);
//   const closeModal = () => setEditPopupOpen(false);

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
//     if (userId) fetchUserData();
//   }, [userId]);

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
//             {userData?.role?.slice(0, 2)?.toUpperCase() || "AD"}
//           </span>
//           <span className="text-sm font-bold">{userData?.username || "..."}</span>
//         </div>
//       </div>

//       <div className="flex mt-4 gap-4">
//         <Navigation selected={selected} />
//         <div className="font-['Times_New_Roman'] flex-1 mb-5">
//           <h2 className="text-[#243a48] text-[16px] font-[700]">profile</h2>
//           <div>
//             <div className="">
//               <div className="mt-4">
//                 <table className=" text-xs text-left  w-[70%]">
//                   <thead className="bg-[#e4e4e4]">
//                     <tr className=" border-y border-y-[#7e97a7]">
//                       <th className="px-2 py-2" colSpan={3}>
//                         About You
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className=" border-y border-y-[#7e97a7]">
//                     <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
//                       <td className="px-2 py-2">First Name</td>
//                       <td colSpan={2}></td>
//                     </tr>
//                     <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
//                       <td className="px-2 py-2">Last Name</td>
//                       <td colSpan={2} className="px-2 py-2"></td>
//                     </tr>
//                     <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
//                       <td className="px-2 py-2">Birthday</td>
//                       <td colSpan={2} className="px-2 py-2">-----</td>
//                     </tr>
//                     <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
//                       <td className="px-2 py-2">Email</td>
//                       <td colSpan={2} className="px-2 py-2">{userData?.email ?? "-"}</td>
//                     </tr>
//                     <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
//                       <td className="px-2 py-2">Password</td>
//                       <td className="px-2 py-2">************</td>
//                       <td className="px-2 py-2">
//                         <button
//                           className="flex gap-1 text-[#2789ce] border border-[#bbb] rounded-sm px-2 py-1"
//                           style={{
//                             background: "linear-gradient(180deg, #fff, #eee)",
//                           }}
//                           onClick={() => setEditPopupOpen(true)}
//                         >
//                           <span>Edit</span>
//                           <BiSolidPencil className="text-sm" />
//                         </button>
//                       </td>
//                     </tr>
//                     <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
//                       <td className="px-2 py-2">Time Zone</td>
//                       <td colSpan={2} className="px-2 py-2">Asia/Kolkata</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             <div className="mt-4">
//               <table className=" text-xs text-left  w-[70%]">
//                 <thead >
//                   <tr  className="bg-[#e4e4e4] border-y border-y-[#7e97a7] ">
//                     <th className="px-2 py-2" colSpan={2} >
//                       Contact Details
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr className="border-y border-y-[#7e97a7]  bg-[#0000000d]">
//                     <td className="px-2 py-2">Primary Number</td>
//                     <td className="px-2 py-2" ></td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* edit popup */}
//       {isEditPopupOpen && <EditPopup onClose={closeModal} userId={userId}/>}
//     </div>
//   );
// }

// export default MyProfile;

import React, { useState, useEffect } from "react";
import { BiSolidPencil } from "react-icons/bi";
import Navigation from "../../components/myAccount/Navigation";
import EditPopup from "../../components/myAccount/EditPopup";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";

function MyProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector(state => state.auth.user);
  const userId = user?.id;
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [selected, setSelected] = useState("myProfile");

  const openModal = () => setEditPopupOpen(true);
  const closeModal = () => setEditPopupOpen(false);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/sub-admin/profile-data", { userId });

      if (!data?.success || !data.data) {
        console.warn("No user found with ID:", userId);
        setUserData(null);
        setLoading(false);
        return;
      }

      // Map API response to your component's expected structure
      const mappedData = {
        firstName: data.data.basicInfo?.name ?? "",
        lastName: "-", // API does not provide separate last name
        email: data.data.basicInfo?.userName ?? "-",
        timezone: "Asia/Kolkata", // default as API does not provide
        phone: data.data.basicInfo?.phone ?? "-",
        role: data.data.basicInfo?.role ?? "user",
        username: data.data.basicInfo?.userName ?? "-",
      };

      setUserData(mappedData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUserData();
  }, [userId]);

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
            {userData?.role?.slice(0, 2)?.toUpperCase() || "AD"}
          </span>
          <span className="text-sm font-bold">{userData?.username || "..."}</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected={selected} />
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">profile</h2>

          <div className="mt-4">
            <table className="text-xs text-left w-[70%]">
              <thead className="bg-[#e4e4e4]">
                <tr className="border-y border-y-[#7e97a7]">
                  <th className="px-2 py-2" colSpan={3}>
                    About You
                  </th>
                </tr>
              </thead>
              <tbody className="border-y border-y-[#7e97a7]">
                <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
                  <td className="px-2 py-2">First Name</td>
                  <td colSpan={2} className="px-2 py-2">{userData.firstName}</td>
                </tr>
                <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
                  <td className="px-2 py-2">Last Name</td>
                  <td colSpan={2} className="px-2 py-2">{userData.lastName}</td>
                </tr>
                <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
                  <td className="px-2 py-2">Birthday</td>
                  <td colSpan={2} className="px-2 py-2">-----</td>
                </tr>
                <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
                  <td className="px-2 py-2">Email</td>
                  <td colSpan={2} className="px-2 py-2">{userData.email}</td>
                </tr>
                <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
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
                <tr className="border-y border-y-[#7e97a7] even:bg-[#fff] odd:bg-[#0000000d]">
                  <td className="px-2 py-2">Time Zone</td>
                  <td colSpan={2} className="px-2 py-2">{userData.timezone}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <table className="text-xs text-left w-[70%]">
              <thead>
                <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
                  <th className="px-2 py-2" colSpan={2}>
                    Contact Details
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-y border-y-[#7e97a7] bg-[#0000000d]">
                  <td className="px-2 py-2">Primary Number</td>
                  <td className="px-2 py-2">{userData.phone}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit popup */}
      {isEditPopupOpen && <EditPopup onClose={closeModal} userId={userId} />}
    </div>
  );
}

export default MyProfile;
