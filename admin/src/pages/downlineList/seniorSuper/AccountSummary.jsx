import React,{useState} from "react";
import { FaUser } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import EditPopup from "../../../components/downListComp/seniorSuper/EditPopup";
import Navigation from "../../../components/downListComp/seniorSuper/Navigation";
function AccountSummary() {
    const [isEditPopupOpen, setEditPopupOpen] = useState(false);
    const [selected, setselected] = useState("AccountSummary")
      const openModal = () => setEditPopupOpen(true);
      const closeModal = () => setEditPopupOpen(false);
  return (
    <div className="p-2 mt-4">
      <div
        className="flex gap-4 border border-[#bbb] rounded shadow-inner px-4 py-2 w-fit"
        style={{
          background: "linear-gradient(180deg, #fff, #eee)",
          boxShadow: "inset 0 2px 0 0 #ffffff80",
        }}
      >
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            AD
          </span>
          <span className="text-sm font-bold">bajivaiadminbdt</span>
        </div>
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            SA
          </span>
          <span className="text-sm font-bold">testsuperagent</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected={selected}/>
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">
            Account Summary
          </h2>
          <div className="mt-4">
            <FaUser />
          </div>
          <div className="mt-4 flex">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
                  <th className="px-2 py-2">Wallet</th>
                  <th className="px-2 py-2">Available to Bet </th>
                  <th className="px-2 py-2">Funds available to withdraw </th>
                  <th className="px-2 py-2">Current exposure</th>
                </tr>
              </thead>
              <tbody className="bg-[#fff] border-y border-y-[#7e97a7]">
                <tr>
                  <td className="px-2 py-2">Main wallet</td>
                  <td className="px-2 py-2">0</td>
                  <td className="px-2 py-2">0</td>
                  <td className="px-2 py-2">0</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="">
            <h2 className="text-[#243a48] text-[16px] font-[700] mt-2">
              Profile
            </h2>
            <div className="mt-4">
              <table className=" text-xs text-left bg-[#fff] w-[70%]">
                <thead className="bg-[#e4e4e4]">
                  <tr className=" border-y border-y-[#7e97a7]">
                    <th className="px-2 py-2" colSpan={3}>
                      About You
                    </th>
                  </tr>
                </thead>
                <tbody className=" border-y border-y-[#7e97a7]">
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">First Name</td>
                    <td></td>
                  </tr>
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">Last Name</td>
                    <td className="px-2 py-2"></td>
                  </tr>
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">Birthday</td>
                    <td className="px-2 py-2">-----</td>
                  </tr>
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">Email</td>
                    <td className="px-2 py-2">bajitest1@gmail.com</td>
                  </tr>
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">Password</td>
                    <td className="px-2 py-2">************</td>
                    <td className="px-2 py-2">
                      <button
                        className="flex gap-1 text-[#2789ce] border border-[#bbb] rounded-sm px-2 py-1"
                        style={{
                          background: "linear-gradient(180deg, #fff, #eee)",
                        }}
                        onClick={()=>setEditPopupOpen(true)}
                      >
                        <span>Edit</span>
                        <BiSolidPencil className="text-sm" />
                      </button>
                    </td>
                  </tr>
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">Time Zone</td>
                    <td className="px-2 py-2">Asia/Kolkata</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4">
            <table className=" text-xs text-left bg-[#fff] w-[70%]">
              <thead >
                <tr  className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
                  <th className="px-2 py-2" colSpan={2} >
                    Contact Details
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-y border-y-[#7e97a7]">
                  <td className="px-2 py-2">Primary Number</td>
                  <td className="px-2 py-2" ></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* edit popup */}
      {isEditPopupOpen && <EditPopup onClose={closeModal}/>}
    </div>
  );
}

export default AccountSummary;
