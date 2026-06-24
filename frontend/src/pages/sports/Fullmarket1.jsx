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
// // import { fetchCricketBatingData } from '../../features/sports/cricketSlice';
// import { fetchSoccerData } from '../../features/sports/soccerSlice';
// import Spinner from '../../components/Spinner'
// function Fullmarket1() {
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
//       dispatch(fetchSoccerData(gameid)).finally(() => {
//         setLoader(false);
//       });
//     }
//   }, [dispatch, gameid]);

//   useEffect(() => {
//     if (!gameid) return;

//     const socket = new WebSocket(host);

//     socket.onopen = () => {
//       socket.send(JSON.stringify({ type: "subscribe", gameid, apitype: "soccer" }));
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
//         await dispatch(fetchSoccerData(gameid));
//         setLoader(false);
//       };
//       fetchData();
//     }
//     return () => {
//       clearInterval(intervalId);
//     };
//   }, [gameid]);

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
//                 max: getMarketMaxLimit(market),
//                 min: market.minLiabilityPerBet ?? market.min,
//                 status: runner.status,
//               }))
//             : [],
//           max: getMarketMaxLimit(market),
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
//                 max: getMarketMaxLimit(market),
//                 min: market.minLiabilityPerBet ?? market.min,
//                 gstatus: runner.status,
//               }))
//             : [],
//           max: getMarketMaxLimit(market),
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
//           ? [{ oname: "back1", odds: runner.back[0].price, size: runner.back[0].size }]
//           : []),
//         ...(runner.lay?.[0]
//           ? [{ oname: "lay1", odds: runner.lay[0].price, size: runner.lay[0].size }]
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


// console.log("oddevenData", oddevenData);
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
//     content = <Sportbook openBetSlip={openBetSlip} oddevenData={oddevenData} gameid={gameid} match={match} />;
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

// export default Fullmarket1


import React from 'react'
import Header from '../../components/Header/Header'
import HeaderLoginBack from '../../components/Header/HeaderLoginBack';
import HeaderLogin from '../../components/Header/HeaderLogin';
import graph from '../../assets/graph.png'
import Live from '../../assets/icon/live.webp'
import { GrStarOutline } from "react-icons/gr";
import { IoInformationCircle } from "react-icons/io5";
import { useState, useEffect, useRef, useMemo } from 'react'
import Matchodds from '../../components/leaguescomp/Matchodds';
import Bookmakers from '../../components/leaguescomp/Bookmakers';
import Fancybet from '../../components/leaguescomp/Fancybet';
import Sportbook from '../../components/leaguescomp/Sportbook';
import SoccerOver05 from '../../components/leaguescomp/SoccerOver05';
import SoccerOver15 from '../../components/leaguescomp/SoccerOver15';
import SoccerOver25 from '../../components/leaguescomp/SoccerOver25';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BetCard from './BetCard';
import { wsClient } from '../../utils/wsClient';
import { fetchCricketBatingData } from '../../features/sports/cricketSlice';
import { fetchSoccerBatingData } from '../../features/sports/soccerSlice';
import { getUser } from '../../features/auth/authSlice';
import { div } from 'motion/react-client';
import Spinner from '../../components/Spinner';
import { toast } from 'react-hot-toast';
import {
  getSportsMediaUrls,
  getBetfairTvLinkByEventId,
  getBetfairTvLinkSync,
  DEFAULT_BULKAPI_KEY,
  resolveBeventId,
  SPORTS_MEDIA_TYPE,
} from '../../utils/sportsMediaUrls';
import { getMarketMaxLimit, getMarketMinLimit } from '../../utils/marketLimits';
function Fullmarket1() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { gameid } = useParams() || {};
  const { match } = useParams() || {};
  const { soccerData: soccerMatches = [] } = useSelector((state) => state.soccer);
  const key = DEFAULT_BULKAPI_KEY;
  const beventId = useMemo(
    () =>
      resolveBeventId({
        locationState: location.state,
        matches: soccerMatches,
        gameid,
      }),
    [location.state, soccerMatches, gameid]
  );
  const mediaUrls = useMemo(
    () =>
      getSportsMediaUrls({
        sport: SPORTS_MEDIA_TYPE.FOOTBALL,
        gameid,
        key,
        beventId,
      }),
    [gameid, key, beventId]
  );
  const [selected, setSelected] = useState("Fancybet");
  const[isFacncyActive, setIsFancyActive] = useState(true);
  const [isLive, setIsLive] = useState(false);

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
  const { loading, successMessage, errorMessage } = useSelector(
    (state) => state.bet
  );
  const { battingData } = useSelector((state) => state.soccer);
  // console.log("betting data....",battingData)
  // console.log(battingData[0].section[0].nat)
  const { userInfo, user } = useSelector((state) => state.auth);
  // const { pendingBet } = useSelector((state) => state.bet);
  const [formData, setFormData] = useState({
    gameId: gameid,
    sid: 1, // Soccer SID
    otype: "",
    price: null,
    xValue: "",
    gameType: "",
    gameName: "Soccer Game",
    teamName: "",
  });

  // ✅ Fetch once before using socket (optional)
  useEffect(() => {
    if (gameid) {
      setLoader(true);
      dispatch(fetchSoccerBatingData(gameid)).finally(() => {
        setLoader(false);
      });
    }
  }, [dispatch, gameid]);

  useEffect(() => {
    if (!gameid) return;
    wsClient.send({ type: "subscribe", gameid, apitype: "soccer" });

    const unsubscribe = wsClient.subscribe((message) => {
      if (
        message?.type === "bettingData" &&
        String(message.gameid) === String(gameid)
      ) {
        setBettingData(message.data);
      }
    });

    return () => unsubscribe();
  }, [gameid]);

    useEffect(() => {
    let intervalId;

    if (gameid) {
      // Set loader true before initial fetch
      setLoader(true);

      const fetchData = async () => {
        await dispatch(fetchSoccerBatingData(gameid));
        setLoader(false); // Stop loader after first successful fetch
      };

      fetchData();

      // intervalId = setInterval(() => {
      //   dispatch(fetchCricketBatingData(gameid));
      // }, 2000);
    }


    return () => {
      clearInterval(intervalId);
    };
  }, [gameid]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);

  // ✅ Use socket data for all lists
  useEffect(() => {
    // Only fetch user data if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getUser());
    }
  }, [dispatch]);

  // Fetch scorecard data when ScoreBoard is selected and auto-refresh
  // useEffect(() => {
  //   let intervalId = null;
    
  //   const fetchScorecard = async (isInitial = false) => {
  //     if (!gameid || isLive) return;
      
  //     try {
  //       const response = await fetch(`https://baajilive.com/api/check/soccer/score-v2?event_id=${gameid}`);
  //       // const response = await fetch(`https://shubdxinternational.com/score/football-v2?event_id=${gameid}`);
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       let htmlContent = await response.text();
        
  //       // Check if the response is JSON-encoded (starts with quotes)
  //       if (htmlContent.startsWith('"') && htmlContent.endsWith('"')) {
  //         try {
  //           htmlContent = JSON.parse(htmlContent);
  //         } catch (e) {
  //           // If parsing fails, use as is
  //         }
  //       }
        
  //       if (htmlContent && htmlContent.trim().length > 0) {
  //         // Store the raw HTML content for srcDoc
  //         setScorecardHtml(htmlContent);
  //       } else {
  //         throw new Error("Empty response from scorecard API");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching scorecard:", error);
  //       // Only show error toast on initial fetch, not on auto-refresh
  //       if (isInitial) {
  //         // toast.error("No scorecard available");
  //         setScorecardHtml(null);
  //       }
  //     }
  //   };

  //   if (!isLive && gameid) {
  //     // Fetch immediately with loading indicator
  //     fetchScorecard(true);
      
  //     // Set up auto-refresh every 3 seconds (without loading indicator)
  //     intervalId = setInterval(() => {
  //       fetchScorecard(false);
  //     }, 3000);
  //   } else if (isLive) {
  //     // Clear scorecard when switching to Live
  //     setScorecardHtml(null);
  //   }

  //   // Cleanup interval on unmount or when dependencies change
  //   return () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //     }
  //   };
  // }, [isLive, gameid]);

  // ...existing code...
  // Fetch scorecard data when ScoreBoard is selected and auto-refresh
  useEffect(() => {
    let intervalId = null;
    
    const fetchScorecard = async (isInitial = false) => {
      if (!gameid || isLive) return;
      try {
        if (isInitial) setScorecardLoading(true);

        const response = await fetch(
          mediaUrls.scorecardUrl
        );
        const json = await response.json();

        const iframeUrl = json?.iframe?.url;
        if (json?.success && iframeUrl) {
          setScorecardUrl(iframeUrl);
          setScorecardHtml(
            `<!doctype html><html><head><meta charset="utf-8" /></head><body style="margin:0;padding:0;"><iframe src="${iframeUrl}" style="border:0;width:100%;height:50vh;" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope" allowfullscreen></iframe></body></html>`
          );
        } else {
          throw new Error(json?.message || "Failed to fetch live score");
        }
      } catch (error) {
        console.error('Error fetching scorecard:', error);
        if (isInitial) {
          setScorecardHtml(null);
          setScorecardUrl("");
        }
      } finally {
        if (isInitial) setScorecardLoading(false);
      }
    };

    if (!isLive && gameid) {
      fetchScorecard(true);
      // Don't auto-refresh the iframe; it causes blinking due to reloads.
      // If you want periodic refresh later, only update when URL changes.
    } else if (isLive) {
      setScorecardHtml(null);
      setScorecardUrl("");
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLive, gameid]);

  // Fetch live stream when Live is selected
  // useEffect(() => {
  //   if (!user) return;
  //   const fetchLiveStream = async () => {
  //     if (!isLive || !gameid || !match) {
  //       setLiveStreamHtml(null);
  //       setLiveStreamSrc(null);
  //       return;
  //     }

  //     try {
  //       setLiveStreamLoading(true);
  //       const response = await fetch('https://sporta-api.iomhost.com:4200/spb/match-live-stream', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           match_id: `${gameid}`,
  //           sportsName: 'football',
  //           match_name: match,
  //         }),
  //       });

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const result = await response.json();
  //       console.log("Live stream API response:", result);
        
  //       if (result.status && result.data) {
  //         const streamData = result.data;
  //         console.log("Live stream data:", streamData);
  //         console.log("Data type:", typeof streamData);
          
  //         let streamUrl = null;
          
  //         // Check if result.data is already a direct URL
  //         if (typeof streamData === 'string' && (streamData.startsWith('http://') || streamData.startsWith('https://'))) {
  //           // It's already a URL string - use it directly
  //           streamUrl = streamData.trim();
  //           console.log("✅ Direct URL detected:", streamUrl);
  //         } else if (typeof streamData === 'string') {
  //           // Try to extract URL from HTML iframe string (fallback)
  //           const srcMatch = streamData.match(/src=["']([^"']+)["']/);
  //           streamUrl = srcMatch ? srcMatch[1].trim() : null;
  //           console.log("Extracted URL from HTML:", streamUrl || "No URL found");
  //         }
          
  //         // Validate the URL
  //         if (streamUrl && streamUrl.length > 10) {
  //           const isFallbackUrl = (
  //             streamUrl.includes('not-available') ||
  //             streamUrl.includes('unavailable') ||
  //             streamUrl.includes('error') ||
  //             (streamUrl.endsWith('.html') && !streamUrl.startsWith('http'))
  //           );
            
  //           if (!isFallbackUrl) {
  //             // Valid streaming URL
  //             console.log("✅ Setting live stream URL:", streamUrl);
  //             setLiveStreamSrc(streamUrl);
  //             setLiveStreamHtml(null); // Clear HTML since we're using direct URL
  //           } else {
  //             console.log("❌ Invalid or fallback URL detected:", streamUrl);
  //             setLiveStreamSrc(null);
  //             setLiveStreamHtml(null);
  //           }
  //         } else {
  //           console.log("❌ No valid stream URL found");
  //           setLiveStreamSrc(null);
  //           setLiveStreamHtml(null);
  //         }
  //       } else {
  //         console.log("❌ API response invalid:", result);
  //         setLiveStreamSrc(null);
  //         setLiveStreamHtml(null);
  //         throw new Error(result.message || 'Failed to fetch live stream');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching live stream:', error);
  //       setLiveStreamHtml(null);
  //       setLiveStreamSrc(null);
  //       toast.error('Failed to load live stream');
  //     } finally {
  //       setLiveStreamLoading(false);
  //     }
  //   };

  //   fetchLiveStream();
  // }, [isLive, gameid, match]);

  useEffect(() => {
    if (!gameid || !key) return;
    let isCancelled = false;
    const altEventIds = beventId ? [beventId] : [];

    const cachedTv = getBetfairTvLinkSync({ gameid, key, altEventIds });
    if (cachedTv) {
      setLiveStreamUrl(cachedTv);
      setIsLive(true);
      setIsLoadingStream(false);
      return;
    }

    const setStreamUrl = async () => {
      setIsLoadingStream(true);
      const tvUrl = await getBetfairTvLinkByEventId({ gameid, key, altEventIds });
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
  }, [gameid, key, beventId]);

  // Reset live stream when switching away from Live
  useEffect(() => {
    if (!isLive || !user) {
      setLiveStreamHtml(null);
      setLiveStreamSrc(null);
    }
  }, [isLive, user]);
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

  // const matchOddsList = Array.isArray(bettingData)
  //   ? bettingData.filter(
  //     (item) =>
  //       item?.mname === "MATCH_ODDS" || item?.mname === "TOURNAMENT_WINNER"
  //   )
  //   : [];

  const dataSource = Array.isArray(bettingData) && bettingData.length > 0 ? bettingData : (Array.isArray(battingData) ? battingData : []);
  // Normalize section from either API format (section with nat/odds or runners with back/lay)
  const normalizeRunnersToSection = (market) => {
    if (Array.isArray(market?.section) && market.section.length > 0) return market.section;
    if (!Array.isArray(market?.runners)) return [];
    return market.runners.map((runner) => ({
      nat: runner.name,
      team: runner.name,
      sid: runner.id,
      gstatus: runner.status,
      odds: [
        ...(runner.back?.[0] ? [{ oname: 'back1', odds: runner.back[0].price, size: runner.back[0].size }] : []),
        ...(runner.lay?.[0] ? [{ oname: 'lay1', odds: runner.lay[0].price, size: runner.lay[0].size }] : []),
      ],
    }));
  };

  // Match Odds List – pehle specific filter, agar kuch na mile to saare markets dikhao
  let matchOddsList = Array.isArray(dataSource)
    ? dataSource
        .filter(
          (item) =>
            item?.name === "Match Odds" ||
            item?.mtype === "MATCH_ODDS" ||
            item?.mname === "Match Odds" ||
            item?.mname === "MATCH_ODDS"
        )
        .map((market) => ({
          ...market,
          section: normalizeRunnersToSection(market),
          max: getMarketMaxLimit(market),
          min: getMarketMinLimit(market),
          status: market.status,
        }))
    : [];

  // Fallback: agar specific Match Odds market nahi mila, to jitne bhi markets hain unko dikhado
  if (matchOddsList.length === 0 && Array.isArray(dataSource) && dataSource.length > 0) {
    matchOddsList = dataSource.map((market) => ({
      ...market,
      section: normalizeRunnersToSection(market),
               max: getMarketMaxLimit(market),
      min: market.minLiabilityPerBet ?? market.min,
      status: market.status,
    }));
  }

    const soccerOver05List = Array.isArray(dataSource)
    ? dataSource
        .filter(
          (item) =>
            (item?.name === "Total" || item?.mname === "Total") &&
            item?.id && String(item.id).includes("total=0.5")
        )
        .map((market) => ({
          ...market,
          section: normalizeRunnersToSection(market),
          max: getMarketMaxLimit(market),
          min: getMarketMinLimit(market),
          matched: market.matched,
          status: market.status,
        }))
    : [];
    
    

  const soccerOver15List = Array.isArray(dataSource)
  ? dataSource
      .filter(
        (item) =>
          (item?.name === "Total" || item?.mname === "Total") &&
          item?.id && String(item.id).includes("total=1.5")
      )
      .map((market) => ({
        ...market,
        section: normalizeRunnersToSection(market),
        max: getMarketMaxLimit(market),
        min: market.minLiabilityPerBet ?? market.min,
        matched: market.matched,
        status: market.status,
      }))
  : [];
  
  const soccerOver25List = Array.isArray(dataSource)
  ? dataSource
      .filter(
        (item) =>
          (item?.name === "Total" || item?.mname === "Total") &&
          item?.id && String(item.id).includes("total=2.5")
      )
      .map((market) => ({
        ...market,
        section: normalizeRunnersToSection(market),
        max: getMarketMaxLimit(market),
        min: market.minLiabilityPerBet ?? market.min,
        matched: market.matched,
        status: market.status,
      }))
  : [];
  
    
//  console.log("match odd list",matchOddsList)

  // const BookmakerList = Array.isArray(bettingData)
  //   ? bettingData.filter((item) => item.mname === "Bookmaker")
  //   : [];

   // Bookmaker List
   const BookmakerList = Array.isArray(dataSource)
   ? dataSource
       .filter((item) => item.name === "BOOKMAKER")
       .map((market) => ({
         ...market,
         section: market.runners
           ? market.runners.map((runner) => ({
               nat: runner.name,
               sid: runner.id,
               odds: [
                 ...(runner.back?.[0]
                   ? [{ oname: "back1", odds: runner.back[0].price, size: runner.back[0].size }]
                   : []),
                 ...(runner.lay?.[0]
                   ? [{ oname: "lay1", odds: runner.lay[0].price, size: runner.lay[0].size }]
                   : []),
               ],
               max: getMarketMaxLimit(market),
               min: market.minLiabilityPerBet ?? market.min,
               gstatus: runner.status,
             }))
           : [],
         max: getMarketMaxLimit(market),
         min: market.minLiabilityPerBet ?? market.min,
         status: market.status,
       }))
   : [];

  // const fancy1List = bettingData?.filter((item) => item.mname === "fancy1");

  // const fancy1Data =
  //   Array.isArray(fancy1List) && fancy1List.length > 0 && fancy1List[0].section
  //     ? fancy1List[0].section.map((sec) => ({
  //       team: sec.nat,
  //       sid: sec.sid,
  //       odds: sec.odds,
  //       max: sec.max,
  //       min: sec.min,
  //       mname: fancy1List[0].mname, // ✅ Access from first item
  //       status: fancy1List[0].status, // ✅ Access from first item
  //     }))
  //     : [];
    // console.log("fancy1 data",fancy1Data) oddeven
  // Fancybet List/Data (legacy Normal sections + exchange INNINGS_RUNS runners)
  const isFancyNormalMarket = (item) => {
    if (!item || typeof item !== 'object') return false;
    const name = String(item.mname || item.name || '').trim().toLowerCase();
    const hasSections =
      Array.isArray(item.section) && item.section.length > 0;
    const hasRunners =
      Array.isArray(item.runners) && item.runners.length > 0;
    return (
      (name === 'normal' || item.mtype === 'INNINGS_RUNS') &&
      (hasSections || hasRunners)
    );
  };

  const mapFancySection = (market, sec) => ({
    team: sec.nat,
    sid: sec.sid,
    odds: sec.odds,
    max: getMarketMaxLimit({ ...market, ...sec }),
    min: getMarketMinLimit({ ...market, ...sec }),
    mname: market.mname,
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
    gstatus: runner.status,
    marketStatus: market.status,
    marketid:
      gameid && runner.id != null
        ? `${gameid}_${runner.id}`
        : market.mid || market.id,
  });

  const fancy1List = Array.isArray(dataSource)
    ? dataSource.filter(isFancyNormalMarket)
    : [];

  const fancy1Data =
    Array.isArray(fancy1List) && fancy1List.length > 0
      ? fancy1List.flatMap((market) => {
          if (Array.isArray(market.section) && market.section.length > 0) {
            return market.section.map((sec) => mapFancySection(market, sec));
          }
          if (Array.isArray(market.runners) && market.runners.length > 0) {
            return market.runners.map((runner) => mapFancyRunner(market, runner));
          }
          return [];
        })
      : [];
  const oddevenList = Array.isArray(dataSource)
  ? dataSource.filter((item) => item.mname === "oddeven" || item.name?.toLowerCase().includes("odd even"))
  : [];

const oddevenData =
  Array.isArray(oddevenList) && oddevenList.length > 0 && oddevenList[0].section
    ? oddevenList[0].section.map((sec) => ({
        team: sec.nat,
        sid: sec.sid,
        odds: sec.odds,
        max: sec.max,
        min: sec.min,
        mname: oddevenList[0].mname,
        status: oddevenList[0].status,
      }))
    : [];
  // Team names for header - using matchOddsList for better fallback
  // const team1 = matchOddsList?.[0]?.section?.[0]?.nat || 
  //               matchOddsList?.[0]?.section?.[0]?.team || 
  //               bettingData?.[0]?.section?.[0]?.nat || 
  //               bettingData?.[0]?.runners?.[0]?.name || 
  //               "";
  // const team2 = matchOddsList?.[0]?.section?.[1]?.nat || 
  //               matchOddsList?.[0]?.section?.[1]?.team || 
  //               bettingData?.[0]?.section?.[1]?.nat || 
  //               bettingData?.[0]?.runners?.[1]?.name || 
  //               "";

  const team1 = dataSource?.[0]?.runners?.[0]?.name || dataSource?.[0]?.section?.[0]?.nat || dataSource?.[0]?.section?.[0]?.team || match?.split(' - ')?.[0] || "";
  const team2 = dataSource?.[0]?.runners?.[1]?.name || dataSource?.[0]?.section?.[1]?.nat || dataSource?.[0]?.section?.[1]?.team || match?.split(' - ')?.[1] || "";

  const openBetSlip = (betData) => {
    const enriched = { ...betData, sportSid: 1 };
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
  let content;

  if (selected === "Fancybet") {
    content = <Fancybet openBetSlip={openBetSlip} fancy1Data={fancy1Data} gameid={gameid} match={match} sportSid={1} gameName="Soccer Game" />;
  } else if (selected === "Sportbook") {
    content = <Sportbook openBetSlip={openBetSlip} oddevenData={oddevenData} gameid={gameid} match={match}/>;
  }
  return (
    <div>
      {loader &&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40">
          <Spinner />
        </div>
      )}
        {/* {user ? <HeaderLoginBack /> : <Header />} */}
        
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
            <div className="aspect-video w-full">
            <iframe
              src={scorecardUrl || undefined}
              title="Live Score"
              className="w-full h-full"
              scrolling="no"
              loading="lazy"
              allow="autoplay;"
            />
          </div>
          )}
        </div>

        <div>
          {/* Match Odds Section */}
          {!loader && dataSource.length === 0 && (
            <div className="p-4 text-center text-gray-500 bg-[#1e1e1e] text-white">
              No markets available for this match. Try again later.
            </div>
          )}
          {matchOddsList.length > 0 && (
            <>

            <Matchodds openBetSlip={openBetSlip} matchOddsList={matchOddsList} gameid={gameid} match={match} selectedBetData={selectedBetData} gameName="Soccer Game"/>
            </>
          )}
          {/* Over/Under 0.5 Section */}
          {soccerOver05List.length > 0 && (
            <SoccerOver05 openBetSlip={openBetSlip} matchOddsList={soccerOver05List} gameid={gameid} match={match} selectedBetData={selectedBetData} gameName="Soccer Game"/>
          )}
          {/* Over/Under 1.5 Section */}
          {soccerOver15List.length > 0 && (
            <SoccerOver15 openBetSlip={openBetSlip} matchOddsList={soccerOver15List} gameid={gameid} match={match} selectedBetData={selectedBetData} gameName="Soccer Game"/>
          )}
          {/* Over/Under 2.5 Section */}
          {soccerOver25List.length > 0 && (
            <SoccerOver25 openBetSlip={openBetSlip} matchOddsList={soccerOver25List} gameid={gameid} match={match} selectedBetData={selectedBetData} gameName="Soccer Game"/>
          )}
          <div>
            {/* Bookmaker Section */}
            {BookmakerList.length > 0 && (
              <Bookmakers openBetSlip={openBetSlip} BookmakerList={BookmakerList} gameid={gameid} match={match} selectedBetData={selectedBetData} gameName="Soccer Game"/>
            )}
            {/* Fancybet & sportsbook Section */}
            {(fancy1Data.length > 0 || oddevenData.length > 0) && (
              <div className='px-4 pt-4'>
                <div className='bg-black h-12  pl-4 flex  items-center rounded-t-2xl'>
                  {fancy1Data.length > 0 && (
                    <div className={`rounded-t-xl p-2 mt-4 text-white ${isFacncyActive ? 'bg-[#17934e]' : 'bg-transparent'}`}
                      onClick={() => {
                        setSelected("Fancybet");
                        setIsFancyActive(true);
                      }}
                    >Fancybet</div>
                  )}
                  {oddevenData.length > 0 && (
                    <div className={`rounded-t-xl p-2 mt-4 text-white ${!isFacncyActive ? 'bg-[#17934e]' : 'bg-transparent'}`}
                      onClick={() => {
                        setSelected("Sportbook");
                        setIsFancyActive(false);
                      }}
                    >Sportbook</div>
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

export default Fullmarket1