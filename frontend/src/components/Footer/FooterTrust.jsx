import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
  FaPinterestP,
  FaYoutube,
  FaTelegram,
  FaWhatsapp,
} from "react-icons/fa6";
import { MdChat } from "react-icons/md";
import {
  SPONSORSHIPS,
  BRAND_AMBASSADORS,
  OFFICIAL_PARTNER,
  GAMING_LICENSES,
  RESPONSIBLE_GAMING,
  SOCIAL_LINKS,
  slugify,
} from "./footerTrustData";

const SOCIAL_ICON_MAP = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  imo: MdChat,
  tiktok: FaTiktok,
  x: FaXTwitter,
  pinterest: FaPinterestP,
  youtube: FaYoutube,
  telegram: FaTelegram,
  whatsapp: FaWhatsapp,
};

function FooterTrust() {
  return (
    <div className="site-footer-trust">
      <section className="site-footer-trust-section">
        <div className="site-footer-trust-head-row">
          <h3 className="site-footer-trust-heading">Sponsorships</h3>
          <Link to="/sponsorships" className="site-footer-trust-viewall">
            View all
          </Link>
        </div>
        <div className="site-footer-trust-scroll">
          {SPONSORSHIPS.map((item) => (
            <Link
              key={item.name}
              to={`/sponsorships/${slugify(item.name)}`}
              className="site-footer-sponsor-card"
              onClick={() => window.scrollTo(0, 0)}
            >
              <div
                className="site-footer-sponsor-logo"
                style={{ background: item.accent }}
              >
                {item.initials}
              </div>
              <p className="site-footer-sponsor-name">{item.name}</p>
              <p className="site-footer-sponsor-role">{item.role}</p>
              <p className="site-footer-sponsor-year">{item.year}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="site-footer-trust-section">
        <div className="site-footer-trust-head-row">
          <h3 className="site-footer-trust-heading">Brand Ambassadors</h3>
          <Link to="/brand-ambassadors" className="site-footer-trust-viewall">
            View all
          </Link>
        </div>
        <div className="site-footer-trust-scroll">
          {BRAND_AMBASSADORS.map((item) => (
            <Link
              key={item.name}
              to={`/brand-ambassadors/${slugify(item.name)}`}
              className="site-footer-ambassador-card"
              onClick={() => window.scrollTo(0, 0)}
            >
              <span className="site-footer-ambassador-sig" aria-hidden>
                ✍
              </span>
              <p className="site-footer-ambassador-name">{item.name}</p>
              <p className="site-footer-ambassador-years">{item.years}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="site-footer-trust-grid">
        <section className="site-footer-trust-block">
          <h3 className="site-footer-trust-heading">Official Brand Partner</h3>
          <div className="site-footer-partner-badge">{OFFICIAL_PARTNER.name}</div>
        </section>

        <section className="site-footer-trust-block">
          <h3 className="site-footer-trust-heading">Gaming License</h3>
          <div className="site-footer-badge-row">
            {GAMING_LICENSES.map((lic) => (
              <div key={lic.id} className="site-footer-license-badge" title={lic.label}>
                <span>{lic.badge}</span>
                <small>{lic.label}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="site-footer-trust-block">
          <h3 className="site-footer-trust-heading">Responsible Gaming</h3>
          <div className="site-footer-badge-row">
            {RESPONSIBLE_GAMING.map((item) => (
              <div key={item.id} className="site-footer-rg-badge" title={item.label}>
                <span>{item.badge}</span>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="site-footer-social-row">
        {SOCIAL_LINKS.map((social) => {
          const Icon = SOCIAL_ICON_MAP[social.id];
          return (
            <a
              key={social.id}
              href={social.href}
              className="site-footer-social-btn"
              style={{ backgroundColor: social.color }}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              title={social.label}
            >
              {Icon ? <Icon /> : social.label.charAt(0)}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default FooterTrust;
