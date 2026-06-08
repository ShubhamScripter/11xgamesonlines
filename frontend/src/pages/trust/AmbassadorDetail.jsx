import React from "react";
import { useParams, Link } from "react-router-dom";
import { BRAND_AMBASSADORS, slugify } from "../../components/Footer/footerTrustData";
import "./TrustPages.css";

const AVATAR_COLORS = [
  "#7c3aed",
  "#eab308",
  "#2563eb",
  "#dc2626",
  "#0ea5e9",
  "#14805e",
  "#db2777",
];

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function AmbassadorDetail() {
  const { slug } = useParams();
  const index = BRAND_AMBASSADORS.findIndex((a) => slugify(a.name) === slug);
  const item = index >= 0 ? BRAND_AMBASSADORS[index] : null;

  if (!item) {
    return (
      <div className="trust-page">
        <div className="trust-detail-missing">
          <h1>Ambassador not found</h1>
          <Link to="/brand-ambassadors" className="trust-back-link">
            ← Back to Brand Ambassadors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="trust-page">
      <div className="trust-detail">
        <Link to="/brand-ambassadors" className="trust-back-link">
          ← Back to Brand Ambassadors
        </Link>

        <div className="trust-detail-head">
          <div
            className="trust-detail-logo"
            style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
          >
            {getInitials(item.name)}
          </div>
          <div>
            <span className="trust-detail-tag">
              {item.role || "Brand Ambassador"}
            </span>
            <h1 className="trust-detail-name">{item.name}</h1>
            <p className="trust-detail-years">{item.years}</p>
          </div>
        </div>

        <div className="trust-detail-meta">
          <div className="trust-detail-meta-item">
            <span className="trust-detail-meta-label">Role</span>
            <span className="trust-detail-meta-value">
              {item.role || "Brand Ambassador"}
            </span>
          </div>
          <div className="trust-detail-meta-item">
            <span className="trust-detail-meta-label">Active Years</span>
            <span className="trust-detail-meta-value">{item.years}</span>
          </div>
        </div>

        {item.description && (
          <p className="trust-detail-desc">{item.description}</p>
        )}
      </div>
    </div>
  );
}

export default AmbassadorDetail;
