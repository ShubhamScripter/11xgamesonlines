import cricketBall from "../../assets/icon/cricketball-CqVRg2R3.png";
import footballBall from "../../assets/icon/football-CcbDrciO.png";
import tennisBall from "../../assets/icon/tennisball-CRn_0kNy.png";

export const SPORT_ICONS = {
  cricket: cricketBall,
  soccer: footballBall,
  tennis: tennisBall,
};

export const SPORT_LIST_META = {
  cricket: {
    icon: cricketBall,
    title: "Cricket",
    emptyMessage: "No cricket matches available.",
  },
  soccer: {
    icon: footballBall,
    title: "Football",
    emptyMessage: "No football matches available.",
  },
  tennis: {
    icon: tennisBall,
    title: "Tennis",
    emptyMessage: "No tennis matches available.",
  },
};

export const SPORT_CATEGORY_NAV = [
  { id: "cricket", label: "Cricket", image: cricketBall, path: "/cricket" },
  { id: "football", label: "Soccer", image: footballBall, path: "/football" },
  { id: "tennis", label: "Tennis", image: tennisBall, path: "/tennis" },
];
