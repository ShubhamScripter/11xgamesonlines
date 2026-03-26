// import React, { useState } from "react";
// import axios from "../../utils/axiosInstance";

// function EditPopup({ onClose, userId }) {
//   const [formData, setFormData] = useState({
//     newPassword: "",
//     confirmPassword: "",
//     password: "", // this is the current password
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const { newPassword, confirmPassword, password } = formData;

//     if (newPassword !== confirmPassword) {
//       alert("New password and confirmation do not match.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.put(`/users/change-password/${userId}`, {
//         currentPassword: password,
//         newPassword: newPassword,
//       });

//       alert("Password changed successfully");
//       onClose();
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.error || "Password change failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-[rgba(17,17,17,0.49)]  flex justify-center items-start pt-10 z-50 overflow-auto">
//       <div className="bg-[#eee] p-6 rounded-lg w-[400px] relative shadow-lg font-['Times_New_Roman']">
//         <button
//           onClick={onClose}
//           className="absolute right-3 top-2 text-xl font-bold"
//         >
//           ✕
//         </button>
//         <h2 className="text-lg font-['Times_New_Roman'] font-semibold mb-4 text-[#3b5160] ">
//           Change Password
//         </h2>
//         <div className="flex justify-center items-center">
//           <form onSubmit={handleSubmit} className="space-y-3">
//             <div className="flex gap-2 items-center">
//               <label htmlFor="newPassword" className="text-xs flex-1">
//                 New Password
//               </label>
//               <input
//                 type="password"
//                 name="newPassword"
//                 placeholder="Enter New Password"
//                 className="  p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="flex gap-2 items-center">
//               <label htmlFor="confirmPassword" className="text-xs flex-1">
//                 New Password Confirm
//               </label>
//               <input
//                 type="password"
//                 name="confirmPassword"
//                 placeholder="Confirm Password"
//                 className="p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
//                 value={formData.username}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="flex gap-2 items-center">
//               <label htmlFor="password" className="text-xs flex-1">
//                 Your Password
//               </label>
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Enter Old password"
//                 className="p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="flex justify-center mt-4">
//               <button
//                 type="submit"
//                 className=" bg-[#ffcc2f] border border-[#cb8009] hover:bg-yellow-500 p-1 px-10 text-sm font-semibold rounded"
//                 disabled={loading}
//               >
//                 {loading ? "Saving..." : "Change"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EditPopup;

import React, { useState } from "react";
import axios from "../../utils/axiosInstance";

function EditPopup({ onClose }) {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    oldPassword: "", // renamed to match backend
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "/change/password/self",
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        {
          // only needed if axiosInstance doesn’t auto-attach token
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Password changed successfully");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Password change failed.");
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
          Change Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2 items-center">
            <label className="text-xs flex-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter New Password"
              className="p-2 rounded border border-[#aaa] shadow-inner outline-none"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-2 items-center">
            <label className="text-xs flex-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="p-2 rounded border border-[#aaa] shadow-inner outline-none"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-2 items-center">
            <label className="text-xs flex-1">Current Password</label>
            <input
              type="password"
              name="oldPassword"
              placeholder="Enter Old Password"
              className="p-2 rounded border border-[#aaa] shadow-inner outline-none"
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="bg-[#ffcc2f] border border-[#cb8009] hover:bg-yellow-500 p-1 px-10 text-sm font-semibold rounded"
              disabled={loading}
            >
              {loading ? "Saving..." : "Change"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPopup;
