import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig'; // assuming axios is configured here
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setLiveBalance } from '../../features/auth/authSlice';

const LuckySpinTest = () => {
  const [config, setConfig] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [spinResult, setSpinResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/lucky-spin/info');
      if (res.data.success) {
        setConfig(res.data.data.config);
        setRewards(res.data.data.rewards);
      }
    } catch (error) {
      toast.error('Failed to fetch lucky spin info');
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    try {
      setSpinning(true);
      setSpinResult(null);
      const res = await axios.post('/lucky-spin/spin');
      if (res.data.success) {
        setSpinResult(res.data.data);
        toast.success(`You won: ${res.data.data.winGift}`);
        if (res.data.data.type === 'cash') {
          dispatch(setLiveBalance(res.data.data.newBalance));
        }
      } else {
        toast.error(res.data.message || 'Spin failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error spinning');
    } finally {
      setSpinning(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white text-center">Loading Wheel Data...</div>;
  }

  return (
    <div className="p-8 text-white min-h-screen bg-[#141515] flex flex-col items-center pt-20">
      <h1 className="text-3xl font-bold mb-4 text-yellow-400">Lucky Spin Test UI</h1>
      
      <div className="bg-[#1f2020] p-6 rounded-lg w-full max-w-md shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Available Rewards</h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {rewards.map(r => (
            <div key={r.number} className="bg-gray-800 p-2 rounded text-center border border-gray-600">
              <span className="font-bold text-gray-400 block text-xs">Segment {r.number}</span>
              <span className="text-lg font-bold text-green-400">{r.winGift}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSpin}
          disabled={spinning}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-lg text-xl uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          {spinning ? 'Spinning...' : 'SPIN NOW!'}
        </button>

        {spinResult && (
          <div className="mt-6 text-center animate-bounce">
            <h3 className="text-2xl font-bold text-white mb-2">🎉 YOU WON 🎉</h3>
            <div className="bg-green-600 border-2 border-green-400 p-4 rounded-lg inline-block">
              <span className="text-4xl font-extrabold block text-white shadow-sm">
                {spinResult.winGift}
              </span>
            </div>
            {spinResult.type === 'cash' && (
              <p className="text-sm text-gray-300 mt-2">
                Your wallet balance has been updated to ৳{spinResult.newBalance}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LuckySpinTest;
