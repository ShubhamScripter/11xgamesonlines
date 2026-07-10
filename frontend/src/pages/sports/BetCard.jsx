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
import { createBet, createfancyBet, getPendingBet, getPendingBetAmo, messageClear } from '../../features/sports/betReducer';
import { getUser } from '../../features/auth/authSlice';
import { BsArrowRepeat } from 'react-icons/bs';
import { useTranslation } from '../../i18n/LanguageContext';
import { translateBetType } from '../../i18n/i18nHelpers';

function BetCard({ odds, onClose, onBetDataChange, matchId }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { loading, successMessage, errorMessage, eventName: pendingBets } = useSelector((state) => state.bet);

  const [betOdds, setBetOdds] = useState(1.01);
  const [stake, setStake] = useState('');
  const quickAmounts = [10, 100, 200, 500];

  const fancyGameTypes = new Set(['Normal', 'meter', 'line', 'ball', 'khado']);
  const isFancyBet =
    odds?.isFancy || fancyGameTypes.has(odds?.gameType);

  useEffect(() => {
    if (!odds) return;
    if (isFancyBet) {
      // Fancy: upper value = run line (e.g. 143), lower = rate (stored in xValue)
      setBetOdds(odds.odds ?? odds.fancyScore ?? odds.xValue ?? 1);
    } else if (odds.odds != null || odds.xValue != null) {
      setBetOdds(odds.xValue ?? odds.odds ?? 1.01);
    }
  }, [odds, isFancyBet]);

  useEffect(() => {
    const targetGameId = matchId || odds?.gameId;
    if (targetGameId) {
      dispatch(getPendingBet(targetGameId));
    }
  }, [dispatch, odds?.gameId, matchId]);

  const isSlipEmpty = !odds || !odds.selection;

  // Handlers
  const handleOddsChange = (val) => {
    const step = isFancyBet ? 1 : 0.01;
    const floor = isFancyBet ? 1 : 1.01;
    let newOdds = parseFloat((parseFloat(betOdds) + val * step).toFixed(isFancyBet ? 0 : 2));
    if (newOdds < floor) newOdds = floor;
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
          xValue: isFancyBet ? odds?.xValue : betOdds,
          fancyScore: isFancyBet ? betOdds : odds?.fancyScore,
          type: odds?.type,
          stake: stake,
          gameId: odds?.gameId,
          gameType: odds?.gameType,
          marketName: odds?.marketName,
          eventName: odds?.eventName,
          otype: odds?.otype,
          sid: odds?.sid,
          marketId: odds?.marketId,
          isFancy: isFancyBet,
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
      toast.error(t('bet.enterValidStake'));
      return;
    }
    if (min > 0 && numericStake < min) {
      toast.error(t('bet.minBet', { min }));
      return;
    }
    if (max > 0 && numericStake > max) {
      toast.error(t('bet.maxBetIs', { max }));
      return;
    }

    console.log("my odds sid is:", odds?.sid);

    const formData = {
      gameId: odds?.gameId,
      sid: odds?.sportSid ?? odds?.sportId ?? odds?.sport_id ?? 4,
      otype: odds?.otype || odds?.type, // back/lay
      price: numericStake,
      xValue: isFancyBet ? parseFloat(odds?.xValue) : parseFloat(betOdds),
      gameType: odds?.gameType || 'Match Odds',
      gameName:
        odds?.gameName ||
        (odds?.sportSid === 1
          ? 'Soccer Game'
          : odds?.sportSid === 2
            ? 'Tennis Game'
            : 'Cricket Game'),
      teamName: odds?.selection,
      marketName: odds?.marketName || 'Match Odds',
      eventName: odds?.eventName,
      oname: odds?.oname,
      marketId: odds?.marketId,
      selectionId: odds?.selectionId,
      fancyScore: isFancyBet ? parseFloat(betOdds) : odds?.fancyScore,
      isPremium: odds?.isPremium === true,
      providerCGameId: odds?.providerCGameId,
      premiumBetSource: odds?.premiumBetSource,
    };

    try {
      const action =
        fancyGameTypes.has(formData.gameType)
          ? createfancyBet(formData)
          : createBet(formData);
      await dispatch(action).unwrap();
      await dispatch(getUser());
      if (odds?.gameId) {
        dispatch(getPendingBetAmo(odds.gameId));
        dispatch(getPendingBet(odds.gameId));
      }
      setStake('');
    } catch {
      // Error toast shown from betReducer thunk
    }
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      setTimeout(() => {
        onClose?.();
      }, 500);
    }
    if (errorMessage) {
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch, onClose]);

  return (
    <div className="w-full shadow-2xl rounded-xl border border-gray-700 overflow-hidden flex flex-col">
      {/* Unified Header */}
      

      <div className="flex flex-col">

        {!isSlipEmpty && (
          <>
          <div className="bg-[#222424] text-white py-3 pl-3 flex items-center justify-between shadow-sm">
            <h3 className="font-bold text-[16px] tracking-wide">{t('bet.betSlip')}</h3>
            <button onClick={onClose} className="hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all text-[20px] leading-1 font-bold text-white">
              &times;
            </button>
          </div>
          <div className='p-2'>
            {/* Event & Market Info */}
            {/* <div className="mb-3">
              {odds.eventName && (
                <div className="text-[10px] text-gray-400 font-bold uppercase truncate mb-0.5">
                  {odds.eventName}
                </div>
              )}
              <div className="text-[11px] text-[#17934e] font-bold truncate">
                {odds.marketName || 'Match Odds'}
              </div>
            </div> */}

            {/* Selection Identification */}
            <div className={`flex items-center gap-2 mb-4 bg-gray-800 p-2 rounded-md border border-gray-400`}>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
              ${['back', 'No', 'odd'].includes(odds.type) ? 'bg-[#a5d9fe] text-blue-700' : 'bg-[#f8d0d8] text-red-700'}`}>
              {translateBetType(t, odds.type)}</span>
              <span className="text-xs font-bold text-white truncate flex-1">{odds.selection}</span>
              <span className='text-white text-[12px] font-semibold uppercase'>{odds.marketName}</span>
            </div>

            {/* Odds and Stake Controls */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {/* Odds */}
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">{t('bet.odds')}</label>
                </div>
                <div className="flex items-center h-10 border border-gray-600 rounded-lg overflow-hidden focus-within:border-[#17934e] transition-colors">
                  <button className="bg-[#222424] text-white w-10 h-full hover:bg-gray-900 flex items-center justify-center text-lg font-bold" onClick={() => handleOddsChange(-1)}>-</button>
                  <input
                    type="number"
                    step={isFancyBet ? "1" : "0.01"}
                    min={isFancyBet ? "1" : "1.01"}
                    value={betOdds}
                    onChange={e => setBetOdds(e.target.value)}
                    className="w-full text-center text-sm font-bold focus:outline-none text-white"
                  />
                  <button className="bg-[#222424] text-white w-10 h-full hover:bg-gray-900 flex items-center justify-center text-lg font-bold" onClick={() => handleOddsChange(1)}>+</button>
                </div>
              </div>
              {/* Stake */}
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">{t('bet.stake')}</label>
                  <span className="text-[8px] font-bold text-gray-400 uppercase">{t('bet.minStake', { min, max })}</span>
                </div>
                <div className="flex items-center h-10 border border-gray-600 rounded-lg overflow-hidden focus-within:border-[#17934e] transition-colors">
                  <button className="bg-[#222424] text-white w-10 h-full hover:bg-gray-900 flex items-center justify-center text-lg font-bold" onClick={() => handleStakeChange(-1)}>-</button>
                  <input
                    type="text"
                    placeholder="0"
                    value={stake}
                    onChange={e => setStake(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-full text-center text-sm font-bold focus:outline-none text-white"
                  />
                  <button className="bg-[#222424] text-white w-10 h-full hover:bg-gray-900 flex items-center justify-center text-lg font-bold" onClick={() => handleStakeChange(1)}>+</button>
                </div>
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  className="bg-gray-900 hover:bg-gray-800 hover:text-white text-gray-200 py-1.5 rounded font-bold text-[10px] transition-all border border-gray-400"
                  onClick={() => handleQuickAmount(amt)}
                >
                  +{amt}
                </button>
              ))}

            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase mb-4 px-1">
              <span>{t('bet.maxBet')}: {max}</span>
              {stake && parseFloat(stake) > 0 && (
                <span className="text-[#17934e]">{t('bet.potentialWin')}: {((parseFloat(stake) * (parseFloat(betOdds) - (odds.marketName === 'Bookmaker' ? 0 : 1))) || 0).toFixed(2)}</span>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-1 mb-5">
              {[1,2,3,4,5,6,7,8,9,0,'00','.','del'].map((key, idx) => (
                <button
                  key={idx}
                  className={`py-1.5 rounded font-bold text-xs transition-all shadow-sm border
                    ${key === 'del' ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' : 'bg-gray-900 text-gray-200 border-gray-400 hover:bg-gray-800'}
                  `}
                  onClick={() => key === 'del' ? handleKeypad('del') : handleKeypad(key.toString())}
                >
                  {key === 'del' ? <span>&#9003;</span> : key}
                </button>
              ))}
            </div>

            {/* Place Bet Button */}
            <button
              className={`w-full py-2.5 rounded-lg font-bold text-sm shadow-md transition-all transform active:scale-[0.98]
                ${loading || (stake !== '' && (parseFloat(stake) < min || parseFloat(stake) > max)) || !stake || parseFloat(stake) <= 0 ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-[#17934e] text-white hover:bg-[#147a41]'}
              `}
              onClick={handlePlaceBet}
              disabled={loading || (stake !== '' && (parseFloat(stake) < min || parseFloat(stake) > max)) || !stake || parseFloat(stake) <= 0}
            >
              {loading ? t('bet.placing') : t('bet.placeBet')}
            </button>
          </div>
          </>
        )}
       
        <div className="hidden md:block">
          <div className="bg-[#222424] text-white py-3 flex items-center justify-between shadow-sm flex w-full">
            <span className="font-bold text-gray-200 text-[16px] flex items-center gap-2 pl-3">
              {t('bet.openBets')}
            </span>
            <button 
              onClick={() => odds?.gameId && dispatch(getPendingBet(odds.gameId))}
              className="text-gray-400 hover:text-[#17934e] transition-all p-1 rounded-full hover:bg-white"
            >
              <BsArrowRepeat className="text-lg" />
            </button>
          </div>
          
          <div className="space-y-1 py-2 px-1">
            {pendingBets && pendingBets.length > 0 ? (
              pendingBets.map((bet) => (
                <div 
                  key={bet._id} 
                  className={`rounded-md border-l-[3px] ${bet.otype === 'back' ? 'bg-[#cfeffe] border-blue-600' : 'bg-[#fedddd] border-red-600'} shadow-sm hover:shadow transition-shadow relative overflow-hidden`}>
                  <div className="p-2">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-[14px] text-gray-800 leading-tight pr-1 truncate max-w-[65%]">
                        {bet.teamName} - { bet.marketName}
                      </h4>
                      <span className="text-[16px] font-bold text-gray-800">
                        {(bet.xValue || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[12px] font-bold px-3 py-0.5 rounded-[3px] uppercase tracking-tighter
                          ${bet.otype === 'back' ? 'text-blue-50 bg-blue-600' : 'text-red-50 bg-red-600'}`}>
                          {bet.otype === 'back' ? t('bet.back') : t('bet.lay')}
                        </span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[12px] text-gray-500">{t('bet.amount')}:</span>
                          <span className="font-bold text-[12px] text-gray-900">{bet.betAmount || bet.price}</span>
                        </div>
                      </div>
                      
                      {bet.fancyScore && (
                        <div className="flex items-center gap-0.5">
                          <span className="text-[12px] text-gray-600">{t('bet.score')}:</span>
                          <span className="font-bold text-[12px] text-gray-900">{bet.fancyScore}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 px-2 text-center">
                <p className="text-gray-400 text-[9px] font-medium italic">{t('bet.noActiveBets')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default BetCard;