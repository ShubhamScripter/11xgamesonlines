import React ,{useState} from "react";

function EditPopup({ onClose }) {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form Submitted:", formData);

    if (formData.validateCode !== "5083") {
      alert("Invalid validation code");
      return;
    }

    alert("Login successful (dummy)");
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
                className="  p-2 rounded border-[1px] border-[#aaa] shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)] outline-none"
                value={formData.email}
                onChange={(e) => handleChange(e.target.value)}
                required
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
                value={formData.username}
                onChange={(e) => handleChange(e.target.value)}
                required
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
                onChange={(e) => handleChange(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className=" bg-[#ffcc2f] border border-[#cb8009] hover:bg-yellow-500 p-1 px-10 text-sm font-semibold rounded"
              >
                Change
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPopup;
