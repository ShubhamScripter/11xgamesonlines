import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { MdArrowBackIos } from "react-icons/md";
import MainBalanceCard from '../../components/menucomp/MainBalanceCard';
import AccountStatementCard from '../../components/menucomp/AccountStatementCard';
import api from '../../utils/axiosConfig';

function AccountStatement() {
  const { user } = useSelector((state) => state.auth);
  const [balance, setbalance] = useState(106.70)
  const [currency, setcurrency] = useState('BDT')
  const [accountDataList, setAccountDataList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch account transactions (deposit/withdrawal)
  useEffect(() => {
    const fetchAccountTransactions = async () => {
      try {
        setLoading(true);
        
        // Get user ID from Redux or localStorage
        let userId = user?._id || user?.id;
        if (!userId) {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            userId = userData._id || userData.id;
          }
        }

        if (!userId) {
          console.error("User ID not found");
          setLoading(false);
          return;
        }

        const endDate = new Date().toISOString().split("T")[0];
        const startDate = new Date(
          new Date().setDate(new Date().getDate() - 30)
        ).toISOString().split("T")[0];

        const response = await api.get(
          `/user/transactions-hisrtory?startDate=${startDate}&endDate=${endDate}&page=1&limit=200`
        );
        
        if (response.data.success && response.data.data) {
          // Deposit/withdrawal entries, plus rejected deposit audit rows (no balance movement)
          const filteredTransactions = response.data.data.filter(
            (item) =>
              Number(item?.deposite || 0) > 0 ||
              Number(item?.withdrawl || 0) > 0 ||
              item?.from === 'deposit-reject'
          );

          const mappedData = filteredTransactions.map((item) => {
            const depositeAmount = Number(item?.deposite || 0);
            const withdrawalAmount = Number(item?.withdrawl || 0);
            const isDepositReject = item?.from === 'deposit-reject';
            const change = isDepositReject
              ? 0
              : depositeAmount > 0
                ? depositeAmount
                : -withdrawalAmount;
            const txnType = isDepositReject
              ? 'Deposit (rejected)'
              : depositeAmount > 0
                ? 'Deposit'
                : 'Withdrawal';

            return {
              date: new Date(item.createdAt).toLocaleString(),
              deposit: Math.abs(change),
              balance: Number(item?.amount || 0),
              change,
              remark: `${txnType} | ${item?.from || "-"} → ${item?.to || "-"}${item?.remark ? ` | ${item.remark}` : ""}`,
            };
          });
          
          setAccountDataList(mappedData);
          
          // Update balance from the latest transaction if available
          if (mappedData.length > 0) {
            setbalance(mappedData[0].balance);
          }
        } else {
          setAccountDataList([]);
        }
      } catch (error) {
        console.error('Error fetching account statement:', error);
        setAccountDataList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountTransactions();
  }, [user]);
  return (
    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full z-20 h-screen">
          <div className="bg-[#000] h-10 flex items-center">
            <div onClick={() => window.history.back()}>
              <MdArrowBackIos className="text-white text-md font-semibold" />
            </div>
            <span className="text-[18px] font-bold">
              Account Statement
            </span>
          </div>

      <div className='flex flex-col pb-5 '>
        <MainBalanceCard balance={balance} currency={currency}/>
        <div>
          {loading ? (
            <div className="text-center py-8 text-gray-600">
              Loading...
            </div>
          ) : accountDataList.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No deposit/withdrawal history found.
            </div>
          ) : (
            <AccountStatementCard accountdata={accountDataList}/>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountStatement