const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
];

const BLACKLIST = [
  'https://img.ye-mek.net/img/f/tarif.jpg',
  'placeholder', 'no-image', 'default.jpg', 'logo.png', 'favicon', 'banner'
];

function getHeaders() {
  return {
    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  };
}

async function fetchWiki(title) {
  try {
    const wikiTitle = (title || '').trim().replace(/\s+/g, '_');
    const url = `https://tr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    const { data } = await axios.get(url, { timeout: 4000 });
    if (data && data.thumbnail && data.thumbnail.source) return data.thumbnail.source.replace(/\/\d+px-/, '/800px-');
  } catch (e) { }
  return null;
}

// NUCLEAR: Extract thumbnails from Google Image Search (gstatic) with randomized offset
async function fetchFromGoogleMaster(title, offset = 0) {
  const candidates = [];
  try {
    const query = `${title} Türk yemeği tarifi site:lezzet.com.tr OR site:nefisyemektarifleri.com OR site:ye-mek.net OR site:sahrapsoysal.com OR site:kevserinmutfagi.com`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    const { data } = await axios.get(url, { timeout: 10000, headers: getHeaders() });
    
    // Nuclear regex for thumbnails
    const matches = data.match(/https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[^&\s\"]+/g);
    if (matches && matches.length > 0) {
        // Use the offset to pick different images for different recipes
        for (let i = offset; i < matches.length && candidates.length < 5; i++) {
            if(!candidates.includes(matches[i])) candidates.push(matches[i]);
        }
    }
  } catch (e) { }
  return candidates;
}

async function fetchFromSearchEngineLinks(title) {
  const candidates = [];
  try {
    const query = `${title} Türk yemeği tarifi`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { timeout: 10000, headers: getHeaders() });

    const matches = data.match(/https:\/\/(www\.)?([a-zA-Z0-9-]+\.)+(com|net|com\.tr|org)\/[^\s&\"]+/g);
    if (!matches) return [];

    const forbidden = ['google', 'youtube', 'facebook', 'twitter', 'instagram', 'pinterest'];
    const sorted = Array.from(new Set(matches)).sort((a,b) => {
        const aS = /lezzet|nefis|ye-mek|sahrap|kevser|sofra|ozlem|yemek|milliyet|hurriyet/.test(a) ? -1 : 1;
        const bS = /lezzet|nefis|ye-mek|sahrap|kevser|sofra|ozlem|yemek|milliyet|hurriyet/.test(b) ? -1 : 1;
        return aS - bS;
    });

    for (const link of sorted) {
      if (forbidden.some(f => link.includes(f))) continue;
      if (candidates.length >= 10) break;

      try {
        const { data: pageData } = await axios.get(link, { timeout: 4500, headers: getHeaders() });
        const $ = cheerio.load(pageData);
        const img = $('meta[property="og:image"]').attr('content') || $('article img').first().attr('src');
        if (img && img.startsWith('http') && !BLACKLIST.some(b => img.includes(b)) && !candidates.includes(img)) {
          candidates.push(img);
        }
      } catch (e) { }
    }
  } catch (e) { }
  return candidates;
}

async function fetchFromBing(title) {
  const candidates = [];
  try {
    const query = `${title} Türk yemeği tarifi`;
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&FORM=HDRSC3`;
    const { data } = await axios.get(url, { 
      timeout: 10000, 
      headers: { ...getHeaders(), 'Accept-Language': 'tr-TR,tr;q=0.9' } 
    });
    
    // Bing often puts image URLs in a JSON blob or direct matches
    const matches = data.match(/https:\/\/[^\s\"]+\.jpg/g);
    if (matches) {
       matches.forEach(m => {
           if (!BLACKLIST.some(b => m.includes(b)) && !candidates.includes(m)) {
               candidates.push(m);
           }
       });
    }
  } catch (e) { console.error(`   ❌ Bing Error: ${e.message}`); }
  return candidates;
}

async function getScrapedImageCandidates(title, offset = 0) {
  console.log(`🔍 Scraping candidates for: ${title}`);
  const wiki = await fetchWiki(title);
  if (wiki) console.log(`   ✅ Wiki: ${wiki}`);
  const bing = await fetchFromBing(title);
  if (bing.length) console.log(`   ✅ Bing: ${bing.length} found`);
  const links = await fetchFromSearchEngineLinks(title);
  if (links.length) console.log(`   ✅ Links: ${links.length} found`);
  
  const final = [];
  const hash = (t) => t.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0).toString(16);
  const salt = `?v=${hash(title).slice(0, 4)}`;
  const addSalt = (u) => u.includes('?') ? `${u}&v=${hash(title).slice(0, 4)}` : `${u}${salt}`;

  if (wiki) final.push(addSalt(wiki));
  bing.forEach(c => { if (!final.includes(c)) final.push(addSalt(c)); });
  links.forEach(c => { if (!final.includes(c)) final.push(addSalt(c)); });
  
  console.log(`   🏁 Total candidates: ${final.length}`);
  return final;
}



module.exports = {
  fetchScrapedImage: async (t) => { const c = await getScrapedImageCandidates(t); return c[0] || null; },
  getScrapedImageCandidates,
  CATEGORY_MAP: {} 
};
