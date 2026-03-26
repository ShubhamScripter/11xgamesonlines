import React from "react";
import { BiSolidPencil } from "react-icons/bi";
import { IoSearchSharp } from "react-icons/io5";
function PlayerBalance() {
  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Search Users</h2>
      <div className="mt-4 flex gap-2 items-center">
        <div className="bg-white border border-[#aaa] flex items-center gap-2 px-2 py-1 p-4 shadow-[inset_0_2px_0_0_#0000001a]">
          <IoSearchSharp />
          <input
            type="text"
            placeholder="Enter User Name...."
            name="findMember"
            className="outline-0 text-sm "
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-[#ffcc2f]  px-3 py-1 rounded-[5px] border border-[#cb8009] text-[13px] text-[#1e1e1e] font-[700]">
            Search
          </button>
          <button className="bg-gradient-to-b from-white to-[#eee] px-3 py-1 rounded-[5px] border border-[#bbb] text-[13px] text-[#1e1e1e] font-[700]">
            Statement
          </button>
        </div>
      </div>
      <div>
        <div className="mt-4">
          <h2 className="text-[#243a48] text-[16px] font-[700]">Profile</h2>
          <div className="mt-4">
            <table className=" text-xs text-left  w-[70%]">
              <thead className="bg-[#e4e4e4]">
                <tr className=" border-y border-y-[#7e97a7]">
                  <th className="px-2 py-2" colSpan={3}>
                    About Balance
                  </th>
                </tr>
              </thead>
              <tbody className=" border-y border-y-[#7e97a7]">
                <tr className="border-y border-y-[#7e97a7] bg-[#fff] ">
                  <td className="px-2 py-2">Deposit</td>
                  <td colSpan={2}></td>
                </tr>
                <tr className="border-y border-y-[#7e97a7] bg-[#fff] ">
                  <td className="px-2 py-2">Withdraw</td>
                  <td colSpan={2} className="px-2 py-2"></td>
                </tr>
                <tr className="border-y border-y-[#7e97a7] bg-[#fff] ">
                  <td className="px-2 py-2">Balance</td>
                  <td colSpan={2} className="px-2 py-2">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4">
          <table className=" text-xs text-left  w-[70%]">
            <thead>
              <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7] ">
                <th className="px-2 py-2" colSpan={2}>
                  Profile Balance
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-y border-y-[#7e97a7]  bg-[#fff]">
                <td className="px-2 py-2">Current Balance</td>
                <td className="px-2 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <table className=" text-xs text-left  w-[70%]">
            <thead>
              <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7] ">
                <th className="px-2 py-2" colSpan={2}>
                  To Be Deposited
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-y border-y-[#7e97a7]  bg-[#fff]">
                <td className="px-2 py-2 ">
                    <div className="bg-white border border-[#aaa] w-fit flex items-center gap-2 px-2 py-1 p-4 shadow-[inset_0_2px_0_0_#0000001a]">
                    <input
                    type="text"
                    placeholder="Amount"
                    name="findMember"
                    className="outline-0 text-sm "
                    />
                   </div>
                   <button className="bg-[#ffcc2f] mt-2 px-3 py-1 rounded-[5px] border border-[#cb8009] text-[13px] text-[#1e1e1e] font-[700]">Submit</button>
                </td>
                <td className="px-2 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PlayerBalance;
