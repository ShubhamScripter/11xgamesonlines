import React,{useState, useEffect} from 'react'
import { useSelector, useDispatch } from "react-redux";
import { getUser } from '../../features/auth/authSlice';

function MainBalanceCard() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  // console.log("user from balance overview", user);
  const [balance, setBalance] = useState(106.70)
  const [currency, setcurrency] = useState('BDT')

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {

      setBalance(user.avbalance || 0);
      // setCurrency(user.currency || 'BDT');
    }
  }, [user]);
  return (
    <div>
        <div className='bg-[#262c32] rounded-2xl py-3 md:py-4  px-3 md:px-5 my-5 mx-2 md:mx-4'>
          <h3 className='text-white text-lg md:text-xl font-semibold'>Your Balances</h3>
          <div className='flex items-center gap-2  mt-2'>
            <div className='bg-[#17934e] rounded-lg text-white w-fit p-1'>{currency}</div>
            <div className='text-xl md:text-2xl font-bold text-white'>{Number(balance).toFixed(2)}</div>
          </div>
        </div>
    </div>
  )
}

export default MainBalanceCard