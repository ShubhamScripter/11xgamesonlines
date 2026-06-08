import React from "react";
import { useParams, Link } from "react-router-dom";
import { SPONSORSHIPS, slugify } from "../../components/Footer/footerTrustData";
import "./TrustPages.css";

function SponsorshipDetail() {
  const { slug } = useParams();
  const item = SPONSORSHIPS.find((s) => slugify(s.name) === slug);

  if (!item) {
    return (
      <div className="trust-page">
        <div className="trust-detail-missing">
          <h1>Sponsorship not found</h1>
          <Link to="/sponsorships" className="trust-back-link">
            ← Back to Sponsorships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="trust-page">
      <div className="trust-detail">
        <Link to="/sponsorships" className="trust-back-link">
          ← Back to Sponsorships
        </Link>

        <div className="trust-detail-head">
          <div
            className="trust-detail-logo"
            style={{ background: item.accent }}
          >
            {item.initials}
          </div>
          <div>
            <span className="trust-detail-tag">{item.role}</span>
            <h1 className="trust-detail-name">{item.name}</h1>
            <p className="trust-detail-years">{item.year}</p>
          </div>
        </div>

        <div className="trust-detail-meta">
          {item.league && (
            <div className="trust-detail-meta-item">
              <span className="trust-detail-meta-label">League</span>
              <span className="trust-detail-meta-value">{item.league}</span>
            </div>
          )}
          {item.location && (
            <div className="trust-detail-meta-item">
              <span className="trust-detail-meta-label">Location</span>
              <span className="trust-detail-meta-value">{item.location}</span>
            </div>
          )}
          <div className="trust-detail-meta-item">
            <span className="trust-detail-meta-label">Partnership</span>
            <span className="trust-detail-meta-value">{item.year}</span>
          </div>
        </div>

        {item.description && (
          <p className="trust-detail-desc">{item.description}</p>
        )}
      </div>
    </div>
  );
}

export default SponsorshipDetail;
