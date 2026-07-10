import React from "react";
import { GiSoccerBall } from "react-icons/gi";
import SportsBookGrid from "./SportsBookGrid";
import { useTranslation } from "../../i18n/LanguageContext";
import "./Sports.css";

function SportsCasino() {
  const { t } = useTranslation();
  return (
    <div className="sports-casino-section">
      <div className="sports-section-header">
        <span className="sports-section-icon">
          <GiSoccerBall />
        </span>
        <h2 className="sports-title">{t('common.sportsbook')}</h2>
      </div>

      <SportsBookGrid />
    </div>
  );
}

export default SportsCasino;
