import React from "react";
import { Link } from "react-router-dom";
import {
  SPONSORSHIPS,
  OFFICIAL_PARTNER,
  slugify,
} from "../../components/Footer/footerTrustData";
import "./TrustPages.css";

function Sponsorships() {
  return (
    <div className="trust-page">
      <header className="trust-hero">
        <span className="trust-hero-tag">Our Partners</span>
        <h1 className="trust-hero-title">Sponsorships</h1>
        <p className="trust-hero-sub">
          Proudly partnering with the biggest teams and leagues across the
          cricketing world.
        </p>
      </header>

      <section className="trust-section">
        <h2 className="trust-section-title">Official Brand Partner</h2>
        <div className="trust-partner-wrap">
          <div className="trust-partner-badge">{OFFICIAL_PARTNER.name}</div>
          <p className="trust-partner-tagline">{OFFICIAL_PARTNER.tagline}</p>
        </div>
      </section>

      <section className="trust-section">
        <h2 className="trust-section-title">Team Sponsorships</h2>
        <div className="trust-grid">
          {SPONSORSHIPS.map((item) => (
            <Link
              key={item.name}
              to={`/sponsorships/${slugify(item.name)}`}
              className="trust-card"
            >
              <div
                className="trust-card-logo"
                style={{ background: item.accent }}
              >
                {item.initials}
              </div>
              <h3 className="trust-card-name">{item.name}</h3>
              <span className="trust-card-role">{item.role}</span>
              <span className="trust-card-year">{item.year}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Sponsorships;
