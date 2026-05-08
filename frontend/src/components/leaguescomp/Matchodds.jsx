// import React from "react";
// import { GrStarOutline } from "react-icons/gr";
// import { IoInformationCircle } from "react-icons/io5";

// function MatchOdd({ openBetSlip, matchOddsList, gameid, match }) {
//   // Always derive from props so UI updates when odds change
//   const oddsData =
//     matchOddsList?.[0]?.section?.map((sec) => {
//       const back1 = sec?.odds?.find((o) => o.oname === "back1");
//       const lay1 = sec?.odds?.find((o) => o.oname === "lay1");

//       return {
//         team: sec?.team ?? sec?.nat ?? "-",
//         sid: sec?.sid ?? "",
//         values: [
//           { value: back1?.odds ?? "-", odds: back1?.size ?? "-" },
//           { value: lay1?.odds ?? "-", odds: lay1?.size ?? "-" },
//         ],
//         max: matchOddsList?.[0]?.max,
//         min: matchOddsList?.[0]?.min,
//         status: matchOddsList[0]?.status,
//       };
//     }) || [];

//   const formatToK = (num) => {
//     if (!num || num < 1000) return num;
//     const n = Number(num);
//     return `${n / 1000}k`;
//   };

//   return (
//     <div className="bg-white">
//       <div className="bg-[#17934e] h-10 p-2 pl-4 flex items-center gap-2">
//         <GrStarOutline className="text-white" />
//         <span className="text-white">Match Odds</span>
//       </div>

//       {/* Back / Lay Header */}
//       <div className="flex justify-end items-center gap-10 pr-6">
//         <span className="text-sm">Back</span>
//         <span className="text-sm">Lay</span>
//       </div>

//       {/* Odds List */}
//       <div className="bg-white py-2 px-2 rounded-b-2xl">
//         {oddsData?.map((team, idx) => (
//           <div
//             key={idx}
//             className="bg-[#eef6fb] flex justify-between items-center pl-2 mb-[2px] rounded-r-2xl"
//           >
//             <div className="flex-1 text-lg font-bold">{team.team}</div>
//             <div className="flex gap-1">
//               {team.values.map((item, i) => (
//                 <div
//                   key={i}
//                   onClick={() =>
//                     openBetSlip?.({
//                       type: i === 0 ? "back" : "lay",
//                       selection: team.team,
//                       odds: item.value,
//                     })
//                   }
//                   className={`flex flex-col justify-center items-center rounded-lg cursor-pointer w-[60px] py-1 ${
//                     i === 0 ? "bg-[#72BBEF]" : "bg-[#FAA9BA]"
//                   }`}
//                 >
//                   <span className="text-[1.071rem] font-bold leading-none">
//                     {item.value}
//                   </span>
//                   <span className="text-[.643rem]">
//                     {formatToK(item.odds)}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}

//         {/* Min/Max Display */}
//         <div className="flex gap-1 justify-end mr-3">
//           <IoInformationCircle className="text-gray-400" />
//           <span className="text-xs text-gray-400">
//             min/max &nbsp;
//             {oddsData[0]?.min || 0}/{formatToK(oddsData[0]?.max) || 0}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MatchOdd;


import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { createBet, getPendingBetAmo, messageClear } from '../../features/sports/betReducer'
import { toast } from 'react-hot-toast';
import { getUser } from "../../features/auth/authSlice";
import { GrStarOutline } from "react-icons/gr";
import { IoInformationCircle } from "react-icons/io5";

function MatchOdd({ openBetSlip, matchOddsList, gameid, match, selectedBetData, gameName }) {
  const dispatch = useDispatch();
  const { loading, } = useSelector(
    (state) => state.bet
  );
  const { pendingBet } = useSelector((state) => state.bet);
  const [betOdds, setBetOdds] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [seletTeamName, setSeletTeamName] = useState("");


  const [formData, setFormData] = useState({
    gameId: gameid,
    sid: 4,
    otype: "",
    price: null,
    xValue: "",
    gameType: "",
    gameName: "Cricket Game",
    teamName: "",
  });

  useEffect(() => {
    // Only fetch user data if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getUser());
    }
  }, [dispatch]);

  const setValue = (xValue, team, otype, fancyScore) => {
    setBetOdds(xValue);
    // console.log("xValue,team,sid,otype", xValue, team, sid, otype);
    setSeletTeamName(team);

    setFormData((prev) => ({
      ...prev,
      xValue: xValue,
      teamName: team,
      otype: otype,
      fancyScore,
    }));
  };

  const placeBet = async (gameType, marketName, maxAmo) => {

    // console.log("maxAmo", maxAmo);

    // if (betAmount > maxAmo) {
    //   toast.error(`Bet amount cannot exceed ${maxAmo}`);
    //   return;
    // }
    const updatedFormData = {
      ...formData,
      price: betAmount,
      gameType,
      marketName,
      eventName: match,
    };
    setFormData(updatedFormData);

    await dispatch(createBet(updatedFormData)); // Wait for bet to process
    // Only fetch user data if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      await dispatch(getUser()); // Then fetch updated user data
      dispatch(getPendingBetAmo(gameid));
    }
    setSelectedRun({ type: null, index: null }); // Reset selected run
  };

  // Always derive from props so UI updates when odds change
  const oddsData =
    matchOddsList?.[0]?.section?.map((sec) => {
      const back3 = sec?.odds?.find((o) => o.oname === "back3");
      const back2 = sec?.odds?.find((o) => o.oname === "back2");
      const back1 = sec?.odds?.find((o) => o.oname === "back1");
      const lay1 = sec?.odds?.find((o) => o.oname === "lay1");
      const lay2 = sec?.odds?.find((o) => o.oname === "lay2");
      const lay3 = sec?.odds?.find((o) => o.oname === "lay3");

      return {
        team: sec?.team ?? sec?.nat ?? "-",
        sid: sec?.sid ?? "",
        values: [
          { value: back3?.odds ?? "-", odds: back3?.size ?? "-", type: 'back' },
          { value: back2?.odds ?? "-", odds: back2?.size ?? "-", type: 'back' },
          { value: back1?.odds ?? "-", odds: back1?.size ?? "-", type: 'back' },
          { value: lay1?.odds ?? "-", odds: lay1?.size ?? "-", type: 'lay' },
          { value: lay2?.odds ?? "-", odds: lay2?.size ?? "-", type: 'lay' },
          { value: lay3?.odds ?? "-", odds: lay3?.size ?? "-", type: 'lay' },
        ],
        max: matchOddsList?.[0]?.max,
        min: matchOddsList?.[0]?.min,
        status: matchOddsList[0]?.status,
      };
    }) || [];

  const formatToK = (num) => {
    if (!num || num === "-") return "-";
    const n = Number(num);
    if (isNaN(n)) return num;
    if (n < 1000) return n.toFixed(0);
    return `${(n / 1000).toFixed(2)}k`;
  };

  const formatToTwoDecimals = (num) => {
    if (num === "-" || !num) return num;
    const n = Number(num);
    return n.toFixed(2);
  };

  useEffect(() => {
    // Only fetch pending bet amounts if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getPendingBetAmo(gameid));
    }
  }, [dispatch, gameid]);




  const getBetDetails = (pendingBet, team) => {
    // Find the bet for the current team AND gameType
    const matchedTeamBet = pendingBet?.find(
      (item) => item.teamName?.toLowerCase() === team?.toLowerCase() && item.gameType === "Match Odds"
    );

    // If no bet found for this team, get any bet from the same game to use totalPrice
    const anyBetFromGame = pendingBet?.find(
      (item) => item.gameType === "Match Odds"
    );

    const otype = matchedTeamBet?.otype || "";
    const totalBetAmount = matchedTeamBet?.totalBetAmount || 0;
    const totalPrice = matchedTeamBet?.totalPrice || anyBetFromGame?.totalPrice || 0;
    const teamName = matchedTeamBet?.teamName || "";

    return {
      otype,
      totalBetAmount,
      totalPrice,
      teamName,
    };
  };

  const [selectedRun, setSelectedRun] = useState({ type: null, index: null });

  const [betOddsValue, setBetOddsValue] = useState(0);
  const [betOddsType, setBetOddsType] = useState("");

  const handleSelect = (type, index, odds, back) => {
    setSelectedRun({ type, index });
    setBetAmount(0);
    setBetOddsValue(odds);
    setBetOddsType(back)
  };

   function MyComponent({ team, pendingBet, index }) {
    const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(
      pendingBet,
      team
    );


    const isMatchedTeam = teamName?.toLowerCase() === team?.toLowerCase();
    const existingBet = otype && (totalBetAmount > 0 || totalPrice > 0) && isMatchedTeam;

    // Display existing bet amount or totalPrice for teams without bets
    let displayValue = 0;
    let betColor = "green";

    if (existingBet) {
      // Team has a bet - show totalBetAmount in green
      displayValue = totalBetAmount;
      betColor = "green";
    } else {
      // Team has no bet - show totalPrice in red
      displayValue = totalPrice;
      betColor = "red";
    }

    // Calculate new bet profit/loss for ALL teams when BetCard is open
    let calValue = 0;
    let elseColor = "green";

    // Show profit/loss for all teams when any bet is being considered
    // Only show suggestions if the bet is from the Match Odds market
    if (selectedBetData && selectedBetData.stake && selectedBetData.odds && selectedBetData.stake > 0 && selectedBetData.gameType === "Match Odds") {
      const stake = parseFloat(selectedBetData.stake || 0);
      const odds = parseFloat(selectedBetData.odds || 1);
      const betType = selectedBetData.type;
      const selectedTeam = selectedBetData.selection?.toLowerCase();
      const currentTeam = team?.toLowerCase();
      
      // Only show suggestions if we have valid data and the odds haven't just changed
      if (stake > 0 && odds > 1 && selectedBetData.odds) {
        if (currentTeam === selectedTeam) {
          // For the selected team, show the profit/loss
          if (betType === "back") {
            calValue = stake * (odds - 1); // Profit for back bet
            elseColor = calValue >= 0 ? "green" : "red";
          } else if (betType === "lay") {
            calValue = stake * (odds - 1); // Profit for lay bet
            elseColor = calValue >= 0 ? "green" : "red";
          }
        } else {
          // For other teams, show potential loss if this team wins
          if (betType === "back") {
            calValue = -stake; // Loss if other team wins
            elseColor = "red";
          } else if (betType === "lay") {
            calValue = -stake; // Loss if other team wins
            elseColor = "red";
          }
        }
      }
    }

    return (
      <div className="text-xs" style={{ color: betColor }}>
        {displayValue > 0 ? displayValue : ""}
        {selectedBetData && selectedBetData.stake && selectedBetData.odds && selectedBetData.stake > 0 && calValue !== 0 ? (
          <span style={{ color: elseColor }}>
            ({calValue.toFixed(2)})
          </span>
        ) : ""}
      </div>
    );
  }


  return (
    <div className="py-2">
      <div className="bg-[#222424] h-10 p-2 pl-4 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <GrStarOutline className="text-white" />
          <span className="text-white font-bold">Match Odd</span>
        </div>

        <div className="flex gap-1 justify-end mr-3">
          <IoInformationCircle className="text-gray-400" />
          <span className="text-xs text-gray-400">
            min/max &nbsp;
            {oddsData[0]?.min || 0}/{formatToK(oddsData[0]?.max) || 0}
          </span>
        </div>
      </div>

      {/* Back / Lay Header */}
      <div className="grid grid-cols-12 gap-1 py-1">
        <div className="col-span-6 md:col-span-4"></div>
        <div className="col-span-6 md:col-span-8 grid grid-cols-2 md:grid-cols-6 gap-1">
          <div className="hidden md:flex justify-center text-[10px] font-bold text-gray-400 uppercase"></div>
          <div className="hidden md:flex justify-center text-[10px] font-bold text-gray-400 uppercase"></div>
          <div className="flex justify-center text-[13px] font-bold text-blue-600 uppercase">Back</div>
          <div className="flex justify-center text-[13px] font-bold text-pink-600 uppercase">Lay</div>
          <div className="hidden md:flex justify-center text-[10px] font-bold text-gray-400 uppercase"></div>
          <div className="hidden md:flex justify-center text-[10px] font-bold text-gray-400 uppercase"></div>
        </div>
      </div>

      {/* Odds List */}
      <div className="py-1 rounded-b-2xl">
        {oddsData?.map((team, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 gap-1 items-center border-b border-gray-600 py-1"
          >
            <div className="col-span-6 md:col-span-4 pl-1">
              <div className="text-sm font-bold text-white leading-tight truncate">{team.team}</div>
              <MyComponent 
                team={team.team} 
                pendingBet={pendingBet} 
                index={idx} 
              />
            </div>
            <div className="col-span-6 md:col-span-8 grid grid-cols-2 md:grid-cols-6 gap-1">
              {team.values.map((item, i) => {
                const isDesktopOnly = [0, 1, 4, 5].includes(i);
                return (
                  <div
                    key={i}
                    onClick={() =>
                      openBetSlip?.({
                        type: item.type,
                        selection: team.team,
                        odds: item.value,
                        otype: item.type,
                        gameId: gameid,
                        eventName: match,
                        gameType: "Match Odds",
                        marketName: "Match Odds",
                        gameName: gameName || "Cricket Game",
                        min: oddsData?.[0]?.min ?? 0,
                        max: oddsData?.[0]?.max ?? 0,
                        sid: oddsData,
                        marketId: matchOddsList?.[0]?.id,
                      })
                    }
                    className={`flex flex-col justify-center items-center rounded-sm cursor-pointer py-1 min-h-[36px] transition-all hover:brightness-95
                    ${item.type === 'back' ? 'bg-[#a5d9fe]' : 'bg-[#f8d0d8]'}
                    ${isDesktopOnly ? 'hidden md:flex' : 'flex'}`}
                  >
                    <span className="text-[12px] font-bold leading-none text-gray-900">
                      {item.value !== "-" ? formatToTwoDecimals(item.value) : "-"}
                    </span>
                    <span className="text-[9px] text-gray-600 font-medium">
                      {item.odds !== "-" ? formatToK(item.odds) : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default MatchOdd;
