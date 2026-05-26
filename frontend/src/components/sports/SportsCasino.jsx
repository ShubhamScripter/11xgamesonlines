import React from "react";
import { GiSoccerBall } from "react-icons/gi";
import SportsBookGrid from "./SportsBookGrid";
import "./Sports.css";

function SportsCasino() {
  return (
    <div className="sports-casino-section">
      <div className="sports-section-header">
        <span className="sports-section-icon">
          <GiSoccerBall />
        </span>
        <h2 className="sports-title">Sportsbook</h2>
      </div>

      <SportsBookGrid />
    </div>
  );
}

export default SportsCasino;
