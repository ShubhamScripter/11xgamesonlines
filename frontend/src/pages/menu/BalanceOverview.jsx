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
    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full z-20 h-screen">
      <div className="bg-[#000] h-10 flex items-center">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-md font-semibold" />
        </div>
        <span className="text-[18px] font-bold">
          Balance Overview
        </span>
      </div>

      <div className="flex flex-col pb-5">
        <MainBalanceCard />

        <div className="">
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
