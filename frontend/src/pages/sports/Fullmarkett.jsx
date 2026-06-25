// import React from 'react'
// import Header from '../../components/Header/Header'
// import HeaderLoginBack from '../../components/Header/HeaderLoginBack';
// import HeaderLogin from '../../components/Header/HeaderLogin';
// import graph from '../../assets/graph.png'
// import Live from '../../assets/icon/live.webp'
// import { GrStarOutline } from "react-icons/gr";
// import { IoInformationCircle } from "react-icons/io5";
// import { useState,useEffect} from 'react'
// import Matchodds from '../../components/leaguescomp/Matchodds';
// import Bookmakers from '../../components/leaguescomp/Bookmakers';
// import Fancybet from '../../components/leaguescomp/Fancybet';
// import Sportbook from '../../components/leaguescomp/Sportbook';
// import { useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import BetCard from './BetCard';
// import { host } from '../../utils/axiosConfig';
// import { fetchCricketBatingData, fetchCricketPremiumFancy } from '../../features/sports/cricketSlice';
// function Fullmarkett() {
//   const dispatch = useDispatch();
//   const { gameid } = useParams() || {};
//   const { match } = useParams() || {};
//   const [selected, setSelected] = useState("Fancybet");
//   const[isFacncyActive, setIsFancyActive] = useState(true);
//   const [isLive, setIsLive] = useState(false);

//   const [betSlipOpen, setBetSlipOpen] = useState(false);
//   const [betSlipData, setBetSlipData] = useState(null);
  
//   const [selectedRun, setSelectedRun] = useState({ type: null, index: null });
//   // ✅ WebSocket Setup (Real-time updates)
//   const [bettingData, setBettingData] = useState(null);
//   const [betOdds, setBetOdds] = useState(null);
//   const [betAmount, setBetAmount] = useState(0);
//   const [loader, setLoader] = useState(false);
//   const [teamName, setTeamName] = useState("");
//   // const { loading, successMessage, errorMessage } = useSelector(
//   //   (state) => state.bet
//   // );
//   const { battingData } = useSelector((state) => state.cricket);
//   console.log("betting data....",battingData)
//   // console.log(battingData[0].section[0].nat)
//   const { userInfo } = useSelector((state) => state.auth);
//   // const { pendingBet } = useSelector((state) => state.bet);
//   const [formData, setFormData] = useState({
//     gameId: gameid,
//     sid: 4,
//     otype: "",
//     price: null,
//     xValue: "",
//     gameType: "",
//     gameName: "Cricket Game",
//     teamName: "",
//   });

//   // ✅ Fetch once before using socket (optional)
//   useEffect(() => {
//     if (gameid) {
//       setLoader(true);
//       dispatch(fetchCricketBatingData(gameid)).finally(() => {
//         setLoader(false);
//       });
//     }
//   }, [dispatch, gameid]);

//   useEffect(() => {
//     if (!gameid) return;

//     const socket = new WebSocket(host);

//     // socket.onopen = () => {
//     //   console.log("✅ WebSocket connected");
//     //   socket.send(JSON.stringify({ type: "subscribe", gameid }));
//     // };

//     socket.onopen = () => {
//       socket.send(JSON.stringify({ type: "subscribe", gameid, apitype: "cricket" }));
//     };

//     socket.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         if (message.gameid === gameid) {
//           setBettingData(message.data);
//         }
//       } catch (err) {
//         console.error("❌ Error parsing message:", err);
//       }
//     };

//     socket.onerror = (err) => {
//       console.error("❌ WebSocket error:", err);
//     };

//     socket.onclose = () => {
//       console.log("❌ WebSocket disconnected");
//     };

//     return () => socket.close();
//   }, [gameid]);

//     useEffect(() => {
//     let intervalId;

//     if (gameid) {
//       // Set loader true before initial fetch
//       setLoader(true);

//       const fetchData = async () => {
//         await dispatch(fetchCricketBatingData(gameid));
//         setLoader(false); // Stop loader after first successful fetch
//       };

//       fetchData();

//       // intervalId = setInterval(() => {
//       //   dispatch(fetchCricketBatingData(gameid));
//       // }, 2000);
//     }


//     return () => {
//       clearInterval(intervalId);
//     };
//   }, [gameid]);

//   useEffect(() => {
//     setBettingData(battingData);
//   }, [battingData]);

//   // useEffect(() => {
//   //   dispatch(getUser());
//   // }, [dispatch]);

//   // const matchOddsList = Array.isArray(bettingData)
//   //   ? bettingData.filter(
//   //     (item) =>
//   //       item?.mtype === "MATCH_ODDS" 
//   //   )
//   //   : [];

//   // const matchOddsList = Array.isArray(battingData)
//   // ? battingData.filter(
//   //     (item) =>
//   //       item.name === "Match Odds" ||
//   //       item.mtype === "MATCH_ODDS"
//   //   )
//   // : [];


// const matchOddsList = Array.isArray(battingData)
//   ? battingData
//       .filter(
//         (item) =>
//           item.name === "Match Odds" ||
//           item.mtype === "MATCH_ODDS"
//       )
//       .map((market) => ({
//         ...market,
//         section: market.runners
//           ? market.runners.map((runner) => ({
//               team: runner.name,
//               sid: runner.id,
//               odds: [
//                 ...(runner.back?.[0]
//                   ? [{ oname: "back1", odds: runner.back[0].price, size: runner.back[0].size }]
//                   : []),
//                 ...(runner.lay?.[0]
//                   ? [{ oname: "lay1", odds: runner.lay[0].price, size: runner.lay[0].size }]
//                   : []),
//               ],
//               max: market.maxLiabilityPerBet ?? market.max,
//               min: market.minLiabilityPerBet ?? market.min,
//               status: runner.status,
//             }))
//           : [],
//         max: market.maxLiabilityPerBet ?? market.max,
//         min: market.minLiabilityPerBet ?? market.min,
//         status: market.status,
//       }))
//   : [];
//  console.log("match odd list",matchOddsList)
//   const tiedMatchList = Array.isArray(bettingData)
//     ? bettingData.filter(
//       (item) =>
//         item?.mname === "Tied Match" || item?.mname === "Bookmaker IPL CUP"
//     )
//     : [];


//   // const BookmakerList = Array.isArray(bettingData)
//   //   ? bettingData.filter((item) => item.mname === "Bookmaker")
//   //   : [];

//   // const BookmakerList = Array.isArray(bettingData)
//   //   ? bettingData.filter((item) => item.name === "BOOKMAKER")
//   //   : [];

//   const BookmakerList = Array.isArray(battingData)
//   ? battingData
//       .filter((item) => item.name === "BOOKMAKER")
//       .map((market) => ({
//         ...market,
//         section: market.runners
//           ? market.runners.map((runner) => ({
//               nat: runner.name,
//               sid: runner.id,
//               odds: [
//                 ...(runner.back?.[0]
//                   ? [{ oname: "back1", odds: runner.back[0].price, size: runner.back[0].size }]
//                   : []),
//                 ...(runner.lay?.[0]
//                   ? [{ oname: "lay1", odds: runner.lay[0].price, size: runner.lay[0].size }]
//                   : []),
//               ],
//               max: market.maxLiabilityPerBet ?? market.max,
//               min: market.minLiabilityPerBet ?? market.min,
//               gstatus: runner.status,
//             }))
//           : [],
//         max: market.maxLiabilityPerBet ?? market.max,
//         min: market.minLiabilityPerBet ?? market.min,
//         status: market.status,
//       }))
//   : [];

//   console.log("bookmaker list",BookmakerList)

//   // const fancy1List = bettingData?.filter((item) => item.mname === "fancy1");

//   // const fancy1List = bettingData?.filter((item) => item.mtype === "INNINGS_RUNS");
//   // console.log("fancy1 list ",fancy1List)

//   // const fancy1Data =
//   //   Array.isArray(fancy1List) && fancy1List.length > 0 && fancy1List[0].section
//   //     ? fancy1List[0].section.map((sec) => ({
//   //       team: sec.nat,
//   //       sid: sec.sid,
//   //       odds: sec.odds,
//   //       max: sec.max,
//   //       min: sec.min,
//   //       mname: fancy1List[0].mname, // ✅ Access from first item
//   //       status: fancy1List[0].status, // ✅ Access from first item
//   //     }))
//   //     : [];
//     // console.log("fancy1 data",fancy1Data) oddeven

//   const fancy1List = Array.isArray(battingData)
//   ? battingData.filter((item) => item.mtype === "INNINGS_RUNS")
//   : [];

// const fancy1Data = fancy1List.flatMap((market) =>
//   (market.runners || []).map((runner) => ({
//     team: runner.name,
//     sid: runner.id,
//     odds: [
//       ...(runner.back?.[0]
//         ? [{ oname: "back1", odds: runner.back[0].price, size: runner.back[0].size }]
//         : []),
//       ...(runner.lay?.[0]
//         ? [{ oname: "lay1", odds: runner.lay[0].price, size: runner.lay[0].size }]
//         : []),
//     ],
//     min: market.minLiabilityPerBet ?? market.min ?? null,
//     max: market.maxLiabilityPerBet ?? market.max ?? null,
//     status: market.status ?? runner.status ?? "OPEN",
//   }))
// );

//   const oddevenList = bettingData?.filter((item) => item.mname === "oddeven");
//   console.log("odd even list ",oddevenList)
//   const oddevenData =
//     Array.isArray(oddevenList) && oddevenList.length > 0 && oddevenList[0].section
//       ? oddevenList[0]?.section.map((sec) => ({
//         team: sec.nat,
//         sid: sec.sid,
//         odds: sec.odds,
//         max: sec.max,
//         min: sec.min,
//         mname: fancy1List[0]?.mname, // ✅ Access from first item
//         status: fancy1List[0]?.status, // ✅ Access from first item
//       }))
//       : [];
//     console.log("oddevenData",oddevenData)

//   const openBetSlip = (betData) => {
//     setBetSlipData(betData);
//     setBetSlipOpen(true);
//   };

//   const closeBetSlip = () => {
//     setBetSlipOpen(false);
//     setBetSlipData(null);
//   };
//   let content;

//   if (selected === "Fancybet") {
//     content= <Fancybet openBetSlip={openBetSlip} fancy1Data={fancy1Data} gameid={gameid} match={match} />;
//   } else if (selected === "Sportbook") {
//     content = <Sportbook openBetSlip={openBetSlip} oddevenData={oddevenData} gameid={gameid} match={match}/>;
//   }
//   return (
//     <div>
//       <HeaderLoginBack />
//       <div className='bg-[#1e1e1e] h-10 flex justify-around items-center '>
//         <div className={`text-white cursor-pointer ${isLive ?'border-b-2':'' } ${isLive ?'font-bold':'' }`}
//         onClick={() => setIsLive(true)}
//         >Live</div>
//         <div  className={`text-white cursor-pointer ${!isLive ?'border-b-2':'' } ${!isLive ?'font-bold':'' }`}
//         onClick={() => setIsLive(false)}
//         >ScoreBoard</div>
//       </div>
//       <div className='bg-white h-10 p-2 flex justify-around items-center'>
//         <span className='font-semibold'>{battingData[0]?.runners?.[0]?.name || ""}</span>
//         <span className='text-2xl'>-</span>
//         <span className='font-semibold'>{battingData[0]?.runners?.[1]?.name || ""}</span>
//       </div>
//       <div>
//         {isLive? <img src={Live} alt="graph" />:<img src={graph} alt="graph" />}
//       </div>
//       <div className='bg-[#1e1e1e] h-10 p-2 pl-4 pr-4 flex justify-between items-center'>
//         <span className='text-white'>Exchange</span>
//         <span className='text-[#17934e]'>Matched INR &nbsp; 14,987,086.26</span>
//       </div>
//       <div>
//         {/* Match Odds Section */}
//         <Matchodds openBetSlip={openBetSlip} matchOddsList={matchOddsList} gameid={gameid} match={match}/>     
//         <div className='bg-[#eef6fb] pb-5'>
//           {/* Bookmaker Section */}
//           <Bookmakers openBetSlip={openBetSlip} BookmakerList={BookmakerList} gameid={gameid} match={match}/>
//           {/* Fancybet & sportsbook Section */}
//           <div className='px-4 pt-4'>
//             <div className='bg-black h-12  pl-4 flex  items-center rounded-t-2xl'>
//               <div className={`rounded-t-xl p-2 mt-4 text-white ${isFacncyActive ? 'bg-[#17934e]' : 'bg-transparent'}`}
//               onClick={() => {
//                 setSelected("Fancybet");
//                 setIsFancyActive(true);
//               }}
//               >Fancybet
//               </div>
//               <div className={`rounded-t-xl p-2 mt-4 text-white ${!isFacncyActive ? 'bg-[#17934e]' : 'bg-transparent'}`}
//               onClick={() => {
//                 setSelected("Sportbook");
//                 setIsFancyActive(false);
//               }}
//               >Sportbook
//               </div>
//             </div>
//             {content}

//             {/* Bet Slip Modal */}
//             {betSlipOpen && (
//             <div className="fixed inset-0 z-50 flex w-full items-end justify-center  bg-opacity-40">
//             <div className="w-full max-w-[480px] mx-auto bg-white rounded-t-2xl shadow-lg p-4 animate-slide-up">
//             <BetCard odds={betSlipData} onClose={closeBetSlip} />
//             </div>
//             </div>
//             )}
//             <style>{`
//             .animate-slide-up {
//             animation: slideUp 0.3s ease;
//             }
//            @keyframes slideUp {
//            from { transform: translateY(100%); }
//            to { transform: translateY(0); }
//            }
//            `}</style>

//           </div>

//         </div>

//       </div>
//     </div>
//   )
// }

// export default Fullmarkett

// import React, { useState, useEffect } from 'react'
// import HeaderLoginBack from '../../components/Header/HeaderLoginBack';
// import graph from '../../assets/graph.png'
// import Live from '../../assets/icon/live.webp'
// import Matchodds from '../../components/leaguescomp/Matchodds';
// import Bookmakers from '../../components/leaguescomp/Bookmakers';
// import Fancybet from '../../components/leaguescomp/Fancybet';
// import Sportbook from '../../components/leaguescomp/Sportbook';
// import { useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import BetCard from './BetCard';
// import { host } from '../../utils/axiosConfig';
// import { fetchCricketBatingData, fetchCricketPremiumFancy } from '../../features/sports/cricketSlice';
// import Spinner from '../../components/Spinner'
// function Fullmarkett() {
//   const dispatch = useDispatch();
//   const { gameid } = useParams() || {};
//   const { match } = useParams() || {};
//   const [selected, setSelected] = useState("Fancybet");
//   const [isFacncyActive, setIsFancyActive] = useState(true);
//   const [isLive, setIsLive] = useState(false);

//   const [betSlipOpen, setBetSlipOpen] = useState(false);
//   const [betSlipData, setBetSlipData] = useState(null);

//   // WebSocket Setup (Real-time updates)
//   const [bettingData, setBettingData] = useState([]);
//   const [loader, setLoader] = useState(false);

//   const { battingData } = useSelector((state) => state.cricket);

//   // Fetch once before using socket (optional)
//   useEffect(() => {
//     if (gameid) {
//       setLoader(true);
//       dispatch(fetchCricketBatingData(gameid)).finally(() => {
//         setLoader(false);
//       });
//     }
//   }, [dispatch, gameid]);

//   useEffect(() => {
//     if (!gameid) return;

//     const socket = new WebSocket(host);

//     socket.onopen = () => {
//       socket.send(JSON.stringify({ type: "subscribe", gameid, apitype: "cricket" }));
//     };

//     // socket.onmessage = (event) => {
//     //   try {
//     //     const message = JSON.parse(event.data);
//     //     console.log("SOCKET MESSAGE:", message);
//     //     if (message.gameid === gameid) {
//     //       setBettingData(message.data);
//     //     }
//     //   } catch (err) {
//     //     console.error("❌ Error parsing message:", err);
//     //   }
//     // };
//     socket.onmessage = (event) => {
//   try {
//     const message = JSON.parse(event.data);
//     console.log("SOCKET MESSAGE:", message);
//     if (message.gameid === gameid && Array.isArray(message.data)) {
//       setBettingData(message.data);
//     }
//   } catch (err) {
//     console.error("❌ Error parsing message:", err);
//   }
// };

//     socket.onerror = (err) => {
//       console.error("❌ WebSocket error:", err);
//     };

//     socket.onclose = () => {
//       console.log("❌ WebSocket disconnected");
//     };

//     return () => socket.close();
//   }, [gameid]);

//   // On initial load, fetch once for SSR/first render
//   useEffect(() => {
//     let intervalId;
//     if (gameid) {
//       setLoader(true);
//       const fetchData = async () => {
//         await dispatch(fetchCricketBatingData(gameid));
//         setLoader(false);
//       };
//       fetchData();
//     }
//     return () => {
//       clearInterval(intervalId);
//     };
//   }, [gameid]);

//   useEffect(() => {
//     setBettingData(battingData);
//   }, [battingData]);

//   // Use socket data for all lists
//   const dataSource = Array.isArray(bettingData) && bettingData.length > 0 ? bettingData : battingData;

//   // Match Odds List
//   const matchOddsList = Array.isArray(dataSource)
//     ? dataSource
//         .filter(
//           (item) =>
//             item.name === "Match Odds" ||
//             item.mtype === "MATCH_ODDS"
//         )
//         .map((market) => ({
//           ...market,
//           section: market.runners
//             ? market.runners.map((runner) => ({
//                 team: runner.name,
//                 sid: runner.id,
//                 odds: [
//                   ...(runner.back?.[0]
//                     ? [{ oname: "back1", odds: runner.back[0].price, size: runner.back[0].size }]
//                     : []),
//                   ...(runner.lay?.[0]
//                     ? [{ oname: "lay1", odds: runner.lay[0].price, size: runner.lay[0].size }]
//                     : []),
//                 ],
//                 max: market.maxLiabilityPerBet ?? market.max,
//                 min: market.minLiabilityPerBet ?? market.min,
//                 status: runner.status,
//               }))
//             : [],
//           max: market.maxLiabilityPerBet ?? market.max,
//           min: market.minLiabilityPerBet ?? market.min,
//           status: market.status,
//         }))
//     : [];

//   // Bookmaker List
//   const BookmakerList = Array.isArray(dataSource)
//     ? dataSource
//         .filter((item) => item.name === "BOOKMAKER")
//         .map((market) => ({
//           ...market,
//           section: market.runners
//             ? market.runners.map((runner) => ({
//                 nat: runner.name,
//                 sid: runner.id,
//                 odds: [
//                   ...(runner.back?.[0]
//                     ? [{ oname: "back1", odds: runner.back[0].price, size: runner.back[0].size }]
//                     : []),
//                   ...(runner.lay?.[0]
//                     ? [{ oname: "lay1", odds: runner.lay[0].price, size: runner.lay[0].size }]
//                     : []),
//                 ],
//                 max: market.maxLiabilityPerBet ?? market.max,
//                 min: market.minLiabilityPerBet ?? market.min,
//                 gstatus: runner.status,
//               }))
//             : [],
//           max: market.maxLiabilityPerBet ?? market.max,
//           min: market.minLiabilityPerBet ?? market.min,
//           status: market.status,
//         }))
//     : [];

//   // Fancybet List/Data
//   const fancy1List = Array.isArray(dataSource)
//     ? dataSource.filter((item) => item.mtype === "INNINGS_RUNS")
//     : [];

//   const fancy1Data = fancy1List.flatMap((market) =>
//     (market.runners || []).map((runner) => ({
//       team: runner.name,
//       sid: runner.id,
//       odds: [
//         ...(runner.back?.[0]
//           ? [{ oname: "back1", odds: runner.back[0].price, size: runner.back[0].line }]
//           : []),
//         ...(runner.lay?.[0]
//           ? [{ oname: "lay1", odds: runner.lay[0].price, size: runner.lay[0].line }]
//           : []),
//       ],
//       min: market.minLiabilityPerBet ?? market.min ?? null,
//       max: market.maxLiabilityPerBet ?? market.max ?? null,
//       status: market.status ?? runner.status ?? "OPEN",
//     }))
//   );

//   // Odd/Even List/Data (example: filter by mname or another property as needed)
//   const oddevenList = Array.isArray(dataSource)
//     ? dataSource.filter((item) => item.mname === "oddeven" || item.name?.toLowerCase().includes("odd even"))
//     : [];

//   const oddevenData =
//     Array.isArray(oddevenList) && oddevenList.length > 0 && oddevenList[0].section
//       ? oddevenList[0].section.map((sec) => ({
//           team: sec.nat,
//           sid: sec.sid,
//           odds: sec.odds,
//           max: sec.max,
//           min: sec.min,
//           mname: oddevenList[0].mname,
//           status: oddevenList[0].status,
//         }))
//       : [];


// const sportsbookData = Array.isArray(dataSource)
//   ? dataSource.filter(
//       (item) =>
//         item.mtype === "MATCH_ODDS_SB" &&
//         item.name !== "BOOKMAKER" &&
//         item.name !== "MINI BOOKMAKER" &&
//         !item.name.startsWith("BM ")
//     )
//   : [];

// // console.log("sportsbookData.....", sportsbookData);

// // console.log("oddevenData", oddevenData);
//   const openBetSlip = (betData) => {
//     setBetSlipData(betData);
//     setBetSlipOpen(true);
//   };

//   const closeBetSlip = () => {
//     setBetSlipOpen(false);
//     setBetSlipData(null);
//   };

//   let content;
//   if (selected === "Fancybet") {
//     content = <Fancybet openBetSlip={openBetSlip} fancy1Data={fancy1Data} gameid={gameid} match={match} />;
//   } else if (selected === "Sportbook") {
//     // content = <Sportbook openBetSlip={openBetSlip} oddevenData={oddevenData} gameid={gameid} match={match} />;
//     // content = <Sportbook openBetSlip={openBetSlip} sportsbookData={sportsbookData} gameid={gameid} match={match} />;
//     content = <Sportbook openBetSlip={openBetSlip} oddevenData={sportsbookData} gameid={gameid} match={match} />;
//   }

//   // Team names for header
//   const team1 = dataSource?.[0]?.runners?.[0]?.name || "";
//   const team2 = dataSource?.[0]?.runners?.[1]?.name || "";

//   return (
//     <div>
//       {/* Loader Spinner */}
//       {loader && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-40">
//           <Spinner />
//         </div>
//       )}
//       <HeaderLoginBack />
//       <div className='bg-[#1e1e1e] h-10 flex justify-around items-center '>
//         <div className={`text-white cursor-pointer ${isLive ? 'border-b-2' : ''} ${isLive ? 'font-bold' : ''}`}
//           onClick={() => setIsLive(true)}
//         >Live</div>
//         <div className={`text-white cursor-pointer ${!isLive ? 'border-b-2' : ''} ${!isLive ? 'font-bold' : ''}`}
//           onClick={() => setIsLive(false)}
//         >ScoreBoard</div>
//       </div>
//       <div className='bg-white h-10 p-2 flex justify-around items-center'>
//         <span className='font-semibold'>{team1}</span>
//         <span className='text-2xl'>-</span>
//         <span className='font-semibold'>{team2}</span>
//       </div>
//       <div>
//         {isLive ? <img src={Live} alt="graph" /> : <img src={graph} alt="graph" />}
//       </div>
//       <div className='bg-[#1e1e1e] h-10 p-2 pl-4 pr-4 flex justify-between items-center'>
//         <span className='text-white'>Exchange</span>
//         <span className='text-[#17934e]'>Matched INR &nbsp; 14,987,086.26</span>
//       </div>
//       <div>
//         {/* Match Odds Section */}
//         <Matchodds openBetSlip={openBetSlip} matchOddsList={matchOddsList} gameid={gameid} match={match} />
//         <div className='bg-[#eef6fb] pb-5'>
//           {/* Bookmaker Section */}
//           <Bookmakers openBetSlip={openBetSlip} BookmakerList={BookmakerList} gameid={gameid} match={match} />
//           {/* Fancybet & sportsbook Section */}
//           <div className='px-4 pt-4'>
//             <div className='bg-black h-12  pl-4 flex  items-center rounded-t-2xl'>
//               <div className={`rounded-t-xl p-2 mt-4 text-white ${isFacncyActive ? 'bg-[#17934e]' : 'bg-transparent'}`}
//                 onClick={() => {
//                   setSelected("Fancybet");
//                   setIsFancyActive(true);
//                 }}
//               >Fancybet
//               </div>
//               <div className={`rounded-t-xl p-2 mt-4 text-white ${!isFacncyActive ? 'bg-[#17934e]' : 'bg-transparent'}`}
//                 onClick={() => {
//                   setSelected("Sportbook");
//                   setIsFancyActive(false);
//                 }}
//               >Sportbook
//               </div>
//             </div>
//             {content}

//             {/* Bet Slip Modal */}
//             {betSlipOpen && (
//               <div className="fixed inset-0 z-50 flex w-full items-end justify-center  bg-opacity-40">
//                 <div className="w-full max-w-[480px] mx-auto bg-white rounded-t-2xl shadow-lg p-4 animate-slide-up">
//                   <BetCard odds={betSlipData} onClose={closeBetSlip} />
//                 </div>
//               </div>
//             )}
//             <style>{`
//               .animate-slide-up {
//                 animation: slideUp 0.3s ease;
//               }
//               @keyframes slideUp {
//                 from { transform: translateY(100%); }
//                 to { transform: translateY(0); }
//               }
//             `}</style>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Fullmarkett






import React from 'react'
import Header from '../../components/Header/Header'
import HeaderLoginBack from '../../components/Header/HeaderLoginBack';
import HeaderLogin from '../../components/Header/HeaderLogin';
import graph from '../../assets/graph.png'
import Live from '../../assets/icon/live.webp'
import { GrStarOutline } from "react-icons/gr";
import { IoInformationCircle } from "react-icons/io5";
import { useState, useEffect, useRef, useMemo } from 'react'
import { getUser } from '../../features/auth/authSlice';
import Matchodds from '../../components/leaguescomp/Matchodds';
import Bookmakers from '../../components/leaguescomp/Bookmakers';
import Fancybet from '../../components/leaguescomp/Fancybet';
import PremiumFancy from '../../components/leaguescomp/PremiumFancy';
import Sportbook from '../../components/leaguescomp/Sportbook';
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {createBet,createfancyBet,getPendingBetAmo,messageClear} from '../../features/sports/betReducer'
import BetCard from './BetCard';
import { wsClient } from '../../utils/wsClient';
import { fetchCricketBatingData, fetchCricketPremiumFancy } from '../../features/sports/cricketSlice';
import { div } from 'motion/react-client';
import { toast } from 'react-hot-toast';
import {
  getSportsMediaUrls,
  getBetfairTvLinkByEventId,
  getBetfairTvLinkSync,
  DEFAULT_BULKAPI_KEY,
  SPORTS_MEDIA_TYPE,
} from '../../utils/sportsMediaUrls';
import api from '../../utils/axiosConfig';
import { getMarketMaxLimit, getMarketMinLimit } from '../../utils/marketLimits';
import {
  isProviderDFancyMarket,
  mapPremiumFancyData,
  mapProviderDFancyGameType,
  normalizeFancySectionOdds,
  parseBettingPayload,
} from '../../utils/bettingPayloadUtils';

// Prevent duplicate toasts (e.g., React strict-mode double effects / rapid re-renders)
let lastBetToastKey = null;
let lastBetToastAt = 0;

function Fullmarkett() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { gameid } = useParams() || {};
  const { match } = useParams() || {};
  const key = DEFAULT_BULKAPI_KEY;
  const mediaUrls = getSportsMediaUrls({
    sport: SPORTS_MEDIA_TYPE.CRICKET,
    gameid,
    key,
  });
  const hasCheckedRef = useRef(false); // ✅ run only once
  const [selected, setSelected] = useState("Fancybet");
  const[isFacncyActive, setIsFancyActive] = useState(true);
  const [premiumFancyData, setPremiumFancyData] = useState([]);
  const [providerCGameId, setProviderCGameId] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [TiedOddSelected, setTiedOddSelected] = useState("odds");

  const [betSlipOpen, setBetSlipOpen] = useState(false);
  const [betSlipData, setBetSlipData] = useState(null);
  const [selectedBetData, setSelectedBetData] = useState(null);
  
  const [selectedRun, setSelectedRun] = useState({ type: null, index: null });
  // ✅ WebSocket Setup (Real-time updates)
  const [bettingData, setBettingData] = useState(null);
  const [betOdds, setBetOdds] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [loader, setLoader] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [scorecardHtml, setScorecardHtml] = useState(null);
  const [scorecardLoading, setScorecardLoading] = useState(false);
  const scorecardIframeRef = useRef(null);
  const [liveStreamHtml, setLiveStreamHtml] = useState(null);
  const [liveStreamSrc, setLiveStreamSrc] = useState(null);
  const [liveStreamLoading, setLiveStreamLoading] = useState(false);
  const liveStreamIframeRef = useRef(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState("");
  const [scorecardUrl, setScorecardUrl] = useState("");
  const [scorecardAllow, setScorecardAllow] = useState(
    "autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope"
  );
  const { loading, successMessage, errorMessage } = useSelector(
    (state) => state.bet
  );
  const {
    battingData,
    battingGameId,
    premiumFancyData: cachedPremiumFancy,
    providerCGameId: cachedProviderCGameId,
  } = useSelector((state) => state.cricket);
  // console.log("betting data....",battingData)
  // console.log(battingData[0].section[0].nat)
  const { userInfo, user } = useSelector((state) => state.auth);
  // const { pendingBet } = useSelector((state) => state.bet);
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

  const subTabs = [
    { id: "Normal", name: "ALL" },
    { id: "Normal", name: "Fancy" },
    { id: "line", name: "Line Markets" },
    { id: "ball", name: "Ball by Ball" },
    { id: "meter", name: "Meter Markets" },
    { id: "khado", name: "Khado Markets" },
  ];

  const handleSelect = (type, index,) => {
    setSelectedRun({ type, index });
    setBetAmount(0);
  };

  // Load betting data once + subscribe for live updates (no duplicate HTTP fetch)
  useEffect(() => {
    if (!gameid) return;

    let cancelled = false;
    const hasCachedMarkets =
      String(battingGameId) === String(gameid) &&
      Array.isArray(battingData) &&
      battingData.length > 0;
    if (hasCachedMarkets) {
      setBettingData(battingData);
      setLoader(false);
    } else {
      setBettingData(null);
      setLoader(true);
    }

    wsClient.send({ type: "subscribe", gameid, apitype: "cricket" });

    const unsubscribe = wsClient.subscribe((message) => {
      if (
        message?.type !== "bettingData" ||
        String(message.gameid) !== String(gameid)
      ) {
        return;
      }
      const parsed = parseBettingPayload(message);
      if (parsed.markets.length > 0) {
        setBettingData(parsed.markets);
        if (!cancelled) setLoader(false);
      }
      setPremiumFancyData(
        mapPremiumFancyData(parsed.premiumFancy, gameid, parsed.providerCGameId)
      );
      setProviderCGameId(parsed.providerCGameId || gameid);
    });

    dispatch(fetchCricketBatingData(gameid)).finally(() => {
      if (!cancelled) setLoader(false);
    });
    dispatch(fetchCricketPremiumFancy(gameid));

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [dispatch, gameid]);

  useEffect(() => {
    if (String(battingGameId) !== String(gameid)) return;

    if (Array.isArray(battingData) && battingData.length > 0) {
      setBettingData(battingData);
    }
    if (Array.isArray(cachedPremiumFancy)) {
      setPremiumFancyData(
        mapPremiumFancyData(cachedPremiumFancy, gameid, cachedProviderCGameId)
      );
    }
    if (cachedProviderCGameId) {
      setProviderCGameId(cachedProviderCGameId || gameid);
    }
  }, [battingData, battingGameId, cachedPremiumFancy, cachedProviderCGameId, gameid]);

  // ✅ Use socket data for all lists
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
    setTeamName(team);

    setFormData((prev) => ({
      ...prev,
      xValue: xValue,
      teamName: team,
      otype: otype,
      fancyScore: fancyScore,
    }));
  };

  const placeBet = async (gameType, marketName, maxAmo) => {
    // console.log("maxAmo", maxAmo);

    if (betAmount > maxAmo) {
      toast.error(`Bet amount cannot exceed ${maxAmo}`);
      return;
    }
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
    setSelectedRun(null, null); // Reset selected run after placing bet
  };

  const placefancyBet = async (gameType, marketName, maxAmo) => {
    if (betAmount > maxAmo) {
      toast.error(`Bet amount cannot exceed ${maxAmo}`);
      return;
    }
    try {
      const updatedFormData = {
        ...formData,
        price: betAmount,
        gameType,
        marketName,
        eventName: match,
      };
      setFormData(updatedFormData);

      // Wait for bet to process. Toasts/errors will be handled by the single useEffect
      // listening to successMessage/errorMessage to avoid duplicate toasts.
      await dispatch(createfancyBet(updatedFormData));
      // Only fetch user data if user is logged in
      const token = localStorage.getItem("token");
      if (token) {
        await dispatch(getUser()); // Then fetch updated user data
        dispatch(getPendingBetAmo(gameid));
      }
    } catch (error) {
      // Avoid duplicate toasts: error toast is handled in useEffect via errorMessage.
    }
  };


  // const matchOddsList = Array.isArray(bettingData)
  //   ? bettingData.filter(
  //     (item) =>
  //       item?.mname === "MATCH_ODDS" || item?.mname === "TOURNAMENT_WINNER"
  //   )
  //   : [];
//  console.log("match odd list",matchOddsList)

  const reduxMarketsForGame = useMemo(() => {
    if (String(battingGameId) !== String(gameid)) return null;
    return Array.isArray(battingData) && battingData.length > 0 ? battingData : null;
  }, [battingData, battingGameId, gameid]);

  const dataSource = useMemo(() => {
    if (Array.isArray(bettingData) && bettingData.length > 0) return bettingData;
    return reduxMarketsForGame || [];
  }, [bettingData, reduxMarketsForGame]);

  const normalizeRunnersToSection = (market) => {
    // Provider sometimes sends `section` (with nat/odds), sometimes `runners` (with back/lay).
    if (Array.isArray(market?.section) && market.section.length > 0) return market.section;
    if (!Array.isArray(market?.runners)) return [];
    return market.runners.map((runner) => ({
      nat: runner.name,
      team: runner.name,
      sid: runner.id,
      gstatus: runner.status,
      status: runner.status,
      odds: [
        ...(runner.back?.[0]
          ? [{ oname: 'back1', odds: runner.back[0].price, size: runner.back[0].size }]
          : []),
        ...(runner.lay?.[0]
          ? [{ oname: 'lay1', odds: runner.lay[0].price, size: runner.lay[0].size }]
          : []),
      ],
    }));
  };

  const isMatchOddsItem = (item) =>
    item?.name === "Match Odds" ||
    item?.mtype === "MATCH_ODDS" ||
    item?.mname === "Match Odds" ||
    item?.mname === "MATCH_ODDS";

  const isFancyApiMatchOddsDup = (item) => {
    if (!isMatchOddsItem(item)) return false;
    const gtype = String(item?.gtype || "").toLowerCase();
    const marketId = String(item?.marketId || item?.id || item?.mid || "");
    return gtype === "match" && !marketId.startsWith("1.");
  };

  // Match Odds List — prefer Betfair exchange market (1.x id), skip fancy API duplicate
  const matchOddsList = Array.isArray(dataSource)
    ? (() => {
        const candidates = dataSource.filter(
          (item) => isMatchOddsItem(item) && !isFancyApiMatchOddsDup(item)
        );
        const exchange = candidates.find((m) =>
          String(m?.marketId || m?.id || m?.mid || "").startsWith("1.")
        );
        return exchange ? [exchange] : candidates.slice(0, 1);
      })().map((market) => ({
          ...market,
          section: normalizeRunnersToSection(market),
          max: getMarketMaxLimit(market),
          min: getMarketMinLimit(market),
          matched: market.matched,
          status: market.status,
        }))
    : [];
  const BookmakerList = Array.isArray(dataSource)
    ? dataSource
        .filter((item) => item?.name === "BOOKMAKER" || item?.mname === "Bookmaker")
        .map((market) => ({
          ...market,
          section: normalizeRunnersToSection(market),
          max: getMarketMaxLimit(market),
          min: getMarketMinLimit(market),
          status: market.status,
        }))
    : [];
  useEffect(() => {
    if (successMessage) {
      const now = Date.now();
      // block rapid duplicate toasts
      if (now - lastBetToastAt < 1500) return;

      const toastKey = `success:${successMessage}`;
      if (lastBetToastKey !== toastKey) {
        lastBetToastKey = toastKey;
        lastBetToastAt = now;
        toast.success(successMessage);
      }
      setSelectedRun(null);
      dispatch(messageClear());
    }

    if (errorMessage) {
      // Only show error toasts if user is logged in
      const token = localStorage.getItem("token");
      const now = Date.now();
      if (now - lastBetToastAt < 1500) {
        dispatch(messageClear());
        return;
      }

      const toastKey = `error:${errorMessage}`;
      if (token && lastBetToastKey !== toastKey) {
        lastBetToastKey = toastKey;
        lastBetToastAt = now;
        toast.error(errorMessage);
      }
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch]);

  
 
  const mapFancySection = (market, sec) => ({
    team: sec.nat,
    sid: sec.sid,
    odds: normalizeFancySectionOdds(sec, market),
    max: getMarketMaxLimit({ ...market, ...sec }),
    min: getMarketMinLimit({ ...market, ...sec }),
    mname: market.mname,
    gameType: mapProviderDFancyGameType(market.mname || market.mtype),
    gstatus: sec.gstatus,
    marketStatus: market.status,
    marketid:
      gameid && sec.sid != null
        ? `${gameid}_${sec.sid}`
        : sec.marketId || sec.market_id || market.mid,
  });

  const mapFancyRunner = (market, runner) => ({
    team: runner.name || runner.runnerName,
    sid: runner.id,
    odds: [
      ...(runner.back?.[0]
        ? [{ oname: 'back1', odds: runner.back[0].price, size: runner.back[0].size }]
        : []),
      ...(runner.lay?.[0]
        ? [{ oname: 'lay1', odds: runner.lay[0].price, size: runner.lay[0].size }]
        : []),
    ],
    max: getMarketMaxLimit(market),
    min: getMarketMinLimit(market),
    mname: market.mname || market.mtype,
    gameType: mapProviderDFancyGameType(market.mname || market.mtype),
    gstatus: runner.status,
    marketStatus: market.status,
    marketid:
      gameid && runner.id != null
        ? `${gameid}_${runner.id}`
        : market.mid || market.id,
  });

  const fancy1List = Array.isArray(dataSource)
    ? dataSource.filter(isProviderDFancyMarket)
    : [];

  const fancy1Data =
    Array.isArray(fancy1List) && fancy1List.length > 0
      ? fancy1List.flatMap((market) => {
          const mname = String(market.mname || '').toLowerCase();
          if (Array.isArray(market.section) && market.section.length > 0) {
            return market.section.map((sec) => mapFancySection(market, sec));
          }
          if (
            mname !== 'fancy1' &&
            mname !== 'normal' &&
            Array.isArray(market.runners) &&
            market.runners.length > 0
          ) {
            return market.runners.map((runner) => mapFancyRunner(market, runner));
          }
          return [];
        })
      : [];
    // console.log("fancy1 data",fancy1Data) oddeven
//   const fancy1List = Array.isArray(dataSource)
//   ? dataSource.filter((item) => item.mtype === "INNINGS_RUNS")
//   : [];
// console.log("fancy1List........",fancy1List)
// const fancy1Data = fancy1List.flatMap((market) =>
//   (market.runners || []).map((runner) => ({
//     marketid: market.id,
//     event_id: market.groupById,
//     team: runner.name,
//     sid: runner.id,
//     odds: [
//       ...(runner.back?.[0]
//         ? [{ oname: "back1", odds: runner.back[0].price, size: runner.back[0].line }]
//         : []),
//       ...(runner.lay?.[0]
//         ? [{ oname: "lay1", odds: runner.lay[0].price, size: runner.lay[0].line }]
//         : []),
//     ],
//     min: market.minLiabilityPerBet ?? market.min ?? null,
//     max: market.maxLiabilityPerBet ?? market.max ?? null,
//     status: market.status ?? runner.status,
//     statusLabel: market.statusLabel ?? runner.statusLabel,
//   }))
// );
// console.log("fancy1 data.....",fancy1Data)

  // const oddevenList = bettingData?.filter((item) => item.mname === "oddeven");
  // console.log("odd even list ",oddevenList)
  // const oddevenData =
  //   Array.isArray(oddevenList) && oddevenList.length > 0 && oddevenList[0].section
  //     ? oddevenList[0]?.section.map((sec) => ({
  //       team: sec.nat,
  //       sid: sec.sid,
  //       odds: sec.odds,
  //       max: sec.max,
  //       min: sec.min,
  //       mname: fancy1List[0]?.mname, // ✅ Access from first item
  //       status: fancy1List[0]?.status, // ✅ Access from first item
  //     }))
  //     : [];
  //   console.log("oddevenData",oddevenData)

  const oddevenList = Array.isArray(dataSource)
    ? dataSource.filter((item) => item.mname === "oddeven" || item.name?.toLowerCase().includes("odd even"))
    : [];

  const oddevenData =
    Array.isArray(oddevenList) && oddevenList.length > 0 && oddevenList[0].section
      ? oddevenList[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: getMarketMaxLimit({ ...oddevenList[0], ...sec }),
          min: getMarketMinLimit({ ...oddevenList[0], ...sec }),
          mname: oddevenList[0].mname,
          status: oddevenList[0].status,
        }))
      : [];


const sportsbookData = Array.isArray(dataSource)
  ? dataSource.filter(
      (item) =>
        item.mtype === "MATCH_ODDS_SB" &&
        item.name !== "BOOKMAKER" &&
        item.name !== "MINI BOOKMAKER" &&
        !item.name.startsWith("BM ")
    )
  : [];

  // Disabled auto-redirect - let users stay on the page even if no data
  // useEffect(() => {
  //   // Only redirect if we have betting data but all sections are empty
  //   // AND we're not still loading
  //   if (hasCheckedRef.current || loader || !Array.isArray(bettingData) || bettingData.length === 0) return;

  //   const allSectionsEmpty = (
  //     [
  //       ...matchOddsList,
  //       ...tiedMatchList,
  //       ...BookmakerList,
  //       ...fancy1List,
  //     ]
  //   ).every(item => !Array.isArray(item.section) || item.section.length === 0);

  //   // Add a small delay to ensure data has fully loaded
  //   const timeoutId = setTimeout(() => {
  //     if (allSectionsEmpty && !loader) {
  //       hasCheckedRef.current = true; // ✅ prevent future runs
  //       navigate("/");
  //     }
  //   }, 2000); // Wait 2 seconds before redirecting

  //   return () => clearTimeout(timeoutId);
  // }, [bettingData, loader]);

  useEffect(() => {
    // Only fetch pending bet amounts if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getPendingBetAmo(gameid));
    }
  }, [dispatch, gameid]);

  // Fetch scorecard data when ScoreBoard is selected and auto-refresh
  useEffect(() => {
    let intervalId = null;
    
    // const fetchScorecard = async (isInitial = false) => {
    //   if (!gameid || isLive) return;
      
    //   try {
    //     const response = await fetch(`https://baajilive.com/api/check/cricket/score-v2?event_id=${gameid}`);
    //     // const response = await fetch(`https://shubdxinternational.com/score/cricket-v2?event_id=${gameid}`);
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     let htmlContent = await response.text();
        
    //     // Check if the response is JSON-encoded (starts with quotes)
    //     if (htmlContent.startsWith('"') && htmlContent.endsWith('"')) {
    //       try {
    //         htmlContent = JSON.parse(htmlContent);
    //       } catch (e) {
    //         // If parsing fails, use as is
    //       }
    //     }
        
    //     if (htmlContent && htmlContent.trim().length > 0) {
    //       // Store the raw HTML content for srcDoc
    //       setScorecardHtml(htmlContent);
    //     } else {
    //       throw new Error("Empty response from scorecard API");
    //     }
    //   } catch (error) {
    //     console.error("Error fetching scorecard:", error);
    //     // Only show error toast on initial fetch, not on auto-refresh
    //     if (isInitial) {
    //       // toast.error("Failed to load scorecard");
    //       setScorecardHtml(null);
    //     }
    //   }
    // };
    // ...existing code...
    const fetchScorecard = async (isInitial = false) => {
  if (!gameid || isLive) return;

  try {
    if (isInitial) setScorecardLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await api.get(`/cricket/scorecard?gameid=${encodeURIComponent(gameid)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const json = response.data;

    const iframeUrl = json?.iframe?.url;
    if (json?.success && iframeUrl) {
      setScorecardUrl(iframeUrl);
      if (json?.iframe?.allow) {
        setScorecardAllow(json.iframe.allow);
      }
      setScorecardHtml(null);
    } else {
      throw new Error(json?.message || "Failed to fetch live score");
    }
  } catch (error) {
    console.error("Error fetching scorecard:", error);
    if (isInitial) {
      setScorecardHtml(null);
      setScorecardUrl("");
      setScorecardAllow(
        "autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope"
      );
    }
  } finally {
    if (isInitial) setScorecardLoading(false);
  }
};
// ...existing code...
    if (!isLive && gameid) {
      // Fetch immediately with loading indicator
      fetchScorecard(true);
      // Don't auto-refresh the iframe; it causes blinking due to reloads.
    } else if (isLive) {
      // Clear scorecard when switching to Live
      setScorecardHtml(null);
      setScorecardUrl("");
      setScorecardAllow(
        "autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope"
      );
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLive, gameid]);

  // Write HTML content to iframe when it changes
  useEffect(() => {
    if (scorecardHtml && scorecardIframeRef.current && !isLive) {
      const iframe = scorecardIframeRef.current;
      
      const writeContent = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(scorecardHtml);
            iframeDoc.close();
          }
        } catch (error) {
          console.error("Error writing to iframe:", error);
        }
      };

      // Try to write immediately
      if (iframe.contentDocument) {
        writeContent();
      } else {
        // Wait for iframe to load
        iframe.onload = writeContent;
        if (!iframe.src) {
          iframe.src = 'about:blank';
        }
      }
    }
  }, [scorecardHtml, isLive]);

  // Live stream disabled: do not fetch external live stream to avoid errors
  useEffect(() => {
    setLiveStreamHtml(null);
    setLiveStreamSrc(null);
    setLiveStreamLoading(false);
  }, [isLive, gameid, match]);

  useEffect(() => {
    if (!gameid || !key) return;
    let isCancelled = false;

    const cachedTv = getBetfairTvLinkSync({ gameid, key });
    if (cachedTv) {
      setLiveStreamUrl(cachedTv);
      setIsLive(true);
      setIsLoadingStream(false);
      return;
    }

    const setStreamUrl = async () => {
      setIsLoadingStream(true);
      const tvUrl = await getBetfairTvLinkByEventId({ gameid, key });
      if (!isCancelled) {
        setLiveStreamUrl(tvUrl || "");
        if (tvUrl) setIsLive(true);
        setIsLoadingStream(false);
      }
    };
    setStreamUrl();
    return () => {
      isCancelled = true;
    };
  }, [gameid, key]);

  // Reset live stream when switching away from Live
  useEffect(() => {
    if (!isLive || !user) {
      setLiveStreamHtml(null);
      setLiveStreamSrc(null);
    }
  }, [isLive, user]);
  // Write live stream HTML to iframe when it changes (fallback when src extraction fails)
  useEffect(() => {
    if (liveStreamHtml && liveStreamIframeRef.current && isLive && !liveStreamSrc) {
      const iframe = liveStreamIframeRef.current;
      
      const writeContent = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(liveStreamHtml);
            iframeDoc.close();
          }
        } catch (error) {
          console.error("Error writing to live stream iframe:", error);
        }
      };

      // Try to write immediately
      if (iframe.contentDocument) {
        writeContent();
      } else {
        // Wait for iframe to load
        iframe.onload = writeContent;
        if (!iframe.src) {
          iframe.src = 'about:blank';
        }
      }
    }
  }, [liveStreamHtml, isLive, liveStreamSrc]);

  const openBetSlip = (betData) => {
    const enriched = { ...betData, sportSid: 4 };
    setBetSlipData(enriched);
    setSelectedBetData(enriched);
    setBetSlipOpen(true);
    
    // Auto scroll to show the betting section and all fields above BetCard
    setTimeout(() => {
      // First scroll to top to show all content
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Then scroll to the exchange section to show the betting context
      setTimeout(() => {
        const exchangeSection = document.querySelector('.bg-\\[\\#1e1e1e\\]');
        if (exchangeSection) {
          exchangeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }, 100);
  };

  const closeBetSlip = () => {
    setBetSlipOpen(false);
    setBetSlipData(null);
    setSelectedBetData(null);
  };

  const handleBetDataChange = (betData) => {
    setSelectedBetData(betData);
  };

  const hasFancyData = Array.isArray(fancy1Data) && fancy1Data.length > 0;
  const hasPremiumData =
    Array.isArray(premiumFancyData) && premiumFancyData.length > 0;
  const hasSportsbookData =
    Array.isArray(sportsbookData) && sportsbookData.length > 0;
  const showFancyPremiumSection =
    hasFancyData || hasPremiumData || hasSportsbookData;

  let content;
  useEffect(() => {
    if (selected === "Fancybet" && !hasFancyData) {
      if (hasPremiumData) setSelected("Premium");
      else if (hasSportsbookData) setSelected("Sportbook");
    } else if (selected === "Premium" && !hasPremiumData) {
      if (hasFancyData) setSelected("Fancybet");
      else if (hasSportsbookData) setSelected("Sportbook");
    } else if (selected === "Sportbook" && !hasSportsbookData) {
      if (hasFancyData) setSelected("Fancybet");
      else if (hasPremiumData) setSelected("Premium");
    }
  }, [
    hasFancyData,
    hasPremiumData,
    hasSportsbookData,
    selected,
  ]);

  if (selected === "Fancybet" && hasFancyData) {
    content = (
      <Fancybet
        openBetSlip={openBetSlip}
        fancy1Data={fancy1Data}
        gameid={gameid}
        match={match}
        sportSid={4}
        gameName="Cricket Game"
      />
    );
  } else if (selected === "Premium" && hasPremiumData) {
    content = (
      <PremiumFancy
        openBetSlip={openBetSlip}
        premiumFancyData={premiumFancyData}
        gameid={gameid}
        match={match}
        sportSid={4}
        gameName="Cricket Game"
        providerCGameId={providerCGameId}
      />
    );
  } else if (selected === "Sportbook" && hasSportsbookData) {
    content = (
      <Sportbook
        openBetSlip={openBetSlip}
        oddevenData={sportsbookData}
        gameid={gameid}
        match={match}
      />
    );
  }
  const team1 = dataSource?.[0]?.runners?.[0]?.name || "";
  const team2 = dataSource?.[0]?.runners?.[1]?.name || "";
  const hasMarketData =
    Array.isArray(dataSource) &&
    dataSource.length > 0 &&
    (matchOddsList.length > 0 ||
      BookmakerList.length > 0 ||
      fancy1Data.length > 0 ||
      premiumFancyData.length > 0 ||
      sportsbookData.length > 0);
  const oddsLoading = loader && !hasMarketData;

  return (
    <div>
        <div className="flex flex-col md:flex-row gap-4 mb-20 md:mx-4 md:mt-4 md:mb-4">
          <div className="w-full md:w-[60%]">
            <div className='bg-[#1e1e1e] h-10 flex justify-around items-center '>
              <div className={`text-white cursor-pointer ${isLive ?'border-b-2':'' } ${isLive ?'font-bold':'' }`}
              onClick={() => setIsLive(true)}
              >Live</div>
              <div  className={`text-white cursor-pointer ${!isLive ?'border-b-2':'' } ${!isLive ?'font-bold':'' }`}
              onClick={() => setIsLive(false)}
              >ScoreBoard</div>
            </div>
            <div className='w-full'>
              {isLive ? (
                isLoadingStream ? (
                  <div className='flex w-full items-center justify-center'>
                    <span>Loading stream...</span>
                  </div>
                ) : liveStreamUrl ? (
                  <div className='aspect-video w-full'>
                  <iframe
                    src={liveStreamUrl}
                    title='Watch Live'
                    className='h-full w-full'
                    allowFullScreen
                    scrolling="no"
                    loading='eager'
                    allow='autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope'
                  />
                  </div>
                ) : (
                  <div className='flex aspect-video w-full items-center justify-center bg-[#1e1e1e] text-white'>
                    <span>Live stream not available</span>
                  </div>
                )
              ) : scorecardLoading ? (
                <div className='flex w-full items-center justify-center bg-gray-200'>
                  <span>Loading score...</span>
                </div>
              ) : (
               <div className="w-full h-fit">
                <iframe
                  src={scorecardUrl || undefined}
                  title="Betfair Score"
                  className="w-full border-0 rounded-lg"
                  style={{ height: "300px" }}
                  scrolling="no"
                  loading="lazy"
                  allowFullScreen
                  allow={scorecardAllow}
                />
              </div>
              )}
            </div>
        <div>
          {/* Match Odds Section */}
            {matchOddsList.length > 0 ? (
              <Matchodds openBetSlip={openBetSlip} matchOddsList={matchOddsList} gameid={gameid} match={match} selectedBetData={selectedBetData} gameName="Cricket Game"/>
            ) : oddsLoading ? (
              <div className="bg-[#222424] text-gray-300 text-sm py-4 px-3 mb-2">
                Loading match odds...
              </div>
            ) : null}
            <div className='pb-5'>
              {/* Bookmaker Section */}
              {BookmakerList.length > 0 && (
                <Bookmakers openBetSlip={openBetSlip} BookmakerList={BookmakerList} gameid={gameid} match={match} selectedBetData={selectedBetData} gameName="Cricket Game"/>
              )}
              {oddsLoading && !hasFancyData && !hasPremiumData && !hasSportsbookData && (
                <div className="bg-[#222424] text-gray-300 text-sm py-4 px-3 mb-2">
                  Loading fancy markets...
                </div>
              )}
              {showFancyPremiumSection && (
              <div className="pb-2">
                <div className="bg-[#222424] p-2 flex items-center gap-2">
                  {hasFancyData && (
                  <div
                    className={`rounded-sm p-1 text-white cursor-pointer ${
                      selected === "Fancybet" ? "bg-[#17934e]" : "bg-transparent"
                    }`}
                    onClick={() => {
                      setSelected("Fancybet");
                      setIsFancyActive(true);
                    }}
                  >
                    Fancybet
                  </div>
                  )}
                  {hasPremiumData && (
                  <div
                    className={`rounded-sm p-1 text-white cursor-pointer ${
                      selected === "Premium" ? "bg-[#d4a017]" : "bg-transparent"
                    }`}
                    onClick={() => {
                      setSelected("Premium");
                      setIsFancyActive(false);
                    }}
                  >
                    Premium
                  </div>
                  )}
                  {hasSportsbookData && (
                    <div
                      className={`rounded-sm p-1 text-white cursor-pointer ${
                        selected === "Sportbook"
                          ? "bg-[#17934e]"
                          : "bg-transparent"
                      }`}
                      onClick={() => {
                        setSelected("Sportbook");
                        setIsFancyActive(false);
                      }}
                    >
                      Sportbook
                    </div>
                  )}
                </div>
                {content}
              </div>
              )}
            </div>
          </div>
          </div>
          {/* Desktop Sidebar (Right Side) */}
          <div className="hidden md:block md:w-[40%] pr-4">
            <div className="sticky top-[16px]">
              <BetCard 
                odds={betSlipOpen ? betSlipData : null} 
                matchId={gameid}
                onClose={closeBetSlip} 
                onBetDataChange={handleBetDataChange} 
              />
            </div>
          </div>
        </div>

        {/* Mobile Bet Slip Modal */}
        <div className="md:hidden">
          {betSlipOpen && (
            <div className="fixed inset-0 z-[9999] flex w-full items-end justify-center ">
              <div className="w-[96%] mx-auto rounded-t-2xl shadow-lg animate-slide-up bg-[#141515]">
                <BetCard odds={betSlipData} onClose={closeBetSlip} onBetDataChange={handleBetDataChange} />
              </div>
            </div>
          )}
        </div>

        <style>{`
          .animate-slide-up {
            animation: slideUp 0.3s ease-out;
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>
    </div>
  )
}

export default Fullmarkett