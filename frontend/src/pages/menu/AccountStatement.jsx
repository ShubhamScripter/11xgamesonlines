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
  const [currency, setcurrency] = useState('BDT')
  const [accountDataList, setAccountDataList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch casino bet history
  useEffect(() => {
    const fetchBetHistory = async () => {
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

        const response = await api.get(`/casino/bet-history/${userId}`);
        
        if (response.data.success && response.data.data) {
          // Map API response to match accountDataList structure
          const mappedData = response.data.data.map((item) => ({
            date: new Date(item.createdAt).toLocaleString(),
            deposit: item.bet_amount || 0,
            balance: item.wallet_after || 0,
            change: item.change || 0, // Add change field to determine profit/loss
            remark: `Casino / Game ID: ${item.game_uid || 'N/A'} / Round: ${item.game_round || 'N/A'}`
          }));
          
          setAccountDataList(mappedData);
          
          // Update balance from the latest transaction if available
          if (mappedData.length > 0) {
            setbalance(mappedData[0].balance);
          }
        } else {
          setAccountDataList([]);
        }
      } catch (error) {
        console.error('Error fetching casino bet history:', error);
        setAccountDataList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBetHistory();
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
              No casino bet history found.
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