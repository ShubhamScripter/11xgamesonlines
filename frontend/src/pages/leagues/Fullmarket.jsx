import React from 'react'
import Header from '../../components/Header/Header'
import HeaderLoginBack from '../../components/Header/HeaderLoginBack';
import graph from '../../assets/graph.png'
import { GrStarOutline } from "react-icons/gr";
import { IoInformationCircle } from "react-icons/io5";
import { useState } from 'react'
import Matchodds from '../../components/leaguescomp/Matchodds';
import Bookmakers from '../../components/leaguescomp/Bookmakers';
import Fancybet from '../../components/leaguescomp/Fancybet';
import Sportbook from '../../components/leaguescomp/Sportbook';

import BetCard from '../sports/BetCard';
function Fullmarket() {
  const [selected, setSelected] = useState("Fancybet");
  const[isFacncyActive, setIsFancyActive] = useState(true);

  const [betSlipOpen, setBetSlipOpen] = useState(false);
    const [betSlipData, setBetSlipData] = useState(null);
  
    const openBetSlip = (betData) => {
      setBetSlipData(betData);
      setBetSlipOpen(true);
    };
  
    const closeBetSlip = () => {
      setBetSlipOpen(false);
      setBetSlipData(null);
    };

  let content;

  if (selected === "Fancybet") {
    content= <Fancybet openBetSlip={openBetSlip}/>;
  } else if (selected === "Sportbook") {
    content = <Sportbook openBetSlip={openBetSlip} />;
  }
  return (
    <div>
      <HeaderLoginBack/>
      <div className='bg-white h-10 p-2 flex justify-around items-center'>
        <span className='font-semibold'>Zimbabwe</span>
        <span className='text-2xl'>-</span>
        <span className='font-semibold'>South Africa</span>
      </div>
      <div>
        <img src={graph} alt="graph" />
      </div>
      <div className='bg-[#1e1e1e] h-10 p-2 pl-4 pr-4 flex justify-between items-center'>
        <span className='text-white'>Exchange</span>
        <span className='text-[#17934e]'>MatchedBDT &nbsp; 14,987,086.26</span>
      </div>
      <div>
        {/* Match Odds Section */}
        <Matchodds openBetSlip={openBetSlip}/>     
        <div className='bg-[#eef6fb] pb-5'>
          {/* Bookmaker Section */}
          <Bookmakers openBetSlip={openBetSlip}/>
          {/* Fancybet & sportsbook Section */}
          <div className='px-4 pt-4'>
            <div className='bg-black h-12  pl-4 flex  items-center rounded-t-2xl'>
              <div className={`rounded-t-xl p-2 mt-4 text-white ${isFacncyActive ? 'bg-[#17934e]' : 'bg-transparent'}`}
              onClick={() => {
                setSelected("Fancybet");
                setIsFancyActive(true);
              }}
              >Fancybet
              </div>
              <div className={`rounded-t-xl p-2 mt-4 text-white ${!isFacncyActive ? 'bg-[#17934e]' : 'bg-transparent'}`}
              onClick={() => {
                setSelected("Sportbook");
                setIsFancyActive(false);
              }}
              >Sportbook
              </div>
            </div>
            {content}

            {/* Bet Slip Modal */}
            {betSlipOpen && (
            <div className="fixed inset-0 z-50 flex w-full items-end justify-center  bg-opacity-40">
            <div className="w-full max-w-[480px] mx-auto bg-white rounded-t-2xl shadow-lg p-4 animate-slide-up">
            <BetCard odds={betSlipData} onClose={closeBetSlip} />
            </div>
            </div>
            )}
            <style>{`
            .animate-slide-up {
            animation: slideUp 0.3s ease;
            }
           @keyframes slideUp {
           from { transform: translateY(100%); }
           to { transform: translateY(0); }
           }
           `}</style>

          </div>

        </div>

      </div>
    </div>
  )
}

export default Fullmarket