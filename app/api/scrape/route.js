import axios from 'axios';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Received body:', body);

    if (!body.url || !body.url.includes('amazon')) {
      return new Response(JSON.stringify({ error: 'Invalid Amazon URL' }), { status: 400 });
    }

    const cheerio = await import('cheerio');

    const { data } = await axios.get(body.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);

    // Extract the title, description, and image
    const metaTags = {
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      url: $('meta[property="og:url"]').attr('content') || body.url,
      description: $('meta[property="og:description"]').attr('content') || 'No description available',
      image: $('meta[property="og:image"]').attr('content') || $('#imgTagWrapperId img').attr('src'),
    };

    // Selectors for different Amazon price elements
    const priceSelectors = [
      '#priceblock_ourprice',               // Standard price
      '#priceblock_dealprice',               // Deal price
      '#price_inside_buybox',                // Buy box price
      '.a-price .a-offscreen',                // Mobile/standard price
      '.apexPriceToPay span.a-offscreen',     // Product page displayed price
      '#corePrice_feature_div span.a-offscreen',  // Some layouts
    ];

    let price = '';

    for (const selector of priceSelectors) {
      price = $(selector).first().text().trim();
      if (price) break;  // Stop searching once a valid price is found
    }

    metaTags.price = price || 'Price not available';

    console.log('Scraped product data:', metaTags);
    return new Response(JSON.stringify(metaTags), { status: 200 });
  } catch (error) {
    console.error('Error fetching Amazon data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch product data' }), { status: 500 });
  }
}