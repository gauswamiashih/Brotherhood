import { Request, Response } from 'express';
import { db } from '../config/db';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAIAetkYQCJGhDI5fU77gKNe5XAaYZWEpM';

export const generateDescription = async (req: Request, res: Response) => {
  const { name, category, fabric, keyFeatures } = req.body;

  if (!name || !category || !fabric) {
    return res.status(400).json({ error: 'Name, category, and fabric type are required.' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API Key is not configured in the backend environment.' });
  }

  try {
    const prompt = `You are an elite luxury fashion copywriter. Write a premium, high-converting product description (2-3 sentences max) for a product named "${name}" in the "${category}" category, made of "${fabric}" fabric. Focus on couture elegance, premium craftsmanship, and luxury drape. Key features: ${keyFeatures || 'None'}. Do not include markdown formatting or quotes. Make it sound extremely exclusive and premium.`;

    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error('Gemini API Error:', errText);
      return res.status(502).json({ error: 'Failed to generate copy from Gemini service.' });
    }

    const data = (await apiResponse.json()) as any;
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    res.status(200).json({ description: generatedText });
  } catch (error: any) {
    console.error('Error generating product description:', error);
    res.status(500).json({ error: 'Internal server error while writing description.' });
  }
};

export const getStylistAdvice = async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'User message is required.' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API Key is not configured in the backend environment.' });
  }

  try {
    // 1. Fetch active inventory from DB
    const inventoryResult = await db.query(
      `SELECT p.id, p.name, p.price, p.category, p.image_url, s.name as shop_name 
       FROM products p 
       JOIN shops s ON p.shop_id = s.id
       ORDER BY p.created_at DESC`
    );

    const catalogString = inventoryResult.rows
      .map(
        (p: any) =>
          `- ${p.name} (Category: ${p.category}, Price: ₹${Number(p.price).toLocaleString()}, Shop: ${p.shop_name}, ID: ${p.id})`
      )
      .join('\n');

    const systemPrompt = `You are "Couture Stylist", a premium, AI-powered personal stylist for the Brotherhood Boutique Marketplace in Palanpur, Gujarat.
Your goal is to assist clients in selecting the perfect outfits from our exclusive boutique catalog for various events (wedding rituals, garba, modern festivals, premium street wear, etc.).

Rules:
1. Be polite, elite, and highly knowledgeable about luxury fashion, color coordination, and traditional/modern silhouettes.
2. You MUST ONLY recommend products that are present in the provided catalog below. DO NOT make up products.
3. When recommending a product, mention its name, price, and the boutique it belongs to.
4. If no product matches their query, suggest the closest available items or ask clarifying questions about their preferences (color, fit, event type).
5. ALWAYS format your output response cleanly.
6. When referencing a product, write its details clearly so the client knows exactly what to look for.

Available Boutique Catalog:
${catalogString || 'No active inventory available at this moment.'}`;

    // 2. Format history for Gemini API
    const formattedContents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Welcome to Couture Stylist! I am your personal design advisor. Let me help you configure your premium wardrobe from Palanpurs leading boutiques.',
          },
        ],
      },
    ];

    // Append history
    if (Array.isArray(history)) {
      history.forEach((h: any) => {
        formattedContents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text || '' }],
        });
      });
    }

    // Append latest user message
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: formattedContents,
        }),
      }
    );

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error('Gemini API Chat Error:', errText);
      return res.status(502).json({ error: 'Failed to fetch advice from Gemini stylist.' });
    }

    const data = (await apiResponse.json()) as any;
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Match recommended product IDs from catalog to return product objects as structured metadata
    const recommendedProducts: any[] = [];
    inventoryResult.rows.forEach((p: any) => {
      // Look for product name or ID matches in the response text
      const nameEscaped = p.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(${nameEscaped}|${p.id})`, 'i');
      if (regex.test(reply)) {
        recommendedProducts.push(p);
      }
    });

    res.status(200).json({
      reply,
      products: recommendedProducts,
    });
  } catch (error: any) {
    console.error('Error fetching stylist advice:', error);
    res.status(500).json({ error: 'Internal server error while retrieving stylist advice.' });
  }
};
