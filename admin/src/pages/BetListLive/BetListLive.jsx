import React,{useState, useEffect} from "react";
import { GiPlainCircle } from "react-icons/gi";
import MatchedTable from "./MatchedTable";
import UnMatchedTable from "./UnMatchedTable";
import { useDispatch, useSelector } from "react-redux";
import { geAllBetHistory } from "../../store/subadminSlice";
const MatchedData = [
  {
    "plId": "fojol423",
    "betId": "md8osrgq",
    "date": "7/18/2025, 4:09:22 PM",
    "ip": "157.20.57.14",
    "market": "Cricket",
    "match": "United Arab Emirates v Kenya",
    "selection": "Kenya",
    "type": "back",
    "odds": 4.3,
    "stake": 100,
    "liability":100,
    "profitLoss": 330
  },
  {
    "plId": "ruhul6288",
    "betId": "md8oq3nc",
    "date": "7/18/2025, 4:07:18 PM",
    "ip": "37.111.206.111",
    "market": "Soccer",
    "match": "Daegu Fc v Gimcheon Sangmu",
    "selection": "Daegu FC",
    "type": "back",
    "odds": 4.2,
    "stake": 20,
    "liability":20,
    "profitLoss": 64
  },
  {
    "plId": "rajkumar3",
    "betId": "md8ogkul",
    "date": "7/18/2025, 3:59:54 PM",
    "ip": "37.111.218.3",
    "market": "Cricket",
    "match": "England Legends v Pakistan Legends",
    "selection": "England Legends",
    "type": "back",
    "odds": 2.2,
    "stake": 10,
    "liability":10,
    "profitLoss": 12
  },
  {
    "plId": "rajkumar3",
    "betId": "md8of9d8",
    "date": "7/18/2025, 3:58:52 PM",
    "ip": "37.111.218.3",
    "market": "Cricket",
    "match": "England Legends v Pakistan Legends",
    "selection": "England Legends",
    "type": "back",
    "odds": 2.2,
    "stake": 4,
    "liability":4,
    "profitLoss": 4.8
  },
  {
    "plId": "rajkumar3",
    "betId": "md8oezvd",
    "date": "7/18/2025, 3:58:40 PM",
    "ip": "37.111.218.3",
    "market": "Cricket",
    "match": "England Legends v Pakistan Legends",
    "selection": "England Legends",
    "type": "back",
    "odds": 2.2,
    "stake": 19,
    "liability":19,
    "profitLoss": 22.8
  },
  {
    "plId": "rajkumar3",
    "betId": "md8oer8y",
    "date": "7/18/2025, 3:58:29 PM",
    "ip": "37.111.218.3",
    "market": "Cricket",
    "match": "England Legends v Pakistan Legends",
    "selection": "England Legends",
    "type": "back",
    "odds": 2.2,
    "stake": 19,
    "liability":19,
    "profitLoss": 22.8
  },
  {
    "plId": "rajkumar3",
    "betId": "md8oelht",
    "date": "7/18/2025, 3:58:21 PM",
    "ip": "37.111.218.3",
    "market": "Cricket",
    "match": "England Legends v Pakistan Legends",
    "selection": "England Legends",
    "type": "back",
    "odds": 2.2,
    "stake": 19,
    "liability":19,
    "profitLoss": 22.8
  },
  {
    "plId": "rajkumar3",
    "betId": "md8oeff1",
    "date": "7/18/2025, 3:58:13 PM",
    "ip": "37.111.218.3",
    "market": "Cricket",
    "match": "England Legends v Pakistan Legends",
    "selection": "England Legends",
    "type": "back",
    "odds": 2.2,
    "stake": 19,
    "liability":19,
    "profitLoss": 22.8
  },
  {
    "plId": "rajkumar3",
    "betId": "md8ob1p3",
    "date": "7/18/2025, 3:55:36 PM",
    "ip": "37.111.218.3",
    "market": "Cricket",
    "match": "Glamorgan W v Kent W",
    "selection": "Glamorgan W",
    "type": "back",
    "odds": 1.52,
    "stake": 100,
    "liability":100,
    "profitLoss": 52
  },
  {
    "plId": "rajkumar3",
    "betId": "md8o6rbd",
    "date": "7/18/2025, 3:52:16 PM",
    "ip": "37.111.218.3",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand",
    "selection": "Zimbabwe",
    "type": "back",
    "odds": 6,
    "stake": 10,
    "liability":10,
    "profitLoss": 50
  },
  {
    "plId": "mithun07",
    "betId": "md8n3kip",
    "date": "7/18/2025, 3:21:47 PM",
    "ip": "202.86.216.71",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand",
    "selection": "Zimbabwe",
    "type": "back",
    "odds": 6.2,
    "stake": 400,
    "liability":400,
    "profitLoss": 2080
  },
  {
    "plId": "dhaka2837",
    "betId": "md8lhw9f",
    "date": "7/18/2025, 2:36:56 PM",
    "ip": "103.80.3.24",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand",
    "selection": "Zimbabwe",
    "type": "back",
    "odds": 6.2,
    "stake": 1500,
    "liability":1500,
    "profitLoss": 7800
  },
  {
    "plId": "rabbyislam09",
    "betId": "md8gn3ga",
    "date": "7/18/2025, 12:21:01 PM",
    "ip": "223.29.215.66",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand",
    "selection": "Zimbabwe",
    "type": "back",
    "odds": 6.2,
    "stake": 300,
    "liability":300,
    "profitLoss": 1560
  },
  {
    "plId": "arafat583",
    "betId": "md88fee8",
    "date": "7/18/2025, 8:31:05 AM",
    "ip": "116.212.185.157",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand",
    "selection": "Zimbabwe",
    "type": "back",
    "odds": 6.2,
    "stake": 12,
    "liability":12,
    "profitLoss": 62.4
  },
  {
    "plId": "rajkumar3",
    "betId": "md844q2i",
    "date": "7/18/2025, 6:30:48 AM",
    "ip": "103.52.63.214",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand",
    "selection": "Zimbabwe",
    "type": "back",
    "odds": 6.2,
    "stake": 30,
    "liability":30,
    "profitLoss": 156
  }
]

const UnMatchedData=[]

function BetListLive() {
    const dispatch = useDispatch();
    const { bethistoryData } = useSelector((state) => state.subadmin);
    const [matchType, setmatchType] = useState("Cricket")
    const [matchSubType, setmatchSubType] = useState("BetFair")
    const [matchedData, setMatchedData] = useState(MatchedData);

    const mapMatchTypeToSelectedGame = (type) => {
      if (type === "Cricket") return "Cricket Game";
      if (type === "Tennis") return "Tennis Game";
      if (type === "Soccer") return "Soccer Game";
      if (type === "Casino") return "Casino Game";
      return "";
    };

    const fetchData = () => {
      const selectedGame = mapMatchTypeToSelectedGame(matchType);
      dispatch(
        geAllBetHistory({
          id: undefined,
          page: 1,
          limit: 100,
          selectedGame,
          selectedVoid: "unsettel",
        })
      );
    };

    useEffect(() => {
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchType]);

    useEffect(() => {
      const mapped = (bethistoryData || []).map((item) => ({
        plId: item?.userName || item?.plId || "-",
        betId: item?.betId || item?._id || "-",
        date: item?.createdAt || item?.date || "-",
        ip: item?.ip || "-",
        market: item?.gameName || item?.marketName || "-",
        match: item?.eventName || item?.match || "-",
        selection: item?.teamName || item?.selection || "-",
        type: item?.otype || item?.type || "-",
        odds: item?.xValue ?? item?.odds ?? "-",
        stake: item?.price ?? item?.stake ?? "-",
        liability: item?.liability ?? item?.price ?? item?.stake ?? "-",
        profitLoss: item?.resultAmount ?? item?.profitLoss ?? "-",
      }));
      if (bethistoryData) setMatchedData(mapped);
    }, [bethistoryData]);
  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Bet List Live</h2>

      

      {/* Filter Section */}
      <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-2 mt-4">
        {/* Filters */}
      <div className="flex items-center gap-2 mt-2">
        <div className="flex gap-4">
            <div className="flex gap-1 justify-center items-center">
                <div id="Cricket" className={`${matchType==="Cricket" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchType("Cricket")}
                >
                   <GiPlainCircle className={`${matchType==="Cricket" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Cricket">Cricket</label>
            </div>
            <div className="flex gap-1 justify-center items-center">
                <div id="Cricket" className={`${matchType==="Tennis" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchType("Tennis")}
                >
                   <GiPlainCircle className={`${matchType==="Tennis" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Cricket">Tennis</label>
            </div>
            <div className="flex gap-1 justify-center items-center">
                <div id="Cricket" className={`${matchType==="Soccer" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchType("Soccer")}
                >
                   <GiPlainCircle className={`${matchType==="Soccer" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Cricket">Soccer</label>
            </div>
            <div className="flex gap-1 justify-center items-center">
                <div id="Cricket" className={`${matchType==="Casino" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchType("Casino")}
                >
                   <GiPlainCircle className={`${matchType==="Casino" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Cricket">Casino</label>
            </div>
            {(matchType !== "Casino")&&(
                <div className="flex gap-4">
                <div className="flex gap-1 justify-center items-center">
                <div id="Cricket" className={`${matchSubType==="BetFair" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("BetFair")}
                >
                   <GiPlainCircle className={`${matchSubType==="BetFair" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="BetFair">Bet Fair</label>
                </div>

                <div className="flex gap-1 justify-center items-center">
                <div id="Cricket" className={`${matchSubType==="Bookmaker" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("Bookmaker")}
                >
                   <GiPlainCircle className={`${matchSubType==="Bookmaker" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Bookmaker">Bookmaker</label>
                </div>

                <div className="flex gap-1 justify-center items-center">
                <div id="Fancy" className={`${matchSubType==="Fancy" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("Fancy")}
                >
                   <GiPlainCircle className={`${matchSubType==="Fancy" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Fancy">Fancy</label>
                </div>

                <div className="flex gap-1 justify-center items-center">
                <div id="SportsBook" className={`${matchSubType==="SportsBook" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("SportsBook")}
                >
                   <GiPlainCircle className={`${matchSubType==="SportsBook" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="SportsBook">SportsBook</label>
                </div>

                <div className="flex gap-1 justify-center items-center">
                <div id="Tie" className={`${matchSubType==="Tie" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("Tie")}
                >
                   <GiPlainCircle className={`${matchSubType==="Tie" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Tie">Tie</label>
                </div>

                <div className="flex gap-1 justify-center items-center">
                <div id="Toss" className={`${matchSubType==="Toss" ? "border-4 border-[#2196f3] rounded-[50%]":"border border-gray-300 rounded-[50%]"}`}
                onClick={()=>setmatchSubType("Toss")}
                >
                   <GiPlainCircle className={`${matchSubType==="Toss" ?"text-white text-[8px]":"text-xs text-white"}`}/>
                </div>
                <label htmlFor="Toss">Toss</label>
                </div>

            </div>
            )}
        </div>
      </div>
        <div className="flex items-center  gap-4 mt-3">
          {/* Sports filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-[700]">Order of display:</span>
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
              <select className=" text-sm bg-white w-40 outline-0 ">
                <option value="Stake">Stake</option>
                <option value="Time">Time</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-[700]">of:</span>
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
              <select className=" text-sm bg-white w-40 outline-0">
                <option value="Accending">Accending</option>
                <option value="Decending">Decending</option>
              </select>
            </div>
          </div>

          {/* Time Zone filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-[700]">Last:</span>
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
              <select className=" text-sm bg-white w-40 outline-0">
                <option value="100">100 Tnx</option>
                <option value="100">200 Tnx</option>
                <option value="500">500 Tnx</option>
                <option value="1000">1000 Tnx</option>
                <option value="5000">5000 Tnx</option>
                <option value="10000">10000 Tnx</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>

          {/* Auto Refresh*/}
          <div className="flex items-center gap-2">
            <span className="text-xs font-[700]">Auto Refresh (Seconds):</span>
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
              <select className=" text-sm bg-white w-40 outline-0">
                <option value="Stop">Stop</option>
                <option value="60">60</option>
                <option value="30">30</option>
                <option value="15">15</option>
                <option value="5">5</option>
                <option value="2">2</option>
              </select>
            </div>
          </div>
          

          
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 pb-2">
          {/* Auto Refresh*/}
          <div className="flex items-center gap-2">
            <span className="text-xs font-[700]">Bet Status:</span>
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
              <select className=" text-sm bg-white w-40 outline-0">
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
          
          <button className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] p-2 rounded-sm hover:bg-[#ffa00c] cursor-pointer">
            Search
          </button>
          <button className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer">
            Reset
          </button>
        </div>
      </div>
      {/* paragraph Section */}
      <div className="mt-2">
        <p className="text-[14px]">
          Betting History enables you to review the bets you have placed.
          Specify the time period during which your bets were placed, the type
          of markets on which the bets were placed, and the sport.
        </p>
        <p className="text-[14px] mt-2">
          Betting History is available online for the past 30 days.
        </p>
      </div>
      {/* Table Section */}
      <div className="mt-4">
        <UnMatchedTable bettingData={UnMatchedData}/>
      </div>
      <div className="mt-4">
        <MatchedTable bettingData={matchedData}/>
      </div>
    </div>
  )
}

export default BetListLive