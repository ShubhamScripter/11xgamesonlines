import React from "react";
import { MdArrowBackIos } from "react-icons/md";
import HeaderLogin from "../../components/Header/HeaderLogin";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
function MyProfile() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  return (
    <div>
      <HeaderLogin />
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-2xl font-semibold" />
        </div>
        <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">
          My Profile
        </span>
      </div>
      <div className="bg-[#f1f7ff] min-h-[80vh] flex flex-col items-center ">
        <table className=" w-[90%] bg-white shadow-md rounded-lg m-2 mt-4">
          <tbody>
            <tr className="border-b ">
              <td colSpan={1} className="p-2">
                <span className="text-gray-600 text-lg">Username</span>
              </td>
              <td colSpan={2} className="p-2">
                <span className="text-gray-600 text-lg">{user?.username}</span>
              </td>
            </tr>
            <tr className="border-b ">
              <td colSpan={1} className="p-2">
                <span className="text-gray-600 text-lg">Email</span>
              </td>
              <td colSpan={2} className="p-2">
                <span className="text-gray-600 text-lg">{user?.email}</span>
              </td>
            </tr>
            <tr>
              <td colSpan={1} className="p-2">
                <span className="text-gray-600 text-lg">Password</span>
              </td>
              <td colSpan={1} className="p-2">
                <span className="text-gray-600 text-lg">********</span>
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
