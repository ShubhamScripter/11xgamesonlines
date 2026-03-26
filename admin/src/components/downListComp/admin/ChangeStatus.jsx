// import React, { useState } from "react";
// import { FaRegCheckCircle } from "react-icons/fa";
// import { TbCancel } from "react-icons/tb";
// import { FaLock } from "react-icons/fa";
// // import axios from "axios";
// import axios from "../../../utils/axiosInstance";
// import toast from "react-hot-toast"; // optional, for alerts

// function ChangeStatus({ onClose, userId, role, username, status,onStatusChanged}) {
//   console.log( "prop from change status",userId, role, username, status)
//   const [selectedStatus, setSelectedStatus] = useState(status);
//   console.log("selected status",selectedStatus)
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChangeStatus = async () => {
//     if (!password) {
//       toast.error("Please enter your password");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await axios.patch(
//         `/users/${userId}/change-status`,
//         { status: selectedStatus, password },
//       );
//       console.log(response)
//       toast.success("Status updated successfully");
//       if (onStatusChanged) onStatusChanged();
//       onClose();
       
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Failed to change status");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-[rgba(17,17,17,0.49)] flex justify-center items-start pt-10 z-50 overflow-auto">
//       <div className="bg-[#eee] p-6 rounded-lg w-[400px] relative shadow-lg font-['Times_New_Roman']">
//         <button
//           onClick={onClose}
//           className="absolute right-3 top-2 text-xl font-bold"
//         >
//           ✕
//         </button>
//         <h2 className="text-lg font-semibold mb-4 text-[#3b5160]">
//           Change Status
//         </h2>

//         {/* Account Info */}
//         <div className="flex justify-between items-center border-b pb-3 border-b-[#00000014]">
//           <div className="flex gap-1">
//             <span className="bg-[#568bc8] rounded-sm p-1 text-white text-xs">
//               {role}
//             </span>
//             <span>{username}</span>
//           </div>
//           <div className="flex justify-center items-center gap-1">
//             <span className="text-green-700 text-lg">●</span>
//             <span className="text-green-600 text-xs">{status}</span>
//           </div>
//         </div>

//         {/* Status Selection */}
//         <div className="flex items-center justify-between mt-4 mx-4">
//           <div
//             className={`${
//               selectedStatus === "active"
//                 ? "bg-[#4cbb17] text-white"
//                 : "bg-gradient-to-b from-[#d9d9d9] to-white"
//             } border border-[#d9d9d9] rounded-[8px] flex flex-col justify-center items-center p-4 px-6 cursor-pointer`}
//             onClick={() => setSelectedStatus("active")}
//           >
//             <FaRegCheckCircle />
//             <span>Active</span>
//           </div>
//           <div
//             className={`${
//               selectedStatus === "suspended"
//                 ? "bg-gradient-to-b from-[#db2828] to-[#921313] text-white"
//                 : "bg-gradient-to-b from-[#d9d9d9] to-white"
//             } border border-[#d9d9d9] rounded-[8px] flex flex-col justify-center items-center p-4 px-6 cursor-pointer`}
//             onClick={() => setSelectedStatus("suspended")}
//           >
//             <TbCancel />
//             <span>Suspend</span>
//           </div>
//           <div
//             className={`${
//               selectedStatus === "locked"
//                 ? "bg-gradient-to-b from-[#9ab6ce] to-[#536174] text-white"
//                 : "bg-gradient-to-b from-[#d9d9d9] to-white"
//             } border border-[#d9d9d9] rounded-[8px] flex flex-col justify-center items-center p-4 px-6 cursor-pointer`}
//             onClick={() => setSelectedStatus("locked")}
//           >
//             <FaLock />
//             <span>Locked</span>
//           </div>
//         </div>

//         {/* Password + Submit */}
//         <div className="mt-4 mx-4 flex gap-2 items-center justify-center">
//           <div className="flex gap-2 items-center">
//             <label htmlFor="password">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               name="password"
//               placeholder="Enter Password"
//               className="p-1 outline-none border border-[#aaaaaa] rounded-[2px] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)]"
//             />
//           </div>
//           <button
//             onClick={handleChangeStatus}
//             disabled={loading}
//             className="bg-[#ffcc2f] border border-[#cb8009] text-xs font-semibold rounded-sm p-1 px-2 disabled:opacity-60"
//           >
//             {loading ? "..." : "Change"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChangeStatus;

import React, { useState } from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { TbCancel } from "react-icons/tb";
import { FaLock } from "react-icons/fa";
import axios from "../../../utils/axiosInstance";
import toast from "react-hot-toast"; // optional, for alerts

function ChangeStatus({ onClose, userId, role, username, status, onStatusChanged }) {
  console.log("prop from change status", userId, role, username, status);

  const [selectedStatus, setSelectedStatus] = useState(status);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangeStatus = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `/user-setting`,
        {
          masterPassword: password,
          status: selectedStatus,
          userId,
        }
      );
      console.log(response);
      toast.success("Status updated successfully");
      if (onStatusChanged) onStatusChanged();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(17,17,17,0.49)] flex justify-center items-start pt-10 z-50 overflow-auto">
      <div className="bg-[#eee] p-6 rounded-lg w-[400px] relative shadow-lg font-['Times_New_Roman']">
        <button
          onClick={onClose}
          className="absolute right-3 top-2 text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4 text-[#3b5160]">
          Change Status
        </h2>

        {/* Account Info */}
        <div className="flex justify-between items-center border-b pb-3 border-b-[#00000014]">
          <div className="flex gap-1">
            <span className="bg-[#568bc8] rounded-sm p-1 text-white text-xs">
              {role}
            </span>
            <span>{username}</span>
          </div>
          <div className="flex justify-center items-center gap-1">
            <span
              className={`text-lg ${
                selectedStatus === "active"
                  ? "text-green-700"
                  : selectedStatus === "suspended"
                  ? "text-red-700"
                  : "text-gray-500"
              }`}
            >
              ●
            </span>
            <span className="text-xs">{selectedStatus}</span>
          </div>
        </div>

        {/* Status Selection */}
        <div className="flex items-center justify-between mt-4 mx-4">
          <div
            className={`${
              selectedStatus === "active"
                ? "bg-[#4cbb17] text-white"
                : "bg-gradient-to-b from-[#d9d9d9] to-white"
            } border border-[#d9d9d9] rounded-[8px] flex flex-col justify-center items-center p-4 px-6 cursor-pointer`}
            onClick={() => setSelectedStatus("active")}
          >
            <FaRegCheckCircle />
            <span>Active</span>
          </div>
          <div
            className={`${
              selectedStatus === "suspended"
                ? "bg-gradient-to-b from-[#db2828] to-[#921313] text-white"
                : "bg-gradient-to-b from-[#d9d9d9] to-white"
            } border border-[#d9d9d9] rounded-[8px] flex flex-col justify-center items-center p-4 px-6 cursor-pointer`}
            onClick={() => setSelectedStatus("suspended")}
          >
            <TbCancel />
            <span>Suspend</span>
          </div>
          <div
            className={`${
              selectedStatus === "locked"
                ? "bg-gradient-to-b from-[#9ab6ce] to-[#536174] text-white"
                : "bg-gradient-to-b from-[#d9d9d9] to-white"
            } border border-[#d9d9d9] rounded-[8px] flex flex-col justify-center items-center p-4 px-6 cursor-pointer`}
            onClick={() => setSelectedStatus("locked")}
          >
            <FaLock />
            <span>Locked</span>
          </div>
        </div>

        {/* Password + Submit */}
        <div className="mt-4 mx-4 flex gap-2 items-center justify-center">
          <div className="flex gap-2 items-center">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              placeholder="Enter Password"
              className="p-1 outline-none border border-[#aaaaaa] rounded-[2px] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)]"
            />
          </div>
          <button
            onClick={handleChangeStatus}
            disabled={loading}
            className="bg-[#ffcc2f] border border-[#cb8009] text-xs font-semibold rounded-sm p-1 px-2 disabled:opacity-60"
          >
            {loading ? "..." : "Change"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangeStatus;
