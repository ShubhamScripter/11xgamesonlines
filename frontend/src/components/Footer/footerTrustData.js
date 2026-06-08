export const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const SPONSORSHIPS = [
  {
    name: "Quetta Gladiators",
    role: "Titanium Sponsor",
    year: "2023",
    accent: "#7c3aed",
    initials: "QG",
    league: "Pakistan Super League (PSL)",
    location: "Quetta, Pakistan",
    description:
      "As Titanium Sponsor of the Quetta Gladiators, we backed one of the most passionate franchises in the Pakistan Super League, sharing the field with elite cricketing talent.",
  },
  {
    name: "Sunrisers Eastern Cape",
    role: "Title Sponsor",
    year: "2023 - 2024",
    accent: "#eab308",
    initials: "SEC",
    league: "SA20 League",
    location: "Gqeberha, South Africa",
    description:
      "Our title sponsorship of the Sunrisers Eastern Cape placed our brand at the heart of South Africa's premier T20 competition, the SA20 League.",
  },
  {
    name: "Deccan Gladiators",
    role: "Title Sponsor",
    year: "2023 - 2024",
    accent: "#2563eb",
    initials: "DG",
    league: "Abu Dhabi T10 League",
    location: "Abu Dhabi, UAE",
    description:
      "We proudly served as Title Sponsor of the Deccan Gladiators in the fast-paced Abu Dhabi T10 League, one of the most explosive formats in world cricket.",
  },
  {
    name: "St Kitts & Nevis Patriots",
    role: "Principle Sponsor",
    year: "2024 - 2025",
    accent: "#dc2626",
    initials: "SKNP",
    league: "Caribbean Premier League (CPL)",
    location: "St Kitts & Nevis, Caribbean",
    description:
      "As Principle Sponsor of the St Kitts & Nevis Patriots, we joined the vibrant Caribbean Premier League and its electric island cricket culture.",
  },
  {
    name: "Biratnagar Kings",
    role: "Back of Jersey Sponsor",
    year: "2024 - 2025",
    accent: "#0ea5e9",
    initials: "BK",
    league: "Nepal Premier League (NPL)",
    location: "Biratnagar, Nepal",
    description:
      "Our Back of Jersey sponsorship of the Biratnagar Kings supported the rapidly growing cricket scene in Nepal's Premier League.",
  },
];

export const BRAND_AMBASSADORS = [
  {
    name: "Mia Khalifa",
    years: "2024",
    role: "Media Personality",
    description:
      "Global media personality Mia Khalifa joined us as a brand ambassador, bringing a massive international social following to our platform.",
  },
  {
    name: "Kevin Pietersen",
    years: "2024 - 2026",
    role: "Cricket Legend",
    description:
      "Former England captain and one of cricket's most explosive batsmen, Kevin Pietersen represents our passion for the game at the highest level.",
  },
  {
    name: "Amy Jackson",
    years: "2023 - 2024",
    role: "Actress & Model",
    description:
      "Acclaimed actress and model Amy Jackson lent her star power as one of our flagship brand ambassadors.",
  },
  {
    name: "Hansika Motwani",
    years: "2023 - 2024",
    role: "Actress",
    description:
      "Popular Indian cinema star Hansika Motwani partnered with us, connecting our brand with millions of fans across South Asia.",
  },
  {
    name: "Wasim Akram",
    years: "2024 - 2028",
    role: "Cricket Legend",
    description:
      "The 'Sultan of Swing' Wasim Akram, widely regarded as the greatest fast bowler of all time, is a long-term ambassador of our brand.",
  },
  {
    name: "Keya Akter Payel",
    years: "2025",
    role: "Actress",
    description:
      "Bangladeshi actress Keya Akter Payel joined our roster of ambassadors, strengthening our presence across the region.",
  },
  {
    name: "Yesha Sagar",
    years: "2025 - 2026",
    role: "Content Creator",
    description:
      "Rising content creator Yesha Sagar represents the next generation of digital stars partnering with our brand.",
  },
];

export const OFFICIAL_PARTNER = {
  name: "CAZVIP",
  tagline: "Official Brand Partner",
};

export const GAMING_LICENSES = [
  { id: "curacao", label: "Gaming Curacao", badge: "GC" },
  { id: "anjouan", label: "Anjouan eGaming", badge: "AJ" },
  { id: "mandala", label: "Licensed Operator", badge: "●" },
];

export const RESPONSIBLE_GAMING = [
  { id: "stop", label: "Play Safe", badge: "✋" },
  { id: "gamcare", label: "GamCare", badge: "GC" },
  { id: "18plus", label: "18+ Only", badge: "18+" },
];

export const SOCIAL_LINKS = [
  { id: "facebook", label: "Facebook", href: "#", color: "#1877f2" },
  { id: "instagram", label: "Instagram", href: "#", color: "#e4405f" },
  { id: "imo", label: "IMO", href: "#", color: "#00b4ff" },
  { id: "tiktok", label: "TikTok", href: "#", color: "#010101" },
  { id: "x", label: "X", href: "#", color: "#000000" },
  { id: "pinterest", label: "Pinterest", href: "#", color: "#bd081c" },
  { id: "youtube", label: "YouTube", href: "#", color: "#ff0000" },
  { id: "telegram", label: "Telegram", href: "#", color: "#229ed9" },
  { id: "whatsapp", label: "WhatsApp", href: "#", color: "#25d366" },
];
