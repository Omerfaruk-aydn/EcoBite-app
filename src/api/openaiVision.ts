import type { DetectedIngredient } from '../types';

export const detectIngredients = async (base64Image: string): Promise<DetectedIngredient[]> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
            {
              type: 'text',
              text: `Görseldeki tüm yiyecek malzemelerini tanımla. 
              Kurallar:
              1. Sadece gerçekten gördüğün yiyecekleri listele.
              2. Gıda dışı nesneleri (tabak, el, plastik vb.) görmezden gel.
              3. Emin değilsen tahmin etme.
              4. Genel ve basit isimler kullan.
              5. Sonucu sadece JSON formatında, her malzeme için hem Türkçe (tr) hem İngilizce (en) isimleri içeren bir liste olarak döndür.
              Örnek: [{"tr": "domates", "en": "tomato"}, {"tr": "yumurta", "en": "egg"}]`,
            },
          ],
        },
      ],
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content.trim();
  // Extract JSON array from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse ingredients from AI response');
  }
  return JSON.parse(jsonMatch[0]) as DetectedIngredient[];
};
