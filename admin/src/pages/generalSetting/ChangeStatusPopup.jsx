import React, { useState } from "react";
import axios from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

function ChangeStatusPopup({ onClose, userId, status, onSuccess }) {
  const [formData, setFormData] = useState({
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put("/user-setting", {
        masterPassword: formData.password,
        status,
        userId,
      });
      toast.success("Status updated successfully");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update status."
      );
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
          Change Status To: <span className="ml-1">{status}</span>
        </h2>
        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit} className="space-y-3 w-full">
            <div className="flex gap-2 items-center">
              <label htmlFor="password" className="text-xs flex-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none flex-1"
                value={formData.password}
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

export default ChangeStatusPopup;

