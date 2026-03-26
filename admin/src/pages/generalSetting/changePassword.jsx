import React, { useState } from "react";
import axios from "../../utils/axiosInstance";

function ChangePassword({ onClose, userId }) {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    oldPassword: "", // current (old) password
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword, oldPassword } = formData;

    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }

    try {
      setLoading(true);
      // Call the correct API
      const res = await axios.post("/change/password-downline", {
        newPassword,
        id: userId,
        oldPassword,
      });

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
        <h2 className="text-lg font-['Times_New_Roman'] font-semibold mb-4 text-[#3b5160]">
          Change Password
        </h2>

        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit} className="space-y-3 w-full">
            <div className="flex gap-2 items-center">
              <label htmlFor="newPassword" className="text-xs flex-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter New Password"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none flex-1"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex gap-2 items-center">
              <label htmlFor="confirmPassword" className="text-xs flex-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none flex-1"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex gap-2 items-center">
              <label htmlFor="oldPassword" className="text-xs flex-1">
                Your Current Password
              </label>
              <input
                type="password"
                name="oldPassword"
                placeholder="Enter Old Password"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none flex-1"
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
    </div>
  );
}

export default ChangePassword;

