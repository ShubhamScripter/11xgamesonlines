import { EXCLUSIVE_GAMES } from "../exclusive/exclusiveGamesData";
import {
  POPULAR_GAMES_ROW1,
  POPULAR_GAMES_ROW2,
} from "../popular/popularGamesData";

const EXCLUSIVE_UIDS = new Set(EXCLUSIVE_GAMES.map((g) => g.game_uid));

const EXTRA_MOST_RATED = [
  {
    title: "Fortune Tree",
    provider: "JILI",
    game_uid: "6a7e156ceec5c581cd6b9251854fe504",
    icon: "https://bulkapi.in/jili/Fortune-Tree.png",
  },
  {
    title: "Hot Chilli",
    provider: "JILI",
    game_uid: "c845960c81d27d7880a636424e53964d",
    icon: "https://bulkapi.in/jili/Hot-Chilli.png",
  },
];

function buildMostRatedGames(limit = 9) {
  const pool = [...POPULAR_GAMES_ROW1, ...POPULAR_GAMES_ROW2, ...EXTRA_MOST_RATED];
  const seen = new Set();
  const games = [];

  for (const game of pool) {
    if (EXCLUSIVE_UIDS.has(game.game_uid)) continue;
    if (seen.has(game.game_uid)) continue;
    seen.add(game.game_uid);
    games.push(game);
    if (games.length >= limit) break;
  }

  return games;
}

export const MOST_RATED_GAMES = buildMostRatedGames(9);
