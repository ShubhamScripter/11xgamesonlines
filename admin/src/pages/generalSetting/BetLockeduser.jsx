import React from "react";

const lockedUsers = [
  {
    user: "shopnonil229",
    reason: "-",
    superAdmin: "dadabaibdt",
    admin: "bajivaiadminbdt",
    subAdmin: "bdravikant",
    seniorSuper: "bdneval",
    superAgent: "bdchrew",
    agent: "bdratul",
  },
  {
    user: "sunny998",
    reason: "-",
    superAdmin: "dadabaibdt",
    admin: "bajivaiadminbdt",
    subAdmin: "bdravikant",
    seniorSuper: "bdneval",
    superAgent: "bdtpok",
    agent: "bdpritam",
  },
  {
    user: "sammy221",
    reason: "-",
    superAdmin: "dadabaibdt",
    admin: "bajivaiadminbdt",
    subAdmin: "bdravikant",
    seniorSuper: "bdneval",
    superAgent: "bdtpok",
    agent: "bdpritam",
  },
  {
    user: "kamrul789",
    reason: "-",
    superAdmin: "dadabaibdt",
    admin: "bajivaiadminbdt",
    subAdmin: "bdravikant",
    seniorSuper: "bdneval",
    superAgent: "bdtpok",
    agent: "bdpritam",
  },
  {
    user: "emon7756",
    reason: "-",
    superAdmin: "dadabaibdt",
    admin: "bajivaiadminbdt",
    subAdmin: "bdravikant",
    seniorSuper: "bdneval",
    superAgent: "bdthemanager",
    agent: "bdparvez",
  },
  {
    user: "bokul77",
    reason: "-",
    superAdmin: "dadabaibdt",
    admin: "bajivaiadminbdt",
    subAdmin: "bdravikant",
    seniorSuper: "bdneval",
    superAgent: "sarjis",
    agent: "bdhridoy",
  },
  {
    user: "alamin410",
    reason: "-",
    superAdmin: "dadabaibdt",
    admin: "bajivaiadminbdt",
    subAdmin: "bdravikant",
    seniorSuper: "bdneval",
    superAgent: "bdthemanager",
    agent: "bdfaisal88",
  },
  {
    user: "yeasin1378",
    reason: "-",
    superAdmin: "dadabaibdt",
    admin: "bajivaiadminbdt",
    subAdmin: "bdravikant",
    seniorSuper: "bdneval",
    superAgent: "taher66",
    agent: "bdasad 678",
  },
  {
    user: "sujon11223",
    reason: "-",
    superAdmin: "dadabaibdt",
    admin: "bajivaiadminbdt",
    subAdmin: "bdravikant",
    seniorSuper: "bdneval",
    superAgent: "bdtrack",
    agent: "bdprincearman",
  },
  {
    user: "ram234",
    reason: "-",
    superAdmin: "dadabaibdt",
    admin: "bajivaiadminbdt",
    subAdmin: "bdravikant",
    seniorSuper: "bdneval",
    superAgent: "sarjis",
    agent: "bdsiam",
  },
];

function BetLockeduser() {
  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Bet Locked Users</h2>
      <div className="mt-4">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">User</th>
              <th className="px-2 py-2">Reason</th>
              <th className="px-2 py-2">Super Admin</th>
              <th className="px-2 py-2">Admin</th>
              <th className="px-2 py-2">Sub Admin</th>
              <th className="px-2 py-2">Senior Super</th>
              <th className="px-2 py-2">Super Agent</th>
              <th className="px-2 py-2">Agent</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {lockedUsers.map((user, index) => (
              <tr key={index} className="bg-white border-y border-y-[#7e97a7]">
                <td className="px-2 py-2">{user.user}</td>
                <td className="px-2 py-2">{user.reason}</td>
                <td className="px-2 py-2">{user.superAdmin}</td>
                <td className="px-2 py-2">{user.admin}</td>
                <td className="px-2 py-2">{user.subAdmin}</td>
                <td className="px-2 py-2">{user.seniorSuper}</td>
                <td className="px-2 py-2">{user.superAgent}</td>
                <td className="px-2 py-2">{user.agent}</td>
                <td className="px-2 py-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BetLockeduser;
