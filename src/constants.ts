export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  type?: string; // Primary type for battle logic
  sprite: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'shiny';
}

export const TYPE_CHART: Record<string, { strengths: string[], weaknesses: string[] }> = {
  fire: { strengths: ['grass', 'ice', 'bug', 'steel'], weaknesses: ['water', 'ground', 'rock'] },
  water: { strengths: ['fire', 'ground', 'rock'], weaknesses: ['electric', 'grass'] },
  grass: { strengths: ['water', 'ground', 'rock'], weaknesses: ['fire', 'ice', 'poison', 'flying', 'bug'] },
  electric: { strengths: ['water', 'flying'], weaknesses: ['ground'] },
  normal: { strengths: [], weaknesses: ['fighting'] },
  psychic: { strengths: ['fighting', 'poison'], weaknesses: ['bug', 'ghost', 'dark'] },
  ghost: { strengths: ['psychic', 'ghost'], weaknesses: ['ghost', 'dark'] },
  poison: { strengths: ['grass', 'fairy'], weaknesses: ['ground', 'psychic'] },
  ice: { strengths: ['grass', 'ground', 'flying', 'dragon'], weaknesses: ['fire', 'fighting', 'rock', 'steel'] },
  dragon: { strengths: ['dragon'], weaknesses: ['ice', 'dragon', 'fairy'] },
  flying: { strengths: ['grass', 'fighting', 'bug'], weaknesses: ['electric', 'ice', 'rock'] },
  fighting: { strengths: ['normal', 'ice', 'rock', 'dark', 'steel'], weaknesses: ['flying', 'psychic', 'fairy'] },
  ground: { strengths: ['fire', 'electric', 'poison', 'rock', 'steel'], weaknesses: ['water', 'grass', 'ice'] },
  rock: { strengths: ['fire', 'ice', 'flying', 'bug'], weaknesses: ['water', 'grass', 'fighting', 'ground', 'steel'] },
  bug: { strengths: ['grass', 'psychic', 'dark'], weaknesses: ['fire', 'flying', 'rock'] },
  steel: { strengths: ['ice', 'rock', 'fairy'], weaknesses: ['fire', 'fighting', 'ground'] },
  fairy: { strengths: ['fighting', 'dragon', 'dark'], weaknesses: ['poison', 'steel'] },
};

const GEN1_NAMES = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard",
  "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree",
  "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot",
  "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok",
  "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina",
  "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Clefairy", "Clefable",
  "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat",
  "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat",
  "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck",
  "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag",
  "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop",
  "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool",
  "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash",
  "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetch'd", "Doduo",
  "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder",
  "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee",
  "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute",
  "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung",
  "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela",
  "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu",
  "Starmie", "Mr. Mime", "Scyther", "Jynx", "Electabuzz", "Magmar",
  "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto",
  "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte",
  "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno",
  "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew"
];

const LEGENDARIES = [144, 145, 146, 150, 151];
const RARES = [3, 6, 9, 59, 65, 68, 94, 130, 131, 143, 149];
const UNCOMMONS = [2, 5, 8, 26, 31, 34, 36, 38, 40, 45, 53, 55, 57, 62, 64, 67, 71, 73, 76, 78, 80, 82, 85, 87, 89, 91, 93, 97, 99, 101, 103, 105, 106, 107, 110, 112, 113, 115, 117, 119, 121, 122, 123, 124, 125, 126, 127, 128, 134, 135, 136, 137, 139, 141, 142, 148];

// Simplified type mapping for Gen 1
const POKEMON_TYPES: Record<number, string[]> = {
  1: ['grass', 'poison'], 2: ['grass', 'poison'], 3: ['grass', 'poison'],
  4: ['fire'], 5: ['fire'], 6: ['fire', 'flying'],
  7: ['water'], 8: ['water'], 9: ['water'],
  14: ['electric'], 25: ['electric'],
  92: ['ghost', 'poison'], 93: ['ghost', 'poison'], 94: ['ghost', 'poison'],
  144: ['ice', 'flying'], 145: ['electric', 'flying'], 146: ['fire', 'flying'],
  150: ['psychic'], 151: ['psychic']
};

export const POKEMON_LIST: Pokemon[] = GEN1_NAMES.map((name, index) => {
  const id = index + 1;
  let rarity: Pokemon['rarity'] = 'common';
  if (LEGENDARIES.includes(id)) rarity = 'legendary';
  else if (RARES.includes(id)) rarity = 'rare';
  else if (UNCOMMONS.includes(id)) rarity = 'uncommon';

  return {
    id,
    name,
    types: POKEMON_TYPES[id] || ['normal'],
    type: (POKEMON_TYPES[id] || ['normal'])[0],
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    rarity
  };
});

export const TYPE_COLORS: Record<string, string> = {
  grass: "bg-green-500",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  normal: "bg-slate-400",
  psychic: "bg-pink-500",
  ghost: "bg-purple-600",
  poison: "bg-purple-500",
  fairy: "bg-pink-300",
  ice: "bg-cyan-300",
  dragon: "bg-indigo-600",
  flying: "bg-sky-400",
  fighting: "bg-orange-700",
  ground: "bg-amber-600",
  rock: "bg-stone-500",
  bug: "bg-lime-500",
  steel: "bg-zinc-400",
};

export const RARITY_COLORS: Record<Pokemon['rarity'], string> = {
  common: "text-slate-400",
  uncommon: "text-emerald-500",
  rare: "text-indigo-500",
  legendary: "text-amber-500",
  shiny: "text-pink-500",
};

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'capture' | 'rarity' | 'clicker' | 'battle' | 'progress' | 'secret';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Captura
  { id: 'first_capture', title: 'Primeiro Pokémon', description: 'Capture seu primeiro Pokémon.', icon: '🎯', category: 'capture' },
  { id: 'hunter_50', title: 'Caçador', description: 'Capture 50 Pokémon.', icon: '🏹', category: 'capture' },
  { id: 'pokedex_master', title: 'Mestre Pokémon', description: 'Capture 200+ Pokémon.', icon: '👑', category: 'capture' },
  
  // Raridade
  { id: 'lucky_rare', title: 'Sortudo', description: 'Capture um Pokémon Raro.', icon: '🍀', category: 'rarity' },
  { id: 'living_legend', title: 'Lenda Viva', description: 'Capture um Pokémon Lendário.', icon: '🔥', category: 'rarity' },
  { id: 'miracle_shiny', title: 'Milagre', description: 'Capture um Pokémon Shiny.', icon: '✨', category: 'rarity' },
  
  // Clicker
  { id: 'frenetic_click', title: 'Clique Frenético', description: 'Alcance 100 cliques rápidos no Clicker.', icon: '⚡', category: 'clicker' },
  { id: 'combo_master', title: 'Combo Master', description: 'Alcance um combo de x10 no Clicker.', icon: '💥', category: 'clicker' },
  
  // Batalha
  { id: 'first_win', title: 'Primeira Vitória', description: 'Vença sua primeira batalha.', icon: '⚔️', category: 'battle' },
  { id: 'invincible_5', title: 'Invencível', description: 'Vença 5 batalhas seguidas.', icon: '🛡️', category: 'battle' },
  { id: 'destroyer', title: 'Destruidor', description: 'Vença uma batalha sem tomar dano.', icon: '🌋', category: 'battle' },
  
  // Progresso
  { id: 'addicted', title: 'Viciado', description: 'Jogue por mais de 1 hora.', icon: '⏰', category: 'progress' },
  { id: 'collector', title: 'Colecionador', description: 'Tenha 100 Pokémon diferentes na Pokédex.', icon: '📂', category: 'progress' },
  
  // Segredos
  { id: 'secret_logo', title: 'Curiosidade Mórbida', description: 'Descobriu o segredo do logo.', icon: '🤫', category: 'secret' },
];
