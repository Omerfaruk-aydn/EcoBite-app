const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const axios = require('axios');

const { getStableImageUrl, fetchScrapedImage } = require('../utils/imageUtils');

// Utility function to generate recipes using OpenAI
const generateRecipesWithAI = async (prompt, count = 1) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing in backend environment');
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Sen profesyonel bir Türk şefisin. Verilen formata KESİNLİKLE UYARAK, ${count} adet %100 Türkçe yemek tarifi üret. 
            YANIT SADECE JSON DİZİSİ (Array) OLMALIDIR. MARKDOWN KULLANMA. 
            "imageKeyword" alanına yemeği en iyi tarif eden 2-3 adet İngilizce anahtar kelime yaz (ör: "grilled,meat", "lentil,soup").
            FORMAT:
            [
              {
                "id": "benzersiz_rastgele_string_id",
                "title": "Örnek Yemek Adı",
                "imageKeyword": "keyword1,keyword2",
                "readyInMinutes": 30,
                "difficulty": "Kolay",
                "extendedIngredients": [{"id": 1, "name": "Malzeme Adı", "amount": 1, "unit": "adet", "image": ""}],
                "analyzedInstructions": [{"name": "Yapılışı", "steps": [{"number": 1, "step": "İlk adım..."}]}],
                "summary": "Kısa ve iştah açıcı özet",
                "tags": ["kahvaltı", "vegan"]
              }
            ]`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    let content = response.data.choices[0].message.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    const recipesRaw = JSON.parse(content);
    
    // Map raw data to include stable images (try scraping first, then fallback)
    const finalRecipes = [];
    for (const r of recipesRaw) {
      const { imageKeyword, ...rest } = r;
      let img = await fetchScrapedImage(r.title);
      if (!img) img = getStableImageUrl(imageKeyword, r.title);
      
      finalRecipes.push({
        ...rest,
        image: img
      });
    }
    return finalRecipes;
  } catch (error) {
    console.error("OpenAI Error:", error.response?.data || error.message);
    throw new Error('Yapay zeka tarif üretemedi.');
  }
};

const User = require('./auth').User;

// Middleware to authenticate JWT
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// GET /api/recipes/daily?type=breakfast
router.get('/daily', auth, async (req, res) => {
  try {
    const { type } = req.query; // breakfast, lunch, dinner, vegan, dessert
    if (!type) return res.status(400).json({ message: "Type is required" });

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Check if daily recipes are already set for Today
    if (user.dailyRecipesDate === today && user.dailyRecipes && user.dailyRecipes[type] && user.dailyRecipes[type].length > 0) {
      return res.json(user.dailyRecipes[type]);
    }

    // 2. If it's a new day or not set, generate ALL daily categories at once to "lock" them
    const categories = ['breakfast', 'lunch', 'dinner', 'vegan', 'dessert', 'suggested'];
    const newDaily = user.dailyRecipes || {};

    // Map English category keys to Turkish tag keywords present in the DB
    const catTagRegex = {
      breakfast: 'kahvalt',
      lunch:     'çorba|öğle',
      dinner:    'et yeme|kebap|tencere|ızgara|dolma',
      vegan:     'zeytinyağl|vegan',
      dessert:   'tatlı|helva',
    };

    for (const cat of categories) {
      const regexStr = catTagRegex[cat];
      const matchQuery = regexStr
        ? { tags: { $regex: regexStr, $options: 'i' } }
        : {};

      const picked = await Recipe.aggregate([
        { $match: matchQuery },
        { $sample: { size: 3 } }
      ]);
      newDaily[cat] = picked;
    }

    // Update user
    user.dailyRecipes = newDaily;
    user.dailyRecipesDate = today;
    user.markModified('dailyRecipes');
    await user.save();

    return res.json(newDaily[type]);
  } catch (error) {
    console.error("Daily recipes error:", error);
    res.status(500).json({ message: "Sunucu hatası, tarif getirilemedi." });
  }
});

// POST /api/recipes/smart-search
router.post('/smart-search', async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: "Ingredients array is required" });
    }

    // Find recipes in DB that contain ANY of these ingredients
    const validIngredients = ingredients
      .map(ing => typeof ing === 'string' ? ing.trim() : (ing?.tr || ''))
      .filter(Boolean);
    
    console.log("[Smart Search] Incoming ingredients:", validIngredients);

    if (validIngredients.length === 0) return res.json([]);

    // Broaden search terms: if someone enters "Patates ve Sogan", split them
    const searchTerms = validIngredients.flatMap(i => i.split(/[\s,]+/));

    const orQueries = searchTerms.map(term => ({
      $or: [
        { 'extendedIngredients.name': { $regex: term, $options: 'i' } },
        { title: { $regex: term, $options: 'i' } },
        { summary: { $regex: term, $options: 'i' } }
      ]
    }));

    const existingRecipes = await Recipe.find({ $or: orQueries }).limit(15);
    console.log(`[Smart Search] Found ${existingRecipes.length} recipes in DB.`);

    // If we have any matches, or AI is likely to fail, just return what we have
    if (existingRecipes.length >= 1) {
      return res.json(existingRecipes);
    }

    // Try AI generation, but don't crash if it fails (quota issue)
    try {
      const prompt = `Şu malzemelerin BAZILARINI veya TAMAMINI ana malzeme olarak kullanan 3 adet harika yemek tarifi üret: ${ingredients.join(', ')}. Evde bulunabilecek temel malzemeleri (tuz, yağ vs.) ekleyebilirsin ama ana odak verdiğim malzemeler olmalı.`;
      const newRecipesData = await generateRecipesWithAI(prompt, 3);
      
      // Save generated recipes to DB for future caching
      await Recipe.insertMany(newRecipesData, { ordered: false }).catch(() => {});
      
      return res.json([...existingRecipes, ...newRecipesData]);
    } catch (aiError) {
      console.warn("AI Smart Search failed (likely quota):", aiError.message);
      // Fallback: Just return what we found in DB, even if it's 0 or 1
      return res.json(existingRecipes);
    }
  } catch (error) {
    console.error("Smart search error:", error);
    res.status(500).json({ message: "Arama sırasında bir hata oluştu." });
  }
});

// GET /api/recipes/all - Paginated and Filtered
router.get('/all', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (category && category !== 'all') {
      // Map frontend IDs to DB tags
      const categoryMap = {
        'breakfast': /Kahvaltı/i,
        'lunch': /Öğle/i,
        'dinner': /Akşam/i,
        'vegan': /Vegan/i,
        'dessert': /Tatlı/i
      };
      
      const searchPattern = categoryMap[category] || new RegExp(category, 'i');
      query.tags = searchPattern;
    }

    const recipes = await Recipe.find(query)
      .sort({ _id: -1 }) // Newest first
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination UI 
    const total = await Recipe.countDocuments(query);

    res.json({
      recipes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Fetch all recipes error:", error);
    res.status(500).json({ message: "Tarifler getirilemedi." });
  }
});

// --- FAVORITES ENDPOINTS ---

// GET /api/recipes/saved - Get user's favorites
router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch full recipe objects for each ID in favorites
    const favoriteRecipes = await Recipe.find({
      id: { $in: user.favorites || [] }
    });

    res.json(favoriteRecipes);
  } catch (error) {
    console.error("Fetch saved error:", error);
    res.status(500).json({ message: "Favoriler getirilemedi." });
  }
});

// POST /api/recipes/save - Add to favorites
router.post('/save', auth, async (req, res) => {
  try {
    const { id } = req.body; // Internal String ID
    if (!id) return res.status(400).json({ message: "Recipe ID is required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.favorites) user.favorites = [];
    
    // Avoid duplicates
    if (!user.favorites.includes(String(id))) {
      user.favorites.push(String(id));
      user.markModified('favorites');
      await user.save();
    }

    res.json({ message: "Tarif favorilere eklendi.", favorites: user.favorites });
  } catch (error) {
    console.error("Save recipe error:", error);
    res.status(500).json({ message: "Tarif kaydedilemedi." });
  }
});

// DELETE /api/recipes/unsave/:id - Remove from favorites
router.delete('/unsave/:id', auth, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.favorites = (user.favorites || []).filter(fid => fid !== String(recipeId));
    user.markModified('favorites');
    await user.save();

    res.json({ message: "Tarif favorilerden çıkarıldı.", favorites: user.favorites });
  } catch (error) {
    console.error("Unsave recipe error:", error);
    res.status(500).json({ message: "Favorilerden çıkarılamadı." });
  }
});

// IMAGE PROXY: Fetches external images server-side to bypass hotlink protection
router.get('/image-proxy', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('Missing url parameter');
  
  try {
    const cleanUrl = imageUrl.split('?v=')[0]; // Remove our salt
    // Extract domain for proper Referer spoofing
    const urlObj = new URL(cleanUrl);
    const referer = `${urlObj.protocol}//${urlObj.hostname}/`;
    
    const response = await axios.get(cleanUrl, {
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': referer,
        'Origin': referer,
      }
    });
    
    // Forward content-type
    const ct = response.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=604800'); // Cache for 7 days
    response.data.pipe(res);
  } catch (error) {
    console.error('Image proxy error for:', imageUrl, error.message);
    res.status(404).send('Image not found');
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  try {
    // Check if it's our String ID
    const recipe = await Recipe.findOne({ id: req.params.id });
    if (!recipe) return res.status(404).json({ message: "Tarif bulunamadı" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
