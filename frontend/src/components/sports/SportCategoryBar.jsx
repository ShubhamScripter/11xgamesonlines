import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SPORT_CATEGORY_NAV } from "./sportSidebarAssets";
import "./Sports.css";

function SportCategoryBar({ className = "" }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className={`sport-category-bar ${className}`.trim()}
      aria-label="Sports categories"
    >
      {SPORT_CATEGORY_NAV.map(({ id, label, image, path }) => {
        const isActive = pathname === path;
        return (
          <button
            key={id}
            type="button"
            onClick={() => navigate(path)}
            className={`sport-category-item ${isActive ? "sport-category-item--active" : ""}`}
          >
            <span className="sport-category-icon">
              <img src={image} alt="" />
            </span>
            <span className="sport-category-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default SportCategoryBar;
