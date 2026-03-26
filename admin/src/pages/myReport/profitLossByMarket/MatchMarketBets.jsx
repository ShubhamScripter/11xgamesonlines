import React from "react";

// Sample JSON data
const betsData = [
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "mdalom@",
    "type": "back",
    "selection": "",
    "odds": 15,
    "stake": 20,
    "placeTime": "7/23/2025, 5:55:04 AM",
    "ip": "37.111.207.78",
    "pnl": -20,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "ripon110",
    "type": "back",
    "selection": "",
    "odds": 11,
    "stake": 100,
    "placeTime": "7/23/2025, 6:47:55 AM",
    "ip": "176.44.119.216",
    "pnl": -100,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "rajon954",
    "type": "back",
    "selection": "",
    "odds": 11,
    "stake": 200,
    "placeTime": "7/23/2025, 7:10:12 AM",
    "ip": "116.58.203.28",
    "pnl": -200,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "mohiuddin65",
    "type": "back",
    "selection": "",
    "odds": 13.5,
    "stake": 100,
    "placeTime": "7/23/2025, 7:32:48 AM",
    "ip": "37.111.201.89",
    "pnl": -100,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hamid26684",
    "type": "back",
    "selection": "",
    "odds": 4.1,
    "stake": 200,
    "placeTime": "7/23/2025, 8:26:15 AM",
    "ip": "37.111.239.59",
    "pnl": -200,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hafizur20",
    "type": "back",
    "selection": "",
    "odds": 5,
    "stake": 500,
    "placeTime": "7/23/2025, 8:31:52 AM",
    "ip": "37.111.212.109",
    "pnl": -500,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hafizur20",
    "type": "back",
    "selection": "",
    "odds": 1.45,
    "stake": 1000,
    "placeTime": "7/23/2025, 8:36:44 AM",
    "ip": "37.111.212.109",
    "pnl": -1000,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hafizur20",
    "type": "back",
    "selection": "",
    "odds": 1.46,
    "stake": 200,
    "placeTime": "7/23/2025, 8:36:55 AM",
    "ip": "37.111.212.109",
    "pnl": -200,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hafizur20",
    "type": "back",
    "selection": "",
    "odds": 2,
    "stake": 500,
    "placeTime": "7/23/2025, 8:38:31 AM",
    "ip": "37.111.212.109",
    "pnl": -500,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "bdmahedi76",
    "type": "lay",
    "selection": "",
    "odds": 1.72,
    "stake": 2,
    "placeTime": "7/23/2025, 8:42:16 AM",
    "ip": "103.127.5.69",
    "pnl": -1.44,
    "status": "lay"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "mdjewel22",
    "type": "back",
    "selection": "",
    "odds": 2.3,
    "stake": 200,
    "placeTime": "7/23/2025, 8:43:29 AM",
    "ip": "103.86.199.1",
    "pnl": -200,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hafizur20",
    "type": "lay",
    "selection": "",
    "odds": 1.7,
    "stake": 200,
    "placeTime": "7/23/2025, 8:46:32 AM",
    "ip": "37.111.212.109",
    "pnl": -140,
    "status": "lay"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "rohan567",
    "type": "back",
    "selection": "",
    "odds": 2.6,
    "stake": 464,
    "placeTime": "7/23/2025, 8:49:24 AM",
    "ip": "37.111.193.237",
    "pnl": -464,
    "status": "back"
  },

   {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "mdalom@",
    "type": "back",
    "selection": "",
    "odds": 15,
    "stake": 20,
    "placeTime": "7/23/2025, 5:55:04 AM",
    "ip": "37.111.207.78",
    "pnl": -20,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "ripon110",
    "type": "back",
    "selection": "",
    "odds": 11,
    "stake": 100,
    "placeTime": "7/23/2025, 6:47:55 AM",
    "ip": "176.44.119.216",
    "pnl": -100,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "rajon954",
    "type": "back",
    "selection": "",
    "odds": 11,
    "stake": 200,
    "placeTime": "7/23/2025, 7:10:12 AM",
    "ip": "116.58.203.28",
    "pnl": -200,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "mohiuddin65",
    "type": "back",
    "selection": "",
    "odds": 13.5,
    "stake": 100,
    "placeTime": "7/23/2025, 7:32:48 AM",
    "ip": "37.111.201.89",
    "pnl": -100,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hamid26684",
    "type": "back",
    "selection": "",
    "odds": 4.1,
    "stake": 200,
    "placeTime": "7/23/2025, 8:26:15 AM",
    "ip": "37.111.239.59",
    "pnl": -200,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hafizur20",
    "type": "back",
    "selection": "",
    "odds": 5,
    "stake": 500,
    "placeTime": "7/23/2025, 8:31:52 AM",
    "ip": "37.111.212.109",
    "pnl": -500,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hafizur20",
    "type": "back",
    "selection": "",
    "odds": 1.45,
    "stake": 1000,
    "placeTime": "7/23/2025, 8:36:44 AM",
    "ip": "37.111.212.109",
    "pnl": -1000,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hafizur20",
    "type": "back",
    "selection": "",
    "odds": 1.46,
    "stake": 200,
    "placeTime": "7/23/2025, 8:36:55 AM",
    "ip": "37.111.212.109",
    "pnl": -200,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hafizur20",
    "type": "back",
    "selection": "",
    "odds": 2,
    "stake": 500,
    "placeTime": "7/23/2025, 8:38:31 AM",
    "ip": "37.111.212.109",
    "pnl": -500,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "bdmahedi76",
    "type": "lay",
    "selection": "",
    "odds": 1.72,
    "stake": 2,
    "placeTime": "7/23/2025, 8:42:16 AM",
    "ip": "103.127.5.69",
    "pnl": -1.44,
    "status": "lay"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "mdjewel22",
    "type": "back",
    "selection": "",
    "odds": 2.3,
    "stake": 200,
    "placeTime": "7/23/2025, 8:43:29 AM",
    "ip": "103.86.199.1",
    "pnl": -200,
    "status": "back"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "hafizur20",
    "type": "lay",
    "selection": "",
    "odds": 1.7,
    "stake": 200,
    "placeTime": "7/23/2025, 8:46:32 AM",
    "ip": "37.111.212.109",
    "pnl": -140,
    "status": "lay"
  },
  {
    "sport": "cricket",
    "matchName": "Hong Kong v Samoa",
    "client": "rohan567",
    "type": "back",
    "selection": "",
    "odds": 2.6,
    "stake": 464,
    "placeTime": "7/23/2025, 8:49:24 AM",
    "ip": "37.111.193.237",
    "pnl": -464,
    "status": "back"
  }
]


function MatchMarketBets() {
  return (
    <div className="bg-[#f0ece1] min-h-[100vh] p-4 font-['Times_New_Roman']">
      <div className="flex justify-between">
        <div className="text-[#243a48] text-base font-[700]">Show Bets (Disabled)</div>
        <button className="bg-[#ffcc2f] border border-[#cb8009] px-2 py-1 rounded hover:bg-yellow-500 text-[#333] font-[700] text-xs"
        onClick={()=>{
            window.history.back();
        }}
        >
          Close
        </button>
      </div>

      <div className="mt-4">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">Sports</th>
              <th className="px-2 py-2">Match Name</th>
              <th className="px-2 py-2">Client</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Selection</th>
              <th className="px-2 py-2">Odds</th>
              <th className="px-2 py-2">Stake</th>
              <th className="px-2 py-2">Place Time</th>
              <th className="px-2 py-2">IP</th>
              <th className="px-2 py-2">PnL</th>
              <th className="px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan="11"
                className="text-center py-8 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
              >
                <div className="text-lg font-bold mb-2">Show Bets Feature Disabled</div>
                <div className="text-sm">This feature is currently not available.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MatchMarketBets;
