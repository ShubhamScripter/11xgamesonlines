import { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';

const DEFAULT_SECTIONS = {
  match_odds: true,
  bookmaker: true,
  fancy: true,
  premium: true,
};

/**
 * Fetch per-match section visibility for user fullmarket pages.
 * @returns {{ loading: boolean, matchDisabled: boolean, sections: Record<string, boolean> }}
 */
export default function useMatchSectionSettings(matchId, sport) {
  const [loading, setLoading] = useState(true);
  const [matchDisabled, setMatchDisabled] = useState(false);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);

  useEffect(() => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/public/match-section-settings/${matchId}`, {
          params: sport ? { sport } : undefined,
        });
        const d = res?.data?.data || {};
        if (!mounted) return;
        setMatchDisabled(Boolean(d.matchDisabled));
        setSections({ ...DEFAULT_SECTIONS, ...(d.sections || {}) });
      } catch {
        if (mounted) {
          setMatchDisabled(false);
          setSections(DEFAULT_SECTIONS);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [matchId, sport]);

  return { loading, matchDisabled, sections };
}
