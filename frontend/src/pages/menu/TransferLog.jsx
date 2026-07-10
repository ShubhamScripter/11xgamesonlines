import React,{useState, useEffect} from 'react'
import { MdArrowBackIos } from "react-icons/md";
import BalanceCard from '../../components/menucomp/BalanceCard';
import { useSelector, useDispatch } from "react-redux";
import {getTransactionHistory} from '../../features/sports/betReducer';
import { formatAppDateTime } from '../../utils/time';
import { useTranslation } from '../../i18n/LanguageContext';

function TransferLog() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {transHistory} = useSelector((state) => state.bet);
  const [balanceDataList, setBalanceDataList] = useState([]);

  useEffect(() => {
   
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(
      new Date().setDate(new Date().getDate() - 30)
    ).toISOString().split("T")[0];

    dispatch(getTransactionHistory({ startDate, endDate, page: 1, limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (transHistory && Array.isArray(transHistory)) {
      const mapped = transHistory.map((txn) => ({
        date: formatAppDateTime(txn.createdAt),
        deposit: parseFloat(txn.deposite > 0 ? txn.deposite : txn.withdrawl) || 0,
        balance: parseFloat(txn.amount) || 0,
        agent: `${txn.from}  → ${txn.to} `,
      }));
      setBalanceDataList(mapped);
    }
  }, [transHistory]);
  return (
    <div>
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div
        onClick={() => window.history.back()} 
        >
          <MdArrowBackIos className='text-white text-2xl font-semibold' />
        </div>
        <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">{t('page.transferLog.title')}</span>
      </div>
      <div className='bg-[#f1f7ff] min-h-[80vh]'>
        {balanceDataList.length === 0 &&(
          <div className='bg-[#f1f7ff] min-h-[80vh] flex flex-col pb-5 '>
          <div className='px-2 mx-2'>
           
            <div className='bg-white p-4 rounded-lg shadow-md'>
              <h2 className='text-xl font-semibold mb-4'>{t('page.transferLog.heading')}</h2>
              <p className='text-gray-600'>{t('page.transferLog.noData')}</p>
            </div>
          </div>
        </div>
        )}
        <div className='bg-[#f1f7ff] min-h-[80vh] flex flex-col pb-5 '>
        <div className='px-2 mx-2'>
          <BalanceCard balancedata={balanceDataList}/>
        </div>
      </div>
      </div>
    </div>
  )
}

export default TransferLog
