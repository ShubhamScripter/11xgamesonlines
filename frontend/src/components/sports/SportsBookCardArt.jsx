import React from "react";
import { getSportsBrandImage, getSportsBrandStyle } from "./sportsBookBrands";
import footballIcon from "../../assets/icon/football-CcbDrciO.png";
import "./Sports.css";

function SportsBookCardArt({ providerKey, className = "" }) {
  const brand = getSportsBrandStyle(providerKey);
  const image = getSportsBrandImage(providerKey);

  return (
    <div
      className={`sports-casino-card-img-wrap ${className}`.trim()}
      style={image ? undefined : { background: brand.bg }}
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="sports-casino-card-cover"
        />
      ) : (
        <>
          <img
            src={footballIcon}
            alt=""
            className="sports-casino-card-watermark"
            aria-hidden
          />
          <span className="sports-casino-card-abbr">{brand.abbr}</span>
        </>
      )}
    </div>
  );
}

export default SportsBookCardArt;
