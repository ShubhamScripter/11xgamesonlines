// import React, { useState } from "react";
// import { GrStarOutline } from "react-icons/gr";
// import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

// function Sportbook({ openBetSlip, oddevenData }) {
//   console.log("oddevenData", oddevenData);

//   // Keep track of which sections are open using their sid
//   const [openSections, setOpenSections] = useState([]);

//   const handleToggle = (sid) => {
//     setOpenSections((prev) =>
//       prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid]
//     );
//   };

//   // Transform API data
//   const sections = Array.isArray(oddevenData)
//     ? oddevenData.map((item) => {
//         const odd = item.odds?.find((o) => o.oname === "back1")?.odds ?? 0;
//         const even = item.odds?.find((o) => o.oname === "lay1")?.odds ?? 0;
//         return {
//           sid: item.sid,
//           title: item.team || "-",
//           odd,
//           even,
//           status: item.status || "OPEN",
//         };
//       })
//     : [];

//   return (
//     <div>
//       {/* Header */}
//       <div className="bg-[#17934e] h-10 p-2 pl-4 flex items-center gap-2"></div>

//       {/* Sections */}
//       {sections.map((section) => {
//         const isOpen = openSections.includes(section.sid);
//         const isSuspended = section.status === "SUSPENDED";

//         return (
//           <div key={section.sid}>
//             {/* Toggle row */}
//             <div
//               className="flex justify-between items-center p-2 cursor-pointer"
//               onClick={() => handleToggle(section.sid)}
//             >
//               <div className="flex gap-2 items-center">
//                 <GrStarOutline />
//                 <span>{section.title}</span>
//               </div>
//               <div className="cursor-pointer">
//                 {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
//               </div>
//             </div>

//             {/* Odds section */}
//             <div
//               className={`
//                 bg-white grid grid-cols-2 gap-2 p-1
//                 transition-all duration-700 overflow-hidden
//                 ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 p-0"}
//               `}
//             >
//               {/* Odd button */}
//               <div
//                 className={`flex flex-col justify-center items-center py-1 rounded ${
//                   isSuspended
//                     ? "bg-gray-400 text-white cursor-not-allowed"
//                     : "bg-[#D4E0E5] cursor-pointer"
//                 }`}
//                 onClick={() => {
//                   if (!isSuspended) {
//                     openBetSlip({
//                       type: "odd",
//                       selection: section.title,
//                       odds: section.odd,
//                     });
//                   }
//                 }}
//               >
//                 {isSuspended ? (
//                   <span className="text-sm font-semibold">Suspended</span>
//                 ) : (
//                   <>
//                     <span className="leading-none text-xs">odd</span>
//                     <span className="font-semibold text-lg">
//                       {section.odd}
//                     </span>
//                   </>
//                 )}
//               </div>

//               {/* Even button */}
//               <div
//                 className={`flex flex-col justify-center items-center py-1 rounded ${
//                   isSuspended
//                     ? "bg-gray-400 text-white cursor-not-allowed"
//                     : "bg-[#D4E0E5] cursor-pointer"
//                 }`}
//                 onClick={() => {
//                   if (!isSuspended) {
//                     openBetSlip({
//                       type: "even",
//                       selection: section.title,
//                       odds: section.even,
//                     });
//                   }
//                 }}
//               >
//                 {isSuspended ? (
//                   <span className="text-sm font-semibold">Suspended</span>
//                 ) : (
//                   <>
//                     <span className="leading-none text-xs">even</span>
//                     <span className="font-semibold text-lg">
//                       {section.even}
//                     </span>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// export default Sportbook;



// import React, { useState } from "react";
// import { GrStarOutline } from "react-icons/gr";
// import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

// function Sportbook({ openBetSlip, oddevenData }) {
//   console.log("oddevenData", oddevenData);

//   // Keep track of which sections are open using their sid
//   const [openSections, setOpenSections] = useState([]);

//   const handleToggle = (sid) => {
//     setOpenSections((prev) =>
//       prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid]
//     );
//   };

//   // Transform API data
//   const sections = Array.isArray(oddevenData)
//     ? oddevenData.map((item) => {
//         // const odd = item.odds?.find((o) => o.oname === "back1")?.odds ?? 0;
//         // const even = item.odds?.find((o) => o.oname === "lay1")?.odds ?? 0;
//         return {
//           sid: item.id,
//           title: item.name || "-",
//           oddname: item.runners[0]?.name || "-",
//           evenname: item.runners[1]?.name || "-",
//           odd: item.runners[0]?.back[0].price || 0,
//           even : item.runners[0]?.lay[0]?.price || 0,
//           status: item.status || "OPEN",
//         };
//       })
//     : [];
//     console.log("sections", sections);

//   return (
//     <div>
//       {/* Header */}
//       <div className="bg-[#17934e] h-10 p-2 pl-4 flex items-center gap-2"></div>

//       {/* Sections */}
//       {sections.map((section) => {
//         const isOpen = openSections.includes(section.sid);
//         const isSuspended = section.status === "SUSPENDED";

//         return (
//           <div key={section.sid}>
//             {/* Toggle row */}
//             <div
//               className="flex justify-between items-center p-2 cursor-pointer"
//               onClick={() => handleToggle(section.sid)}
//             >
//               <div className="flex gap-2 items-center">
//                 <GrStarOutline />
//                 <span>{section.title}</span>
//               </div>
//               <div className="cursor-pointer">
//                 {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
//               </div>
//             </div>

//             {/* Odds section */}
//             <div
//               className={`
//                 bg-white grid grid-cols-2 gap-2 p-1
//                 transition-all duration-700 overflow-hidden
//                 ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 p-0"}
//               `}
//             >
//               {/* Odd button */}
//               <div
//                 className={`flex flex-col justify-center items-center py-1 rounded ${
//                   isSuspended
//                     ? "bg-gray-400 text-white cursor-not-allowed"
//                     : "bg-[#D4E0E5] cursor-pointer"
//                 }`}
//                 onClick={() => {
//                   if (!isSuspended) {
//                     openBetSlip({
//                       type: "odd",
//                       selection: section.title,
//                       odds: section.odd,
//                     });
//                   }
//                 }}
//               >
//                 {isSuspended ? (
//                   <span className="text-sm font-semibold">Suspended</span>
//                 ) : (
//                   <>
//                     <span className="leading-none text-xs">{section.oddname}</span>
//                     <span className="font-semibold text-lg">
//                       {section.odd}
//                     </span>
//                   </>
//                 )}
//               </div>

//               {/* Even button */}
//               <div
//                 className={`flex flex-col justify-center items-center py-1 rounded ${
//                   isSuspended
//                     ? "bg-gray-400 text-white cursor-not-allowed"
//                     : "bg-[#D4E0E5] cursor-pointer"
//                 }`}
//                 onClick={() => {
//                   if (!isSuspended) {
//                     openBetSlip({
//                       type: "even",
//                       selection: section.title,
//                       odds: section.even,
//                     });
//                   }
//                 }}
//               >
//                 {isSuspended ? (
//                   <span className="text-sm font-semibold">Suspended</span>
//                 ) : (
//                   <>
//                     <span className="leading-none text-xs">{section.evenname}</span>
//                     <span className="font-semibold text-lg">
//                       {section.even}
//                     </span>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// export default Sportbook;



import React, { useState } from "react";
import { GrStarOutline } from "react-icons/gr";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

function Sportbook({ openBetSlip, oddevenData, gameid, match }) {
  console.log("oddevenData", oddevenData);

  // Keep track of which sections are open using their sid
  const [openSections, setOpenSections] = useState([]);

  const handleToggle = (sid) => {
    setOpenSections((prev) =>
      prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid]
    );
  };

  // Transform API data
  const sections = Array.isArray(oddevenData)
    ? oddevenData.map((item) => {
        const odd = item.odds?.find((o) => o.oname === "back1")?.odds ?? 0;
        const even = item.odds?.find((o) => o.oname === "lay1")?.odds ?? 0;
        return {
          sid: item.id,
          title: item.name || "-",
          oddname: item.runners[0]?.name || "-",
          evenname: item.runners[1]?.name || "-",
          odd: item.runners[0]?.back[0]?.price || 0,
          even : item.runners[1]?.back[0]?.price || 0,
          status: item.status || "OPEN",
        };
      })
    : [];
    console.log("sections", sections);
  return (
    <div>
      {/* Header */}
      <div className="bg-[#17934e] h-10 p-2 pl-4 flex items-center gap-2"></div>

      {/* Sections */}
      {sections.map((section) => {
        const isOpen = openSections.includes(section.sid);
        const isSuspended = section.status === "SUSPENDED";

        return (
          <div key={section.sid}>
            {/* Toggle row */}
            <div
              className="flex justify-between items-center p-2 cursor-pointer"
              onClick={() => handleToggle(section.sid)}
            >
              <div className="flex gap-2 items-center">
                <GrStarOutline />
                <span>{section.title}</span>
              </div>
              <div className="cursor-pointer">
                {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </div>
            </div>

            {/* Odds section */}
            <div
              className={`
                bg-white grid grid-cols-2 gap-2 p-1
                transition-all duration-700 overflow-hidden
                ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 p-0"}
              `}
            >
              {/* Odd button */}
              <div
                className={`flex flex-col justify-center items-center py-1 rounded ${
                  isSuspended
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#D4E0E5] cursor-pointer"
                }`}
                onClick={() => {
                  if (!isSuspended) {
                    openBetSlip({
                      type: "odd",
                      selection: section.title,
                      odds: section.odd,
                      // enriched bet context
                      otype: "back",
                      gameId: gameid,
                      eventName: match,
                      gameType: "MATCH_ODDS_SB",
                      marketName: section.title,
                      min: 0,
                      max: 10000,
                      sid: 4,
                      marketId: oddevenData?.[0]?.id,
                    });
                  }
                }}
              >
                {isSuspended ? (
                  <span className="text-sm font-semibold">Suspended</span>
                ) : (
                  <>
                    <span className="leading-none text-xs">{section.oddname}</span>
                    <span className="font-semibold text-lg">
                      {section.odd}
                    </span>
                  </>
                )}
              </div>

              {/* Even button */}
              <div
                className={`flex flex-col justify-center items-center py-1 rounded ${
                  isSuspended
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#D4E0E5] cursor-pointer"
                }`}
                onClick={() => {
                  if (!isSuspended) {
                    openBetSlip({
                      type: "even",
                      selection: section.title,
                      odds: section.even,
                      // enriched bet context
                      otype: "back",
                      gameId: gameid,
                      eventName: match,
                      gameType: "MATCH_ODDS_SB",
                      marketName: section.title,
                      min: 0,
                      max: 10000,
                      sid: 4,
                      marketId: oddevenData?.[0]?.id,
                    });
                  }
                }}
              >
                {isSuspended ? (
                  <span className="text-sm font-semibold">Suspended</span>
                ) : (
                  <>
                    <span className="leading-none text-xs">{section.evenname}</span>
                    <span className="font-semibold text-lg">
                      {section.even}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Sportbook;








// import React, { useState } from "react";
// import { GrStarOutline } from "react-icons/gr";
// import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

// function Sportbook({ openBetSlip, sportsbookData }) {
//   // Keep track of which sections are open using their market id
//   const [openSections, setOpenSections] = useState([]);

//   const handleToggle = (mid) => {
//     setOpenSections((prev) =>
//       prev.includes(mid) ? prev.filter((id) => id !== mid) : [...prev, mid]
//     );
//   };

//   return (
//     <div>
//       {Array.isArray(sportsbookData) && sportsbookData.map((market) => {
//         const isOpen = openSections.includes(market.id);
//         const isSuspended = market.status === "SUSPENDED";
//         return (
//           <div key={market.id || market.name}>
//             {/* Market Title */}
//             <div
//               className="flex justify-between items-center p-2 cursor-pointer"
//               onClick={() => handleToggle(market.id)}
//             >
//               <div className="flex gap-2 items-center">
//                 <GrStarOutline />
//                 <span>{market.name}</span>
//               </div>
//               <div className="cursor-pointer">
//                 {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
//               </div>
//             </div>
//             {/* Runners/Odds */}
//             <div
//               className={`
//                 bg-white grid grid-cols-${market.runners?.length || 2} gap-2 p-1
//                 transition-all duration-700 overflow-hidden
//                 ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 p-0"}
//               `}
//             >
//               {market.runners && market.runners.map((runner) => (
//                 <div
//                   key={runner.id}
//                   className={`flex flex-col justify-center items-center py-1 rounded ${
//                     isSuspended || runner.status === "SUSPENDED"
//                       ? "bg-gray-400 text-white cursor-not-allowed"
//                       : "bg-[#D4E0E5] cursor-pointer"
//                   }`}
//                   onClick={() => {
//                     if (!isSuspended && runner.status !== "SUSPENDED") {
//                       openBetSlip({
//                         selection: runner.name,
//                         odds: runner.back?.[0]?.price || "-",
//                         market: market.name,
//                       });
//                     }
//                   }}
//                 >
//                   {isSuspended || runner.status === "SUSPENDED" ? (
//                     <span className="text-sm font-semibold">Suspended</span>
//                   ) : (
//                     <>
//                       <span className="leading-none text-xs">{runner.name}</span>
//                       <span className="font-semibold text-lg">
//                         {runner.back?.[0]?.price || "-"}
//                       </span>
//                     </>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// export default Sportbook;