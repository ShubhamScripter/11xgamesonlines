import React, { useState } from "react";
import axios from "../../../utils/axiosInstance";
import toast from "react-hot-toast";

function CreditRef({ onClose, userId, creditReferenceCurrent, onSuccess }) {
  const [formData, setFormData] = useState({
    creditReference: "",
    masterPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { creditReference, masterPassword } = formData;
    
    if (!creditReference || !masterPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      // Call the API with the correct structure matching the backend
      const res = await axios.put("/update/user-details", {
        userId: userId,
        formData: {
          creditReference: creditReference,
          masterPassword: masterPassword,
        }
      });

      toast.success(res.data.message || "Credit Reference updated successfully");
      
      // Refresh the table data
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error("Error updating credit reference:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Update failed.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(17,17,17,0.49)] flex justify-center items-start pt-10 z-[9999] overflow-auto">
      <div className="bg-[#eee] p-6 rounded-lg w-[400px] relative shadow-lg font-['Times_New_Roman']">
        <button
          onClick={onClose}
          className="absolute right-3 top-2 text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-lg font-['Times_New_Roman'] font-semibold mb-4 text-[#3b5160]">
        Credit Reference Edit
        </h2>
        <p className="text-sm text-[#3b5160] mb-4">Current Credit Reference: {(creditReferenceCurrent ?? 0).toFixed(2)}</p>
        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit} className="space-y-3 w-full">
            <div className="flex gap-2 items-center">
              <label htmlFor="creditReference" className="text-xs flex-1">
                New Credit Reference
              </label>
              <input
                type="number"
                name="creditReference"
                placeholder="Enter Credit Reference Amount"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none flex-1"
                value={formData.creditReference}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex gap-2 items-center">
              <label htmlFor="masterPassword" className="text-xs flex-1">
                Master Password
              </label>
              <input
                type="password"
                name="masterPassword"
                placeholder="Enter Master Password"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none flex-1"
                value={formData.masterPassword}
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
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreditRef;

