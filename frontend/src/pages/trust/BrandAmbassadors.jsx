import React from "react";
import { Link } from "react-router-dom";
import { BRAND_AMBASSADORS, slugify } from "../../components/Footer/footerTrustData";
import { useTranslation } from "../../i18n/LanguageContext";
import "./TrustPages.css";

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "#7c3aed",
  "#eab308",
  "#2563eb",
  "#dc2626",
  "#0ea5e9",
  "#14805e",
  "#db2777",
];

function BrandAmbassadors() {
  const { t } = useTranslation();

  return (
    <div className="trust-page">
      <header className="trust-hero">
        <span className="trust-hero-tag">{t('trust.facesOfBrand')}</span>
        <h1 className="trust-hero-title">{t('trust.brandAmbassadors')}</h1>
        <p className="trust-hero-sub">{t('trust.brandAmbassadorsSub')}</p>
      </header>

      <section className="trust-section">
        <div className="trust-grid">
          {BRAND_AMBASSADORS.map((item, index) => (
            <Link
              key={item.name}
              to={`/brand-ambassadors/${slugify(item.name)}`}
              className="trust-card"
            >
              <div
                className="trust-card-logo"
                style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
              >
                {getInitials(item.name)}
              </div>
              <h3 className="trust-card-name">{item.name}</h3>
              <span className="trust-card-role">{item.role || t('trust.brandAmbassadorRole')}</span>
              <span className="trust-card-year">{item.years}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default BrandAmbassadors;
