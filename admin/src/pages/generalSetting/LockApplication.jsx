import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { IoSearchSharp, IoLockClosed, IoLockOpen } from 'react-icons/io5';
import axiosInstance from '../../utils/axiosInstance';
import { formatIST } from '../../utils/time';

const SPORTS = [
  { id: 'cricket', label: 'Cricket' },
  { id: 'soccer', label: 'Soccer' },
  { id: 'tennis', label: 'Tennis' },
];

const BET_TYPES = [
  { id: 'all_odds', label: 'Match Odds' },
  { id: 'all_bookmaker', label: 'Bookmaker' },
  { id: 'fancy', label: 'Fancy' },
  { id: 'betfair_fancy', label: 'Premium Fancy' },
];

const MATCH_SECTIONS = [
  { id: 'match_odds', label: 'Match Odds' },
  { id: 'bookmaker', label: 'Bookmaker' },
  { id: 'fancy', label: 'Fancy' },
  { id: 'premium', label: 'Premium' },
];

const DEFAULT_SECTIONS = Object.fromEntries(
  MATCH_SECTIONS.map((s) => [s.id, true])
);

function toDateInputValue(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function ToggleSwitch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-[#dc3545] border-[#dc3545]' : 'bg-[#e4e4e4] border-[#7e97a7]'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function LockChip({ locked }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
        locked
          ? 'bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]'
          : 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]'
      }`}
    >
      {locked ? <IoLockClosed size={12} /> : <IoLockOpen size={12} />}
      {locked ? 'Locked' : 'Open'}
    </span>
  );
}

function LockApplication() {
  const user = useSelector((state) => state.auth.user);
  const allowedRoles = ['superadmin', 'admin', 'subadmin', 'seniorSuper'];
  const canManage = allowedRoles.includes(user?.role);
  const canManageSections = canManage;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [sectionSettingsMap, setSectionSettingsMap] = useState({});
  const [sectionActionKey, setSectionActionKey] = useState(null);
  const [actionMatchId, setActionMatchId] = useState(null);

  const [sports, setSports] = useState({});
  const [betTypes, setBetTypes] = useState({});
  const [marketTypes, setMarketTypes] = useState({});
  const [leagues, setLeagues] = useState([]);
  const [matches, setMatches] = useState([]);

  const [activeEventSport, setActiveEventSport] = useState('cricket');
  const [eventDateMode, setEventDateMode] = useState('all');
  const [eventDate, setEventDate] = useState(toDateInputValue());
  const [eventMatches, setEventMatches] = useState([]);
  const [eventMatchTotal, setEventMatchTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openLeagues, setOpenLeagues] = useState({});

  const lockedSportCount = useMemo(
    () => SPORTS.filter((s) => sports[s.id] === true).length,
    [sports]
  );

  const lockedMatchCount = useMemo(
    () => matches.filter((m) => m.locked === true).length,
    [matches]
  );

  const loadSectionSettings = useCallback(async (sport) => {
    try {
      const { data } = await axiosInstance.get('/admin/match-section-settings', {
        params: sport ? { sport } : undefined,
      });
      setSectionSettingsMap(data?.data || {});
    } catch (err) {
      console.error('Failed to load match section settings:', err);
      setSectionSettingsMap({});
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/bet-application-lock');
      const payload = data?.data || {};
      setSports(payload.sports || {});
      setBetTypes(payload.betTypes || {});
      setMarketTypes(payload.marketTypes || {});
      setLeagues(Array.isArray(payload.leagues) ? payload.leagues : []);
      setMatches(Array.isArray(payload.matches) ? payload.matches : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load lock settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    if (!['cricket', 'soccer', 'tennis'].includes(activeEventSport)) {
      setEventMatches([]);
      return;
    }
    setEventsLoading(true);
    try {
      const { data } = await axiosInstance.get('/bet-application-lock/events', {
        params: {
          sport: activeEventSport,
          date: eventDateMode === 'all' ? 'all' : eventDate,
        },
      });
      setEventMatches(Array.isArray(data?.matches) ? data.matches : []);
      setEventMatchTotal(data?.totalAll ?? data?.total ?? 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load events');
      setEventMatches([]);
    } finally {
      setEventsLoading(false);
    }
  }, [activeEventSport, eventDate, eventDateMode]);

  useEffect(() => {
    if (canManage) loadSettings();
  }, [canManage, loadSettings]);

  useEffect(() => {
    if (canManage) loadEvents();
  }, [canManage, loadEvents]);

  useEffect(() => {
    if (canManage) loadSectionSettings(activeEventSport);
  }, [canManage, activeEventSport, loadSectionSettings]);

  const getMatchSections = useCallback(
    (matchId) => {
      const settings = sectionSettingsMap[String(matchId)];
      if (!settings || settings.matchDisabled) {
        return { ...DEFAULT_SECTIONS };
      }
      return { ...DEFAULT_SECTIONS, ...(settings.sections || {}) };
    },
    [sectionSettingsMap]
  );

  const handleSectionToggle = useCallback(
    async (match, sectionId, lockSection) => {
      if (!canManageSections || !match?.matchId) return;

      const matchKey = String(match.matchId);
      const actionKey = `${matchKey}-${sectionId}`;
      const settings = sectionSettingsMap[matchKey] || {};
      const currentDisabled = Array.isArray(settings.disabledSections)
        ? [...settings.disabledSections]
        : [];

      const nextDisabled = lockSection
        ? [...new Set([...currentDisabled, sectionId])]
        : currentDisabled.filter((s) => s !== sectionId);

      const previousMap = sectionSettingsMap;
      const nextSections = { ...DEFAULT_SECTIONS };
      for (const s of MATCH_SECTIONS) {
        nextSections[s.id] = !nextDisabled.includes(s.id);
      }
      setSectionSettingsMap((prev) => ({
        ...prev,
        [matchKey]: {
          ...(prev[matchKey] || {}),
          matchDisabled: false,
          disabledSections: nextDisabled,
          sections: nextSections,
        },
      }));

      try {
        setSectionActionKey(actionKey);
        await axiosInstance.patch(`/matches/${matchKey}/sections`, {
          sport: activeEventSport,
          matchName: match.matchName || '',
          disabledSections: nextDisabled,
        });
        await loadSectionSettings(activeEventSport);
        const label =
          MATCH_SECTIONS.find((s) => s.id === sectionId)?.label || sectionId;
        toast.success(lockSection ? `${label} hidden on user site` : `${label} visible on user site`);
      } catch (err) {
        setSectionSettingsMap(previousMap);
        toast.error(err?.response?.data?.message || 'Failed to update section');
      } finally {
        setSectionActionKey(null);
      }
    },
    [activeEventSport, canManageSections, loadSectionSettings, sectionSettingsMap]
  );

  const isLeagueLocked = (sport, leagueName) =>
    leagues.some(
      (l) =>
        l.sport === sport &&
        l.leagueName === leagueName &&
        l.locked === true
    );

  const isMatchLocked = (sport, matchId) =>
    matches.some(
      (m) =>
        m.sport === sport &&
        String(m.matchId) === String(matchId) &&
        m.locked === true
    );

  const toggleSport = (id, locked) => {
    setSports((prev) => ({ ...prev, [id]: locked }));
  };

  const toggleBetType = (id, locked) => {
    setBetTypes((prev) => ({ ...prev, [id]: locked }));
  };

  const toggleLeagueLock = (sport, leagueName, locked) => {
    setLeagues((prev) => {
      const rest = prev.filter(
        (l) => !(l.sport === sport && l.leagueName === leagueName)
      );
      if (locked) {
        return [...rest, { sport, leagueName, locked: true }];
      }
      return rest;
    });
  };

  const toggleMatchLock = async (match, locked) => {
    const { matchId, matchName, leagueName, date } = match;
    const previousMatches = matches;
    const newMatches = (() => {
      const rest = matches.filter(
        (m) =>
          !(
            m.sport === activeEventSport &&
            String(m.matchId) === String(matchId)
          )
      );
      if (locked) {
        return [
          ...rest,
          {
            sport: activeEventSport,
            matchId: String(matchId),
            matchName: matchName || '',
            leagueName: leagueName || '',
            date: date || '',
            locked: true,
          },
        ];
      }
      return rest;
    })();

    setMatches(newMatches);

    try {
      setActionMatchId(String(matchId));
      const { data } = await axiosInstance.patch(
        `/bet-application-lock/matches/${encodeURIComponent(matchId)}`,
        {
          sport: activeEventSport,
          locked,
          matchName: matchName || '',
          leagueName: leagueName || '',
          date: date || '',
        }
      );
      if (data?.data?.matches) {
        setMatches(data.data.matches);
      }
      toast.success(
        locked
          ? 'Match locked — hidden from user site'
          : 'Match unlocked — visible on user site'
      );
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          await axiosInstance.put('/bet-application-lock', {
            sports,
            betTypes,
            marketTypes,
            leagues,
            matches: newMatches,
          });
          toast.success(
            locked
              ? 'Match locked — hidden from user site'
              : 'Match unlocked — visible on user site'
          );
          return;
        } catch (putErr) {
          setMatches(previousMatches);
          toast.error(putErr?.response?.data?.message || 'Failed to lock match');
          return;
        }
      }
      setMatches(previousMatches);
      toast.error(err?.response?.data?.message || 'Failed to lock match');
    } finally {
      setActionMatchId(null);
    }
  };

  const groupedEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = eventMatches.filter((m) => {
      if (!term) return true;
      return (
        (m.matchName || '').toLowerCase().includes(term) ||
        (m.leagueName || '').toLowerCase().includes(term) ||
        String(m.matchId).includes(term)
      );
    });

    const map = filtered.reduce((acc, m) => {
      const league = m.leagueName || 'Other';
      if (!acc[league]) acc[league] = [];
      acc[league].push(m);
      return acc;
    }, {});

    return Object.keys(map)
      .sort((a, b) => a.localeCompare(b))
      .map((title) => ({ title, matches: map[title] }));
  }, [eventMatches, searchTerm]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/bet-application-lock', {
        sports,
        betTypes,
        marketTypes,
        leagues,
        matches,
      });
      toast.success('Lock settings saved successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save lock settings');
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return (
      <div className="mt-4 p-4 text-[#243a48] font-['Times_New_Roman']">
        You do not have permission to manage bet locks.
      </div>
    );
  }

  return (
    <div className="mt-4 p-2 pb-24 font-['Times_New_Roman']">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[#243a48] text-[16px] font-[700]">
            Lock Application{user?.userName ? ` — ${user.userName}` : ''}
          </h2>
          <p className="text-sm text-gray-600 mt-1 max-w-3xl">
            Enable locks to block users from placing bets. Locks apply at sport,
            bet type, market, league, and match level. Per-match section toggles
            (Match Odds, Bookmaker, Fancy, Premium) hide that section on the user
            site and apply immediately.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-[#fff3cd] text-[#856404] border border-[#ffc107] px-3 py-1.5 rounded-full">
            Sports locked: <strong>{lockedSportCount}</strong>
          </span>
          <span className="text-xs bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] px-3 py-1.5 rounded-full">
            Matches locked: <strong>{lockedMatchCount}</strong>
          </span>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 py-8 text-center">Loading lock settings…</p>
      ) : (
        <div className="space-y-4">
          {/* Sport-wise */}
          <section className="bg-white border border-[#7e97a7] rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#e0e6e6] border-b border-[#7e97a7] px-4 py-3 flex items-center justify-between">
              <h3 className="text-[#243a48] font-[700] text-sm">Event Type — Sports</h3>
              <button
                type="button"
                className="text-xs text-[#243a48] underline"
                onClick={() => {
                  const allLocked = SPORTS.every((s) => sports[s.id] === true);
                  const next = {};
                  SPORTS.forEach((s) => {
                    next[s.id] = !allLocked;
                  });
                  setSports((prev) => ({ ...prev, ...next }));
                }}
              >
                Toggle all
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {SPORTS.map((sport) => {
                const locked = sports[sport.id] === true;
                return (
                  <label
                    key={sport.id}
                    className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                      locked
                        ? 'border-[#dc3545] bg-[#fff5f5]'
                        : 'border-[#d1d5db] bg-[#fafafa] hover:bg-white'
                    }`}
                  >
                    <span className="text-sm text-[#243a48] font-semibold">
                      {sport.label}
                    </span>
                    <ToggleSwitch
                      checked={locked}
                      onChange={(v) => toggleSport(sport.id, v)}
                      label={`Lock ${sport.label}`}
                    />
                  </label>
                );
              })}
            </div>
          </section>

          {/* Market type (bet category) */}
          <section className="bg-white border border-[#7e97a7] rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#e0e6e6] border-b border-[#7e97a7] px-4 py-3">
              <h3 className="text-[#243a48] font-[700] text-sm">Type — Bet Categories</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BET_TYPES.map((type) => {
                const locked = betTypes[type.id] === true;
                return (
                  <label
                    key={type.id}
                    className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2 cursor-pointer ${
                      locked ? 'border-[#dc3545] bg-[#fff5f5]' : 'border-[#d1d5db] bg-[#fafafa]'
                    }`}
                  >
                    <span className="text-sm text-[#243a48]">{type.label}</span>
                    <ToggleSwitch
                      checked={locked}
                      onChange={(v) => toggleBetType(type.id, v)}
                      label={`Lock ${type.label}`}
                    />
                  </label>
                );
              })}
            </div>
          </section>

          {/* League & Match wise */}
          <section className="bg-white border border-[#7e97a7] rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#e0e6e6] border-b border-[#7e97a7] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[#243a48] font-[700] text-sm">
                Competition / Event / Markets
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={eventDateMode}
                  onChange={(e) => setEventDateMode(e.target.value)}
                  className="border border-[#aaa] rounded px-2 py-1 text-sm bg-white"
                >
                  <option value="all">All dates</option>
                  <option value="day">Single date</option>
                </select>
                {eventDateMode === 'day' && (
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="border border-[#aaa] rounded px-2 py-1 text-sm bg-white"
                  />
                )}
              </div>
            </div>

            <div className="border-b border-[#7e97a7] px-2 pt-2 flex flex-wrap gap-1">
              {SPORTS.map((sport) => (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => setActiveEventSport(sport.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-t border border-b-0 transition-colors ${
                    activeEventSport === sport.id
                      ? 'bg-white text-[#243a48] border-[#7e97a7]'
                      : 'bg-[#f3f4f6] text-gray-500 border-transparent hover:bg-[#e5e7eb]'
                  }`}
                >
                  {sport.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              <div className="relative mb-4 max-w-md">
                <IoSearchSharp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search league or match…"
                  className="w-full pl-9 pr-3 py-2 border border-[#aaa] rounded text-sm bg-white"
                />
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Showing {eventMatches.length} match{eventMatches.length === 1 ? '' : 'es'}
                {eventDateMode === 'all'
                  ? ` (${activeEventSport} — all dates)`
                  : ` for ${eventDate}`}
                {eventMatchTotal > eventMatches.length
                  ? ` · ${eventMatchTotal} total loaded`
                  : ''}
              </p>

              {eventsLoading ? (
                <p className="text-sm text-gray-500 py-6 text-center">Loading events…</p>
              ) : groupedEvents.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">
                  No events found for {activeEventSport}
                  {eventDateMode === 'day' ? ` on ${eventDate}` : ''}.
                </p>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {groupedEvents.map(({ title, matches: leagueMatches }) => {
                    const leagueLocked = isLeagueLocked(activeEventSport, title);
                    const isOpen = openLeagues[title] !== false;

                    return (
                      <div
                        key={title}
                        className="border border-[#d1d5db] rounded-lg overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-2 bg-[#f8fafc] px-3 py-2 border-b border-[#e5e7eb]">
                          <button
                            type="button"
                            className="flex-1 text-left text-sm font-semibold text-[#243a48]"
                            onClick={() =>
                              setOpenLeagues((prev) => ({
                                ...prev,
                                [title]: !isOpen,
                              }))
                            }
                          >
                            {isOpen ? '▼' : '▶'} {title}{' '}
                            <span className="text-gray-500 font-normal">
                              ({leagueMatches.length})
                            </span>
                          </button>
                          <LockChip locked={leagueLocked} />
                          <ToggleSwitch
                            checked={leagueLocked}
                            onChange={(v) =>
                              toggleLeagueLock(activeEventSport, title, v)
                            }
                            label={`Lock league ${title}`}
                          />
                        </div>

                        {isOpen && (
                          <div className="divide-y divide-[#f1f5f9]">
                            {leagueMatches.map((match) => {
                              const locked = isMatchLocked(
                                activeEventSport,
                                match.matchId
                              );
                              const sections = getMatchSections(match.matchId);
                              const matchSuspended = Boolean(
                                sectionSettingsMap[String(match.matchId)]?.matchDisabled
                              );

                              return (
                                <div
                                  key={match.matchId}
                                  className={`px-3 py-2 text-xs ${
                                    locked || matchSuspended ? 'bg-[#fff5f5]' : 'bg-white'
                                  }`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold text-[#243a48] truncate">
                                        {match.matchName || '—'}
                                      </p>
                                      <p className="text-gray-500 mt-0.5">
                                        ID: {match.matchId}
                                        {match.date
                                          ? ` · ${formatIST(match.date)}`
                                          : ''}
                                        {match.inplay ? ' · In Play' : ''}
                                        {matchSuspended ? ' · Match suspended' : ''}
                                        {locked ? ' · Locked' : ''}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <LockChip locked={locked} />
                                      <ToggleSwitch
                                        checked={locked}
                                        disabled={actionMatchId === String(match.matchId)}
                                        onChange={(v) => toggleMatchLock(match, v)}
                                        label={`Lock match ${match.matchId}`}
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-2 pt-2 border-t border-[#f1f5f9] flex flex-wrap items-center gap-x-4 gap-y-2">
                                    <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide w-full sm:w-auto">
                                      Sections
                                    </span>
                                    {MATCH_SECTIONS.map((section) => {
                                      const sectionEnabled = sections[section.id] !== false;
                                      const sectionLocked = !sectionEnabled;
                                      const actionKey = `${match.matchId}-${section.id}`;
                                      const isUpdating = sectionActionKey === actionKey;

                                      return (
                                        <div
                                          key={section.id}
                                          className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 ${
                                            sectionLocked
                                              ? 'border-[#fecaca] bg-[#fff5f5]'
                                              : 'border-[#d1d5db] bg-[#fafafa]'
                                          }`}
                                        >
                                          <span className="text-[10px] font-semibold text-[#243a48] whitespace-nowrap">
                                            {section.label}
                                          </span>
                                          <ToggleSwitch
                                            checked={sectionLocked}
                                            disabled={
                                              !canManageSections ||
                                              isUpdating ||
                                              matchSuspended
                                            }
                                            onChange={(v) =>
                                              handleSectionToggle(match, section.id, v)
                                            }
                                            label={`${section.label} for match ${match.matchId}`}
                                          />
                                          <span className="text-[10px] text-gray-500 min-w-[28px]">
                                            {isUpdating ? '…' : sectionLocked ? 'Hidden' : 'Visible'}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#243a48] border-t border-[#1a2d38] px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
        <p className="text-white text-xs sm:text-sm">
          Red toggle = blocked for users. Match lock applies instantly. Other locks need Save.
        </p>
        <button
          type="button"
          disabled={saving || loading}
          onClick={handleSave}
          className="bg-[#ffcc2f] text-[#243a48] border border-[#cb8009] px-5 py-2 rounded text-sm font-bold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Lock Settings'}
        </button>
      </div>
    </div>
  );
}

export default LockApplication;
