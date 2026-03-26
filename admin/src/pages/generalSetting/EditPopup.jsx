import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

function EditPopup({ onClose }) {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    // Validate password length (at least 6 characters)
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/change/password-self", {
        oldPassword: formData.password,
        newPassword: formData.newPassword,
      });

      if (response.data.message) {
        toast.success(response.data.message);
        // Reset form
        setFormData({
          newPassword: "",
          confirmPassword: "",
          password: "",
        });
        // Close popup immediately
        onClose();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-[rgba(17,17,17,0.49)]  flex justify-center items-start pt-10 z-50 overflow-auto">
      <div className="bg-[#eee] p-6 rounded-lg w-[400px] relative shadow-lg font-['Times_New_Roman']">
        <button
          onClick={onClose}
          className="absolute right-3 top-2 text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-lg font-['Times_New_Roman'] font-semibold mb-4 text-[#3b5160] ">
          Change Password
        </h2>
        
        {/* Error Message */}
        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-xs">
            {error}
          </div>
        )}
        
        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 items-center">
              <label htmlFor="newPassword" className="text-xs flex-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter New Password"
                className="p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 items-center">
              <label htmlFor="confirmPassword" className="text-xs flex-1">
                New Password Confirm
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor="password" className="text-xs flex-1">
                Your Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter Old password"
                className="p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#ffcc2f] border border-[#cb8009] hover:bg-yellow-500 p-1 px-10 text-sm font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Changing..." : "Change"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPopup;
