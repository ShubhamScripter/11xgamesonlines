import React ,{useState, useEffect} from 'react'
import ProfitLossTable from './ProfitLossTable'
import axiosInstance from '../../../utils/axiosInstance'

const cricketdata = [
  {
    id: 1,
    title: "West Indies v Australia",
    stake: 0,
    downline: "6393.04",
    player: "-6393.04",
    comm: "190.81",
    upline: "6393.04",
    children: [
      {
        label: "Fancy",
        stake: 0,
        downline: "7972.90",
        player: "-7972.90",
        comm: "0.00",
        upline: "7972.90",
      },
      {
        label: "Odds",
        stake: 0,
        downline: "-1579.86",
        player: "1579.86",
        comm: "190.81",
        upline: "-1579.86",
      },
    ],
  },
  {
    id: 2,
    title: "United Arab Emirates v Kenya",
    stake: 0,
    downline: "1275.06",
    player: "-1275.06",
    comm: "0.32",
    upline: "1275.06",
    children: [
      {
        label: "Odds",
        stake: 0,
        downline: "1275.06",
        player: "-1275.06",
        comm: "0.32",
        upline: "1275.06",
      },
    ],
  },
];

const soccerdata=[
  {
    "id": 1,
    "title": "MLS All Stars v Liga MX All Stars",
    "stake": 0,
    "downline": "86.00",
    "player": "-86.00",
    "comm": "0.00",
    "upline": "86.00",
    "children": [
      {
        "label": "Odds",
        "stake": 0,
        "downline": "86.00",
        "player": "-86.00",
        "comm": "0.00",
        "upline": "86.00"
      }
    ]
  },
  {
    "id": 2,
    "title": "Novorizontino v Goias",
    "stake": 0,
    "downline": "34.80",
    "player": "-34.80",
    "comm": "0.00",
    "upline": "34.80",
    "children": [
      {
        "label": "Odds",
        "stake": 0,
        "downline": "34.80",
        "player": "-34.80",
        "comm": "0.00",
        "upline": "34.80"
      }
    ]
  },
  {
    "id": 3,
    "title": "Deportivo Pereira v Atletico Nacional Medellin",
    "stake": 0,
    "downline": "315.00",
    "player": "-315.00",
    "comm": "0.00",
    "upline": "315.00",
    "children": [
      {
        "label": "Odds",
        "stake": 0,
        "downline": "315.00",
        "player": "-315.00",
        "comm": "0.00",
        "upline": "315.00"
      }
    ]
  }
]

const tenisdata=[]



function AprofitMarket() {
    const [selectedType, setselectedType] = useState("Cricket")
    const [matchesData, setmatchesData] = useState(cricketdata)
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        gameName: 'Cricket Game',
        eventName: '',
        marketName: '',
        userName: '',
        startDate: '',
        endDate: ''
    })

    // API function to fetch market reports
    const fetchMarketReports = async (params = {}) => {
        setLoading(true)
        try {
            const queryParams = new URLSearchParams({
                page: params.page || filters.page,
                limit: params.limit || filters.limit,
                gameName: params.gameName || filters.gameName,
                eventName: params.eventName || filters.eventName,
                marketName: params.marketName || filters.marketName,
                userName: params.userName || filters.userName,
                startDate: params.startDate || filters.startDate,
                endDate: params.endDate || filters.endDate
            })

            const response = await axiosInstance.get(`/get/my-reports/by-events?${queryParams}`)
            
            if (response.data.success) {
                const { report } = response.data.data
                
                // Map API response to UI format
                const mappedData = report.map((item, index) => ({
                    id: index + 1,
                    title: item.name,
                    stake: 0, // Not provided in API response
                    downline: (item.downlineWinAmount - item.downlineLossAmount).toFixed(2),
                    player: item.myProfit.toFixed(2),
                    comm: 0, // Not provided in API response
                    upline: (item.downlineWinAmount - item.downlineLossAmount).toFixed(2),
                    children: [
                        {
                            label: item.marketName,
                            stake: 0,
                            downline: (item.downlineWinAmount - item.downlineLossAmount).toFixed(2),
                            player: item.myProfit.toFixed(2),
                            comm: 0,
                            upline: (item.downlineWinAmount - item.downlineLossAmount).toFixed(2)
                        }
                    ],
                    // Additional fields from API
                    eventName: item.eventName,
                    gameName: item.gameName,
                    marketName: item.marketName,
                    userName: item.userName,
                    date: item.date,
                    result: item.result,
                    marketId: item.marketId,
                    downlineWinAmount: item.downlineWinAmount,
                    downlineLossAmount: item.downlineLossAmount
                }))

                setmatchesData(mappedData)
            }
        } catch (error) {
            console.error('Error fetching market reports:', error)
            // Keep fallback data on error
        } finally {
            setLoading(false)
        }
    }

    // Load data on component mount
    useEffect(() => {
        fetchMarketReports()
    }, [])

    // Handle search
    const handleSearch = () => {
        fetchMarketReports()
    }

    // Handle reset
    const handleReset = () => {
        setFilters({
            page: 1,
            limit: 10,
            gameName: 'Cricket Game',
            eventName: '',
            marketName: '',
            userName: '',
            startDate: '',
            endDate: ''
        })
        fetchMarketReports({
            page: 1,
            limit: 10,
            gameName: 'Cricket Game',
            eventName: '',
            marketName: '',
            userName: '',
            startDate: '',
            endDate: ''
        })
    }

    // Handle quick date filters
    const handleToday = () => {
        const today = new Date().toISOString()
        const newFilters = { ...filters, startDate: today, endDate: today }
        setFilters(newFilters)
        fetchMarketReports(newFilters)
    }

    const handleYesterday = () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString()
        const newFilters = { ...filters, startDate: yesterdayStr, endDate: yesterdayStr }
        setFilters(newFilters)
        fetchMarketReports(newFilters)
    }

    // Handle sport type change
    const handleSportChange = (sport) => {
        setselectedType(sport)
        const gameName = sport === "Cricket" ? "Cricket Game" : 
                        sport === "Soccer" ? "Soccer Game" : 
                        sport === "Tenis" ? "Tennis Game" : "Cricket Game"
        
        const newFilters = { ...filters, gameName }
        setFilters(newFilters)
        fetchMarketReports(newFilters)
    }
  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className='text-[#243a48] text-[16px] font-[700] font-["Times_New_Roman"]'>
        Profit/Loss Report by Market
      </h2>
      {/* Filter Section */}
      <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-2 mt-4">
        <div className="flex items-center gap-4 mt-3">
          {/* From Date */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-[700]">From</label>
            <input
              type="date"
              value={filters.startDate ? filters.startDate.split('T')[0] : ''}
              onChange={(e) => setFilters({...filters, startDate: e.target.value ? new Date(e.target.value).toISOString() : ''})}
              className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
            />
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">
              00:00
            </div>
          </div>
          {/* To Date */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-[700]">To</label>
            <input
              type="date"
              value={filters.endDate ? filters.endDate.split('T')[0] : ''}
              onChange={(e) => setFilters({...filters, endDate: e.target.value ? new Date(e.target.value).toISOString() : ''})}
              className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
            />
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2">
              00:00
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2 pb-2">
          <button 
            onClick={handleToday}
            className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
          >
            Just For Today
          </button>
          <button 
            onClick={handleYesterday}
            className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
          >
            From Yesterday
          </button>
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] p-2 rounded-sm hover:bg-[#ffa00c] cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
          <button 
            onClick={handleReset}
            className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
      {/* Filter Section */}
      <div className='flex gap-2 mt-2'>
        <button className={`${selectedType==="Cricket"? "bg-[#ffcc2f] border border-[#cb8009] hover:bg-[#cb8009]" : "bg-gradient-to-b from-white to-gray-100 border border-[#bbb]"}  rounded-[5px] px-3 py-2 text-[#333] text-xs font-[700] `}
        onClick={()=>handleSportChange("Cricket")}
        >Cricket</button>
        <button className={`${selectedType==="Soccer"? "bg-[#ffcc2f] border border-[#cb8009] hover:bg-[#cb8009]" : "bg-gradient-to-b from-white to-gray-100 border border-[#bbb]"}  rounded-[5px] px-3 py-2 text-[#333] text-xs font-[700] `}
        onClick={()=>handleSportChange("Soccer")}
        >Soccer</button>
        <button className={`${selectedType==="Tenis"? "bg-[#ffcc2f] border border-[#cb8009] hover:bg-[#cb8009]" : "bg-gradient-to-b from-white to-gray-100 border border-[#bbb]"}  rounded-[5px] px-3 py-2 text-[#333] text-xs font-[700] `}
        onClick={()=>handleSportChange("Tenis")}
        >Tenis</button>
      </div>
      {/* Table Section */}
      <div className="mt-4">
        <ProfitLossTable matchesData={matchesData}/>
      </div>
    </div>
  )
}

export default AprofitMarket