// import React ,{useState,useEffect} from 'react'
// import { MdArrowBackIos } from "react-icons/md";
// import HeaderLogin from '../../components/Header/HeaderLogin'
// import BalanceCard from '../../components/menucomp/BalanceCard';
// import MainBalanceCard from '../../components/menucomp/MainBalanceCard';
// import { useSelector, useDispatch } from "react-redux";
// import {getTransactionHistory} from '../../features/sports/betReducer';
// const balanceDataList = [
//   {
//     date: "7/2/2025, 5:12:45 PM",
//     deposit: 100.00,
//     balance: 100.00,
//     agent: "bakitestuser"
//   },
//   {
//     date: "7/3/2025, 2:30:10 PM",
//     deposit: 50.00,
//     balance: 150.00,
//     agent: "agentjohn"
//   },
//   {
//     date: "7/4/2025, 9:45:00 AM",
//     deposit: 200.00,
//     balance: 350.00,
//     agent: "superagent"
//   }
// ];

// function BalanceOverview() {
//   const dispatch = useDispatch();
//  const {transHistory, loading, errorMessage} = useSelector((state) => state.bet);
//   return (
//     <div>
//       <HeaderLogin/>
//       <div className="bg-[#000] h-10 flex items-center px-5 relative">
//         <div
//         onClick={() => window.history.back()} 
//         >
//           <MdArrowBackIos className='text-white text-2xl font-semibold' />
//         </div>
//         <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">Balance Overview</span>
//       </div>
//       <div className='bg-[#f1f7ff] min-h-[80vh] flex flex-col pb-5 '>
//         <MainBalanceCard />
//         <div className='px-2 mx-2'>
//           <BalanceCard balancedata={balanceDataList}/>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default BalanceOverview

import React, { useState, useEffect } from "react";
import { MdArrowBackIos } from "react-icons/md";
import HeaderLogin from "../../components/Header/HeaderLogin";
import BalanceCard from "../../components/menucomp/BalanceCard";
import MainBalanceCard from "../../components/menucomp/MainBalanceCard";
import { useSelector, useDispatch } from "react-redux";
import { getTransactionHistory } from "../../features/sports/betReducer";

function BalanceOverview() {
  const dispatch = useDispatch();
  const { transHistory, loading, errorMessage } = useSelector(
    (state) => state.bet
  );

  const [balanceDataList, setBalanceDataList] = useState([]);

  useEffect(() => {
   
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(
      new Date().setDate(new Date().getDate() - 30)
    ).toISOString().split("T")[0];

    dispatch(getTransactionHistory({ startDate, endDate, page: 1, limit: 50 }));
  }, [dispatch]);

  // ✅ Map API data into the structure your BalanceCard expects
  useEffect(() => {
    if (transHistory && Array.isArray(transHistory)) {
      const mapped = transHistory.map((t) => ({
        date: new Date(t.createdAt).toLocaleString(),
        deposit: parseFloat(t.deposite > 0 ? t.deposite : t.withdrawl) || 0,
        balance: parseFloat(t.amount) || 0,
        // 👇 Combine "from" and "to" in a readable string format
        agent: `${t.from}  → ${t.to}`,
      }));
      setBalanceDataList(mapped);
    }
  }, [transHistory]);
  
console.log("balanceDataList", balanceDataList);
  return (
    <div>
      <HeaderLogin />
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-2xl font-semibold" />
        </div>
        <span className="text-white text-sm md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">
          Balance Overview
        </span>
      </div>

      <div className="bg-[#f1f7ff] min-h-[80vh] flex flex-col pb-5">
        <MainBalanceCard />

        <div className="px-2 mx-2">
          {loading ? (
            <p className="text-center text-gray-500 mt-5">Loading transactions...</p>
          ) : errorMessage ? (
            <p className="text-center text-red-500 mt-5">{errorMessage}</p>
          ) : balanceDataList.length === 0 ? (
            <p className="text-center text-gray-500 mt-5">No transaction history found.</p>
          ) : (
            <BalanceCard balancedata={balanceDataList} />
          )}
        </div>
      </div>
    </div>
  );
}

export default BalanceOverview;
