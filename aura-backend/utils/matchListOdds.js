/** Map provider list `section[]` to API odds rows (back/lay + volumes). */
export function sectionsToOddsArray(sections, marketStatus = '', withOdds = true) {
  if (!withOdds || !Array.isArray(sections) || !sections.length) return [];

  return sections.map((section) => ({
    home: section?.odds?.[0]?.odds?.toString() || '0',
    away: section?.odds?.[1]?.odds?.toString() || '0',
    backVolume: section?.odds?.[0]?.size?.toString() || '',
    layVolume: section?.odds?.[1]?.size?.toString() || '',
    gstatus:
      section?.gstatus != null ? String(section.gstatus) : marketStatus,
  }));
}
