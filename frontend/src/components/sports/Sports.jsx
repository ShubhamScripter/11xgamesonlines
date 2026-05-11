import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCricketData, fetchCricketBatingData } from "../../features/sports/cricketSlice";
import { fetchSoccerData, fetchSoccerBatingData } from "../../features/sports/soccerSlice";
import { fetchTennisData, fetchTannisBatingData } from "../../features/sports/tennisSlice";
import { GiCricketBat, GiSoccerBall, GiTennisBall } from "react-icons/gi";
import "./Sports.css";
import sportIcon from '../../assets/icon/icon-sport.png'
// Helper functions (implemented based on standard patterns)
const isMatchActive = (id, sport, title) => true; 
const isWithinNext24Hours = (dateString) => {
  if (!dateString) return false;
  const matchDate = new Date(dateString);
  const now = new Date();
  const diff = matchDate.getTime() - now.getTime();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
};
const formatMatchTime = (dateString, todayLabel = "today", tomorrowLabel = "tomorrow") => {
  if (!dateString) return "";
  const matchDate = new Date(dateString);
  const now = new Date();
  const isToday = matchDate.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();

  const timeStr = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  if (isToday) return `${todayLabel} ${timeStr}`;
  if (isTomorrow) return `${tomorrowLabel} ${timeStr}`;
  
  const day = String(matchDate.getDate()).padStart(2, '0');
  const month = String(matchDate.getMonth() + 1).padStart(2, '0');
  const year = String(matchDate.getFullYear()).slice(-2);
  return `${day}/${month}/${year} ${timeStr}`;
};

const t = (key) => key; // Mock translation function

const Sports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { matches: cricketMatches = [], loader: cricketLoading } = useSelector(
    (state) => state.cricket
  );
  const { soccerData: soccerMatches = [], soccerLoading } = useSelector(
    (state) => state.soccer
  );
  const { data: tennisMatches = [], loading: tennisLoading } = useSelector(
    (state) => state.tennis
  );

  useEffect(() => {
    if (!(cricketMatches?.length > 0)) dispatch(fetchCricketData());
    if (!(soccerMatches?.length > 0)) dispatch(fetchSoccerData());
    if (!(tennisMatches?.length > 0)) dispatch(fetchTennisData());
  }, [
    dispatch,
    cricketMatches?.length,
    soccerMatches?.length,
    tennisMatches?.length,
  ]);

  const topMatches = useMemo(() => {
    const cricket = (cricketMatches || [])
      .filter((m) => isMatchActive(m?.id, "cricket", m?.title))
      .filter(
        (m) => (m.inplay && m.tv && m.bm && m.f) || isWithinNext24Hours(m.date)
      )
      .map((m) => {
        const rawLeague = m.title || "Cricket";
        const rawMatchName = m.match || "";
        const league = rawLeague?.trim();
        const matchName = rawMatchName?.trim();
        const teams = matchName || league || "—";

        return {
          id: m.id,
          sport: "CRICKET",
          icon: <GiCricketBat />,
          league,
          teams,
          time: formatMatchTime(m.date, t("today"), t("tomorrow")),
          badges: [m.inplay && "MO", m.bm && "BM", m.f && "F"].filter(Boolean),
          odds: (m.odds || []).slice(0, 3).map((o) => ({
            back: { price: o?.home ?? "—", volume: o?.backVolume || "—" },
            lay: { price: o?.away ?? "—", volume: o?.layVolume || "—" },
          })),
          raw: m,
        };
      });

    const soccer = (soccerMatches || [])
      .filter((m) => isMatchActive(m?.id, "soccer", m?.title))
      .filter(
        (m) => (m.inplay && m.tv && m.bm && m.f) || isWithinNext24Hours(m.date)
      )
      .map((m) => {
        const rawLeague = m.title || "Football";
        const rawMatchName = m.match || "";
        const league = rawLeague?.trim();
        const matchName = rawMatchName?.trim();
        const teams = matchName || league || "—";

        return {
          id: m.id,
          sport: "FOOTBALL",
          icon: <GiSoccerBall />,
          league,
          teams,
          time: formatMatchTime(m.date, t("today"), t("tomorrow")),
          badges: [m.inplay && "MO", ...(m.channels || [])].filter(Boolean),
          odds: (m.odds || []).slice(0, 3).map((o) => ({
            back: { price: o?.home ?? "—", volume: o?.backVolume || "—" },
            lay: { price: o?.away ?? "—", volume: o?.layVolume || "—" },
          })),
          raw: m,
        };
      });

    const tennis = (tennisMatches || [])
      .filter((m) => isMatchActive(m?.id, "tennis", m?.title ?? m?.cname))
      .filter(
        (m) => (m.inplay && m.tv && m.bm && m.f) || isWithinNext24Hours(m.date)
      )
      .map((m) => {
        const rawLeague = m.title || "Tennis";
        const rawMatchName = m.match || m.cname || "";
        const league = rawLeague?.trim();
        const matchName = rawMatchName?.trim();
        const teams = matchName || league || "—";

        return {
          id: m.id,
          sport: "TENNIS",
          icon: <GiTennisBall />,
          league,
          teams,
          time: formatMatchTime(m.date, t("today"), t("tomorrow")),
          badges: [m.inplay && "MO", ...(m.channels || [])].filter(Boolean),
          odds: (m.odds || []).slice(0, 3).map((o) => ({
            back: { price: o?.home ?? "—", volume: o?.backVolume || "—" },
            lay: { price: o?.away ?? "—", volume: o?.layVolume || "—" },
          })),
          raw: m,
        };
      });
    // const byDate = (a, b) =>
    //   new Date(a.raw?.date || 0) - new Date(b.raw?.date || 0);


const sortMatches = (a, b) => {
  // LIVE matches first
  if (a.raw?.inplay && !b.raw?.inplay) return -1;
  if (!a.raw?.inplay && b.raw?.inplay) return 1;

  // Then sort by date
  return new Date(a.raw?.date || 0) - new Date(b.raw?.date || 0);
};

return [...cricket, ...soccer, ...tennis].sort(sortMatches);
  }, [cricketMatches, soccerMatches, tennisMatches]);

  const isLoading =
    topMatches.length === 0 &&
    (cricketLoading || soccerLoading || tennisLoading);

  const handleMatchClick = (match) => {
    if (match.sport === "CRICKET") {
      dispatch(fetchCricketBatingData(match.id));
      navigate(`/sports/fullmarket/${encodeURIComponent(match.teams)}/${match.id}`, {
        state: { match: match.raw },
      });
    } else if (match.sport === "FOOTBALL") {
      dispatch(fetchSoccerBatingData(match.id));
      navigate(`/sports/soccer/${encodeURIComponent(match.teams)}/${match.id}`, {
        state: { match: match.raw },
      });
    } else if (match.sport === "TENNIS") {
      dispatch(fetchTannisBatingData(match.id));
      navigate(`/sports/tennis/${encodeURIComponent(match.teams)}/${match.id}`, {
        state: { match: match.raw },
      });
    }
  };

  if (isLoading) return null;
  if (topMatches.length === 0) return null;

  return (
    <div className="sports-section bg-[#222424] mx-4 mt-4 mb-30">
      <div className="flex text-[20px] font-bold h-[50px] items-center gap-1 uppercase mb-2"><img src={sportIcon} className="h-full py-2"/> Sports</div>
      <div className="matches-scroll-container flex">
        {topMatches.map((match) => (
          <div key={match.id} className="min-w-[90%] md:min-w-[30%] bg-black rounded-[15px] overflow-hidden" onClick={() => handleMatchClick(match)}>
            <div className="card-header flex">
              <div className="bg-blue-800 text-[12px] px-2 py-1 flex-1 rounded-br-2xl truncate">
                <span className="border-r border-white pr-2">{match.sport}</span>
                <span className="px-2">{match.league}</span>
              </div>
              {match.raw.inplay ? (<span className="text-green-500 px-2 text-[12px] font-semibold animate-pulse ">LIVE</span>):<span className="text-gray-500 px-2 text-[12px] font-semibold">LIVE</span>}
            </div> 
            <div className="p-2">
              <div className="teams-name truncate">{match.teams}</div>
              <span className="match-time-text">{match.time}</span>
              <div className="odds-container border-t border-gray-600 py-4">
                {match.odds.length > 0 ? (
                  match.odds.map((odd, i) => (
                    <div key={i} className="odds-group">
                      <div className="odds-box back rounded-l-md">
                        <span className="odds-val">{odd.back.price}</span>
                        <span className="odds-vol">{odd.back.volume}</span>
                      </div>
                      <div className="odds-box lay rounded-r-md">
                        <span className="odds-val">{odd.lay.price}</span>
                        <span className="odds-vol">{odd.lay.volume}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="odds-placeholder">
                    <div className="odds-group">
                      <div className="odds-box lock">🔒</div>
                      <div className="odds-box lock">🔒</div>
                    </div>
                    <div className="odds-group">
                      <div className="odds-box lock">🔒</div>
                      <div className="odds-box lock">🔒</div>
                    </div>
                    <div className="odds-group">
                      <div className="odds-box lock">🔒</div>
                      <div className="odds-box lock">🔒</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sports;
