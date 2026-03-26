import React, { useMemo, useState } from "react";
import axios from "../../../utils/axiosInstance";
function AddUser({ onClose, roleToCreate, parentId, siteTag = "baaji.net", maxCommission = 0 }) {
  console.log("roleToCreate",roleToCreate)
  console.log("parentId",parentId)
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmpassword: "",
    timezone: "Asia/Kolkata",
    commission: 0,
    exposureLimit: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const parsedMaxCommission = useMemo(() => Number(maxCommission) || 0, [maxCommission]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmpassword) {
      alert("Passwords do not match");
      return;
    }

    const commissionValue = Number(formData.commission);
    if (Number.isNaN(commissionValue) || commissionValue < 0) {
      alert("Commission must be a positive number");
      return;
    }

    if (parsedMaxCommission > 0 && commissionValue > parsedMaxCommission) {
      alert(`Commission cannot exceed your allowed limit of ${parsedMaxCommission}%`);
      return;
    }

    try {
      const payload = {
        id: parentId,
        name: formData.username,
        userName: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmpassword,
        timezone: formData.timezone,
        accountType: roleToCreate,
        siteTag,
        commission: commissionValue,
        exposureLimit: Number(formData.exposureLimit) || 0,
      };
      console.log("payload",payload)
      const { data } = await axios.post('/sub-admin/create', payload);
      alert("User created successfully!");
      onClose(); // close modal and refresh
    } catch (err) {
      console.log(err)
      console.error("Error creating user:", err);
      alert(err?.response?.data?.message || "Failed to create user");
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
          Add Sub Admin
        </h2>
        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 items-center">
              <label htmlFor="email" className="text-xs flex-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                className="  p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex gap-2 items-center">
              <label htmlFor="username" className="text-xs flex-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor="password" className="text-xs flex-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="password"
                className="p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor="confirmpassword" className="text-xs flex-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmpassword"
                placeholder="Confirm password"
                className="p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
                value={formData.confirmpassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center  ">
              <label htmlFor="timezone" className="text-xs flex-1">
                Select Time Zone
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="min-w-53 p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="Asia/Dhaka">Asia/Dhaka</option>
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor="commission" className="text-xs flex-1">
                Commission {parsedMaxCommission ? `(max ${parsedMaxCommission}%)` : ""}
              </label>
              <input
                type="number"
                name="commission"
                max={parsedMaxCommission || undefined}
                placeholder="commission"
                className="p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
                value={formData.commission}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor="exposureLimit" className="text-xs flex-1">
              Exposure Limit
              </label>
              <input
                type="number"
                name="exposureLimit"
                placeholder="Exposure Limit"
                className="p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
                value={formData.exposureLimit}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className=" bg-[#ffcc2f] border border-[#cb8009] hover:bg-yellow-500 p-1 px-10 text-sm font-semibold rounded"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddUser;
