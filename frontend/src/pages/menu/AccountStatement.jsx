import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { MdArrowBackIos } from "react-icons/md";
import HeaderLogin from '../../components/Header/HeaderLogin'
import MainBalanceCard from '../../components/menucomp/MainBalanceCard';
import AccountStatementCard from '../../components/menucomp/AccountStatementCard';
import api from '../../utils/axiosConfig';

function AccountStatement() {
  const { user } = useSelector((state) => state.auth);
  const [balance, setbalance] = useState(106.70)
  const [currency, setcurrency] = useState('INR')
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
          // Show only deposit/withdrawal related entries
          const filteredTransactions = response.data.data.filter(
            (item) => Number(item?.deposite || 0) > 0 || Number(item?.withdrawl || 0) > 0
          );

          const mappedData = filteredTransactions.map((item) => {
            const depositeAmount = Number(item?.deposite || 0);
            const withdrawalAmount = Number(item?.withdrawl || 0);
            const change = depositeAmount > 0 ? depositeAmount : -withdrawalAmount;
            const txnType = depositeAmount > 0 ? "Deposit" : "Withdrawal";

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
    <div>
      <HeaderLogin/>
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div
        onClick={() => window.history.back()} 
        >
          <MdArrowBackIos className='text-white text-2xl font-semibold' />
        </div>
        <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">Account Statement</span>
      </div>

      <div className='bg-[#f1f7ff] min-h-[80vh] flex flex-col pb-5 '>
        <MainBalanceCard balance={balance} currency={currency}/>
        <div className='px-2 mx-2'>
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