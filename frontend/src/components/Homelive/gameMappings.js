// Game UID Mappings for Live Casino Games
// Updated with actual game UIDs from casino provider

export const GAME_UID_MAPPINGS = {
  // Image code: Game UID (from your provided data)
  "1000": "2e31c310ad2491d3c6021f6063dc9b74", // Italian Roulette
  "11": "add11b218177a9898c594233148ca740", // Baccarat
  "12": "958d30b26401872450a74a2d710adef6", // Bet On Numbers HD
  "13": "973ba1832c9a604c066f7fa53b76001f", // No Commission Baccarat
  "130": "f1fa68fce40959ce6ad5f367739f9e27", // Super 6 Baccarat
  "14": "b548f20f3e252c312eb32f50c85f91f9", // Russian Poker
  "15": "5619183cf03c3b03ebd01bbf42b37de4", // Speed Cricket Baccarat
  "150": "efdb52994fbfe97efcbd878dbd697ebb", // Dragon Tiger
  "16": "a75308c716157fde9e4faf84bcf80f1f", // Video Blackjack
  "224": "d9723621d4007265d66cc115b5a953df", // Surrender Blackjack
  "224000": "101e3c281b35485001bec47561a0a03e", // Sic Bo
  "224100": "5cd59a9381764a84f5792d237469903a", // Ultimate Sic Bo
  "227100": "26f9f76a8fc813b8abcb6b8cb03c2eab", // Teen Patti 3 Card
  "227101": "e1b5650cd867be7719c15e7596aa7217", // Bet on Teen Patti
  "227103": "01556a46c5163d5570739dd7cddfcf68", // One Day Teen Patti
  "228000": "435b892a73bf466e0ad584d480e12143", // Andar Bahar
  "228001": "c88c40ec4fc544518d938315e2d1b2a3", // Lucky 7
  "228002": "69e690d4f810d033fb4bb8ac7f3cc12f", // 32 Cards
  "260": "4f22281594a261d99c1b1222bc2d3a8a", // Blackjack da Sorte
  "4151": "e34d828be9c5dbd861dbcc414d2daad7", // Spanish Unlimited Blackjack
  "45100": "93e289d1b18a9f82fb5d790f3c8e6735", // Cricket War
  "481008": "382c8d0c9979a8ac81bd5478aafd978b", // EZ Dealer Roulette Hindi
  "507000": "045e21f65e0e96eb502a4856ca9ababb", // Casino Hold'em
  "51": "18cf7864fee424c7471bb7996aa4d37a", // Unlimited Blackjack
  "541000": "b7385424b2c19a46cbcece0c8dfb0080", // Ultimate Roulette
  "6100": "7758936bfff853b06836541b03b372a6"  // Ultimate Flip
};

// Game names for reference and debugging
export const GAME_NAMES = {
  "1000": "Italian Roulette",
  "11": "Baccarat",
  "12": "Bet On Numbers HD",
  "13": "No Commission Baccarat",
  "130": "Super 6 Baccarat",
  "14": "Russian Poker",
  "15": "Speed Cricket Baccarat",
  "150": "Dragon Tiger",
  "16": "Video Blackjack",
  "224": "Surrender Blackjack",
  "224000": "Sic Bo",
  "224100": "Ultimate Sic Bo",
  "227100": "Teen Patti 3 Card",
  "227101": "Bet on Teen Patti",
  "227103": "One Day Teen Patti",
  "228000": "Andar Bahar",
  "228001": "Lucky 7",
  "228002": "32 Cards",
  "260": "Blackjack da Sorte",
  "4151": "Spanish Unlimited Blackjack",
  "45100": "Cricket War",
  "481008": "EZ Dealer Roulette Hindi",
  "507000": "Casino Hold'em",
  "51": "Unlimited Blackjack",
  "541000": "Ultimate Roulette",
  "6100": "Ultimate Flip"
};

// Helper function to get game UID by image code
export const getGameUID = (imageCode) => {
  return GAME_UID_MAPPINGS[imageCode] || imageCode;
};

// Helper function to get image code from game UID
export const getImageCode = (gameUID) => {
  const entry = Object.entries(GAME_UID_MAPPINGS).find(([_, uid]) => uid === gameUID);
  return entry ? entry[0] : null;
};
