import React,{useState} from 'react'
import Navigation from '../../../components/downListComp/superAgent/Navigation'
import BettingTable from './BettingTable'
import { useEffect } from 'react'
const ExchangeData = [
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
    "profitLoss": 156
  }
]

const Fancydata=[
  {
    "plId": "sumon53",
    "betId": "md8q6vz2",
    "date": "7/18/2025, 4:48:21 PM",
    "ip": "27.147.191.95",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand▸20 Over ZIM",
    "selection": "156/100",
    "type": "lay",
    "odds": 1.56,
    "stake": 100,
    "profitLoss": -100
  },
  {
    "plId": "sumon53",
    "betId": "md8q619v",
    "date": "7/18/2025, 4:47:41 PM",
    "ip": "27.147.191.95",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand▸20 Over ZIM",
    "selection": "152/100",
    "type": "lay",
    "odds": 1.52,
    "stake": 100,
    "profitLoss": -100
  },
  {
    "plId": "tapon7677",
    "betId": "md8q5fif",
    "date": "7/18/2025, 4:47:13 PM",
    "ip": "103.10.194.179",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand▸20 Over ZIM",
    "selection": "152/100",
    "type": "lay",
    "odds": 1.52,
    "stake": 100,
    "profitLoss": -200
  },
  {
    "plId": "hasan887",
    "betId": "md8q35hs",
    "date": "7/18/2025, 4:45:26 PM",
    "ip": "103.26.246.27",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand▸1st Wkt ZIM",
    "selection": "41/90",
    "type": "back",
    "odds": 0.455,
    "stake": 90,
    "profitLoss": 90
  },
  {
    "plId": "tapon7677",
    "betId": "md8q33e8",
    "date": "7/18/2025, 4:45:24 PM",
    "ip": "103.10.194.179",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand▸6 Over ZIM",
    "selection": "47/100",
    "type": "lay",
    "odds": 1.47,
    "stake": 100,
    "profitLoss": -300
  },
  {
    "plId": "sumon53",
    "betId": "md8q2xbw",
    "date": "7/18/2025, 4:45:16 PM",
    "ip": "27.147.191.95",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand▸20 Over ZIM",
    "selection": "151/100",
    "type": "lay",
    "odds": 1.51,
    "stake": 100,
    "profitLoss": -100
  },
  {
    "plId": "rohan567",
    "betId": "md8q1dfp",
    "date": "7/18/2025, 4:44:03 PM",
    "ip": "37.111.217.204",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand▸1st Wkt ZIM",
    "selection": "37/110",
    "type": "lay",
    "odds": 0.336,
    "stake": 110,
    "profitLoss": -11000
  },
  {
    "plId": "ruhul6288",
    "betId": "md8py910",
    "date": "7/18/2025, 4:41:38 PM",
    "ip": "37.111.213.195",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand▸6 Over ZIM",
    "selection": "48/100",
    "type": "lay",
    "odds": 1.48,
    "stake": 100,
    "profitLoss": -50
  },
  {
    "plId": "sahin59",
    "betId": "md8py8g6",
    "date": "7/18/2025, 4:41:37 PM",
    "ip": "178.152.25.65",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand▸20 Over ZIM",
    "selection": "151/100",
    "type": "back",
    "odds": 1.51,
    "stake": 100,
    "profitLoss": 100
  },
  {
    "plId": "rakib645",
    "betId": "md8py3eq",
    "date": "7/18/2025, 4:41:31 PM",
    "ip": "103.123.169.144",
    "market": "Cricket",
    "match": "Zimbabwe v New Zealand▸6 Over ZIM",
    "selection": "48/100",
    "type": "lay",
    "odds": 1.48,
    "stake": 100,
    "profitLoss": -50
  }
]

const sportsbookdata=[
  {
    "plId": "ahasan333",
    "betId": "md8qt6ao",
    "date": "7/18/2025, 5:05:41 PM",
    "ip": "103.94.216.140",
    "market": "Cricket",
    "match": "Sunrisers Eastern Cape SRL T20 v Mi Cape Town SRL T20▸1st innings over 16 - Sunrisers Eastern Cape Srl total",
    "selection": "under 10.5",
    "type": "back",
    "odds": 1.66,
    "stake": 90,
    "profitLoss": 59.4
  },
  {
    "plId": "rajkumar3",
    "betId": "md8qnbph",
    "date": "7/18/2025, 5:01:08 PM",
    "ip": "103.52.63.193",
    "market": "Cricket",
    "match": "Yanam Royals v Karaikal Kniights▸Winner (incl. super over)",
    "selection": "Yanam Royals",
    "type": "back",
    "odds": 1.7,
    "stake": 80,
    "profitLoss": 56
  },
  {
    "plId": "rajkumar3",
    "betId": "md8qmz2v",
    "date": "7/18/2025, 5:00:51 PM",
    "ip": "103.52.63.193",
    "market": "Cricket",
    "match": "Yanam Royals v Karaikal Kniights▸Winner (incl. super over)",
    "selection": "Yanam Royals",
    "type": "back",
    "odds": 1.7,
    "stake": 100,
    "profitLoss": 70
  },
  {
    "plId": "fojol423",
    "betId": "md8nn1it",
    "date": "7/18/2025, 3:36:56 PM",
    "ip": "157.20.57.14",
    "market": "Cricket",
    "match": "Sunrisers Eastern Cape SRL T20 v Mi Cape Town SRL T20▸Winner (incl. super over)",
    "selection": "Sunrisers Eastern Cape Srl",
    "type": "back",
    "odds": 3.05,
    "stake": 200,
    "profitLoss": 410
  },
  {
    "plId": "fojol423",
    "betId": "md8nhlfs",
    "date": "7/18/2025, 3:32:41 PM",
    "ip": "157.20.57.14",
    "market": "Cricket",
    "match": "Sunrisers Eastern Cape SRL T20 v Mi Cape Town SRL T20▸Winner (incl. super over)",
    "selection": "Sunrisers Eastern Cape Srl",
    "type": "back",
    "odds": 2.4,
    "stake": 200,
    "profitLoss": 280
  }
]
const bookmakerdata=[]
const casinodata=[]
const tossdata=[]
const tiedata=[]

function CurrentBets() {
  const [bettingData, setbettingData] = useState(ExchangeData)
  const [selected, setselected] = useState("CurrentBets")
  const [selectedType, setselectedType] = useState("Exchange")

  useEffect(() => {
   if(selectedType==="Exchange"){
    setbettingData(ExchangeData)
   }else if(selectedType==="FancyBet"){
    setbettingData(Fancydata)
   }else if(selectedType==="SportsBook"){
    setbettingData(sportsbookdata)
   }else if(selectedType==="BookMaker"){
    setbettingData(bookmakerdata)
   }else if(selectedType==="Casino"){
    setbettingData(casinodata)
   }else if(selectedType==="Toss"){
    setbettingData(tossdata)
   }else if(selectedType==="Tie"){
    setbettingData(tiedata)
   }
  }, [bettingData,selected,selectedType])
  

  return (
        <div className="p-2 mt-4">
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
        <Navigation selected={selected}/>
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">
            Bet List Live
          </h2>
          <div className='mt-4'>
            <div className='border-b-2 border-b-[#060316]'>
              <ul className='flex gap-1'>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160] cursor-pointer ${selectedType === 'Exchange'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("Exchange")}
                >
                  Exhange</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160] cursor-pointer ${selectedType === 'FancyBet'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("FancyBet")}
                >
                  FancyBet</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160] cursor-pointer ${selectedType === 'SportsBook'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("SportsBook")}
                >
                  SportsBook</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160] cursor-pointer ${selectedType === 'BookMaker'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("BookMaker")}
                >
                  BookMaker</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160] cursor-pointer ${selectedType === 'Casino'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("Casino")}
                >
                  Casino</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160] cursor-pointer ${selectedType === 'Toss'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("Toss")}
                >
                  Toss</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160] cursor-pointer ${selectedType === 'Tie'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("Tie")}
                >
                  Tie</li>
              </ul>
            </div>
            <div className='mt-2' >
              <p className='text-[14px]'>Betting History enables you to review the bets you have placed. Specify the time period during which your bets were placed, the type of markets on which the bets were placed, and the sport.</p>
              <p className='text-[14px] mt-2'>Betting History is available online for the past 30 days.</p>
            </div>
            <div className='mt-4'>
              <BettingTable bettingData={bettingData}/>
            </div>
          </div>
        </div>
        </div>
    </div>
  )
}

export default CurrentBets