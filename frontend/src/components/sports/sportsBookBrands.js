import sabaImg from "../../assets/sportsbook/saba.jpeg";
import ugImg from "../../assets/sportsbook/ug.jpeg";
import luckyImg from "../../assets/sportsbook/lucky.jpeg";
import tfImg from "../../assets/sportsbook/tf.jpeg";
import btiImg from "../../assets/sportsbook/bti.jpeg";

/** Local card images (assets/sportsbook). */
export const SPORTS_BRAND_IMAGES = {
  sabasports: sabaImg,
  unitedgaming: ugImg,
  lucksportgaming: luckyImg,
  tfgaming: tfImg,
  btigaming: btiImg,
};

/** Visual branding for sportsbook lobby cards (fallback when no image). */
export const SPORTS_BRAND_STYLES = {
  sabasports: {
    abbr: "SB",
    bg: "linear-gradient(145deg, #0b3d28 0%, #14805e 100%)",
  },
  unitedgaming: {
    abbr: "UG",
    bg: "linear-gradient(145deg, #1e3a5f 0%, #3b82f6 100%)",
  },
  lucksportgaming: {
    abbr: "LS",
    bg: "linear-gradient(145deg, #4a1942 0%, #9333ea 100%)",
  },
  tfgaming: {
    abbr: "TF",
    bg: "linear-gradient(145deg, #1f2937 0%, #6366f1 100%)",
  },
  btigaming: {
    abbr: "BT",
    bg: "linear-gradient(145deg, #7c2d12 0%, #ea580c 100%)",
  },
  sbovirtualsports: {
    abbr: "VS",
    bg: "linear-gradient(145deg, #134e4a 0%, #14b8a6 100%)",
  },
  sbosportsbook: {
    abbr: "SBO",
    bg: "linear-gradient(145deg, #1e3a8a 0%, #2563eb 100%)",
  },
  win568sportsbook: {
    abbr: "568",
    bg: "linear-gradient(145deg, #713f12 0%, #eab308 100%)",
  },
  cmd: {
    abbr: "CMD",
    bg: "linear-gradient(145deg, #374151 0%, #6b7280 100%)",
  },
  betby: {
    abbr: "BY",
    bg: "linear-gradient(145deg, #14532d 0%, #22c55e 100%)",
  },
};

export const getSportsBrandStyle = (providerKey) =>
  SPORTS_BRAND_STYLES[providerKey] || {
    abbr: "SP",
    bg: "linear-gradient(145deg, #1e2021 0%, #14805e 100%)",
  };

export const getSportsBrandImage = (providerKey) =>
  SPORTS_BRAND_IMAGES[providerKey] || null;

/** Short labels for horizontal sportsbook tiles (lobby UI). */
export const SPORTS_DISPLAY_NAMES = {
  sabasports: "I-Sports",
  unitedgaming: "UG Sports",
  lucksportgaming: "Luck Sports",
  tfgaming: "E-Sports",
  btigaming: "BTi Sports",
};

export const getSportsDisplayName = (providerKey, fallback = "") =>
  SPORTS_DISPLAY_NAMES[providerKey] || fallback;
