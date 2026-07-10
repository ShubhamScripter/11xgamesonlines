import React,{useState, useEffect} from 'react'
import { useSelector, useDispatch } from "react-redux";
import { getUser } from '../../features/auth/authSlice';
import { normalizeCurrency, convertUsdtToBdt } from '../../utils/currency';
import useUsdtToBdtRate from '../../hooks/useUsdtToBdtRate';
import { useTranslation } from '../../i18n/LanguageContext';

function MainBalanceCard() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, isLoading } = useSelector((state) => state.auth);
  // console.log("user from balance overview", user);
  const [balance, setBalance] = useState(106.70)
  const [currency, setcurrency] = useState('BDT')
  const usdtToBdtRate = useUsdtToBdtRate();

  // Header already hydrates user; only force-refresh if we have no cached user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {

      setBalance(user.avbalance || 0);
      setcurrency(normalizeCurrency(user.currency));
    }
  }, [user]);
  return (
    <div>
        <div className='bg-[#262c32] rounded-2xl p-3'>
          <h3 className='text-white text-lg md:text-xl font-semibold'>{t('wallet.yourBalances')}</h3>
          <div className='flex items-center gap-2  mt-2'>
            <div className='bg-[#17934e] rounded-lg text-white w-fit p-1'>{currency === 'USDT' ? 'USDT ($)' : currency}</div>
            <div className='text-xl md:text-2xl font-bold text-white'>{Number(balance).toFixed(2)}</div>
          </div>
          {currency === 'USDT' && usdtToBdtRate > 0 && (
            <div className='text-sm text-gray-300 mt-1'>
              {t('wallet.approxBdt', { amount: convertUsdtToBdt(balance, usdtToBdtRate).toFixed(2) })}
              <span className='text-gray-400'> {t('wallet.usdtRate', { rate: usdtToBdtRate })}</span>
            </div>
          )}
        </div>
    </div>
  )
}

export default MainBalanceCard