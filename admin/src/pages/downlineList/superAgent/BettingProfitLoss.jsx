import React, { useState, useEffect } from "react";
import Navigation from "../../../components/downListComp/superAgent/Navigation";
import ProfitLossTable from "./ProfitLossTable";

const ExchangeData= [
  {
    sport: "Cricket",
    match: "England v India",
    settled: "7/14/2025, 10:30:00 AM",
    profitLoss: -20,
    expanded: true,
    bets: [
      {
        username: "bakitestuser",
        betId: "mcx8bu1m",
        selection: "India",
        odds: 3.05,
        stake: 10,
        type: "back",
        placed: "7/10/2025, 3:42:51 PM",
        pnl: -10,
      },
      {
        username: "bakitestuser",
        betId: "mcx8h5rb",
        selection: "India",
        odds: 3.05,
        stake: 10,
        type: "back",
        placed: "7/10/2025, 3:46:59 PM",
        pnl: -10,
      },
    ],
  },
  {
    sport: "Cricket",
    match: "Central Stags v Dubai Capitals",
    settled: "7/10/2025, 7:30:00 PM",
    profitLoss: 0,
    expanded: false,
    bets: [],
  },
  {
    sport: "Soccer",
    match: "Kobe v Hiroshima",
    settled: "7/2/2025, 3:30:00 PM",
    profitLoss: 1.5,
    expanded: false,
    bets: [
      {
        username: "bakitestuser",
        betId: "mclwb7zm",
        selection: "Kobe",
        odds: 1.15,
        stake: 10,
        type: "back",
        placed: "7/2/2025, 5:20:59 PM",
        pnl: 1.5,
      },
    ],
  },
  {
    sport: "Cricket",
    match: "Sri Lanka v Bangladesh",
    settled: "7/2/2025, 2:30:00 PM",
    profitLoss: 5.2,
    expanded: false,
    bets: [
      {
        username: "bakitestuser",
        betId: "mclw6evp",
        selection: "Sri Lanka",
        odds: 1.52,
        stake: 10,
        type: "back",
        placed: "7/2/2025, 5:17:14 PM",
        pnl: 5.2,
      },
    ],
  },
  {
    sport: "Soccer",
    match: "Germany v Tanzania",
    settled: "7/7/2025, 1:00:00 PM",
    profitLoss: 5.7,
    expanded: false,
    bets: [
      {
        username: "bakitestuser",
        betId: "mcsqenbv",
        selection: "Germany",
        odds: 1.57,
        stake: 10,
        type: "back",
        placed: "7/7/2025, 12:10:04 PM",
        pnl: 5.7,
      },
    ],
  },
];
const Fancydata = [];

const sportsbookdata = [];
const bookmakerdata = [];
const casinodata = [];
const tossdata = [];
const tiedata = [];

function BettingProfitLoss() {
  const [bettingData, setbettingData] = useState(ExchangeData);
  const [selected, setselected] = useState("ProfitLoss");
  const [selectedType, setselectedType] = useState("Exchange");

  useEffect(() => {
    if (selectedType === "Exchange") {
      setbettingData(ExchangeData);
    } else if (selectedType === "FancyBet") {
      setbettingData(Fancydata);
    } else if (selectedType === "SportsBook") {
      setbettingData(sportsbookdata);
    } else if (selectedType === "BookMaker") {
      setbettingData(bookmakerdata);
    } else if (selectedType === "Casino") {
      setbettingData(casinodata);
    } else if (selectedType === "Toss") {
      setbettingData(tossdata);
    } else if (selectedType === "Tie") {
      setbettingData(tiedata);
    }
  }, [bettingData, selected, selectedType]);
  return (
    <div className="p-2 mt-4 font-['Times_New_Roman']">
      <div
        className="flex gap-4 border border-[#bbb] rounded shadow-inner px-4 py-2 w-fit"
        style={{
          background: "linear-gradient(180deg, #fff, #eee)",
          boxShadow: "inset 0 2px 0 0 #ffffff80",
        }}
      >
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            AD
          </span>
          <span className="text-sm font-bold">bajivaiadminbdt</span>
        </div>
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            AG
          </span>
          <span className="text-sm font-bold">testbajiuser</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected={selected} />
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">
            Betting Profit Loss
          </h2>
          <div className="mt-4">
            <div className="border-b-2 border-b-[#060316]">
              <ul className='flex gap-1'>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'Exchange'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("Exchange")}
                >
                  Exhange</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'FancyBet'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("FancyBet")}
                >
                  FancyBet</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'SportsBook'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("SportsBook")}
                >
                  SportsBook</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'BookMaker'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("BookMaker")}
                >
                  BookMaker</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'Casino'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("Casino")}
                >
                  Casino</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'Toss'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("Toss")}
                >
                  Toss</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'Tie'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("Tie")}
                >
                  Tie</li>
              </ul>
            </div>
            <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-2">
              <div className="flex justify-between items-center gap-2 mt-3">
                <div className="flex justify-center items-center gap-2">
                  <label htmlFor="betStatus" className="text-xs font-[700]">
                    Bet Status
                  </label>
                  <select
                    name=""
                    id=""
                    className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
                  >
                    <option value="Unmatched">Unmatched</option>
                    <option value="Matched">Matched</option>
                    <option value="Settled">Settled</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Voided">Voided</option>
                  </select>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <label htmlFor="priod" className="text-xs font-[700]">
                    Period
                  </label>
                  <input
                    type="date"
                    className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
                  />
                  <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">
                    00:00
                  </div>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <label htmlFor="priod" className="text-xs font-[700]">
                    Period
                  </label>
                  <input
                    type="date"
                    className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
                  />
                  <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">
                    00:00
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 pb-2">
                <button className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer">
                  Just For Today
                </button>
                <button className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer">
                  From Yesterday
                </button>
                <button className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] p-2 rounded-sm hover:bg-[#ffa00c] cursor-pointer">
                  Get History
                </button>
                <button className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] p-2 rounded-sm hover:bg-[#ffa00c] cursor-pointer">
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-[14px]">
                Betting History enables you to review the bets you have placed.
                Specify the time period during which your bets were placed, the
                type of markets on which the bets were placed, and the sport.
              </p>
              <p className="text-[14px] mt-2">
                Betting History is available online for the past 30 days.
              </p>
            </div>
            <div className="mt-4">
              <ProfitLossTable bettingData={bettingData}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BettingProfitLoss;
