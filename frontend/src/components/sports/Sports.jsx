import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCricketBatingData } from "../../features/sports/cricketSlice";
import { fetchSoccerBatingData } from "../../features/sports/soccerSlice";
import { fetchTannisBatingData } from "../../features/sports/tennisSlice";
import { GiCricketBat, GiSoccerBall, GiTennisBall } from "react-icons/gi";
import {
  isActiveHomeSportSettled,
  isHomeSportsListReady,
  isSportListSettled,
} from "../../utils/sportOddsUtils";
import { persistHomeSportsCache } from "../../utils/homeSportsHydrate";
import { isMatchInPlay } from "../../utils/sportMatchFilters";
import { useTranslation } from "../../i18n/LanguageContext";
import "./Sports.css";

const SIDEBAR_SPORTS = [
  { id: "CRICKET", labelKey: "menu.cricket", Icon: GiCricketBat },
  { id: "TENNIS", labelKey: "menu.tennis", Icon: GiTennisBall },
  { id: "FOOTBALL", labelKey: "menu.football", Icon: GiSoccerBall },
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
const isEligibleHomeMatch = (m, sport) => {
  if (isMatchInPlay(m, sport)) return true;
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

const hasRealOdds = (odd) =>
  odd &&
  ((odd.back?.price && odd.back.price !== "-") ||
    (odd.lay?.price && odd.lay.price !== "-"));

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

function CricketMatchCard({ match, onClick, sportLabel, inPlayLabel, matchOddsLabel }) {
  const [team1, team2] = parseTeamNames(match.teams);
  const o0 = match.odds?.[0];
  const o2 = match.odds?.[2] || match.odds?.[1];
  const hasOdds = (o) =>
    o &&
    ((o.back?.price && o.back.price !== "-") ||
      (o.lay?.price && o.lay.price !== "-"));

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
          <span className="sport-info-sport">{sportLabel}</span>
          <span className="sport-info-league">{match.league}</span>
        </div>
        {isMatchInPlay(match.raw, 'cricket') ? (
          <span className="live-tag live-tag--active">{inPlayLabel}</span>
        ) : null}
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

        <div className="cricket-match-odds">
          <div className="match-odds-label">{matchOddsLabel}</div>
          <div className="odds-container odds-container--match">
            {hasOdds(o0) || hasOdds(o2) ? (
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
    </div>
  );
}

function SoccerMatchCard({ match, onClick, sportLabel, inPlayLabel, matchOddsLabel }) {
  const o0 = match.odds?.[0];
  const o1 = match.odds?.[1];
  const o2 = match.odds?.[2];
  const hasOdds = (o) =>
    o &&
    ((o.back?.price && o.back.price !== "-") ||
      (o.lay?.price && o.lay.price !== "-"));
  const empty = { back: { price: "-", volume: "" }, lay: { price: "-", volume: "" } };

  return (
    <div
      className="match-card match-card--soccer"
      onClick={() => onClick(match)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(match)}
    >
      <div className="card-header">
        <div className="sport-info">
          <span className="sport-icon">
            <GiSoccerBall />
          </span>
          <span className="sport-info-sport">{sportLabel}</span>
          <span className="sport-info-league">{match.league}</span>
        </div>
        {isMatchInPlay(match.raw, 'soccer') ? (
          <span className="live-tag live-tag--active">{inPlayLabel}</span>
        ) : null}
      </div>
      <div className="match-card-body">
        <div className="match-card-top">
          <div className="teams-name">{match.teams}</div>
          <span className="match-time-text">{match.time}</span>
        </div>
        <div className="match-card-odds-footer">
          <div className="match-odds-label">{matchOddsLabel}</div>
          <div className="odds-container">
            {hasOdds(o0) || hasOdds(o1) || hasOdds(o2) ? (
              <>
                <OddsPair back={(o0 || empty).back} lay={(o0 || empty).lay} />
                <OddsPair back={(o1 || empty).back} lay={(o1 || empty).lay} />
                <OddsPair back={(o2 || empty).back} lay={(o2 || empty).lay} />
              </>
            ) : (
              <div className="odds-placeholder">
                {[0, 1, 2].map((i) => (
                  <OddsPair
                    key={i}
                    back={{ price: "-", volume: "" }}
                    lay={{ price: "-", volume: "" }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, onClick, labels }) {
  const SportIcon = SPORT_ICONS[match.sport] || GiSoccerBall;
  const visibleOdds = (match.odds || []).filter(hasRealOdds);
  const { inPlayLabel, matchOddsLabel, cricket: cricketLabel, football: footballLabel, tennis: tennisLabel } = labels;

  if (match.sport === "CRICKET") {
    return (
      <CricketMatchCard
        match={match}
        onClick={onClick}
        sportLabel={cricketLabel}
        inPlayLabel={inPlayLabel}
        matchOddsLabel={matchOddsLabel}
      />
    );
  }

  if (match.sport === "FOOTBALL") {
    return (
      <SoccerMatchCard
        match={match}
        onClick={onClick}
        sportLabel={footballLabel}
        inPlayLabel={inPlayLabel}
        matchOddsLabel={matchOddsLabel}
      />
    );
  }

  const sportLabel =
    match.sport === "TENNIS" ? tennisLabel : match.sport;

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
          <span className="sport-info-sport">{sportLabel}</span>
          <span className="sport-info-divider">|</span>
          <span className="sport-info-league">{match.league}</span>
        </div>
        {isMatchInPlay(match.raw, match.sport === 'TENNIS' ? 'tennis' : 'soccer') ? (
          <span className="live-tag live-tag--active">{inPlayLabel}</span>
        ) : null}
      </div>
      <div className="match-card-body">
        <div className="match-card-top">
          <div className="teams-name">{match.teams}</div>
          <span className="match-time-text">{match.time}</span>
        </div>
        <div className="match-card-odds-footer">
          <div className="odds-container">
            {visibleOdds.length > 0 ? (
              visibleOdds.map((odd, i) => (
                <OddsPair key={i} back={odd.back} lay={odd.lay} />
              ))
            ) : (
              <div className="odds-placeholder">
                {[0, 1, 2].map((i) => (
                  <OddsPair
                    key={i}
                    back={{ price: "-", volume: "" }}
                    lay={{ price: "-", volume: "" }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Sports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeSport, setActiveSport] = useState("CRICKET");
  const [activeLeague, setActiveLeague] = useState("ALL");

  const cardLabels = useMemo(
    () => ({
      inPlayLabel: t("sports.inPlay"),
      matchOddsLabel: t("sports.matchOdds"),
      cricket: t("menu.cricket"),
      football: t("menu.football"),
      tennis: t("menu.tennis"),
    }),
    [t]
  );

  const sportLabelById = useMemo(
    () => ({
      CRICKET: t("menu.cricket"),
      FOOTBALL: t("menu.football"),
      TENNIS: t("menu.tennis"),
    }),
    [t]
  );

  const todayTimeLabel = t("common.today");
  const tomorrowTimeLabel = t("common.tomorrow");

  const {
    matches: cricketMatches = [],
    loader: cricketLoading,
    error: cricketError,
    matchesHaveOdds: cricketHaveOdds,
    matchesOddsScope: cricketOddsScope,
  } = useSelector((state) => state.cricket);
  const {
    soccerData: soccerMatches = [],
    soccerLoading,
    soccerError,
    matchesHaveOdds: soccerHaveOdds,
    matchesOddsScope: soccerOddsScope,
  } = useSelector((state) => state.soccer);
  const {
    data: tennisMatches = [],
    loading: tennisLoading,
    error: tennisError,
    matchesHaveOdds: tennisHaveOdds,
    matchesOddsScope: tennisOddsScope,
  } = useSelector((state) => state.tennis);

  const todayLabel = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const sportStates = useMemo(
    () => ({
      cricket: {
        matches: cricketMatches,
        loading: cricketLoading,
        haveOdds: cricketHaveOdds,
      },
      soccer: {
        matches: soccerMatches,
        loading: soccerLoading,
        haveOdds: soccerHaveOdds,
      },
      tennis: {
        matches: tennisMatches,
        loading: tennisLoading,
        haveOdds: tennisHaveOdds,
      },
    }),
    [
      cricketMatches,
      cricketLoading,
      cricketHaveOdds,
      soccerMatches,
      soccerLoading,
      soccerHaveOdds,
      tennisMatches,
      tennisLoading,
      tennisHaveOdds,
    ]
  );

  const listReady = useMemo(
    () =>
      isHomeSportsListReady({
        cricketMatches,
        cricketLoading,
        soccerMatches,
        soccerLoading,
        tennisMatches,
        tennisLoading,
      }),
    [
      cricketMatches,
      cricketLoading,
      soccerMatches,
      soccerLoading,
      tennisMatches,
      tennisLoading,
    ]
  );

  const activeSportSettled = useMemo(
    () => isActiveHomeSportSettled(activeSport, sportStates),
    [activeSport, sportStates]
  );

  const activeSportLoadingOdds = useMemo(() => {
    const key =
      activeSport === "FOOTBALL"
        ? "soccer"
        : activeSport === "TENNIS"
          ? "tennis"
          : "cricket";
    const s = sportStates[key];
    return Boolean(s?.loading && s?.matches?.length > 0 && !s?.haveOdds);
  }, [activeSport, sportStates]);

  useEffect(() => {
    if (!listReady) return;
    persistHomeSportsCache({
      cricketMatches,
      cricketHaveOdds,
      cricketOddsScope,
      soccerMatches,
      soccerHaveOdds,
      soccerOddsScope,
      tennisMatches,
      tennisHaveOdds,
      tennisOddsScope,
    });
  }, [
    listReady,
    cricketMatches,
    cricketHaveOdds,
    cricketOddsScope,
    soccerMatches,
    soccerHaveOdds,
    soccerOddsScope,
    tennisMatches,
    tennisHaveOdds,
    tennisOddsScope,
  ]);

  const allMatches = useMemo(() => {
    const mapCricket = (m) => ({
      id: `${m.id}-cricket`,
      sport: "CRICKET",
      league: (m.cname || m.title || "Cricket").trim(),
      teams: (m.match || m.title || "—").trim(),
      time: formatMatchTime(m.date, todayTimeLabel, tomorrowTimeLabel),
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
      time: formatMatchTime(m.date, todayTimeLabel, tomorrowTimeLabel),
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
      time: formatMatchTime(m.date, todayTimeLabel, tomorrowTimeLabel),
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
          isMatchActive(m?.id, "cricket", m?.title) &&
          isEligibleHomeMatch(m, "cricket")
      )
      .map(mapCricket);

    const soccer = (soccerMatches || [])
      .filter(
        (m) =>
          isMatchActive(m?.id, "soccer", m?.title) &&
          isEligibleHomeMatch(m, "soccer")
      )
      .map(mapSoccer);

    const tennis = (tennisMatches || [])
      .filter(
        (m) =>
          isMatchActive(m?.id, "tennis", m?.title ?? m?.cname) &&
          isEligibleHomeMatch(m, "tennis")
      )
      .map(mapTennis);

    const sportKey = (card) =>
      card.sport === "FOOTBALL"
        ? "soccer"
        : (card.sport || "cricket").toLowerCase();

    const sortMatches = (a, b) => {
      const aLive = isMatchInPlay(a.raw, sportKey(a)) ? 1 : 0;
      const bLive = isMatchInPlay(b.raw, sportKey(b)) ? 1 : 0;
      if (bLive !== aLive) return bLive - aLive;
      return new Date(a.raw?.date || 0) - new Date(b.raw?.date || 0);
    };

    return [...cricket, ...soccer, ...tennis].sort(sortMatches);
  }, [cricketMatches, soccerMatches, tennisMatches, todayTimeLabel, tomorrowTimeLabel]);

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

  if (!listReady) {
    return (
      <div className="sports-section">
        <p className="sports-loading-text">{t("sports.loadingMatches")}</p>
      </div>
    );
  }

  if (fetchError && !hasRawMatches) {
    return (
      <div className="sports-section">
        <p className="sports-empty-text">{t("sports.loadFailed")}</p>
      </div>
    );
  }

  return (
    <div className="sports-section">
      <div className="sports-body">
        <aside className="sports-sidebar" aria-label="Sport categories">
          {SIDEBAR_SPORTS.map(({ id, Icon, labelKey }) => {
            const label = t(labelKey);
            const isActive = activeSport === id;
            const count = allMatches.filter((m) => m.sport === id).length;
            const sportKey =
              id === "FOOTBALL" ? "soccer" : id === "TENNIS" ? "tennis" : "cricket";
            const settling = !isSportListSettled(
              sportStates[sportKey].matches,
              sportStates[sportKey].loading
            );
            return (
              <button
                key={id}
                type="button"
                title={label}
                onClick={() => handleSportChange(id)}
                className={`sports-sidebar-btn ${isActive ? "sports-sidebar-btn--active" : ""} ${count === 0 ? "sports-sidebar-btn--empty" : ""}`}
              >
                <Icon />
                {settling && count === 0 ? (
                  <span className="sports-sidebar-pulse" aria-hidden />
                ) : null}
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
              {t("common.all")}
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
              {!activeSportSettled
                ? t("sports.loadingSportMatches", {
                    sport: sportLabelById[activeSport] || activeSport,
                  })
                : t("sports.noSportMatches", {
                    sport: sportLabelById[activeSport] || activeSport,
                  })}
            </p>
          ) : (
            <div className="matches-scroll-container">
              {activeSportLoadingOdds ? (
                <p className="sports-odds-hint">{t("sports.updatingOdds")}</p>
              ) : null}
              {filteredMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={handleMatchClick}
                  labels={cardLabels}
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
