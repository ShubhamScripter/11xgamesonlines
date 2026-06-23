/** Count non-live rows across league sections (live section is always shown in full). */
export function countNonLiveMatches(sections) {
  if (!Array.isArray(sections)) return 0;
  return sections
    .filter((s) => !s.isLiveSection)
    .reduce((n, s) => n + (s.matches?.length || 0), 0);
}

/**
 * Show all in-play sections fully; cap upcoming/non-live rows for fast first paint.
 */
export function applyProgressiveDisplay(sections, { visibleRestCount }) {
  if (!Array.isArray(sections) || sections.length === 0) return [];

  let budget = Math.max(0, visibleRestCount);
  const result = [];

  for (const section of sections) {
    if (section.isLiveSection) {
      result.push(section);
      continue;
    }
    if (budget <= 0) continue;
    const matches = (section.matches || []).slice(0, budget);
    budget -= matches.length;
    if (matches.length > 0) {
      result.push({ ...section, matches });
    }
  }

  return result;
}
