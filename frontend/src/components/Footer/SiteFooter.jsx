import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiOutlineExternalLink } from "react-icons/hi";
import { useTranslation } from "../../i18n/LanguageContext";
import "./SiteFooter.css";
import FooterTrust from "./FooterTrust";

function getFooterColumns(t) {
  return [
    {
      title: t("footer.gaming"),
      links: [
        { label: t("footer.popular"), path: "/" },
        { label: t("menu.cricket"), path: "/cricket" },
        { label: t("menu.football"), path: "/football" },
        { label: t("menu.tennis"), path: "/tennis" },
        { label: t("menu.casino"), path: "/casino/casino/all" },
        { label: t("menu.crash"), path: "/casino/crash/all" },
        { label: t("menu.slot"), path: "/casino/slot/all" },
        { label: t("menu.table"), path: "/casino/table/all" },
        { label: t("menu.fishing"), path: "/casino/fishing/all" },
        { label: t("menu.arcade"), path: "/casino/arcade/all" },
        { label: t("footer.lottery"), path: "/casino/lottery/all" },
      ],
    },
    {
      title: t("footer.account"),
      auth: true,
      links: [
        { label: t("menu.myProfile"), path: "/user/profile" },
        { label: t("menu.balanceOverview"), path: "/user/balance-overview" },
        { label: t("menu.accountStatement"), path: "/user/account-statement" },
        { label: t("footer.changePassword"), path: "/user/change-password" },
        { label: t("menu.activeLog"), path: "/user/active-log" },
      ],
    },
    {
      title: t("footer.features"),
      auth: true,
      links: [
        { label: t("nav.myBets"), path: "/mybets" },
        { label: t("menu.currentBets"), path: "/user/current-bets" },
        { label: t("footer.betHistory"), path: "/user/bet-history" },
      ],
    },
    {
      title: t("footer.help"),
      links: [
        { label: t("footer.login"), path: "/login", guestOnly: true },
        { label: t("footer.register"), path: "/register", guestOnly: true },
      ],
    },
  ];
}

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
  const { t } = useTranslation();
  const isLoggedIn = Boolean(user);

  const visibleColumns = getFooterColumns(t)
    .map((col) => {
      if (col.auth && !isLoggedIn) return null;

      const links = col.links.filter((link) => {
        if (link.guestOnly && isLoggedIn) return false;
        if (link.auth && !isLoggedIn) return false;
        return true;
      });

      if (links.length === 0) return null;
      return { ...col, links };
    })
    .filter(Boolean);

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
          © {new Date().getFullYear()} Bajilive. {t("footer.playResponsibly")}
        </p>
        {!isLoggedIn && (
          <button
            type="button"
            className="site-footer-cta"
            onClick={() => navigate("/login")}
          >
            {t("footer.signInCta")}
          </button>
        )}
      </div>
    </footer>
  );
}

export default SiteFooter;
