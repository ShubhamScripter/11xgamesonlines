import React from "react";
import { Link } from "react-router-dom";
import {
  SPONSORSHIPS,
  OFFICIAL_PARTNER,
  slugify,
} from "../../components/Footer/footerTrustData";
import { useTranslation } from "../../i18n/LanguageContext";
import "./TrustPages.css";

function Sponsorships() {
  const { t } = useTranslation();

  return (
    <div className="trust-page">
      <header className="trust-hero">
        <span className="trust-hero-tag">{t('trust.ourPartners')}</span>
        <h1 className="trust-hero-title">{t('trust.sponsorships')}</h1>
        <p className="trust-hero-sub">{t('trust.sponsorshipsSub')}</p>
      </header>

      <section className="trust-section">
        <h2 className="trust-section-title">{t('trust.officialBrandPartner')}</h2>
        <div className="trust-partner-wrap">
          <div className="trust-partner-badge">{OFFICIAL_PARTNER.name}</div>
          <p className="trust-partner-tagline">{OFFICIAL_PARTNER.tagline}</p>
        </div>
      </section>

      <section className="trust-section">
        <h2 className="trust-section-title">{t('trust.teamSponsorships')}</h2>
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
