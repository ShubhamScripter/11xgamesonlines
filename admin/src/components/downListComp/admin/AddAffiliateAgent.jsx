import React, { useState } from "react";
import axios from "../../../utils/axiosInstance";

function AddAffiliateAgent({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
    commissionPercent: "",
  });
  const [saving, setSaving] = useState(false);
  const [createdLink, setCreatedLink] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const pct = formData.commissionPercent.trim();
    if (pct !== "" && (Number.isNaN(Number(pct)) || Number(pct) < 0 || Number(pct) > 100)) {
      alert("Commission must be between 0 and 100");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        userName: formData.userName.trim(),
        password: formData.password,
      };
      if (pct !== "") {
        payload.commissionPercent = Number(pct);
      }

      const { data } = await axios.post("/admin/affiliate/agents", payload);
      const link = data?.data?.referralLink || "";
      setCreatedLink(link);
      alert("Affiliate agent created successfully!");
      if (!link) onClose();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    if (!createdLink) return;
    navigator.clipboard.writeText(createdLink).then(
      () => alert("Referral link copied!"),
      () => alert("Could not copy link")
    );
  };

  return (
    <div className="fixed inset-0 bg-[rgba(17,17,17,0.49)] flex justify-center items-start pt-10 z-50 overflow-auto">
      <div className="bg-[#eee] p-6 rounded-lg w-[420px] relative shadow-lg font-['Times_New_Roman']">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-2 text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-1 text-[#3b5160]">Add Agent</h2>
        <p className="text-xs text-gray-600 mb-4">
          Creates an affiliate agent with a unique referral link for onboarding users.
        </p>

        {createdLink ? (
          <div className="space-y-3">
            <p className="text-sm text-green-700 font-semibold">Agent created successfully.</p>
            <label className="text-xs text-gray-600 block">Referral link</label>
            <p className="text-xs break-all bg-white border border-[#aaa] p-2 rounded font-mono">
              {createdLink}
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <button
                type="button"
                onClick={copyLink}
                className="bg-[#ffcc2f] border border-[#cb8009] hover:bg-yellow-500 p-1 px-6 text-sm font-semibold rounded"
              >
                Copy Link
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-[#243a48] text-white p-1 px-6 text-sm font-semibold rounded"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 items-center">
              <label className="text-xs flex-1">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Agent full name"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none min-w-[200px]"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs flex-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none min-w-[200px]"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs flex-1">Username</label>
              <input
                type="text"
                name="userName"
                placeholder="Login username"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none min-w-[200px]"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs flex-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none min-w-[200px]"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs flex-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none min-w-[200px]"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs flex-1">Commission % (optional)</label>
              <input
                type="number"
                name="commissionPercent"
                min="0"
                max="100"
                placeholder="Uses global % if empty"
                className="p-2 rounded border border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none min-w-[200px]"
                value={formData.commissionPercent}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#ffcc2f] border border-[#cb8009] hover:bg-yellow-500 p-1 px-10 text-sm font-semibold rounded disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Agent"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddAffiliateAgent;
