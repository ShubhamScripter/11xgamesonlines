import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCricketData,
  fetchCricketBatingData,
} from "../../features/sports/cricketSlice";
import {
  fetchSoccerData,
  fetchSoccerBatingData,
} from "../../features/sports/soccerSlice";
import {
  fetchTennisData,
  fetchTannisBatingData,
} from "../../features/sports/tennisSlice";
import { GiCricketBat, GiSoccerBall, GiTennisBall } from "react-icons/gi";
import "./Sports.css";

const SIDEBAR_SPORTS = [
  { id: "CRICKET", label: "Cricket", Icon: GiCricketBat },
  { id: "TENNIS", label: "Tennis", Icon: GiTennisBall },
  { id: "FOOTBALL", label: "Football", Icon: GiSoccerBall },
];

const SPORT_ICONS = {
  CRICKET: GiCricketBat,
  FOOTBALL: GiSoccerBall,
  TENNIS: GiTennisBall,
};

const isMatchActive = () => true;

const isWithinNext24Hours = (dateString) => {
  if (!dateString) return false;
  const matchDate = new Date(dateString);
  if (Number.isNaN(matchDate.getTime())) return false;
  const now = new Date();
  const diff = matchDate.getTime() - now.getTime();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
};

/** Same rules as Cricket.jsx / Main — in-play or today/tomorrow/upcoming. */
const isEligibleHomeMatch = (m) => {
  if (m?.inplay) return true;
  if (!m?.date) return true;
  const matchDate = new Date(m.date);
  if (Number.isNaN(matchDate.getTime())) return true;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const day = matchDate.toDateString();
  if (day === today.toDateString() || day === tomorrow.toDateString()) return true;
  return isWithinNext24Hours(m.date);
};

const formatMatchTime = (
  dateString,
  todayLabel = "today",
  tomorrowLabel = "tomorrow"
) => {
  if (!dateString) return "";
  const matchDate = new Date(dateString);
  const now = new Date();
  const isToday = matchDate.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();

  const timeStr = matchDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  if (isToday) return `${todayLabel} ${timeStr}`;
  if (isTomorrow) return `${tomorrowLabel} ${timeStr}`;

  const day = String(matchDate.getDate()).padStart(2, "0");
  const month = String(matchDate.getMonth() + 1).padStart(2, "0");
  const year = String(matchDate.getFullYear()).slice(-2);
  return `${day}/${month}/${year} ${timeStr}`;
};

const formatOddsPrice = (v) => {
  if (v === null || v === undefined) return "-";
  const s = String(v).trim();
  if (s === "" || s === "0" || s === "0.0" || s === "0.00") return "-";
  const n = Number(s);
  if (!Number.isNaN(n) && n === 0) return "-";
  return s;
};

const parseTeamNames = (teamsStr) => {
  const s = String(teamsStr || "").trim();
  const parts = s.split(/\s+v\s+|\s+vs\s+/i);
  if (parts.length >= 2) {
    return [parts[0].trim(), parts[1].trim()];
  }
  return [s || "—", ""];
};

const teamInitials = (name) => {
  const w = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!w.length) return "?";
  if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
  return (w[0][0] + w[w.length - 1][0]).toUpperCase();
};

function OddsPair({ back, lay }) {
  return (
    <div className="odds-group">
      <div className="odds-box back rounded-l-md">
        <span className="odds-val">{back.price}</span>
        {back.volume && back.volume !== "—" ? (
          <span className="odds-vol">{back.volume}</span>
        ) : null}
      </div>
      <div className="odds-box lay rounded-r-md">
        <span className="odds-val">{lay.price}</span>
        {lay.volume && lay.volume !== "—" ? (
          <span className="odds-vol">{lay.volume}</span>
        ) : null}
      </div>
    </div>
  );
}

function CricketMatchCard({ match, onClick }) {
  const [team1, team2] = parseTeamNames(match.teams);
  const o0 = match.odds[0];
  const o2 = match.odds[2] || match.odds[1];

  return (
    <div
      className="match-card match-card--cricket"
      onClick={() => onClick(match)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(match)}
    >
      <div className="card-header">
        <div className="sport-info">
          <span className="sport-icon">
            <GiCricketBat />
          </span>
          <span className="sport-info-sport">Cricket</span>
          <span className="sport-info-league">{match.league}</span>
        </div>
        <span
          className={`live-tag ${match.raw?.inplay ? "live-tag--active" : ""}`}
        >
          LIVE
        </span>
      </div>

      <div className="match-card-body match-card-body--cricket">
        <div className="cricket-teams">
          <div className="cricket-team-row">
            <span className="team-avatar">{teamInitials(team1)}</span>
            <div className="team-meta">
              <span className="team-name">{team1}</span>
              <span className="team-innings">—</span>
            </div>
            <span className="team-score">—</span>
          </div>
          {team2 ? (
            <div className="cricket-team-row">
              <span className="team-avatar">{teamInitials(team2)}</span>
              <div className="team-meta">
                <span className="team-name">{team2}</span>
                <span className="team-innings">—</span>
              </div>
              <span className="team-score">—</span>
            </div>
          ) : null}
        </div>

        <div className="match-odds-label">Match Odds</div>
        <div className="odds-container odds-container--match">
          {o0 && o2 ? (
            <>
              <OddsPair back={o0.back} lay={o0.lay} />
              <OddsPair back={o2.back} lay={o2.lay} />
            </>
          ) : (
            <div className="odds-placeholder">
              <OddsPair
                back={{ price: "-", volume: "" }}
                lay={{ price: "-", volume: "" }}
              />
              <OddsPair
                back={{ price: "-", volume: "" }}
                lay={{ price: "-", volume: "" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, onClick }) {
  const SportIcon = SPORT_ICONS[match.sport] || GiSoccerBall;

  if (match.sport === "CRICKET") {
    return <CricketMatchCard match={match} onClick={onClick} />;
  }

  return (
    <div
      className="match-card"
      onClick={() => onClick(match)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(match)}
    >
      <div className="card-header">
        <div className="sport-info">
          <span className="sport-icon">
            <SportIcon />
          </span>
          <span className="sport-info-sport">{match.sport}</span>
          <span className="sport-info-divider">|</span>
          <span className="sport-info-league">{match.league}</span>
        </div>
        <span
          className={`live-tag ${match.raw?.inplay ? "live-tag--active" : ""}`}
        >
          LIVE
        </span>
      </div>
      <div className="match-card-body">
        <div className="teams-name">{match.teams}</div>
        <span className="match-time-text">{match.time}</span>
        <div className="odds-container">
          {match.odds.length > 0 ? (
            match.odds.map((odd, i) => (
              <OddsPair key={i} back={odd.back} lay={odd.lay} />
            ))
          ) : (
            <div className="odds-placeholder">
              {[0, 1, 2].map((i) => (
                <OddsPair
                  key={i}
                  back={{ price: "🔒", volume: "" }}
                  lay={{ price: "🔒", volume: "" }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Sports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeSport, setActiveSport] = useState("CRICKET");
  const [activeLeague, setActiveLeague] = useState("ALL");

  const {
    matches: cricketMatches = [],
    loader: cricketLoading,
    error: cricketError,
  } = useSelector((state) => state.cricket);
  const {
    soccerData: soccerMatches = [],
    soccerLoading,
    soccerError,
  } = useSelector((state) => state.soccer);
  const {
    data: tennisMatches = [],
    loading: tennisLoading,
    error: tennisError,
  } = useSelector((state) => state.tennis);

  const todayLabel = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    dispatch(fetchCricketData());
    dispatch(fetchSoccerData());
    dispatch(fetchTennisData());
  }, [dispatch]);

  const allMatches = useMemo(() => {
    const mapCricket = (m) => ({
      id: `${m.id}-cricket`,
      sport: "CRICKET",
      league: (m.cname || m.title || "Cricket").trim(),
      teams: (m.match || m.title || "—").trim(),
      time: formatMatchTime(m.date),
      odds: (m.odds || []).slice(0, 3).map((o) => ({
        back: {
          price: formatOddsPrice(o?.home),
          volume: o?.backVolume || "—",
        },
        lay: {
          price: formatOddsPrice(o?.away),
          volume: o?.layVolume || "—",
        },
      })),
      raw: m,
    });

    const mapSoccer = (m) => ({
      id: `${m.id}-football`,
      sport: "FOOTBALL",
      league: (m.title || m.cname || "Football").trim(),
      teams: (m.match || m.title || "—").trim(),
      time: formatMatchTime(m.date),
      odds: (m.odds || []).slice(0, 3).map((o) => ({
        back: {
          price: formatOddsPrice(o?.home),
          volume: o?.backVolume || "—",
        },
        lay: {
          price: formatOddsPrice(o?.away),
          volume: o?.layVolume || "—",
        },
      })),
      raw: m,
    });

    const mapTennis = (m) => ({
      id: `${m.id}-tennis`,
      sport: "TENNIS",
      league: (m.title || m.cname || "Tennis").trim(),
      teams: (m.match || m.cname || m.title || "—").trim(),
      time: formatMatchTime(m.date),
      odds: (m.odds || []).slice(0, 3).map((o) => ({
        back: {
          price: formatOddsPrice(o?.home),
          volume: o?.backVolume || "—",
        },
        lay: {
          price: formatOddsPrice(o?.away),
          volume: o?.layVolume || "—",
        },
      })),
      raw: m,
    });

    const cricket = (cricketMatches || [])
      .filter(
        (m) =>
          isMatchActive(m?.id, "cricket", m?.title) && isEligibleHomeMatch(m)
      )
      .map(mapCricket);

    const soccer = (soccerMatches || [])
      .filter(
        (m) =>
          isMatchActive(m?.id, "soccer", m?.title) && isEligibleHomeMatch(m)
      )
      .map(mapSoccer);

    const tennis = (tennisMatches || [])
      .filter(
        (m) =>
          isMatchActive(m?.id, "tennis", m?.title ?? m?.cname) &&
          isEligibleHomeMatch(m)
      )
      .map(mapTennis);

    const sortMatches = (a, b) => {
      if (a.raw?.inplay && !b.raw?.inplay) return -1;
      if (!a.raw?.inplay && b.raw?.inplay) return 1;
      return new Date(a.raw?.date || 0) - new Date(b.raw?.date || 0);
    };

    return [...cricket, ...soccer, ...tennis].sort(sortMatches);
  }, [cricketMatches, soccerMatches, tennisMatches]);

  const sportMatches = useMemo(
    () => allMatches.filter((m) => m.sport === activeSport),
    [allMatches, activeSport]
  );

  const leagues = useMemo(() => {
    const set = new Set();
    sportMatches.forEach((m) => {
      if (m.league) set.add(m.league);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [sportMatches]);

  const filteredMatches = useMemo(() => {
    if (activeLeague === "ALL") return sportMatches;
    return sportMatches.filter((m) => m.league === activeLeague);
  }, [sportMatches, activeLeague]);

  const isFetching = cricketLoading || soccerLoading || tennisLoading;
  const fetchError = cricketError || soccerError || tennisError;
  const hasRawMatches =
    (cricketMatches?.length ?? 0) > 0 ||
    (soccerMatches?.length ?? 0) > 0 ||
    (tennisMatches?.length ?? 0) > 0;

  const handleSportChange = (sportId) => {
    setActiveSport(sportId);
    setActiveLeague("ALL");
  };

  const handleMatchClick = (match) => {
    if (match.sport === "CRICKET") {
      dispatch(fetchCricketBatingData(match.raw.id ?? match.id));
      navigate(
        `/sports/fullmarket/${encodeURIComponent(match.teams)}/${match.raw.id}`,
        { state: { match: match.raw } }
      );
    } else if (match.sport === "FOOTBALL") {
      dispatch(fetchSoccerBatingData(match.raw.id ?? match.id));
      navigate(
        `/sports/soccer/${encodeURIComponent(match.teams)}/${match.raw.id}`,
        { state: { match: match.raw } }
      );
    } else if (match.sport === "TENNIS") {
      dispatch(fetchTannisBatingData(match.raw.id ?? match.id));
      navigate(
        `/sports/tennis/${encodeURIComponent(match.teams)}/${match.raw.id}`,
        { state: { match: match.raw } }
      );
    }
  };

  if (isFetching && !hasRawMatches) {
    return (
      <div className="sports-section">
        <p className="sports-loading-text">Loading matches…</p>
      </div>
    );
  }

  return (
    <div className="sports-section">
      {fetchError && !hasRawMatches ? (
        <p className="sports-empty-text">
          Could not load matches. Check backend is running.
        </p>
      ) : null}
      <div className="sports-body">
        <aside className="sports-sidebar" aria-label="Sport categories">
          {SIDEBAR_SPORTS.map(({ id, Icon, label }) => {
            const isActive = activeSport === id;
            const count = allMatches.filter((m) => m.sport === id).length;
            return (
              <button
                key={id}
                type="button"
                title={label}
                onClick={() => handleSportChange(id)}
                className={`sports-sidebar-btn ${isActive ? "sports-sidebar-btn--active" : ""} ${count === 0 ? "sports-sidebar-btn--empty" : ""}`}
              >
                <Icon />
              </button>
            );
          })}
        </aside>

        <div className="sports-main">
          <div className="sports-league-bar">
            <button
              type="button"
              onClick={() => setActiveLeague("ALL")}
              className={`sports-league-chip ${activeLeague === "ALL" ? "sports-league-chip--active" : ""}`}
            >
              All
            </button>
            {leagues.map((league) => (
              <button
                key={league}
                type="button"
                onClick={() => setActiveLeague(league)}
                className={`sports-league-chip ${activeLeague === league ? "sports-league-chip--active" : ""}`}
              >
                {league}
              </button>
            ))}
            <span className="sports-date-pill">{todayLabel}</span>
          </div>

          {filteredMatches.length === 0 ? (
            <p className="sports-empty-text">
              No {activeSport.toLowerCase()} matches right now
            </p>
          ) : (
            <div className="matches-scroll-container">
              {filteredMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={handleMatchClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sports;
