// import React from "react";
// import { GrStarOutline } from "react-icons/gr";
// import { IoInformationCircle } from "react-icons/io5";

// function Fancybet({ openBetSlip, fancy1Data }) {
//   // Transform backend fancy data
//   const fancyMarkets = Array.isArray(fancy1Data)
//     ? fancy1Data.map((item) => {
//         const back1 = item.odds?.find((o) => o.oname === "back1");
//         const lay1 = item.odds?.find((o) => o.oname === "lay1");

//         return {
//           title: item.team || "-",
//           values: [
//             { value: lay1?.size ?? 0, odds: lay1?.odds ?? 0 },
//             { value: back1?.size ?? 0, odds: back1?.odds ?? 0 },
//           ],
//           min: item.min ?? 0,
//           max: item.max ?? 0,
//           status: item.status 
//         };
//       })
//     : [];

//   const formatToK = (num) => {
//     if (!num || num < 1000) return num;
//     const n = Number(num);
//     return `${n / 1000}k`;
//   };

//   return (
//     <div>
//       {/* Header */}
//       <div className="bg-[#17934e] h-10 p-2 pl-4 flex items-center gap-2">
//         <GrStarOutline className="text-white" />
//       </div>

//       {/* No / Yes Labels */}
//       <div className="flex justify-end items-center gap-10 pr-6 bg-white">
//         <span className="text-sm">No</span>
//         <span className="text-sm">Yes</span>
//       </div>

//       {/* Market List */}
//       <div className="bg-white">
//         {fancyMarkets.map((market, idx) => {
//           const isSuspended = market.status === "SUSPENDED";

//           return (
//             <React.Fragment key={idx}>
//               <div className="bg-[#eef6fb] flex justify-between items-center pl-2 mb-[2px] rounded-r-2xl">
//                 <div className="flex-1 text-lg font-bold">{market.title}</div>
//                 <div className="flex gap-1">
//                   {market.values.map((item, i) => (
//                     <div
//                       key={i}
//                       onClick={() => {
//                         if (!isSuspended) {
//                           openBetSlip({
//                             type: i === 0 ? "No" : "Yes",
//                             selection: market.title,
//                             odds: item.value,
//                           });
//                         }
//                       }}
//                       className={`flex flex-col justify-center items-center rounded-lg w-[60px] py-1 transition ${
//                         isSuspended
//                           ? "bg-gray-400 text-white cursor-not-allowed"
//                           : i === 0
//                           ? "bg-[#72BBEF] hover:opacity-90 cursor-pointer"
//                           : "bg-[#FAA9BA] hover:opacity-90 cursor-pointer"
//                       }`}
//                     >
//                       {isSuspended ? (
//                         <span className="text-sm font-semibold">Suspended</span>
//                       ) : (
//                         <>
//                           <span className="text-[1.071rem] font-bold leading-none">
//                             {item.value}
//                           </span>
//                           <span className="text-[.643rem]">
//                             {formatToK(item.odds)}
//                           </span>
//                         </>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Min/Max */}
//               <div className="flex gap-1 justify-end mr-3 py-2">
//                 <IoInformationCircle className="text-gray-400" />
//                 <span className="text-xs text-gray-400">
//                   min/max &nbsp;{market.min}/{formatToK(market.max)}
//                 </span>
//               </div>
//             </React.Fragment>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export default Fancybet;


// import React from "react";
// import { GrStarOutline } from "react-icons/gr";
// import { IoInformationCircle } from "react-icons/io5";

// function Fancybet({ openBetSlip, fancy1Data, gameid, match }) {
//   console.log("fancy1Data in fancybet", fancy1Data);
//   // Transform backend fancy data
//   const fancyMarkets = Array.isArray(fancy1Data)
//     ? fancy1Data.map((item) => {
//         const back1 = item.odds?.find((o) => o.oname === "back1");
//         const lay1 = item.odds?.find((o) => o.oname === "lay1");

//         return {
//           title: item.team || "-",
//           values: [
//             { value: back1?.odds ?? 0, odds: back1?.size ?? 0 },
//             { value: lay1?.odds ?? 0, odds: lay1?.size ?? 0 },
//           ],
//           min: item.min ?? 0,
//           max: item.max ?? 0,
//           status: item.status,
//           statusLabel: item.statusLabel,
//         };
//       })
//     : [];

//   const formatToK = (num) => {
//     if (!num || num < 1000) return num;
//     const n = Number(num);
//     return `${n / 1000}k`;
//   };

//   return (
//     <div>
//       {/* Header */}
//       <div className="bg-[#17934e] h-10 p-2 pl-4 flex items-center gap-2">
//         <GrStarOutline className="text-white" />
//       </div>

//       {/* No / Yes Labels */}
//       <div className="flex justify-end items-center gap-10 pr-6 bg-white">
//         <span className="text-sm">No</span>
//         <span className="text-sm">Yes</span>
//       </div>

//       {/* Market List */}
//       <div className="bg-white">
//         {fancyMarkets.map((market, idx) => {
//           const isSuspended = market.statusLabel === "Ball Running";

//           return (
//             <React.Fragment key={idx}>
//               <div className="bg-[#eef6fb] flex justify-between items-center pl-2 mb-[2px] rounded-r-2xl">
//                 <div className="flex-1 text-lg font-bold">{market.title}</div>
//                 <div className="flex gap-1">
//                   {market.values.map((item, i) => (
//                     <div
//                       key={i}
//                       onClick={() => {
//                         if (!isSuspended) {
//                           openBetSlip({
//                             type: i === 0 ? "No" : "Yes",
//                             selection: market.title,
//                             odds: item.value,
//                             // enriched bet context
//                             otype: i === 0 ? "lay" : "back", // No = lay, Yes = back
//                             gameId: gameid,
//                             eventName: match,
//                             // Backend expects one of: Normal, meter, line, ball, khado
//                             gameType: "Normal",
//                             marketName: market.title,
//                             min: market.min ?? 0,
//                             max: market.max ?? 0,
//                             sid: 4,
//                             marketId: fancy1Data?.[0]?.id,
//                             isFancy: true,
//                           });
//                         }
//                       }}
//                       className={`flex flex-col justify-center items-center rounded-lg w-[60px] py-1 transition ${
//                         isSuspended
//                           ? "bg-gray-400 text-white cursor-not-allowed"
//                           : i === 0
//                           ? "bg-[#72BBEF] hover:opacity-90 cursor-pointer"
//                           : "bg-[#FAA9BA] hover:opacity-90 cursor-pointer"
//                       }`}
//                     >
//                       {isSuspended ? (
//                         <span className="text-sm font-semibold">Suspended</span>
//                       ) : (
//                         <>
//                           <span className="text-[1.071rem] font-bold leading-none">
//                             {item.value}
//                           </span>
//                           <span className="text-[.643rem]">
//                             {formatToK(item.odds)}
//                           </span>
//                         </>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Min/Max */}
//               <div className="flex gap-1 justify-end mr-3 py-2">
//                 <IoInformationCircle className="text-gray-400" />
//                 <span className="text-xs text-gray-400">
//                   min/max &nbsp;{market.min}/{formatToK(market.max)}
//                 </span>
//               </div>
//             </React.Fragment>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export default Fancybet;

import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { GrStarOutline } from "react-icons/gr";
import { IoInformationCircle } from "react-icons/io5";
import { getPendingBetAmo } from "../../features/sports/betReducer";
function Fancybet({ openBetSlip, fancy1Data, gameid, match }) {
  const { pendingBet } = useSelector((state) => state.bet);
  console.log("pending bet", pendingBet)
  console.log("fancy1Data in fancybet", fancy1Data);

  // Transform backend fancy data
  const fancyMarkets = Array.isArray(fancy1Data)
    ? fancy1Data.map((item) => {
      const back1 = item.odds?.find((o) => o.oname === "back1");
      const lay1 = item.odds?.find((o) => o.oname === "lay1");

      return {
        marketid: item.marketid,
        event_id: item.event_id,
        title: item.team || "-",
        values: [
          { value: lay1?.odds ?? 0, odds: lay1?.size ?? 0 },
          { value: back1?.odds ?? 0, odds: back1?.size ?? 0 },
          
        ],
        min: item.min ?? 0,
        max: item.max ?? 0,
        status: item.status,
        statusLabel: item.statusLabel,
      };
    })
    : [];
console.log("fancyMarkets.........", fancyMarkets)
  const formatToK = (num) => {
    if (!num || num < 1000) return num;
    const n = Number(num);
    return `${n / 1000}k`;
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-[#17934e] h-10 p-2 pl-4 flex items-center gap-2">
        <GrStarOutline className="text-white" />
      </div>

      {/* No / Yes Labels */}
      <div className="flex justify-end items-center gap-10 pr-6 bg-white">
        <span className="text-sm">No</span>
        <span className="text-sm">Yes</span>
      </div>

      {/* Market List */}
      <div className="bg-white">
        {fancyMarkets.map((market, idx) => {
          const isSuspended = market.statusLabel === "Ball Running";

          return (
            <React.Fragment key={idx}>
              <div className="bg-[#eef6fb] flex justify-between items-center pl-2 mb-[2px] rounded-r-2xl">
                <div className="flex-1 text-lg font-bold">{market.title}
                <p className="text-red-500">
                  {
                    pendingBet
                      ?.filter(
                        (item) =>
                          item.gameType ===
                          "Normal" &&
                          item.teamName?.toLowerCase() ===
                          market.title?.toLowerCase()
                      )
                      .reduce(
                        (sum, item) =>
                          sum + (item.totalPrice || 0),
                        ""
                      ) // Changed initial value to 0
                  }</p>
                </div>
                
                {/* BUTTON AREA */}
                <div className="relative flex gap-1">

                  {/* OVERLAY WHEN SUSPENDED */}
                  {isSuspended && (
                    <div
                      className="absolute inset-0 flex items-center justify-center 
                                 bg-gray-500/60 bg-opacity-40 backdrop-blur-sm 
                                 rounded-lg z-10"
                    >
                      <span className="text-white font-semibold text-sm">
                        Ball Running
                      </span>
                    </div>
                  )}

                  {/* BUTTONS */}
                  {market.values.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        if (!isSuspended) {
                          openBetSlip({
                            type: i === 0 ? "No" : "Yes",
                            selection: market.title,
                            odds: item.value,
                            otype: i === 0 ? "lay" : "back", // No = lay, Yes = back
                            gameId: gameid,
                            eventName: match,
                            gameType: "Normal",
                            marketName: market.title,
                            min: market.min ?? 0,
                            max: market.max ?? 0,
                            sid: 4,
                            marketId: market.marketid,
                            fancyScore: item.odds,
                            isFancy: true,
                          });
                        }
                      }}
                      className={`flex flex-col justify-center items-center rounded-lg w-[60px] py-1 transition
                        ${i === 0 ? "bg-[#72BBEF]" : "bg-[#FAA9BA]"}
                        ${isSuspended
                          ? "opacity-40 pointer-events-none"
                          : "cursor-pointer hover:opacity-90"
                        }
                      `}
                    >
                      <span className="text-[1.071rem] font-bold leading-none">
                        {formatToK(item.odds)}
                      </span>
                      <span className="text-[.643rem]">
                      {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MIN / MAX */}
              <div className="flex gap-1 justify-end mr-3 py-2">
                <IoInformationCircle className="text-gray-400" />
                <span className="text-xs text-gray-400">
                  min/max &nbsp;{market.min}/{formatToK(market.max)}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default Fancybet;
