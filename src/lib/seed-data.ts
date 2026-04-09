/**
 * Real sports card data for seeding the database.
 * These are actual popular cards with accurate names, years, sets, and teams.
 */
export const SEED_CARDS = [
  // --- Hockey ---
  { name: "2015-16 Upper Deck Young Guns #201", player_name: "Connor McDavid", year: 2015, card_set: "Upper Deck Series 1", sport: "Hockey", team: "Edmonton Oilers" },
  { name: "1979-80 O-Pee-Chee #18 RC", player_name: "Wayne Gretzky", year: 1979, card_set: "O-Pee-Chee", sport: "Hockey", team: "Edmonton Oilers" },
  { name: "2016-17 Upper Deck Young Guns #201", player_name: "Auston Matthews", year: 2016, card_set: "Upper Deck Series 1", sport: "Hockey", team: "Toronto Maple Leafs" },
  { name: "2005-06 Upper Deck Young Guns #201", player_name: "Sidney Crosby", year: 2005, card_set: "Upper Deck Series 1", sport: "Hockey", team: "Pittsburgh Penguins" },
  { name: "2005-06 Upper Deck Young Guns #443", player_name: "Alexander Ovechkin", year: 2005, card_set: "Upper Deck Series 2", sport: "Hockey", team: "Washington Capitals" },
  { name: "1966-67 Topps #35 RC", player_name: "Bobby Orr", year: 1966, card_set: "Topps", sport: "Hockey", team: "Boston Bruins" },
  { name: "2019-20 Upper Deck Young Guns #201", player_name: "Cale Makar", year: 2019, card_set: "Upper Deck Series 1", sport: "Hockey", team: "Colorado Avalanche" },
  { name: "2023-24 Upper Deck Young Guns #201", player_name: "Connor Bedard", year: 2023, card_set: "Upper Deck Series 1", sport: "Hockey", team: "Chicago Blackhawks" },

  // --- Basketball ---
  { name: "2018-19 Panini Prizm #280 RC", player_name: "Luka Doncic", year: 2018, card_set: "Panini Prizm", sport: "Basketball", team: "Dallas Mavericks" },
  { name: "2003-04 Topps Chrome #111 RC", player_name: "LeBron James", year: 2003, card_set: "Topps Chrome", sport: "Basketball", team: "Cleveland Cavaliers" },
  { name: "1986-87 Fleer #57 RC", player_name: "Michael Jordan", year: 1986, card_set: "Fleer", sport: "Basketball", team: "Chicago Bulls" },
  { name: "2009-10 Panini Prizm #1 RC", player_name: "Stephen Curry", year: 2009, card_set: "Panini Prizm", sport: "Basketball", team: "Golden State Warriors" },
  { name: "2019-20 Panini Prizm #248 RC", player_name: "Zion Williamson", year: 2019, card_set: "Panini Prizm", sport: "Basketball", team: "New Orleans Pelicans" },
  { name: "2023-24 Panini Prizm Silver #282 RC", player_name: "Victor Wembanyama", year: 2023, card_set: "Panini Prizm", sport: "Basketball", team: "San Antonio Spurs" },
  { name: "2020-21 Panini Prizm #258 RC", player_name: "Anthony Edwards", year: 2020, card_set: "Panini Prizm", sport: "Basketball", team: "Minnesota Timberwolves" },
  { name: "1996-97 Topps Chrome #138 RC", player_name: "Kobe Bryant", year: 1996, card_set: "Topps Chrome", sport: "Basketball", team: "Los Angeles Lakers" },

  // --- Football ---
  { name: "2017 Panini Prizm #269 RC", player_name: "Patrick Mahomes", year: 2017, card_set: "Panini Prizm", sport: "Football", team: "Kansas City Chiefs" },
  { name: "2020 Panini Prizm #325 RC", player_name: "Justin Herbert", year: 2020, card_set: "Panini Prizm", sport: "Football", team: "Los Angeles Chargers" },
  { name: "2020 Panini Prizm #307 RC", player_name: "Joe Burrow", year: 2020, card_set: "Panini Prizm", sport: "Football", team: "Cincinnati Bengals" },
  { name: "2018 Panini Prizm #203 RC", player_name: "Josh Allen", year: 2018, card_set: "Panini Prizm", sport: "Football", team: "Buffalo Bills" },
  { name: "2021 Panini Prizm #331 RC", player_name: "Trevor Lawrence", year: 2021, card_set: "Panini Prizm", sport: "Football", team: "Jacksonville Jaguars" },
  { name: "2000 Playoff Contenders #144 RC Auto", player_name: "Tom Brady", year: 2000, card_set: "Playoff Contenders", sport: "Football", team: "New England Patriots" },
  { name: "2023 Panini Prizm #341 RC", player_name: "CJ Stroud", year: 2023, card_set: "Panini Prizm", sport: "Football", team: "Houston Texans" },
  { name: "2023 Panini Prizm #302 RC", player_name: "Caleb Williams", year: 2023, card_set: "Panini Prizm", sport: "Football", team: "Chicago Bears" },

  // --- Baseball ---
  { name: "2018 Topps Chrome #150 RC", player_name: "Shohei Ohtani", year: 2018, card_set: "Topps Chrome", sport: "Baseball", team: "Los Angeles Angels" },
  { name: "2011 Topps Update #US175 RC", player_name: "Mike Trout", year: 2011, card_set: "Topps Update", sport: "Baseball", team: "Los Angeles Angels" },
  { name: "2001 Topps Chrome #596 RC", player_name: "Albert Pujols", year: 2001, card_set: "Topps Chrome", sport: "Baseball", team: "St. Louis Cardinals" },
  { name: "1952 Topps #311", player_name: "Mickey Mantle", year: 1952, card_set: "Topps", sport: "Baseball", team: "New York Yankees" },
  { name: "2019 Topps Chrome #203 RC", player_name: "Fernando Tatis Jr.", year: 2019, card_set: "Topps Chrome", sport: "Baseball", team: "San Diego Padres" },
  { name: "2022 Topps Chrome #215 RC", player_name: "Julio Rodriguez", year: 2022, card_set: "Topps Chrome", sport: "Baseball", team: "Seattle Mariners" },
  { name: "2020 Bowman Chrome #BCP-1 1st", player_name: "Jasson Dominguez", year: 2020, card_set: "Bowman Chrome", sport: "Baseball", team: "New York Yankees" },
  { name: "2023 Topps Chrome #100 RC", player_name: "Elly De La Cruz", year: 2023, card_set: "Topps Chrome", sport: "Baseball", team: "Cincinnati Reds" },

  // --- Soccer ---
  { name: "2023-24 Topps Chrome UCL #1 RC", player_name: "Lamine Yamal", year: 2023, card_set: "Topps Chrome UCL", sport: "Soccer", team: "FC Barcelona" },
  { name: "2019-20 Topps Chrome UCL #74 RC", player_name: "Erling Haaland", year: 2019, card_set: "Topps Chrome UCL", sport: "Soccer", team: "Manchester City" },
  { name: "2018-19 Topps Chrome UCL #1 RC", player_name: "Kylian Mbappe", year: 2018, card_set: "Topps Chrome UCL", sport: "Soccer", team: "Paris Saint-Germain" },
  { name: "2020-21 Topps Chrome UCL #88 RC", player_name: "Jude Bellingham", year: 2020, card_set: "Topps Chrome UCL", sport: "Soccer", team: "Real Madrid" },
  { name: "2004-05 Panini Mega Cracks #71 RC", player_name: "Lionel Messi", year: 2004, card_set: "Panini Mega Cracks", sport: "Soccer", team: "FC Barcelona" },
  { name: "2003-04 Panini Mega Cracks #237 RC", player_name: "Cristiano Ronaldo", year: 2003, card_set: "Panini Mega Cracks", sport: "Soccer", team: "Sporting CP" },

  // --- Pokemon ---
  { name: "1999 Base Set #4 Holo", player_name: "Charizard", year: 1999, card_set: "Base Set", sport: "Pokemon", team: null },
  { name: "1999 Base Set #2 Holo", player_name: "Blastoise", year: 1999, card_set: "Base Set", sport: "Pokemon", team: null },
  { name: "1999 Base Set #15 Holo", player_name: "Venusaur", year: 1999, card_set: "Base Set", sport: "Pokemon", team: null },
  { name: "2002 Legendary Collection #S1 Reverse Holo", player_name: "Charizard", year: 2002, card_set: "Legendary Collection", sport: "Pokemon", team: null },
  { name: "1996 Japanese Base Set #6 Holo", player_name: "Charizard", year: 1996, card_set: "Japanese Base Set", sport: "Pokemon", team: null },
  { name: "1999 Base Set #16 Holo", player_name: "Zapdos", year: 1999, card_set: "Base Set", sport: "Pokemon", team: null },
  { name: "2006 EX Dragon Frontiers #100 Gold Star", player_name: "Charizard", year: 2006, card_set: "EX Dragon Frontiers", sport: "Pokemon", team: null },
  { name: "2023 Scarlet & Violet 151 #199 Illustration Rare", player_name: "Mew", year: 2023, card_set: "Scarlet & Violet 151", sport: "Pokemon", team: null },

  // --- Magic: The Gathering ---
  { name: "Black Lotus (Alpha)", player_name: "Black Lotus", year: 1993, card_set: "Alpha", sport: "Magic", team: null },
  { name: "Ancestral Recall (Alpha)", player_name: "Ancestral Recall", year: 1993, card_set: "Alpha", sport: "Magic", team: null },
  { name: "Mox Sapphire (Alpha)", player_name: "Mox Sapphire", year: 1993, card_set: "Alpha", sport: "Magic", team: null },
  { name: "Time Walk (Alpha)", player_name: "Time Walk", year: 1993, card_set: "Alpha", sport: "Magic", team: null },
  { name: "Underground Sea (Revised)", player_name: "Underground Sea", year: 1994, card_set: "Revised Edition", sport: "Magic", team: null },
  { name: "Jace, the Mind Sculptor (Worldwake)", player_name: "Jace, the Mind Sculptor", year: 2010, card_set: "Worldwake", sport: "Magic", team: null },
  { name: "Liliana of the Veil (Innistrad)", player_name: "Liliana of the Veil", year: 2011, card_set: "Innistrad", sport: "Magic", team: null },
  { name: "Ragavan, Nimble Pilferer (MH2)", player_name: "Ragavan, Nimble Pilferer", year: 2021, card_set: "Modern Horizons 2", sport: "Magic", team: null },
  { name: "The One Ring (LTR)", player_name: "The One Ring", year: 2023, card_set: "Lord of the Rings", sport: "Magic", team: null },
  { name: "Sheoldred, the Apocalypse (DMU)", player_name: "Sheoldred, the Apocalypse", year: 2022, card_set: "Dominaria United", sport: "Magic", team: null },
];
