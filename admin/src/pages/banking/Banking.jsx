// import React, { useState,useEffect } from "react";
// import { IoSearchSharp } from "react-icons/io5";
// import { MdOutlineRefresh } from "react-icons/md";
// import BankingTable from "./BankingTable";
// import { useSelector,useDispatch } from "react-redux";
// import { fetchDownlineTree } from "../../store/downlineSlice";
// import { fetchAccountSummary } from '../../store/accountSummarySlice';
// const userData = [
//   {
//     id: "6853b767d21e5ca967f63387",
//     uid: "bajitest1",
//     balance: 182.4,
//     availableDW: 0.0,
//     exposure: 0.0,
//     creditRef: 0.0,
//     referencePL: 0,
//     gameBalances: [
//       { game: "SABA", balance: 0 },
//       { game: "Sky Trader", balance: 0 },
//       { game: "Royal Gaming", balance: 0 },
//       { game: "BPoker", balance: 0 },
//       { game: "Casino", balance: 0 },
//     ],
//   },
//   {
//     id: "6865161fa45d92c5de4444ab",
//     uid: "bajitest2",
//     balance: 0.0,
//     availableDW: 0.0,
//     exposure: 0.0,
//     creditRef: 0.0,
//     referencePL: 0,
//     gameBalances: [
//       { game: "SABA", balance: 0 },
//       { game: "Sky Trader", balance: 0 },
//       { game: "Royal Gaming", balance: 0 },
//       { game: "BPoker", balance: 0 },
//       { game: "Casino", balance: 0 },
//     ],
//   },
//   {
//     id: "66d4c90560e9ed0f2fc750ee",
//     uid: "bdravikant",
//     balance: 2655978.04,
//     availableDW: 0.0,
//     exposure: 2336.37,
//     creditRef: 0.0,
//     referencePL: 2656160.44,
//     gameBalances: [
//       { game: "SABA", balance: 0 },
//       { game: "Sky Trader", balance: 0 },
//       { game: "Royal Gaming", balance: 0 },
//       { game: "BPoker", balance: 0 },
//       { game: "Casino", balance: 0 },
//     ],
//   },
// ];

// function Banking() {
//   const user = useSelector(state => state.auth.user);
//   const { summary, loading } = useSelector(state => state.accountSummary);
//   console.log("summary",summary)
//   const dispatch = useDispatch();
//   console.log("user",user)

//   useEffect(() => {
//     if (user?.id) {
//       dispatch(fetchAccountSummary(user.id));
//       dispatch(fetchDownlineTree(user.id));
//     }
//   }, [user?.id, dispatch]);
//   const [expandedRows, setExpandedRows] = useState({});

//   const toggleExpand = (id) => {
//     setExpandedRows((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };

//   return (
//     <div className='mt-4 p-2 font-["Times_New_Roman"]'>
//       <h2 className="text-[#243a48] text-[16px] font-[700]">Banking</h2>

//       <div className="mt-4 flex justify-between items-center">
//         <div className="flex gap-2 items-center">
//           <div className="bg-white border border-[#aaa] flex items-center gap-2 px-2 py-1 shadow-[inset_0_2px_0_0_#0000001a]">
//             <IoSearchSharp />
//             <input
//               type="text"
//               placeholder="Find Member...."
//               name="findMember"
//               className="outline-0 text-sm"
//             />
//             <button className="bg-[#fdb72f] rounded-sm p-1 font-serif text-sm">
//               Search
//             </button>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className="font-serif text-sm font-light">Status</span>
//             <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
//               <select className="text-sm bg-white w-40 outline-0">
//                 <option value="active">Active</option>
//                 <option value="suspended">Suspend</option>
//                 <option value="locked">Locked</option>
//               </select>
//             </div>
//           </div>

//           <MdOutlineRefresh className="text-2xl" />
//         </div>
//       </div>

//       <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] mt-4 flex gap-4 p-3">
//         <span>Your Balance</span>
//         <div>
//           <small>PBU</small>
//           <span className="text-2xl font-[700] text-black pl-2">
//             {summary?.balance?.toFixed(2)}
//           </span>
//         </div>
//       </div>

//       <div className="mt-4 overflow-auto">
//         <BankingTable userData={userData}/>
//       </div>
//       {/* <div className="bg-[#fff] mt-4 p-2 flex justify-center items-center gap-2">
//         <button className="bg-[#f3f3f3] border border-[#e1e1e1] px-3 py-1 rounded-sm">Clear All</button>
//         <input type="password" placeholder="password" className="px-1  border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] p-2 rounded-sm" />
//         <button className="bg-[#ffcc2f] border-[#cb8009] text-[#333] px-3 py-2 text-xs font-[700] rounded-sm ">
//             Submit
//             <span className="mx-2 bg-[#ffe9a5] rounded-full p-1 px-2">0</span>
//             Payment
//         </button>
//       </div> */}
//     </div>
//   );
// }

// export default Banking;


import React, { useState, useEffect } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { MdOutlineRefresh } from "react-icons/md";
import BankingTable from "./BankingTable";
import { useSelector, useDispatch } from "react-redux";
import { fetchDownlineTree } from "../../store/downlineSlice";
import { fetchAccountSummary } from "../../store/accountSummarySlice";

function Banking() {
  const user = useSelector((state) => state.auth.user);
  const { summary } = useSelector((state) => state.accountSummary);
  const { downlines } = useSelector((state) => state.downline);
  console.log("summary", summary);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [filteredDownlines, setFilteredDownlines] = useState([]);


  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAccountSummary(user.id));
      dispatch(fetchDownlineTree(user.id));
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (!downlines) return;

    let filtered = downlines;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((member) =>
        member.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((member) => {
        if (statusFilter === "active") return member.status === "active";
        if (statusFilter === "suspended") return member.status === "suspended";
        if (statusFilter === "locked") return member.status === "locked";
        return true;
      });
    }

    setFilteredDownlines(filtered);
  }, [downlines, searchTerm, statusFilter]);


  // 🔄 Re-fetch balances after any successful transaction
  const refreshBalances = () => {
    if (user?.id) {
      dispatch(fetchDownlineTree(user.id));
      dispatch(fetchAccountSummary(user.id)); // refresh own summary too
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchClick = () => {
    // Search is already applied via useEffect, this can trigger a refresh if needed
    console.log(`Searching for: ${searchTerm}, Status: ${statusFilter}`);
  };

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Banking</h2>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className="bg-white border border-[#aaa] flex items-center gap-2 px-2 py-1 shadow-[inset_0_2px_0_0_#0000001a]">
            <IoSearchSharp />
            <input
              type="text"
              placeholder="Find Member...."
              name="findMember"
              value={searchTerm}
              onChange={handleSearchChange}
              className="outline-0 text-sm"
            />
            <button 
             onClick={handleSearchClick}
             className="bg-[#fdb72f] rounded-sm p-1 font-serif text-sm">
              Search
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-light">Status</span>
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="text-sm bg-white w-40 outline-0">
                <option value="active">Active</option>
                <option value="suspended">Suspend</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>

          <MdOutlineRefresh
            className="text-2xl cursor-pointer"
            onClick={refreshBalances}
            title="Refresh Balances"
          />
        </div>
      </div>

      <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] mt-4 flex gap-4 p-3">
        <span>Your Balance</span>
        <div>
          <small>PBU</small>
          <span className="text-2xl font-[700] text-black pl-2">
            {/* {summary?.balance?.toFixed(2)} */}
            {summary?.financialInfo?.avbalance?.toFixed(2) ?? '0.00'}
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-auto">
        {/* ✅ Pass refresh callback down */}
        <BankingTable 
        downlines={filteredDownlines}
        onTransactionComplete={refreshBalances} />
      </div>
    </div>
  );
}

export default Banking;
