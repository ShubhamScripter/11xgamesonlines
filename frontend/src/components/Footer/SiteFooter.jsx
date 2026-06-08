import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiOutlineExternalLink } from "react-icons/hi";
import "./SiteFooter.css";
import FooterTrust from "./FooterTrust";

const FOOTER_COLUMNS = [
  {
    title: "Gaming",
    links: [
      { label: "Popular", path: "/" },
      { label: "Cricket", path: "/cricket" },
      { label: "Football", path: "/football" },
      { label: "Tennis", path: "/tennis" },
      { label: "Casino", path: "/casino/casino/all" },
      { label: "Crash", path: "/casino/crash/all" },
      { label: "Slots", path: "/casino/slot/all" },
      { label: "Table", path: "/casino/table/all" },
      { label: "Fishing", path: "/casino/fishing/all" },
      { label: "Arcade", path: "/casino/arcade/all" },
      { label: "Lottery", path: "/casino/lottery/all" },
    ],
  },
  {
    title: "Account",
    auth: true,
    links: [
      { label: "My Profile", path: "/user/profile" },
      { label: "Balance Overview", path: "/user/balance-overview" },
      { label: "Account Statement", path: "/user/account-statement" },
      { label: "Change Password", path: "/user/change-password" },
      { label: "Settings", path: "/user/setting" },
      { label: "Active Log", path: "/user/active-log" },
    ],
  },
  {
    title: "Features",
    auth: true,
    links: [
      { label: "My Bets", path: "/mybets" },
      { label: "Current Bets", path: "/user/current-bets" },
      { label: "Bet History", path: "/user/bet-history" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Login", path: "/login", guestOnly: true },
      { label: "Register", path: "/register", guestOnly: true },
    ],
  },
];

function FooterLink({ item, onNavigate }) {
  const content = (
    <>
      <span>{item.label}</span>
      {item.external && <HiOutlineExternalLink className="site-footer-external-icon" />}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        className="site-footer-link"
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={item.path} className="site-footer-link" onClick={onNavigate}>
      {content}
    </Link>
  );
}

function SiteFooter() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = Boolean(user);

  const visibleColumns = FOOTER_COLUMNS.map((col) => {
    if (col.auth && !isLoggedIn) return null;

    const links = col.links.filter((link) => {
      if (link.guestOnly && isLoggedIn) return false;
      if (link.auth && !isLoggedIn) return false;
      return true;
    });

    if (links.length === 0) return null;
    return { ...col, links };
  }).filter(Boolean);

  return (
    <footer className="site-footer">
      <FooterTrust />

      <div className="site-footer-grid">
        {visibleColumns.map((col) => (
          <div key={col.title} className="site-footer-column">
            <h3 className="site-footer-heading">{col.title}</h3>
            <ul className="site-footer-list">
              {col.links.map((link) => (
                <li key={`${col.title}-${link.label}`}>
                  <FooterLink item={link} onNavigate={() => window.scrollTo(0, 0)} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="site-footer-bottom">
        <p className="site-footer-brand">Bajilive</p>
        <p className="site-footer-copy">
          © {new Date().getFullYear()} Bajilive. Play responsibly.
        </p>
        {!isLoggedIn && (
          <button
            type="button"
            className="site-footer-cta"
            onClick={() => navigate("/login")}
          >
            Sign in to access account &amp; wallet features
          </button>
        )}
      </div>
    </footer>
  );
}

export default SiteFooter;
