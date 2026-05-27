export const emojiMap: Record<string, string> = {
  // Sebzeler
  'domates': '🍅',
  'salatalık': '🥒',
  'havuç': '🥕',
  'patates': '🥔',
  'soğan': '🧅',
  'sarımsak': '🧄',
  'brokoli': '🥦',
  'marul': '🥬',
  'mısır': '🌽',
  'patlıcan': '🍆',
  'biber': '🫑',
  
  // Meyveler
  'elma': '🍎',
  'armut': '🍐',
  'muz': '🍌',
  'çilek': '🍓',
  'üzüm': '🍇',
  'karpuz': '🍉',
  'kavun': '🍈',
  'portakal': '🍊',
  'limon': '🍋',
  'ananas': '🍍',
  'avokado': '🥑',
  
  // Süt ve Kahvaltılık
  'süt': '🥛',
  'yumurta': '🥚',
  'peynir': '🧀',
  'yoğurt': '🥣',
  'tereyağı': '🧈',
  'zeytin': '🫒',
  'bal': '🍯',
  
  // Et ve Protein
  'tavuk': '🍗',
  'et': '🥩',
  'balık': '🐟',
  'sucuk': '🌭',
  'pastırma': '🥓',
  
  // Bakliyat ve Temel
  'pirinç': '🍚',
  'makarna': '🍝',
  'ekmek': '🍞',
  'un': '🥡',
  'şeker': '🍬',
  'tuz': '🧂',
  'yağ': '🧴',
  
  // İçecekler
  'su': '💧',
  'kahve': '☕',
  'çay': '🍵',
  'meyve suyu': '🧃',
};

export const getEmojiForIngredient = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerName.includes(key)) return emoji;
  }
  
  return '📦'; // Default
};
