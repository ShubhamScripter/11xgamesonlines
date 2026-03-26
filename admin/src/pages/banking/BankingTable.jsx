// // import React from "react";
// // import { useSelector, useDispatch } from "react-redux";
// // function BankingTable({ userData }) {
// //   const { balanceData, downlines, loading, error } = useSelector(
// //     (state) => state.downline
// //   );
// //   console.log("balancedata", balanceData);
// //   console.log("downline", downlines);

// //   return (
// //     <div>
// //       <table className="w-full text-xs border-collapse">
// //         <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]  ">
// //           <tr>
// //             <th className="px-2 py-2">UID</th>
// //             <th className="px-2 py-2">Balance</th>
// //             <th className="px-2 py-2">Available D/W</th>
// //             <th className="px-2 py-2">Exposure</th>
// //             <th className="px-2 py-2">Deposit / Withdraw</th>
// //             <th className="px-2 py-2">Credit Reference</th>
// //             <th className="px-2 py-2">Reference P/L</th>
// //             <th className="px-2 py-2">Remark</th>
// //             <th className="px-2 py-2">All Logs</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {downlines.map((user) => (
// //             <React.Fragment key={user.id}>
// //               <tr className="bg-[#fff] border-y border-[#7e97a7]">
// //                 <td className="cursor-pointer  px-2 py-2">{user.username}</td>
// //                 <td className="px-2 py-2">{user.availBal.toFixed(2)}</td>
// //                 <td className="px-2 py-2">{user.balance.toFixed(2)}</td>
// //                 <td className="px-2 py-2">{user.exposure.toFixed(2)}</td>
// //                 <td className="border-x px-2 py-2">
// //                   <div className="flex gap-2">
// //                     <div className="flex gap-2 mb-1">
// //                       <label className="flex items-center gap-1">
// //                         <input type="radio" name={`dw_${user.id}`} />
// //                         <span className="bg-green-200 px-1">D</span>
// //                       </label>
// //                       <label className="flex items-center gap-1">
// //                         <input type="radio" name={`dw_${user.id}`} />
// //                         <span className="bg-red-200 px-1">W</span>
// //                       </label>
// //                     </div>
// //                     <div className="flex gap-2">
// //                       <input
// //                         type="number"
// //                         min="1"
// //                         className=" px-1 w-15 border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]"
// //                       />
// //                       <button className="px-2 py-1 bg-gradient-to-b from-white to-gray-100 font-[700] text-sm border border-[#bbb] rounded">
// //                         Full
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </td>
// //                 <td className="px-2 py-2">
// //                   <span>{user.creditRef.toFixed(2)}</span>
// //                   <button className="ml-2 px-2 py-1 bg-gradient-to-b from-white to-gray-100 font-[700] text-sm border border-[#bbb] rounded">
// //                     Edit
// //                   </button>
// //                 </td>
// //                 <td className="border-x px-2 py-2">0</td>
// //                 <td className="px-2 py-2">
// //                   <input
// //                     type="text"
// //                     placeholder="Remark"
// //                     className="px-1  border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] p-2 "
// //                   />
// //                 </td>
// //                 <td className="px-2 py-2">
// //                   <button
// //                     type="button"
// //                     className="px-2 py-1 bg-gradient-to-b from-white to-gray-100 font-[700] text-sm border border-[#bbb] rounded"
// //                   >
// //                     Log
// //                   </button>
// //                 </td>
// //               </tr>
// //             </React.Fragment>
// //           ))}

// //           {/* Totals */}
// //           <tr className="font-bold bg-[#fff] border-y border-y-[#7e97a7]">
// //             <td className="px-2 py-2">Total</td>
// //             <td className="px-2 py-2">
// //               {downlines
// //                 .reduce((acc, user) => acc + user.availBal, 0)
// //                 .toFixed(2)}
// //             </td>
// //             <td className="px-2 py-2">
// //               {downlines
// //                 .reduce((acc, user) => acc + user.balance, 0)
// //                 .toFixed(2)}
// //             </td>
// //             <td className="px-2 py-2">
// //               {downlines
// //                 .reduce((acc, user) => acc + user.exposure, 0)
// //                 .toFixed(2)}
// //             </td>
// //             <td className="px-2 py-2"></td>
// //             <td className="px-2 py-2">
// //               {downlines
// //                 .reduce((acc, user) => acc + user.creditRef, 0)
// //                 .toFixed(2)}
// //             </td>
// //             <td className="px-2 py-2">
// //               {/* {userData
// //                           .reduce((acc, user) => acc + user.referencePL, 0)
// //                           .toFixed(2)} */}
// //               0
// //             </td>
// //             <td className="px-2 py-2"></td>
// //             <td className="px-2 py-2"></td>
// //           </tr>
// //         </tbody>
// //       </table>
// //       <div className="bg-[#fff] mt-4 p-2 flex justify-center items-center gap-2">
// //         <button className="bg-[#f3f3f3] border border-[#e1e1e1] px-3 py-1 rounded-sm">Clear All</button>
// //         <input type="password" placeholder="password" className="px-1  border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] p-2 rounded-sm" />
// //         <button className="bg-[#ffcc2f] border-[#cb8009] text-[#333] px-3 py-2 text-xs font-[700] rounded-sm ">
// //             Submit
// //             <span className="mx-2 bg-[#ffe9a5] rounded-full p-1 px-2">0</span>
// //             Payment
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// // export default BankingTable;

// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import axiosInstance from "../../utils/axiosInstance";
// import { useNavigate } from "react-router";

// function BankingTable({ onTransactionComplete }) {
//   const navigate = useNavigate();
//   const { downlines } = useSelector((state) => state.downline);

//   const [transactions, setTransactions] = useState({});
//   const [password, setPassword] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const handleChange = (userId, field, value) => {
//     setTransactions((prev) => ({
//       ...prev,
//       [userId]: { ...prev[userId], [field]: value },
//     }));
//   };

//   const handleClearAll = () => {
//     setTransactions({});
//     setPassword("");
//   };

//   const handleSubmit = async () => {
//     setSubmitting(true);

//     const requests = Object.entries(transactions)
//       .filter(([_, tx]) => tx && tx.type && tx.amount > 0)
//       .map(([userId, tx]) =>
//         axiosInstance.post(
//           `/users/subadmins/${userId}/${tx.type === "D" ? "deposit" : "withdraw"}`,
//           {
//             amount: tx.amount,
//             remark: tx.remark || "",
//             password, // ✅ send password in body
//           }
//         )
//       );

//     if (requests.length === 0) {
//       alert("No transactions to submit.");
//       setSubmitting(false);
//       return;
//     }

//     try {
//       await Promise.all(requests);
//       alert("Transaction submitted!");
//       handleClearAll();
//       if (onTransactionComplete) onTransactionComplete();
//     } catch (err) {
//       console.error("Submit error:", err.response?.data || err.message);
//       alert(`Error: ${err.response?.data?.error || err.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div>
//       <table className="w-full text-xs border-collapse">
//         <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
//           <tr>
//             <th className="px-2 py-2">UID</th>
//             <th className="px-2 py-2">Balance</th>
//             <th className="px-2 py-2">Available D/W</th>
//             <th className="px-2 py-2">Exposure</th>
//             <th className="px-2 py-2">Deposit / Withdraw</th>
//             <th className="px-2 py-2">Credit Reference</th>
//             <th className="px-2 py-2">Reference P/L</th>
//             <th className="px-2 py-2">Remark</th>
//             <th className="px-2 py-2">All Logs</th>
//           </tr>
//         </thead>
//         <tbody>
//           {downlines.map((user) => (
//             <React.Fragment key={user._id}>
//               <tr className="bg-[#fff] border-y border-[#7e97a7]">
//                 <td className="cursor-pointer px-2 py-2">{user.username}</td>
//                 <td className="px-2 py-2">{user.availBal.toFixed(2)}</td>
//                 <td className="px-2 py-2">{user.balance.toFixed(2)}</td>
//                 <td className="px-2 py-2">{user.exposure.toFixed(2)}</td>
//                 <td className="border-x px-2 py-2">
//                   <div className="flex gap-2">
//                     <div className="flex gap-2 mb-1">
//                       <label className="flex items-center gap-1">
//                         <input
//                           type="radio"
//                           name={`dw_${user._id}`}
//                           checked={transactions[user._id]?.type === "D"}
//                           onChange={() => handleChange(user._id, "type", "D")}
//                         />
//                         <span className="bg-green-200 px-1">D</span>
//                       </label>
//                       <label className="flex items-center gap-1">
//                         <input
//                           type="radio"
//                           name={`dw_${user._id}`}
//                           checked={transactions[user._id]?.type === "W"}
//                           onChange={() => handleChange(user._id, "type", "W")}
//                         />
//                         <span className="bg-red-200 px-1">W</span>
//                       </label>
//                     </div>
//                     <div className="flex gap-2">
//                       <input
//                         type="number"
//                         min="1"
//                         value={transactions[user._id]?.amount || ""}
//                         onChange={(e) =>
//                           handleChange(user._id, "amount", Number(e.target.value))
//                         }
//                         className="px-1 w-15 border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]"
//                       />
//                       <button
//                         type="button"
//                         className="px-2 py-1 bg-gradient-to-b from-white to-gray-100 font-[700] text-sm border border-[#bbb] rounded"
//                         onClick={() =>
//                           handleChange(
//                             user._id,
//                             "amount",
//                             transactions[user._id]?.type === "W"
//                               ? user.balance
//                               : user.availBal
//                           )
//                         }
//                       >
//                         Full
//                       </button>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-2 py-2">
//                   <span>{user.creditRef.toFixed(2)}</span>
//                   <button className="ml-2 px-2 py-1 bg-gradient-to-b from-white to-gray-100 font-[700] text-sm border border-[#bbb] rounded">
//                     Edit
//                   </button>
//                 </td>
//                 <td className="border-x px-2 py-2">0</td>
//                 <td className="px-2 py-2">
//                   <input
//                     type="text"
//                     placeholder="Remark"
//                     value={transactions[user._id]?.remark || ""}
//                     onChange={(e) =>
//                       handleChange(user._id, "remark", e.target.value)
//                     }
//                     className="px-1 border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] p-2"
//                   />
//                 </td>
//                 <td className="px-2 py-2">
//                   <button
//                     onClick={() => navigate(`/transaction-logs/${user._id}`)}
//                     type="button"
//                     className="px-2 py-1 bg-gradient-to-b from-white to-gray-100 font-[700] text-sm border border-[#bbb] rounded"
//                   >
//                     Log
//                   </button>
//                 </td>
//               </tr>
//             </React.Fragment>
//           ))}

//           {/* Totals */}
//           <tr className="font-bold bg-[#fff] border-y border-y-[#7e97a7]">
//             <td className="px-2 py-2">Total</td>
//             <td className="px-2 py-2">
//               {downlines.reduce((acc, u) => acc + u.availBal, 0).toFixed(2)}
//             </td>
//             <td className="px-2 py-2">
//               {downlines.reduce((acc, u) => acc + u.balance, 0).toFixed(2)}
//             </td>
//             <td className="px-2 py-2">
//               {downlines.reduce((acc, u) => acc + u.exposure, 0).toFixed(2)}
//             </td>
//             <td className="px-2 py-2"></td>
//             <td className="px-2 py-2">
//               {downlines.reduce((acc, u) => acc + u.creditRef, 0).toFixed(2)}
//             </td>
//             <td className="px-2 py-2">0</td>
//             <td className="px-2 py-2"></td>
//             <td className="px-2 py-2"></td>
//           </tr>
//         </tbody>
//       </table>

//       <div className="bg-[#fff] mt-4 p-2 flex justify-center items-center gap-2">
//         <button
//           className="bg-[#f3f3f3] border border-[#e1e1e1] px-3 py-1 rounded-sm"
//           onClick={handleClearAll}
//           disabled={submitting}
//         >
//           Clear All
//         </button>
//         <input
//           type="password"
//           placeholder="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="px-1 border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] p-2 rounded-sm"
//         />
//         <button
//           className="bg-[#ffcc2f] border-[#cb8009] text-[#333] px-3 py-2 text-xs font-[700] rounded-sm"
//           onClick={handleSubmit}
//           disabled={submitting}
//         >
//           Submit
//           <span className="mx-2 bg-[#ffe9a5] rounded-full p-1 px-2">
//             {Object.values(transactions).filter(
//               (tx) => tx && tx.type && tx.amount > 0
//             ).length}
//           </span>
//           Payment
//         </button>
//       </div>
//     </div>
//   );
// }

// export default BankingTable;

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router";
import CreditRef from "../../components/downListComp/admin/CreditRef";
function BankingTable({ onTransactionComplete, downlines: filteredDownlines }) {
  const navigate = useNavigate();
  // const { downlines } = useSelector((state) => state.downline);
  const { downlines: reduxDownlines } = useSelector((state) => state.downline);
  
  // Use filtered downlines if provided, otherwise use all downlines
  const downlines = filteredDownlines || reduxDownlines || [];

  const [transactions, setTransactions] = useState({});
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localDownlines, setLocalDownlines] = useState([]);
  const [isCreditRefOpen, setisCreditRefOpen] = useState(false);
  const openCreditRef = () => setisCreditRefOpen(true);
  const closeCreditRef = () => setisCreditRefOpen(false);

  const [selectedUser, setSelectedUser] = useState(null);
console.log("localDownlines", localDownlines);
  // Initialize localDownlines whenever downlines from Redux changes
  useEffect(() => {
    setLocalDownlines(downlines || []);
  }, [downlines]);

  const handleChange = (userId, field, value) => {
    setTransactions((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const handleClearAll = () => {
    setTransactions({});
    setPassword("");
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const validTransactions = Object.entries(transactions).filter(
      ([_, tx]) => tx && tx.type && tx.amount > 0
    );

    if (validTransactions.length === 0) {
      alert("No transactions to submit.");
      setSubmitting(false);
      return;
    }

    try {
      const requests = validTransactions.map(([userId, tx]) =>
        axiosInstance.put("/withdrowal-deposite", {
          userId,
          formData: {
            balance: tx.amount,
            masterPassword: password,
            remark: tx.remark || "",
          },
          type: tx.type === "D" ? "deposite" : "withdraw",
        })
      );

      const responses = await Promise.all(requests);

      // Update local downlines after successful transactions
      const updatedDownlines = localDownlines.map((user) => {
        const res = responses.find((r) => r.data.child._id === user._id);
        return res ? res.data.child : user;
      });
      console.log("Updated Downlines:", updatedDownlines);
      setLocalDownlines(updatedDownlines);
      alert("Transactions completed successfully!");
      handleClearAll();
      if (onTransactionComplete) onTransactionComplete();
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <table className="w-full text-xs border-collapse">
        <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
          <tr>
            <th className="px-2 py-2">UID</th>
            <th className="px-2 py-2">Balance</th>
            <th className="px-2 py-2">Available D/W</th>
            <th className="px-2 py-2">Exposure</th>
            <th className="px-2 py-2">Deposit / Withdraw</th>
            <th className="px-2 py-2">Credit Reference</th>
            <th className="px-2 py-2">Reference P/L</th>
            <th className="px-2 py-2">Remark</th>
            <th className="px-2 py-2">All Logs</th>
          </tr>
        </thead>
        <tbody>
          {localDownlines.map((user) => (
            <tr key={user._id} className="bg-[#fff] border-y border-[#7e97a7]">
              <td className="cursor-pointer px-2 py-2">{user.username || "-"}</td>
              <td className="px-2 py-2">{(user.avbalance ?? 0).toFixed(2)}</td>
              <td className="px-2 py-2">{(user.avbalance ?? 0).toFixed(2)}</td>
              <td className="px-2 py-2">{(user.exposure ?? 0).toFixed(2)}</td>
              <td className="border-x px-2 py-2">
                <div className="flex gap-2">
                  <div className="flex gap-2 mb-1">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={`dw_${user._id}`}
                        checked={transactions[user._id]?.type === "D"}
                        onChange={() => handleChange(user._id, "type", "D")}
                      />
                      <span className="bg-green-200 px-1">D</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={`dw_${user._id}`}
                        checked={transactions[user._id]?.type === "W"}
                        onChange={() => handleChange(user._id, "type", "W")}
                      />
                      <span className="bg-red-200 px-1">W</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={transactions[user._id]?.amount || ""}
                      onChange={(e) =>
                        handleChange(user._id, "amount", Number(e.target.value))
                      }
                      className="px-1 w-15 border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]"
                    />
                    <button
                      type="button"
                      className="px-2 py-1 bg-gradient-to-b from-white to-gray-100 font-[700] text-sm border border-[#bbb] rounded"
                      onClick={() =>
                        handleChange(
                          user._id,
                          "amount",
                          transactions[user._id]?.type === "W"
                            ? user.balance ?? 0
                            : user.avbalance ?? 0
                        )
                      }
                    >
                      Full
                    </button>
                  </div>
                </div>
              </td>
              <td className="px-2 py-2">
                <span>{(user.creditRef ?? 0).toFixed(2)}</span>
                <button className="ml-2 px-2 py-1 bg-gradient-to-b from-white to-gray-100 font-[700] text-sm border border-[#bbb] rounded"
                onClick={() => {
                        setSelectedUser({ 
                          id: user._id, 
                          role: user.role, 
                          username: user.username || user.account,
                          creditReference: user.creditRef || user.creditReference || 0
                        });
                        openCreditRef();
                      }}
                >
                  Edit
                </button>
              </td>
              <td className="border-x px-2 py-2">0</td>
              <td className="px-2 py-2">
                <input
                  type="text"
                  placeholder="Remark"
                  value={transactions[user._id]?.remark || ""}
                  onChange={(e) =>
                    handleChange(user._id, "remark", e.target.value)
                  }
                  className="px-1 border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] p-2"
                />
              </td>
              <td className="px-2 py-2">
                <button
                  onClick={() => navigate(`/transaction-logs/${user._id}`)}
                  type="button"
                  className="px-2 py-1 bg-gradient-to-b from-white to-gray-100 font-[700] text-sm border border-[#bbb] rounded"
                >
                  Log
                </button>
              </td>
            </tr>
          ))}

          {/* Totals */}
          {localDownlines.length > 0 && (
            <tr className="font-bold bg-[#fff] border-y border-y-[#7e97a7]">
            <td className="px-2 py-2">Total</td>
            <td className="px-2 py-2">
              {localDownlines
                .reduce((acc, u) => acc + (u.avbalance ?? 0), 0)
                .toFixed(2)}
            </td>
            <td className="px-2 py-2">
              {localDownlines
                .reduce((acc, u) => acc + (u.balance ?? 0), 0)
                .toFixed(2)}
            </td>
            <td className="px-2 py-2">
              {localDownlines
                .reduce((acc, u) => acc + (u.exposure ?? 0), 0)
                .toFixed(2)}
            </td>
            <td className="px-2 py-2"></td>
            <td className="px-2 py-2">
              {localDownlines
                .reduce((acc, u) => acc + (u.creditReference ?? 0), 0)
                .toFixed(2)}
            </td>
            <td className="px-2 py-2">0</td>
            <td className="px-2 py-2"></td>
            <td className="px-2 py-2"></td>
          </tr>
          )}
        </tbody>
      </table>

      <div className="bg-[#fff] mt-4 p-2 flex justify-center items-center gap-2">
        <button
          className="bg-[#f3f3f3] border border-[#e1e1e1] px-3 py-1 rounded-sm"
          onClick={handleClearAll}
          disabled={submitting}
        >
          Clear All
        </button>
        <input
          type="password"
          placeholder="Master Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-1 border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] p-2 rounded-sm"
        />
        <button
          className="bg-[#ffcc2f] border-[#cb8009] text-[#333] px-3 py-2 text-xs font-[700] rounded-sm"
          onClick={handleSubmit}
          disabled={submitting}
        >
          Submit
          <span className="mx-2 bg-[#ffe9a5] rounded-full p-1 px-2">
            {Object.values(transactions).filter(
              (tx) => tx && tx.type && tx.amount > 0
            ).length}
          </span>
          Payment
        </button>
      </div>
      {/* {isCreditRefOpen && selectedUser && <CreditRef 
        onClose={closeCreditRef} 
        userId={selectedUser.id}
        creditReferenceCurrent={selectedUser.creditReference}
        
      />} */}
      {isCreditRefOpen && selectedUser && (
       <CreditRef
          onClose={closeCreditRef}
         userId={selectedUser.id}
         creditReferenceCurrent={selectedUser.creditReference}
         onSuccess={() => {            // re-sync local list from latest prop
            setLocalDownlines(downlines || []);
            // call parent refresh (Banking -> refreshBalances)
           if (onTransactionComplete) onTransactionComplete();
         }}
       />
     )}
    </div>
  );
}

export default BankingTable;
