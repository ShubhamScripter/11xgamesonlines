// import React,{useState} from 'react'
// import Navigation from '../../components/myAccount/Navigation'
// import AccountStatementTable from './AccountStatementTable';
// const transactions = [
//   {
//     datetime: "7/5/2025, 7:16:13 PM",
//     depositFromUpline: "-",
//     depositToDownline: "1,000,000.00",
//     withdrawByUpline: "-",
//     withdrawFromDownline: "-",
//     balance: "1,499,801.09",
//     remark: "",
//     fromTo: "bajivaiadminbdt -> bdneval"
//   },
//   {
//     datetime: "7/5/2025, 7:10:30 PM",
//     depositFromUpline: "2,000,000.00",
//     depositToDownline: "-",
//     withdrawByUpline: "-",
//     withdrawFromDownline: "-",
//     balance: "2,499,801.09",
//     remark: "",
//     fromTo: "super_admin -> bajivaiadminbdt"
//   },
//   {
//     datetime: "7/5/2025, 7:08:55 PM",
//     depositFromUpline: "400,000.00",
//     depositToDownline: "-",
//     withdrawByUpline: "-",
//     withdrawFromDownline: "-",
//     balance: "499,801.09",
//     remark: "",
//     fromTo: "super_admin -> bajivaiadminbdt"
//   },
//   {
//     datetime: "7/4/2025, 7:16:03 PM",
//     depositFromUpline: "-",
//     depositToDownline: "400,000.00",
//     withdrawByUpline: "-",
//     withdrawFromDownline: "-",
//     balance: "99,801.09",
//     remark: "",
//     fromTo: "bajivaiadminbdt -> bdneval"
//   },
//   {
//     datetime: "7/2/2025, 4:55:15 PM",
//     depositFromUpline: "-",
//     depositToDownline: "200.00",
//     withdrawByUpline: "-",
//     withdrawFromDownline: "-",
//     balance: "499,801.09",
//     remark: "test",
//     fromTo: "bajivaiadminbdt -> bajitest1"
//   },
//   {
//     datetime: "6/22/2025, 12:44:39 PM",
//     depositFromUpline: "-",
//     depositToDownline: "500,000.00",
//     withdrawByUpline: "-",
//     withdrawFromDownline: "-",
//     balance: "500,001.09",
//     remark: "",
//     fromTo: "bajivaiadminbdt -> bdneval"
//   },
//   {
//     datetime: "6/22/2025, 12:44:11 PM",
//     depositFromUpline: "-",
//     depositToDownline: "-",
//     withdrawByUpline: "500,000.00",
//     withdrawFromDownline: "-",
//     balance: "1,000,001.09",
//     remark: "",
//     fromTo: "bajivaiadminbdt -> bdravikant"
//   },
//   {
//     datetime: "6/22/2025, 12:43:56 PM",
//     depositFromUpline: "-",
//     depositToDownline: "500,000.00",
//     withdrawByUpline: "-",
//     withdrawFromDownline: "-",
//     balance: "500,001.09",
//     remark: "",
//     fromTo: "bajivaiadminbdt -> bdravikant"
//   },
//   {
//     datetime: "6/6/2025, 5:33:23 PM",
//     depositFromUpline: "1,000,000.00",
//     depositToDownline: "-",
//     withdrawByUpline: "-",
//     withdrawFromDownline: "-",
//     balance: "1,000,001.09",
//     remark: "",
//     fromTo: "super_admin -> bajivaiadminbdt"
//   },
//   {
//     datetime: "6/6/2025, 3:07:33 PM",
//     depositFromUpline: "1,000,000.00",
//     depositToDownline: "-",
//     withdrawByUpline: "-",
//     withdrawFromDownline: "-",
//     balance: "1.09",
//     remark: "",
//     fromTo: "bajivaiadminbdt ->"
//   }
// ];


// function MyAccountStatement() {
//   const [selected, setselected] = useState("MyAccountStatement")
//   return (
//     <div className="p-2 mt-4">
//       <div
//         className="flex gap-4 border border-[#bbb] rounded shadow-inner px-4 py-2 w-fit"
//         style={{
//           background: "linear-gradient(180deg, #fff, #eee)",
//           boxShadow: "inset 0 2px 0 0 #ffffff80",
//         }}
//       >
//         <div className="flex font-['Times_New_Roman'] gap-2">
//           <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
//             AD
//           </span>
//           <span className="text-sm font-bold">bajivaiadminbdt</span>
//         </div>
        
//       </div>

//       <div className="flex mt-4 gap-4">
//         <Navigation selected={selected} />
//         <div className="font-['Times_New_Roman'] flex-1 mb-5">
//           <h2 className="text-[#243a48] text-[16px] font-[700]">
//             Account Statement
//           </h2>
//           <div className='mt-4'>
//             <AccountStatementTable transactions={transactions}/>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default MyAccountStatement

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navigation from "../../components/myAccount/Navigation";
import AccountStatementTable from "./AccountStatementTable";
import { fetchAgentTransactions } from "../../store/transactionsSlice";

// Helper: convert API object to table row shape
function mapApiTxToRow(tx) {
  return {
    datetime: new Date(tx.date || tx.createdAt).toLocaleString(),
    depositFromUpline: tx.deposite > 0 ? tx.deposite.toFixed(2) : "-",
    depositToDownline: "-", // API doesn't supply this
    withdrawByUpline: "-",  // API doesn't supply this
    withdrawFromDownline: tx.withdrawl > 0 ? tx.withdrawl.toFixed(2) : "-",
    balance: tx.amount?.toFixed(2) ?? "-",
    remark: tx.remark || "",
    fromTo: `${tx.from} -> ${tx.to}`,
  };
}

function MyAccountStatement() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: transactions, loading, error } = useSelector(
    (state) => state.transactions
  );

  // Fetch agent transaction history for the logged-in user
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAgentTransactions(user.id));
    }
  }, [dispatch, user]);

  const tableData = transactions.map(mapApiTxToRow);

  return (
    <div className="p-2 mt-4">
      {/* Account header */}
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
          <span className="text-sm font-bold">{user?.userName || "—"}</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected="MyAccountStatement" />

        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">
            Account Statement
          </h2>

          {loading && (
            <p className="mt-4 text-center text-gray-700">Loading…</p>
          )}
          {error && (
            <p className="mt-4 text-center text-red-600">
              Failed to load: {error}
            </p>
          )}

          {!loading && !error && (
            <div className="mt-4">
              <AccountStatementTable transactions={tableData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyAccountStatement;
