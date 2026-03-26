import React from "react";

function InactiveUsers() {
  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">In Active Users</h2>
      <div className="mt-4">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">Account</th>
              <th className="px-2 py-2">Credit Ref.</th>
              <th className="px-2 py-2">Balance</th>
              <th className="px-2 py-2">Exposure</th>
              <th className="px-2 py-2">Avail. bal. </th>
              <th className="px-2 py-2">Player Balance </th>
              <th className="px-2 py-2">Exposure Limit</th>
              <th className="px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-y border-y-[#7e97a7]">
              <td colspan="9" className="px-2 py-2">No records found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InactiveUsers;
