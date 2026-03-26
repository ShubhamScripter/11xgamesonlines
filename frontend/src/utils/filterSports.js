// utils/filterSports.js
export const filterMatches = (matches, filterType) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (filterType === "In Play") {
    return matches.filter(m => m.inplay === true);
  } else if (filterType === "Today") {
    return matches.filter(m => new Date(m.date).toDateString() === today.toDateString());
  } else if (filterType === "Tomorrow") {
    return matches.filter(m => new Date(m.date).toDateString() === tomorrow.toDateString());
  }
  return matches;
};
