/**
 * Ingredient Emoji Mapper
 * Maps Turkish ingredient names to high-quality native emojis.
 * Provides zero-latency, vibrant visuals for the recipe detail page.
 */

const EMOJI_MAP: Record<string, string> = {
  // Vegetables & Greens
  'domates': '🍅',
  'patates': '🥔',
  'sogan': '🧅',
  'sarimsak': '🧄',
  'havuc': '🥕',
  'havc': '🥕',
  'biber': '🫑',
  'patlican': '🍆',
  'kabak': '🥒',
  'zucchini': '🥒',
  'ispanak': '🥬',
  'pazi': '🥬',
  'marul': '🥬',
  'roka': '🌿',
  'maydanoz': '🌿',
  'dereotu': '🌿',
  'nane': '🌿',
  'feslegen': '🌿',
  'tere': '🌿',
  'semizotu': '🌿',
  'reyhan': '🌿',
  'kekik': '🌱',
  'biberiye': '🌿',
  'defne': '🍃',
  'enginar': '🥗',
  'kereviz': '🥗',
  'pirasa': '🥬',
  'karnabahar': '🥦',
  'karnibahar': '🥦',
  'brokoli': '🥦',
  'bamya': '🎋',
  'bezelye': '🫛',
  'fasulye': '🫛',
  'bakla': '🫛',
  'borulce': '🫛',
  'misir': '🌽',
  'mantar': '🍄',
  'karakavak': '🍄',
  'algam': '🍠',
  'turp': '🍠',
  'lahana': '🥬',
  'brul': '🥦',
  'salatalik': '🥒',
  'hiyar': '🥒',
  'asma': '🍃',
  'yaprak': '🍃',
  'basil': '🌿',
  'rosemary': '🌿',
  'kale': '🥬',
  'aubergine': '🍆',

  // Proteins (Meats & Poultry)
  'kiyma': '🍖',
  'et': '🥩',
  'dana': '🥩',
  'sigir': '🥩',
  'kuzu': '🥩',
  'koyun': '🥩',
  'bonfile': '🥩',
  'antrikot': '🥩',
  'pirzola': '🥩',
  'incik': '🍗',
  'but': '🍗',
  'kanat': '🍗',
  'gogus': '🍗',
  'tavuk': '🍗',
  'hindi': '🍗',
  'ordek': '🍗',
  'ciger': '🥩',
  'bobrek': '🥩',
  'yurek': '🥩',
  'iskembe': '🍲',
  'paca': '🍲',
  'sucuk': '🌭',
  'sosis': '🌭',
  'pastirma': '🥓',
  'salam': '🥓',
  'kavurma': '🥩',
  'yumurta': '🥚',
  'kofte': '🧆',
  'kebap': '🍢',
  'kebab': '🍢',
  'doner': '🥙',
  'biftek': '🥩',
  'kelle': '🥩',
  'kemik': '🦴',
  'sirdan': '🍲',
  'mumbar': '🍲',

  // Seafood
  'balik': '🐟',
  'hamsi': '🐟',
  'sardalya': '🐟',
  'palamut': '🐟',
  'levrek': '🐟',
  'cipura': '🐟',
  'cupra': '🐟',
  'somon': '🐟',
  'mezgit': '🐟',
  'istavrit': '🐟',
  'lufer': '🐟',
  'uskeru': '🐟',
  'alabalik': '🐟',
  'kalkan': '🐟',
  'karides': '🍤',
  'midye': '🦪',
  'kalamar': '🦑',
  'ahtapot': '🐙',
  'murekkep': '🦑',
  'istakoz': '🦞',
  'iskorpit': '🐟',
  'cinekop': '🐟',

  // Dairy
  'sut': '🥛',
  'yogur': '🥛',
  'yogh': '🥛',
  'peynir': '🧀',
  'kasar': '🧀',
  'gravyer': '🧀',
  'mozzarella': '🧀',
  'parmesan': '🧀',
  'lor': '🧀',
  'cokelek': '🧀',
  'tereyagi': '🧈',
  'kaymak': '🥣',
  'krema': '🍶',
  'krem santi': '🍦',
  'mayonez': '🥣',
  'margarin': '🧈',

  // Grains & Legumes & Breads
  'un': '🌾',
  'pirinc': '🍚',
  'bulgur': '🌾',
  'bulgar': '🌾',
  'irmik': '🌾',
  'nisasta': '🍚',
  'makarna': '🍝',
  'eriste': '🍝',
  'sehriye': '🥣',
  'kuskus': '🍲',
  'mercimek': '🍲',
  'nohut': '🍲',
  'yufka': '🫓',
  'ekmek': '🍞',
  'bread': '🍞',
  'pide': '🫓',
  'simit': '🥯',
  'lavas': '🫓',
  'tortilla': '🫓',
  'kadayif': '🧁',
  'gullac': '🧁',
  'galeta': '🥖',
  'borek': '🥧',
  'bugday': '🌾',
  'kinoa': '🍲',
  'fava': '🍲',
  'humus': '🥣',
  'kisir': '🥗',
  'leblebi': '🥜',
  'lazanya': '🍝',

  // Spices, Condiments & Pantry
  'tuz': '🧂',
  'tu': '🧂',
  'seker': '🍬',
  'karabiber': '🌑',
  'pul biber': '🌶️',
  'toz biber': '🌶️',
  'isot': '🌶️',
  'kimyon': '🤎',
  'tarcin': '🪵',
  'vanilya': '🍦',
  'vanilin': '🍦',
  'zencefil': '🫚',
  'zerdecal': '💛',
  'sumak': '💜',
  'yenibahar': '🤎',
  'karanfil': '🤎',
  'corek otu': '🌑',
  'susam': '🥯',
  'maya': '🍞',
  'kabartma tozu': '🍚',
  'salca': '🥫',
  'ketchup': '🍅',
  'hardal': '🟡',
  'sirke': '🧪',
  'zeytinyagi': '🫒',
  'sivi yag': '💧',
  'yag': '💧',
  'zeytin': '🫒',
  'bal': '🍯',
  'pekmez': '🍯',
  'tahin': '🍯',
  'nar eksisi': '🍯',
  'limon': '🍋',
  'su': '💧',
  'cay': '☕',
  'kahve': '☕',
  'soda': '🥤',
  'buz': '🧊',
  'kakao': '🍫',
  'cikolata': '🍫',
  'recel': '🍯',
  'marmelat': '🍯',
  'safran': '🟡',
  'saffran': '🟡',
  'salep': '☕',
  'tarhana': '🥣',
  'tarhona': '🌿',
  'tarhun': '🌿',
  'kori': '🥣',
  'jelatin': '🧪',
  'recine': '🌲',
  'mayse': '🍺',
  'paprika': '🌶️',
  'sakiz': '🍬',

  // Fruits & Nuts
  'elma': '🍎',
  'armut': '🍐',
  'muz': '🍌',
  'cilek': '🍓',
  'kiraz': '🍒',
  'visne': '🍒',
  'vi': '🍒',
  'erik': '🍏',
  'kayisi': '🍑',
  'seftali': '🍑',
  'uzum': '🍇',
  'incir': '🍇',
  'nar': '🍎',
  'kavun': '🍈',
  'karpuz': '🍉',
  'portakal': '🍊',
  'mandalina': '🍊',
  'greyfurt': '🍊',
  'ayva': '🍐',
  'kizilcik': '🍒',
  'ceviz': '🥜',
  'findik': '🌰',
  'fistik': '🥜',
  'fisti': '🥜',
  'badem': '🥜',
  'kaju': '🥜',
  'hindistan': '🥥',
  'hurma': '🌴',
  'kestane': '🌰',
  'cam fistik': '🥜',
  'antep fistik': '🥜',
  'antep fisti': '🥜',

  // Others & Generic
  'meyve': '🍎',
  'sebze': '🥗',
  'baharat': '🧂',
  'bakliyat': '🍲',
  'sakatat': '🥩',
  'sos': '🥣',
  'siradan': '🍴',
  'dondurma': '🍦',
  'biskuvi': '🍪',
  'kek': '🍰',
  'pasta': '🎂',
  'havlu': '🧻',
  'testi': '🏺',
  'sis': '🍢',
  'sarisabir': '🌵',
  'kivam': '🧪',
  'tarı': '🌾',
  'meyan': '🪵',
  'niye': '🍴'
};

/**
 * Normalizes Turkish characters to their English counterparts for broader matching.
 */
const normalizeTurkish = (text: string): string => {
  return text
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/[.,:;?!-]/g, ' ')
    .toLowerCase().trim();
};

/**
 * Gets the emoji representation for a Turkish ingredient name.
 * Uses a robust normalization and multi-pass matching system.
 */
export const getIngredientEmoji = (name: string): string | null => {
  if (!name) return null;
  
  const originalLower = name.trim().toLowerCase();
  const normalized = normalizeTurkish(name);
  
  // Pass 1: Exact normalization match
  if (EMOJI_MAP[normalized]) return EMOJI_MAP[normalized];
  
  // Pass 2: Exact partial word match inside normalization (highest priority to longest keywords)
  const keywords = Object.keys(EMOJI_MAP).sort((a, b) => b.length - a.length);
  
  const match = keywords.find(keyword => normalized.includes(keyword) || originalLower.includes(keyword));
  if (match) {
    return EMOJI_MAP[match];
  }
  
  // Pass 3: Suffix-stripped match
  let stripped = normalized.replace(/(i|u|ü|si|su|sü|leri|lari)$/, '');
  if (EMOJI_MAP[stripped]) return EMOJI_MAP[stripped];
  
  // Ultimate Fallback
  return '🍴'; 
};
