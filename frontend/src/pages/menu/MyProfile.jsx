import React from "react";
import { MdArrowBackIos } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
function MyProfile({ setProfileOpen }) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  return (
    <div className="md:mt-12">
      <div className="flex items-center justify-between text-[18px] font-bold gap-2 h-[66px] px-4 bg-[#1a1a1a]">
        <span className="text-white">Profile</span>
        <button
          onClick={() => setProfileOpen(false)}
          className="text-2xl text-gray-400 hover:text-white transition-colors block md:hidden"
          aria-label="Close profile"
        >
          <IoClose />
        </button>
      </div>
      <div className="flex flex-col items-center ">
        <table className="shadow-md rounded-lg md:mt-4 w-full">
          <tbody>
            <tr className="border-b border-gray-700">
              <td colSpan={1} className="p-2">
                <span className="text-gray-300 text-md">Username</span>
              </td>
              <td colSpan={2} className="p-2">
                <span className="text-gray-300 text-md">{user?.username}</span>
              </td>
            </tr>
            <tr className="border-b border-gray-700">
              <td colSpan={1} className="p-2">
                <span className="text-gray-300 text-md">Email</span>
              </td>
              <td colSpan={2} className="p-2">
                <span className="text-gray-300 text-md">{user?.email}</span>
              </td>
            </tr>
            <tr>
              <td colSpan={1} className="p-2">
                <span className="text-gray-300 text-md">Password</span>
              </td>
              <td colSpan={1} className="p-2">
                <span className="text-gray-300 text-md">********</span>
              </td>
              <td colSpan={1} className="p-2">
                <button
                  onClick={() => navigate("/user/change-password")}
                  type="button"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MyProfile;
