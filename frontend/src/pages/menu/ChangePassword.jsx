// import React, { useState } from "react";
// import { IoIosArrowBack } from "react-icons/io";
// import { FaUser, FaLock } from "react-icons/fa";
// import { MdVerifiedUser } from "react-icons/md";
// import logo from "../../assets/logo.png";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { changePassword, reset } from "../../features/auth/authSlice";
// import toast from "react-hot-toast";
// import { Toaster } from "react-hot-toast";
// function ChangePassword() {
//   const dispatch = useDispatch();
//   const { user, isLoading } = useSelector((state) => state.auth);
//   const navigate = useNavigate();
//   const [oldPasswordFocus, setOldPasswordFocus] = useState(false);
//   const [passwordFocus, setPasswordFocus] = useState(false);
//   const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
//   const [oldPassword, setOldPassword] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const isOldPasswordActive = oldPasswordFocus || oldPassword;
//   const isPasswordActive = passwordFocus || password;
//   const isConfirmPasswordActive = confirmPasswordFocus || confirmPassword;

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!oldPassword || !password || !confirmPassword) {
//       toast.error("All fields are required");
//       return;
//     }

//     if (password !== confirmPassword) {
//       toast.error("New password and confirm password must match");
//       return;
//     }

//     dispatch(
//       changePassword({
//         userId: user?._id, // or user?.id based on your user object
//         passwordData: { currentPassword: oldPassword, newPassword: password },
//       })
//     )
//       .unwrap()
//       .then((res) => {
//         toast.success(res.message || "Password changed successfully");
//         setOldPassword("");
//         setPassword("");
//         setConfirmPassword("");
//         navigate("/user/profile");
//       })
//       .catch((err) => {
//         toast.error(err || "Failed to change password");
//       });
//   };
//   return (
//     <div className="min-h-screen bg-[url(/loginbg.jpg)] bg-cover bg-center bg-no-repeat flex flex-col">
//       <Toaster position="top-right" reverseOrder={false} />
//       {/* Back Button */}
//       <div className="bg-white w-8 h-8 rounded-full flex justify-center items-center ml-2 mt-2">
//         <IoIosArrowBack
//           className="text-gray-600 w-6 h-6"
//           onClick={() => window.history.back()}
//         />
//       </div>

//       {/* Logo */}
//       <div className="flex flex-col items-center justify-center mt-4">
//         <img src={logo} alt="Logo" width={200} height={200} />
//       </div>

//       {/* Login Form Section (fills remaining height) */}
//       <div className="bg-white rounded-t-2xl shadow-lg p-4 mt-4 flex-1 flex flex-col justify-center">
//         <h2 className="text-3xl font-sans text-center py-4">Change Password</h2>

//         <form className="flex flex-col px-2" onSubmit={handleSubmit}>
//           {/* Old Password */}
//           <div
//             className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${
//               isOldPasswordActive ? "border-[#19A044]" : "border-gray-400"
//             }`}
//           >
//             <FaLock
//               className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${
//                 isOldPasswordActive ? "text-[#19A044]" : "text-gray-600"
//               }`}
//             />
//             <label
//               htmlFor="oldPassword"
//               className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
//               ${
//                 isOldPasswordActive
//                   ? "text-xs -top-2 text-[#19A044]"
//                   : "top-1/2 transform -translate-y-1/2 text-gray-400"
//               }
//             `}
//             >
//               Old Password
//             </label>
//             <input
//               type="password"
//               id="oldPassword"
//               value={oldPassword}
//               onFocus={() => setOldPasswordFocus(true)}
//               onBlur={() => setOldPasswordFocus(false)}
//               onChange={(e) => setOldPassword(e.target.value)}
//               className="pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800"
//             />
//           </div>

//           {/*New Password */}
//           <div
//             className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${
//               isPasswordActive ? "border-[#19A044]" : "border-gray-400"
//             }`}
//           >
//             <FaLock
//               className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${
//                 isPasswordActive ? "text-[#19A044]" : "text-gray-600"
//               }`}
//             />
//             <label
//               htmlFor="password"
//               className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
//                     ${
//                       isPasswordActive
//                         ? "text-xs -top-2 text-[#19A044]"
//                         : "top-1/2 transform -translate-y-1/2 text-gray-400"
//                     }
//                   `}
//             >
//               New Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onFocus={() => setPasswordFocus(true)}
//               onBlur={() => setPasswordFocus(false)}
//               onChange={(e) => setPassword(e.target.value)}
//               className="pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800"
//             />
//           </div>

//           {/*Confirm Password */}
//           <div
//             className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${
//               isConfirmPasswordActive ? "border-[#19A044]" : "border-gray-400"
//             }`}
//           >
//             <FaLock
//               className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${
//                 isConfirmPasswordActive ? "text-[#19A044]" : "text-gray-600"
//               }`}
//             />
//             <label
//               htmlFor="confirmPassword"
//               className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
//               ${
//                 isConfirmPasswordActive
//                   ? "text-xs -top-2 text-[#19A044]"
//                   : "top-1/2 transform -translate-y-1/2 text-gray-400"
//               }
//             `}
//             >
//               Confirm Password
//             </label>
//             <input
//               type="password"
//               id="confirmPassword"
//               value={confirmPassword}
//               onFocus={() => setConfirmPasswordFocus(true)}
//               onBlur={() => setConfirmPasswordFocus(false)}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className="pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="bg-[#19A044] text-white py-2 rounded hover:bg-green-700 transition duration-200 disabled:opacity-50"
//           >
//             {isLoading ? "Changing..." : "Change"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default ChangePassword;

import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { FaUser, FaLock } from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../features/auth/authSlice";   // ✅ removed unused reset
import toast, { Toaster } from "react-hot-toast";

function ChangePassword() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [oldPasswordFocus, setOldPasswordFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isOldPasswordActive = oldPasswordFocus || oldPassword;
  const isPasswordActive = passwordFocus || password;
  const isConfirmPasswordActive = confirmPasswordFocus || confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!oldPassword || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    // ✅ Updated dispatch to match new API: { oldPassword, newPassword }
    dispatch(
      changePassword({ oldPassword, newPassword: password })
    )
      .unwrap()
      .then((res) => {
        toast.success(res.message || "Password changed successfully");
        setOldPassword("");
        setPassword("");
        setConfirmPassword("");
        navigate("/user/profile");
      })
      .catch((err) => {
        toast.error(err || "Failed to change password");
      });
  };

  return (
    <div className="min-h-screen bg-[url(/loginbg.jpg)] bg-cover bg-center bg-no-repeat flex flex-col">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Back Button */}
      <div className="bg-white w-8 h-8 rounded-full flex justify-center items-center ml-2 mt-2">
        <IoIosArrowBack
          className="text-gray-600 w-6 h-6"
          onClick={() => window.history.back()}
        />
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center justify-center mt-4">
        <img src={logo} alt="Logo" width={200} height={200} />
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-t-2xl shadow-lg p-4 mt-4 flex-1 flex flex-col justify-center">
        <h2 className="text-3xl font-sans text-center py-4">Change Password</h2>

        {/* <form className="flex flex-col px-2" onSubmit={handleSubmit}> */}
        <form className="flex flex-col px-2">
          {/* Old Password */}
          <div
            className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${
              isOldPasswordActive ? "border-[#19A044]" : "border-gray-400"
            }`}
          >
            <FaLock
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${
                isOldPasswordActive ? "text-[#19A044]" : "text-gray-600"
              }`}
            />
            <label
              htmlFor="oldPassword"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${
                isOldPasswordActive
                  ? "text-xs -top-2 text-[#19A044]"
                  : "top-1/2 transform -translate-y-1/2 text-gray-400"
              }
            `}
            >
              Old Password
            </label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onFocus={() => setOldPasswordFocus(true)}
              onBlur={() => setOldPasswordFocus(false)}
              onChange={(e) => setOldPassword(e.target.value)}
              className="pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800"
            />
          </div>

          {/* New Password */}
          <div
            className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${
              isPasswordActive ? "border-[#19A044]" : "border-gray-400"
            }`}
          >
            <FaLock
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${
                isPasswordActive ? "text-[#19A044]" : "text-gray-600"
              }`}
            />
            <label
              htmlFor="password"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
                ${
                  isPasswordActive
                    ? "text-xs -top-2 text-[#19A044]"
                    : "top-1/2 transform -translate-y-1/2 text-gray-400"
                }
              `}
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800"
            />
          </div>

          {/* Confirm Password */}
          <div
            className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${
              isConfirmPasswordActive ? "border-[#19A044]" : "border-gray-400"
            }`}
          >
            <FaLock
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${
                isConfirmPasswordActive ? "text-[#19A044]" : "text-gray-600"
              }`}
            />
            <label
              htmlFor="confirmPassword"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${
                isConfirmPasswordActive
                  ? "text-xs -top-2 text-[#19A044]"
                  : "top-1/2 transform -translate-y-1/2 text-gray-400"
              }
            `}
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onFocus={() => setConfirmPasswordFocus(true)}
              onBlur={() => setConfirmPasswordFocus(false)}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#19A044] text-white py-2 rounded hover:bg-green-700 transition duration-200 disabled:opacity-50"
          >
            {isLoading ? "Changing..." : "Change"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
