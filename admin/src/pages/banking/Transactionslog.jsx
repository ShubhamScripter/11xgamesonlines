// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axiosInstance from "../../utils/axiosInstance";

// function Transactionslog() {
//   const { userId } = useParams();
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchLogs = async () => {
//       try {
//         const res = await axiosInstance.get(
//           `/users/subadmins/${userId}/transactions`
//         );
//         console.log('Fetched transactions:', res.data);
//         setLogs(Array.isArray(res.data.transactions) ? res.data.transactions : []);
//       } catch (err) {
//         console.error("Failed to load transactions:", err);
//         setLogs([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (userId) fetchLogs();
//   }, [userId]);

//   if (loading) {
//     return (
//       <div className="bg-[#f0ece1] min-h-[100vh] p-4 font-['Times_New_Roman']">
//         <p className="text-center py-4">Loading…</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#f0ece1] min-h-[100vh] p-4 font-['Times_New_Roman']">
//       <div className="flex justify-between">
//         <div className="text-[#243a48] text-base font-[700]">Account Statement</div>
//         <button
//           className="bg-[#ffcc2f] border border-[#cb8009] px-2 py-1 rounded hover:bg-yellow-500 text-[#333] font-[700] text-xs"
//           onClick={() => window.history.back()}
//         >
//           Close
//         </button>
//       </div>

//       <div className="mt-4 overflow-x-auto">
//         <table className="min-w-full text-xs text-left">
//           <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
//             <tr>
//               <th className="px-2 py-2">Date/Time</th>
//               <th className="px-2 py-2">Deposit</th>
//               <th className="px-2 py-2">Withdraw</th>
//               <th className="px-2 py-2">Balance</th>
//               <th className="px-2 py-2">Remark</th>
//               <th className="px-2 py-2">From/To</th>
//             </tr>
//           </thead>
//           <tbody>
//   {logs.length === 0 ? (
//     <tr>
//       <td className="px-2 py-2 text-center" colSpan="6">
//         No transactions found
//       </td>
//     </tr>
//   ) : (
//     logs.map((tx) => {
//       const isDeposit = tx.type === "deposit";   // <-- use DB type
//       return (
//         <tr key={tx._id} className="bg-white border-y border-y-[#7e97a7]">
//           <td className="px-2 py-2">
//             {new Date(tx.createdAt).toLocaleString()}
//           </td>
//           <td className="px-2 py-2">
//             {isDeposit ? tx.amount.toFixed(2) : "-"}
//           </td>
//           <td className="px-2 py-2">
//             {!isDeposit ? tx.amount.toFixed(2) : "-"}
//           </td>
//           <td className="px-2 py-2">
//             {tx.balanceAfter?.toFixed(2) ?? "-"}
//           </td>
//           <td className="px-2 py-2">{tx.remark || "-"}</td>
//           <td className="px-2 py-2">
//             {isDeposit ? tx.from?.username : tx.to?.username}
//           </td>
//         </tr>
//       );
//     })
//   )}
// </tbody>

//         </table>
//       </div>
//     </div>
//   );
// }

// export default Transactionslog;


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

function Transactionslog() {
  const { userId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // POST request with JSON body
        const res = await axiosInstance.post(
          "/get/agent-trantionhistory",
          { id: userId }
        );

        console.log("Fetched transactions:", res.data);

        // Response shape: { success:true, data:[...], totalPages:1 }
        setLogs(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        console.error("Failed to load transactions:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchLogs();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-[#f0ece1] min-h-[100vh] p-4 font-['Times_New_Roman']">
        <p className="text-center py-4">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f0ece1] min-h-[100vh] p-4 font-['Times_New_Roman']">
      <div className="flex justify-between">
        <div className="text-[#243a48] text-base font-[700]">Account Statement</div>
        <button
          className="bg-[#ffcc2f] border border-[#cb8009] px-2 py-1 rounded hover:bg-yellow-500 text-[#333] font-[700] text-xs"
          onClick={() => window.history.back()}
        >
          Close
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">Date/Time</th>
              <th className="px-2 py-2">Deposit</th>
              <th className="px-2 py-2">Withdraw</th>
              <th className="px-2 py-2">Amount</th>
              <th className="px-2 py-2">Remark</th>
              <th className="px-2 py-2">From/To</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td className="px-2 py-2 text-center" colSpan="6">
                  No transactions found
                </td>
              </tr>
            ) : (
              logs.map((tx) => (
                <tr key={tx._id} className="bg-white border-y border-y-[#7e97a7]">
                  <td className="px-2 py-2">
                    {new Date(tx.date || tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-2 py-2">
                    {tx.deposite?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-2 py-2">
                    {tx.withdrawl?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-2 py-2">
                    {tx.amount?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-2 py-2">{tx.remark || "-"}</td>
                  <td className="px-2 py-2">
                    {tx.from} → {tx.to}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactionslog;
