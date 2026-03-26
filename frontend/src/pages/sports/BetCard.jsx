// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-hot-toast';
// import { createBet, createfancyBet, getPendingBetAmo, messageClear } from '../../features/sports/betReducer';
// import { getUser } from '../../features/auth/authSlice';

// function BetCard({ odds, onClose, onBetDataChange }) {
//   const dispatch = useDispatch();
//   const { loading, successMessage, errorMessage } = useSelector((state) => state.bet);

//   const [betOdds, setBetOdds] = useState(odds?.odds || 1.01);
//   const [stake, setStake] = useState('');
//   const quickAmounts = [10, 100, 200, 500];

//   if (!odds) return null;

//   // Handlers
//   const handleOddsChange = (val) => {
//     let newOdds = parseFloat((parseFloat(betOdds) + val).toFixed(2));
//     if (newOdds < 1.01) newOdds = 1.01;
//     setBetOdds(newOdds);
//   };

//   const handleStakeChange = (val) => {
//     let newStake = stake === '' ? 0 : parseFloat(stake);
//     newStake += val;
//     if (newStake < 0) newStake = 0;
//     setStake(newStake === 0 ? '' : newStake);
//   };

//   const handleKeypad = (val) => {
//     if (val === 'del') {
//       setStake(stake.toString().slice(0, -1));
//     } else {
//       setStake((stake + val).replace(/^0+/, ''));
//     }
//   };

//   const handleQuickAmount = (amt) => {
//     setStake((prev) => (parseFloat(prev || 0) + amt).toString());
//   };

//   const min = Number(odds?.min ?? 1);
//   const max = Number(odds?.max ?? 100);

//   // Notify parent component when bet data changes
//   useEffect(() => {
//     if (onBetDataChange) {
//       // Only send data if stake has a value, otherwise send null to clear
//       if (stake && stake > 0) {
//         onBetDataChange({
//           selection: odds?.selection,
//           odds: betOdds,
//           type: odds?.type,
//           stake: stake,
//           gameId: odds?.gameId,
//           gameType: odds?.gameType,
//           marketName: odds?.marketName,
//           eventName: odds?.eventName,
//           otype: odds?.otype,
//           sid: odds?.sid,
//           marketId: odds?.marketId,
//         });
//       } else {
//         // Clear the data when stake is empty
//         onBetDataChange(null);
//       }
//     }
//   }, [betOdds, stake, odds, onBetDataChange]);

//   // Clear data when component unmounts (when BetCard closes)
//   useEffect(() => {
//     return () => {
//       if (onBetDataChange) {
//         onBetDataChange(null);
//       }
//     };
//   }, [onBetDataChange]);

//   const handlePlaceBet = async () => {
//     const numericStake = parseFloat(stake || '0');
//     if (!numericStake || Number.isNaN(numericStake)) {
//       toast.error('Enter a valid stake');
//       return;
//     }
//     // if (numericStake < min) {
//     //   toast.error(`Stake must be at least ${min}`);
//     //   return;
//     // }
//     // if (numericStake > max) {
//     //   toast.error(`Stake cannot exceed ${max}`);
//     //   return;
//     // }

//     const formData = {
//       gameId: odds?.gameId,
//       sid: odds?.sid || 4,
//       otype: odds?.otype || odds?.type, // back/lay
//       price: numericStake,
//       xValue: parseFloat(betOdds),
//       gameType: odds?.gameType || 'Match Odds',
//       gameName: odds?.gameName || 'Cricket Game', // Use the gameName from odds prop
//       teamName: odds?.selection,
//       marketName: odds?.marketName || 'Match Odds',
//       eventName: odds?.eventName,
//       marketId: odds?.marketId,
//     };

//     try {
//       // Use createfancyBet for Fancy categories the backend supports
//       const fancyGameTypes = new Set(['Normal', 'meter', 'line', 'ball', 'khado']);
//       if (fancyGameTypes.has(formData.gameType)) {
//         await dispatch(createfancyBet(formData));
//       } else {
//         await dispatch(createBet(formData));
//       }
//       await dispatch(getUser());
//       if (odds?.gameId) {
//         dispatch(getPendingBetAmo(odds.gameId));
//       }
//       setStake('');
//     } catch (e) {
//       // errors handled via slice
//     }
//   };

//   useEffect(() => {
//     if (successMessage) {
//       toast.success(successMessage);
//       dispatch(messageClear());
//       // Add a small delay to ensure user data is refreshed before closing
//       setTimeout(() => {
//         onClose?.();
//       }, 500);
//     }
//     if (errorMessage) {
//       const msg = typeof errorMessage === 'string' ? errorMessage : (errorMessage?.message || 'Bet failed');
//       toast.error(msg);
//       dispatch(messageClear());
//     }
//   }, [successMessage, errorMessage, dispatch, onClose]);

//   return (
//     <div className="bg-white p-4 w-full rounded-t-2xl">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-3">
//         <span className={`px-3 py-1 rounded-full font-semibold capitalize text-sm
//         ${['back', 'No', 'odd'].includes(odds.type) ? 'bg-[#72BBEF] text-blue-900' : 'bg-pink-200 text-pink-700'}`}>
//         {odds.type}</span>
//         <span className="text-lg font-bold">{odds.selection}</span>
//         <button onClick={onClose} className="text-2xl font-bold px-2">&times;</button>
//       </div>
//       {/* Odds and Stake Controls */}
//       <div className="flex gap-2 mb-2">
//         {/* Odds */}
//         <div className="flex-1 bg-[#eaf4fb] rounded-lg flex flex-col items-center py-2">
//           <span className="text-gray-500 text-sm mb-1">Odds</span>
//           <div className="flex items-center gap-1">
//             <button className="bg-[#17934e] text-white w-8 h-8 rounded flex items-center justify-center text-xl" onClick={() => handleOddsChange(-0.01)}>-</button>
//             <input
//               type="number"
//               step="0.01"
//               min="1.01"
//               value={betOdds}
//               onChange={e => setBetOdds(e.target.value)}
//               className="w-16 text-center border border-gray-300 rounded mx-1 text-lg font-semibold"
//             />
//             <button className="bg-[#17934e] text-white w-8 h-8 rounded flex items-center justify-center text-xl" onClick={() => handleOddsChange(0.01)}>+</button>
//           </div>
//         </div>
//         {/* Stake */}
//         <div className="flex-1 bg-[#eaf4fb] rounded-lg flex flex-col items-center py-2">
//           <span className="text-gray-500 text-sm mb-1">Stake</span>
//           <div className="flex items-center gap-1">
//             <button className="bg-[#17934e] text-white w-8 h-8 rounded flex items-center justify-center text-xl" onClick={() => handleStakeChange(-1)}>-</button>
//             <input
//               type="text"
//               value={stake}
//               onChange={e => setStake(e.target.value.replace(/[^0-9.]/g, ''))}
//               className="w-16 text-center border border-gray-300 rounded mx-1 text-lg font-semibold"
//             />
//             <button className="bg-[#17934e] text-white w-8 h-8 rounded flex items-center justify-center text-xl" onClick={() => handleStakeChange(1)}>+</button>
//           </div>
//         </div>
//       </div>
//       {/* Quick Amounts */}
//       <div className="flex gap-2 mb-2">
//         {quickAmounts.map((amt) => (
//           <button
//             key={amt}
//             className="flex-1 bg-[#17934e] text-white py-2 rounded font-semibold"
//             onClick={() => handleQuickAmount(amt)}
//           >
//             + {amt}
//           </button>
//         ))}
//         <button className="bg-[#17934e] text-white py-2 px-2 rounded flex items-center justify-center">
//           <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="9" stroke="#fff" strokeWidth="2"/><path d="M10 6v4l2 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
//         </button>
//       </div>
//       {/* Keypad */}
//       <div className="grid grid-cols-4 gap-1 mb-3">
//         {[1,2,3,4,5,6,7,8,9,0,'00','.','del'].map((key, idx) => (
//           <button
//             key={idx}
//             className="bg-[#eaf4fb] text-gray-800 py-2 rounded font-semibold text-sm"
//             onClick={() => key === 'del' ? handleKeypad('del') : handleKeypad(key.toString())}
//           >
//             {key === 'del' ? <span>&#9003;</span> : key}
//           </button>
//         ))}
//       </div>
//       {/* Min/Max */}
//       <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
//         <svg width="16" height="16" fill="none"><circle cx="8" cy="8" r="7" stroke="#888" strokeWidth="2"/><text x="8" y="12" textAnchor="middle" fontSize="10" fill="#888">i</text></svg>
//         <span>min/max &nbsp; {min}/{max}</span>
//       </div>
//       {/* Place Bet Button */}
//       <button
//         className={`w-full mt-1 mb-1 ${loading ? 'bg-gray-200 text-gray-500' : 'bg-[#17934e] text-white'} py-2 rounded font-semibold text-sm`}
//         onClick={handlePlaceBet}
//         disabled={loading}
//       >
//         {loading ? 'Placing…' : 'Place Bet'}
//       </button>
//     </div>
//   );
// }

// export default BetCard;

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { createBet, createfancyBet, getPendingBetAmo, messageClear } from '../../features/sports/betReducer';
import { getUser } from '../../features/auth/authSlice';

function BetCard({ odds, onClose, onBetDataChange }) {
  const dispatch = useDispatch();
  const { loading, successMessage, errorMessage } = useSelector((state) => state.bet);

  const [betOdds, setBetOdds] = useState(odds?.odds || 1.01);
  const [stake, setStake] = useState('');
  const quickAmounts = [10, 100, 200, 500];

  if (!odds) return null;

  // Handlers
  const handleOddsChange = (val) => {
    let newOdds = parseFloat((parseFloat(betOdds) + val).toFixed(2));
    if (newOdds < 1.01) newOdds = 1.01;
    setBetOdds(newOdds);
  };

  const handleStakeChange = (val) => {
    let newStake = stake === '' ? 0 : parseFloat(stake);
    newStake += val;
    if (newStake < 0) newStake = 0;
    setStake(newStake === 0 ? '' : newStake);
  };

  const handleKeypad = (val) => {
    if (val === 'del') {
      setStake(stake.toString().slice(0, -1));
    } else {
      setStake((stake + val).replace(/^0+/, ''));
    }
  };

  const handleQuickAmount = (amt) => {
    setStake((prev) => (parseFloat(prev || 0) + amt).toString());
  };

  const min = Number(odds?.min ?? 1);
  const max = Number(odds?.max ?? 100);

  // Notify parent component when bet data changes
  useEffect(() => {
    if (onBetDataChange) {
      // Only send data if stake has a value, otherwise send null to clear
      if (stake && stake > 0) {
        onBetDataChange({
          selection: odds?.selection,
          odds: betOdds,
          type: odds?.type,
          stake: stake,
          gameId: odds?.gameId,
          gameType: odds?.gameType,
          marketName: odds?.marketName,
          eventName: odds?.eventName,
          otype: odds?.otype,
          sid: odds?.sid,
          marketId: odds?.marketId,
        });
      } else {
        // Clear the data when stake is empty
        onBetDataChange(null);
      }
    }
  }, [betOdds, stake, odds, onBetDataChange]);

  // Clear data when component unmounts (when BetCard closes)
  useEffect(() => {
    return () => {
      if (onBetDataChange) {
        onBetDataChange(null);
      }
    };
  }, [onBetDataChange]);

  const handlePlaceBet = async () => {
    const numericStake = parseFloat(stake || '0');
    if (!numericStake || Number.isNaN(numericStake)) {
      toast.error('Enter a valid stake');
      return;
    }
    // if (numericStake < min) {
    //   toast.error(`Stake must be at least ${min}`);
    //   return;
    // }
    // if (numericStake > max) {
    //   toast.error(`Stake cannot exceed ${max}`);
    //   return;
    // }

    const formData = {
      gameId: odds?.gameId,
      sid: odds?.sid || 4,
      otype: odds?.otype || odds?.type, // back/lay
      price: numericStake,
      xValue: parseFloat(betOdds),
      gameType: odds?.gameType || 'Match Odds',
      gameName: odds?.gameName || 'Cricket Game', // Use the gameName from odds prop
      teamName: odds?.selection,
      marketName: odds?.marketName || 'Match Odds',
      eventName: odds?.eventName,
      marketId: odds?.marketId,
      fancyScore: odds?.fancyScore,
    };

    try {
      // Use createfancyBet for Fancy categories the backend supports
      const fancyGameTypes = new Set(['Normal', 'meter', 'line', 'ball', 'khado']);
      if (fancyGameTypes.has(formData.gameType)) {
        await dispatch(createfancyBet(formData));
      } else {
        await dispatch(createBet(formData));
      }
      await dispatch(getUser());
      if (odds?.gameId) {
        dispatch(getPendingBetAmo(odds.gameId));
      }
      setStake('');
    } catch (e) {
      // errors handled via slice
    }
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      // Add a small delay to ensure user data is refreshed before closing
      setTimeout(() => {
        onClose?.();
      }, 500);
    }
    if (errorMessage) {
      const msg = typeof errorMessage === 'string' ? errorMessage : (errorMessage?.message || 'Bet failed');
      toast.error(msg);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch, onClose]);

  return (
    <div className="bg-white p-4 w-full rounded-t-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-3 py-1 rounded-full font-semibold capitalize text-sm
        ${['back', 'No', 'odd'].includes(odds.type) ? 'bg-[#72BBEF] text-blue-900' : 'bg-pink-200 text-pink-700'}`}>
        {odds.type}</span>
        <span className="text-lg font-bold">{odds.selection}</span>
        <button onClick={onClose} className="text-2xl font-bold px-2">&times;</button>
      </div>
      {/* Odds and Stake Controls */}
      <div className="flex gap-2 mb-2">
        {/* Odds */}
        <div className="flex-1 bg-[#eaf4fb] rounded-lg flex flex-col items-center py-2">
          <span className="text-gray-500 text-sm mb-1">Odds</span>
          <div className="flex items-center gap-1">
            <button className="bg-[#17934e] text-white w-8 h-8 rounded flex items-center justify-center text-xl" onClick={() => handleOddsChange(-0.01)}>-</button>
            <input
              type="number"
              step="0.01"
              min="1.01"
              value={betOdds}
              onChange={e => setBetOdds(e.target.value)}
              className="w-16 text-center border border-gray-300 rounded mx-1 text-lg font-semibold"
            />
            <button className="bg-[#17934e] text-white w-8 h-8 rounded flex items-center justify-center text-xl" onClick={() => handleOddsChange(0.01)}>+</button>
          </div>
        </div>
        {/* Stake */}
        <div className="flex-1 bg-[#eaf4fb] rounded-lg flex flex-col items-center py-2">
          <span className="text-gray-500 text-sm mb-1">Stake</span>
          <div className="flex items-center gap-1">
            <button className="bg-[#17934e] text-white w-8 h-8 rounded flex items-center justify-center text-xl" onClick={() => handleStakeChange(-1)}>-</button>
            <input
              type="text"
              value={stake}
              onChange={e => setStake(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-16 text-center border border-gray-300 rounded mx-1 text-lg font-semibold"
            />
            <button className="bg-[#17934e] text-white w-8 h-8 rounded flex items-center justify-center text-xl" onClick={() => handleStakeChange(1)}>+</button>
          </div>
        </div>
      </div>
      {/* Quick Amounts */}
      <div className="flex gap-2 mb-2">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            className="flex-1 bg-[#17934e] text-white py-2 rounded font-semibold"
            onClick={() => handleQuickAmount(amt)}
          >
            + {amt}
          </button>
        ))}
        <button className="bg-[#17934e] text-white py-2 px-2 rounded flex items-center justify-center">
          <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="9" stroke="#fff" strokeWidth="2"/><path d="M10 6v4l2 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      {/* Keypad */}
      <div className="grid grid-cols-4 gap-1 mb-3">
        {[1,2,3,4,5,6,7,8,9,0,'00','.','del'].map((key, idx) => (
          <button
            key={idx}
            className="bg-[#eaf4fb] text-gray-800 py-2 rounded font-semibold text-sm"
            onClick={() => key === 'del' ? handleKeypad('del') : handleKeypad(key.toString())}
          >
            {key === 'del' ? <span>&#9003;</span> : key}
          </button>
        ))}
      </div>
      {/* Min/Max */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
        <svg width="16" height="16" fill="none"><circle cx="8" cy="8" r="7" stroke="#888" strokeWidth="2"/><text x="8" y="12" textAnchor="middle" fontSize="10" fill="#888">i</text></svg>
        <span>min/max &nbsp; {min}/{max}</span>
      </div>
      {/* Place Bet Button */}
      <button
        className={`w-full mt-1 mb-1 ${loading ? 'bg-gray-200 text-gray-500' : 'bg-[#17934e] text-white'} py-2 rounded font-semibold text-sm`}
        onClick={handlePlaceBet}
        disabled={loading}
      >
        {loading ? 'Placing…' : 'Place Bet'}
      </button>
    </div>
  );
}

export default BetCard;