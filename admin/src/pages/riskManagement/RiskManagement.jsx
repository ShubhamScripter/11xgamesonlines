import React, { useState } from "react";
import { useNavigate } from "react-router";
import Top10Table from "./Top10Table";
import MatchOdds from "./MatchOdds";
import FancyBet from "./FancyBet";
import SportsBook from "./SportsBook";
import PremiumCricket from "./PremiumCricket";
import Binary from "./Binary";
function RiskManagement() {

  const combinedMatched = [
    { id: 1, uid: "monir17", exposure: 10000.0, matchedAmount: 21000.0 },
    { id: 2, uid: "rahul756", exposure: 1460.0, matchedAmount: 7100.0 },
    { id: 3, uid: "ayman56", exposure: 693.0, matchedAmount: 4762.6 },
    { id: 4, uid: "shaid3216", exposure: 0.0, matchedAmount: 3492.4 },
    { id: 5, uid: "kamal519", exposure: 0.0, matchedAmount: 3432.2 },
    { id: 6, uid: "sohel954", exposure: 200.0, matchedAmount: 2000.0 },
    { id: 7, uid: "farazi099", exposure: 340.0, matchedAmount: 1146.0 },
    { id: 8, uid: "razzaka4", exposure: 0.0, matchedAmount: 948.0 },
    { id: 9, uid: "sakib1490", exposure: 200.0, matchedAmount: 760.0 },
    { id: 10, uid: "raju123", exposure: 100.0, matchedAmount: 640.0 },
  ];

  const combinedExposure = [
    { id: 1, uid: "somir2361", exposure: 1200.0, matchedAmount: 3200.0 },
    { id: 2, uid: "kamal519", exposure: 1100.0, matchedAmount: 1800.0 },
    { id: 3, uid: "sajib302", exposure: 950.0, matchedAmount: 1430.0 },
    { id: 4, uid: "shahid666", exposure: 900.0, matchedAmount: 1200.0 },
    { id: 5, uid: "ayman56", exposure: 800.0, matchedAmount: 1600.0 },
    { id: 6, uid: "farazi099", exposure: 780.0, matchedAmount: 1340.0 },
    { id: 7, uid: "razzaka4", exposure: 750.0, matchedAmount: 800.0 },
    { id: 8, uid: "sakib1490", exposure: 730.0, matchedAmount: 940.0 },
    { id: 9, uid: "sohel954", exposure: 700.0, matchedAmount: 910.0 },
    { id: 10, uid: "raju123", exposure: 600.0, matchedAmount: 880.0 },
  ];

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className='text-[#243a48] text-[16px] font-[700]'>
        Risk Management Summary
      </h2>
      <div>
        <Top10Table combinedMatched={combinedMatched} combinedExposure={combinedExposure}/>
        <MatchOdds/>
        <FancyBet/>
        <SportsBook/>
        <PremiumCricket/>
        <Binary/>
      </div>
    </div>
  );
}

export default RiskManagement;
