import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { MdArrowBackIos } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import api from '../../utils/axiosConfig';
import { getUser } from '../../features/auth/authSlice';

function GiftCoupon() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [code, setCode] = useState('');
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error('Enter a coupon code');
      return;
    }
    setClaiming(true);
    try {
      const res = await api.post('/user/coupon/claim', { couponCode: trimmed });
      toast.success(res?.data?.message || 'Coupon claimed!');
      setCode('');
      await dispatch(getUser());
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Claim failed');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white pb-24">
      <div className="sticky top-0 z-10 bg-[#141a1f] border-b border-[#252b31] px-4 py-3 flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="text-gray-300">
          <MdArrowBackIos />
        </button>
        <h1 className="text-lg font-bold">Gift Coupon</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <div className="rounded-2xl border border-[#252b31] bg-[#141a1f] p-6">
          <p className="text-4xl mb-3 text-center">🎁</p>
          <p className="text-center text-gray-300 mb-4">
            Enter your promotional coupon code to receive bonus credit.
          </p>
          <form onSubmit={handleClaim} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="COUPON CODE"
              className="w-full bg-[#0b0e11] border border-[#252b31] rounded-xl py-3 px-4 text-center font-mono tracking-widest outline-none focus:border-[#19A044]"
            />
            <button
              type="submit"
              disabled={claiming}
              className="w-full bg-[#19A044] text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {claiming ? 'Claiming...' : 'Claim Coupon'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GiftCoupon;
