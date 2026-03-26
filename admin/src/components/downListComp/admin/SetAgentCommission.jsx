import React, { useState } from "react";
import axios from "../../../utils/axiosInstance";
import toast from "react-hot-toast";

function SetAgentCommission({ onClose, agentId, agentUsername, currentCommission, onSuccess }) {
  const [commissionPercentage, setCommissionPercentage] = useState(currentCommission || 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const commission = parseFloat(commissionPercentage);
    if (isNaN(commission) || commission < 0 || commission > 100) {
      toast.error("Commission must be between 0 and 100");
      return;
    }

    try {
      setLoading(true);
      
      const { data } = await axios.put(`/agent/${agentId}/commission`, {
        commissionPercentage: commission
      });
      
      toast.success(data.message || "Commission set successfully!");
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error("Error setting agent commission:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to set commission";
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
          Set Agent Commission
        </h2>
        <p className="text-sm text-[#3b5160] mb-4">
          Agent: <span className="font-semibold">{agentUsername}</span>
        </p>
        <p className="text-sm text-[#3b5160] mb-4">
          Current Commission Limit: <span className="font-semibold">{(currentCommission || 0).toFixed(2)}%</span>
        </p>
        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit} className="space-y-3 w-full">
            <div className="flex gap-2 items-center">
              <label htmlFor="commissionPercentage" className="text-xs flex-1">
                Commission Percentage (%)
              </label>
              <input
                type="number"
                name="commissionPercentage"
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00"
                className="p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none flex-1"
                value={commissionPercentage}
                onChange={(e) => setCommissionPercentage(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-center mt-4 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 border border-gray-400 hover:bg-gray-400 p-1 px-6 text-sm font-semibold rounded"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#ffcc2f] border border-[#cb8009] hover:bg-yellow-500 p-1 px-10 text-sm font-semibold rounded disabled:opacity-50"
              >
                {loading ? "Saving..." : "Set Commission"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SetAgentCommission;

