// import React, { useState } from 'react';
// import { IoIosArrowDown } from "react-icons/io";
// import { IoIosArrowUp } from "react-icons/io";
// import { GrStarOutline } from "react-icons/gr";
// import { GoGraph } from "react-icons/go";
// import { MdArrowForwardIos } from "react-icons/md";
// import b from '../../assets/icon/b.png';
// import f from '../../assets/icon/f.png';
// import s from '../../assets/icon/s.png';
// import y from '../../assets/icon/youtube.png'
// import { useNavigate } from 'react-router-dom';
// const competitions = [
//   {
//     name: "Test Matches",
//     matches: [
//       { time: "3:30 PM", teams: "England v India", score: "0-0" },
//       { time: "7:30 PM", teams: "West Indies v Australia", score: "0-0" }
//     ]
//   },
//   {
//     name: "Irish Inter Provincial T20 Trophy",
//     matches: [
//       { time: "5:00 PM", teams: "Team A v Team B", score: "0-0" },
//       { time: "6:30 PM", teams: "Team C v Team D", score: "0-0" }
//     ]
//   },
//   {
//     name: "Major League Cricket",
//     matches: [
//       { time: "8:00 PM", teams: "Team C v Team D", score: "0-0" },
//       { time: "9:15 PM", teams: "Team E v Team F", score: "0-0" }
//     ]
//   },
//   {
//     name: "Big Bash League",
//     matches: [
//       { time: "2:00 PM", teams: "Sydney Sixers v Melbourne Stars", score: "0-0" },
//       { time: "5:00 PM", teams: "Brisbane Heat v Perth Scorchers", score: "0-0" }
//     ]
//   },
//   {
//     name: "Pakistan Super League",
//     matches: [
//       { time: "4:00 PM", teams: "Karachi Kings v Lahore Qalandars", score: "0-0" },
//       { time: "7:00 PM", teams: "Islamabad United v Multan Sultans", score: "0-0" }
//     ]
//   },
//   {
//     name: "T20 World Cup",
//     matches: [
//       { time: "3:00 PM", teams: "India v Pakistan", score: "0-0" },
//       { time: "7:00 PM", teams: "Australia v England", score: "0-0" }
//     ]
//   },
//   {
//     name: "Caribbean Premier League",
//     matches: [
//       { time: "6:00 PM", teams: "Trinbago v Guyana", score: "0-0" },
//       { time: "9:00 PM", teams: "Barbados v Jamaica", score: "0-0" }
//     ]
//   },
//   {
//     name: "Bangladesh Premier League",
//     matches: [
//       { time: "1:00 PM", teams: "Dhaka v Chattogram", score: "0-0" },
//       { time: "4:00 PM", teams: "Khulna v Sylhet", score: "0-0" }
//     ]
//   },
//   {
//     name: "The Hundred",
//     matches: [
//       { time: "5:30 PM", teams: "Oval Invincibles v Welsh Fire", score: "0-0" },
//       { time: "8:00 PM", teams: "Manchester Originals v London Spirit", score: "0-0" }
//     ]
//   },
//   {
//     name: "Asia Cup",
//     matches: [
//       { time: "3:00 PM", teams: "Sri Lanka v Bangladesh", score: "0-0" },
//       { time: "7:00 PM", teams: "India v Afghanistan", score: "0-0" }
//     ]
//   }
// ];
// function All() {
//   const navigate = useNavigate();
//   const [openIndex, setOpenIndex] = useState(0);

//   const handleToggle = idx => {
//     setOpenIndex(openIndex === idx ? null : idx);
//   };

//   return (
//     <div className="bg-[#eef6fb] min-h-screen py-4 px-2 md:py-4 md:px-4">
//       {competitions.map((comp, idx) => (
//         <div key={idx} className="mb-4">
//           {/* Competition Header */}
//           <div
//             className={`flex items-center justify-between px-4 py-2 md:px-4 md:py-3 rounded-t-xl font-bold text-xl cursor-pointer ${openIndex === idx ? 'bg-black text-white' : 'bg-black text-white'} `}
//             onClick={() => handleToggle(idx)}
//           >
//             <div className="flex items-center gap-2 text-sm  md:text-lg md:font-semibold">
//               <span className="bg-green-700 text-white rounded-full px-3 flex items-center justify-center text-xs md:text-sm font-semibold">
//                 {comp.matches.length}
//               </span>
//               {comp.name}
//             </div>
//             <span className="text-2xl">{openIndex === idx ? <IoIosArrowDown/> : <IoIosArrowUp/>}</span>
//           </div>
//           {/* Matches Dropdown */}
//           <div
//             className={`transition-all duration-300 overflow-hidden bg-gradient-to-b from-[#d4e0e5] to-[#eef6fb] rounded-b-xl ${openIndex === idx ? 'max-h-96' : 'max-h-0'}`}
//           >
//             {openIndex === idx && comp.matches.map((match, i) => (
//               <div key={i}
//               onClick={()=> navigate('/sports/fullmarket')}
//                className="flex items-center justify-between px-2 py-1 md:px-4 md:py-3 border-b last:border-b-0 bg-gradient-to-b from-[#d4e0e5] to-[#eef6fb]">
//                 <div className='flex justify-center items-center gap-4'>
//                   <GrStarOutline/>
//                   <div className="flex flex-col gap-1">
//                     <div className='flex  gap-2'>
//                       <div className='flex items-center'>
//                         <img src={y} alt="YouTube" className="w-2 h-2 inline-block" />
//                         <img src={b} alt="B" className="w-2 h-2 inline-block" />
//                         <img src={f} alt="F" className="w-2 h-2 inline-block " />
//                         <img src={s} alt="S" className="w-2 h-2 inline-block" />
//                       </div>
//                       <span className="bg-yellow-200 text-black rounded font-bold pl-0.5 pr-0.5 text-xs">{match.time}</span>
//                     </div>
//                     <span className="text-xs font-medium md:text-[16px] md:font-semibold">{match.teams}</span>
//                   </div>
//                 </div>
//                 <div className='flex justify-center items-center gap-4'>
//                   <span className="text-yellow-600 font-bold md:text-2xl">{match.score}</span>
//                   <GoGraph/>
//                   <MdArrowForwardIos className='text-xl font-bold'/>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default All;

import React, { useState, useEffect } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { GrStarOutline } from "react-icons/gr";
import { GoGraph } from "react-icons/go";
import { MdArrowForwardIos } from "react-icons/md";
import b from '../../assets/icon/b.png';
import f from '../../assets/icon/f.png';
import s from '../../assets/icon/s.png';
import y from '../../assets/icon/youtube.png'
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { fetchCricketData } from '../../features/sports/cricketSlice';

function All() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { matches, loader, error } = useSelector((state) => state.cricket);
  const [openIndexes, setOpenIndexes] = useState([0]);
  console.log("cricket matches",matches)

  // Group matches by title
  const groupedMatches = matches?.reduce((acc, match) => {
    if (!acc[match.title]) {
      acc[match.title] = [];
    }
    acc[match.title].push(match);
    return acc;
  }, {});

  // Convert grouped object into array for rendering
  const groupedArray = Object.keys(groupedMatches).map(title => ({
    title,
    matches: groupedMatches[title]
  }));

  const handleToggle = idx => {
    setOpenIndexes(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };
  console.log("grouped cricket data",groupedArray)
  useEffect(() => {
    dispatch(fetchCricketData());
  }, [dispatch]);

  const handleClick = (match) => {
    navigate(`/sports/fullmarket/${match.match}/${match.id}`);
  };

  return (
    <div className="bg-[#eef6fb] min-h-screen py-4 px-2 md:py-4 md:px-4">
      {groupedArray.map((comp, idx) => (
        <div key={idx} className="mb-4">
          {/* Title Header */}
          <div
            className="flex items-center justify-between px-4 py-2 rounded-t-xl font-bold text-xl cursor-pointer bg-black text-white"
            onClick={() => handleToggle(idx)}
          >
            <div className="flex items-center gap-2 text-sm md:text-lg">
              <span className="bg-green-700 text-white rounded-full px-3 text-xs md:text-sm font-semibold">
                {comp.matches.length}
              </span>
              {comp.title}
            </div>
            <span className="text-2xl">
              {openIndexes.includes(idx) ? <IoIosArrowDown /> : <IoIosArrowUp />}
            </span>
          </div>

          {/* Matches list */}
          <div
            className={`transition-all duration-300 overflow-hidden  rounded-b-xl ${
              openIndexes.includes(idx) ? 'max-h-[1000px]' : 'max-h-0'
            }`}
          >
            {comp.matches.map((m, i) => (
              <div
                key={i}
                onClick={() => handleClick(m)}
                className="flex items-center justify-between px-2 py-1 border-b last:border-b-0 cursor-pointer  bg-gradient-to-b from-[#d4e0e5] to-[#eef6fb]"
              >
                <div className="flex items-center gap-4">
                  <GrStarOutline />
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <img src={y} alt="YouTube" className="w-2 h-2" />
                        <img src={b} alt="B" className="w-2 h-2" />
                        <img src={f} alt="F" className="w-2 h-2" />
                        <img src={s} alt="S" className="w-2 h-2" />
                      </div>
                      <span className="bg-yellow-200 text-black rounded font-bold px-1 text-[8px] md:text-xs">
                        {m.date}
                      </span>
                      {m.inplay&&<span className="bg-[#52bf05] text-white rounded font-bold px-1 h-fit text-xs">
                        Inplay
                      </span>}
                      
                    </div>
                    <span className="text-xs font-medium md:text-[16px] md:font-semibold">
                      {m.match}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-yellow-600 font-bold md:text-2xl">
                    {/* {m.odds?.[0]?.home} - {m.odds?.[0]?.away} */}
                    0-0
                  </span>
                  <GoGraph />
                  <MdArrowForwardIos className="text-xl font-bold" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default All;
