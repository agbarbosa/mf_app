/**
 * DGL Scraper - Simple N8N Version
 *
 * QUICK START:
 * 1. Copy this entire code
 * 2. In N8N, create an HTTP Request node (see config below)
 * 3. Add a Code node and paste this code
 * 4. Update the SELECTORS based on website inspection
 */

// ============================================
// HTTP REQUEST NODE CONFIGURATION
// ============================================
/*
Method: GET
URL: https://dglequipamentos.com.br/search/?q=carretel%20automatico%20para%20diesel

Headers (Add these):
  User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
  Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*\/*;q=0.8
  Accept-Language: pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7
  Referer: https://dglequipamentos.com.br/

Response Format: String
*/

// ============================================
// CODE NODE - PASTE BELOW THIS LINE
// ============================================

const cheerio = require('cheerio');

// Get HTML from previous HTTP Request node
const html = $input.item.json.body;

// Load HTML into Cheerio
const $ = cheerio.load(html);

// ============================================
// ⚠️ CONFIGURE THESE SELECTORS ⚠️
// Inspect the website to find the correct ones
// ============================================

const SELECTORS = {
  // Main product container (the element that repeats for each product)
  productContainer: '.product-item, .product, .item, .grid-item, [data-product-id]',

  // Product name (try these in order)
  name: '.product-name, .product-title, .title, h2, h3, .name',

  // Price
  price: '.price, .product-price, .valor, .preco, [data-price]',

  // Image
  image: 'img',

  // Product link
  link: 'a'
};

// ============================================
// EXTRACTION LOGIC
// ============================================

const products = [];

// Try to find product containers
let $products = $(SELECTORS.productContainer);

// If no products found, try to find them by looking for common patterns
if ($products.length === 0) {
  console.log('No products found with default selectors, trying alternatives...');

  // Try finding by common class patterns
  const alternatives = [
    '[class*="product"]',
    '[class*="item"]',
    '[class*="card"]',
    'article',
    '.results > div',
    '.search-results > div'
  ];

  for (const selector of alternatives) {
    $products = $(selector);
    if ($products.length > 0) {
      console.log(`Found ${$products.length} products with selector: ${selector}`);
      break;
    }
  }
}

console.log(`Processing ${$products.length} products...`);

// Extract data from each product
$products.each((index, element) => {
  const $product = $(element);

  // Helper function to try multiple selectors
  const findText = (selectors) => {
    for (const selector of selectors.split(',').map(s => s.trim())) {
      const text = $product.find(selector).first().text().trim();
      if (text) return text;
    }
    return '';
  };

  const findAttr = (selectors, attr) => {
    for (const selector of selectors.split(',').map(s => s.trim())) {
      const value = $product.find(selector).first().attr(attr);
      if (value) return value;
    }
    return '';
  };

  // Extract product data
  const name = findText(SELECTORS.name);
  const priceText = findText(SELECTORS.price);
  const imageUrl = findAttr(SELECTORS.image, 'src') ||
                   findAttr(SELECTORS.image, 'data-src') ||
                   findAttr(SELECTORS.image, 'data-lazy');
  const productUrl = findAttr(SELECTORS.link, 'href');

  // Parse price to number
  let price = null;
  if (priceText) {
    const priceMatch = priceText.match(/[\d.,]+/);
    if (priceMatch) {
      // Convert Brazilian format (1.299,00) to number (1299.00)
      price = parseFloat(
        priceMatch[0]
          .replace(/\./g, '')  // Remove thousand separator
          .replace(',', '.')   // Convert decimal comma to dot
      );
    }
  }

  // Make URLs absolute
  const makeAbsolute = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return 'https://dglequipamentos.com.br' + url;
    return 'https://dglequipamentos.com.br/' + url;
  };

  const absoluteProductUrl = makeAbsolute(productUrl);
  const absoluteImageUrl = makeAbsolute(imageUrl);

  // Extract additional data (if available)
  const sku = $product.find('[data-sku]').attr('data-sku') || '';
  const availability = $product.find('.availability, .stock, .in-stock').text().trim();

  // Only add product if we have at least a name or URL
  if (name || productUrl) {
    products.push({
      name: name,
      price: price,
      priceFormatted: priceText,
      imageUrl: absoluteImageUrl,
      productUrl: absoluteProductUrl,
      sku: sku,
      availability: availability,
      position: index + 1,
      scrapedAt: new Date().toISOString()
    });
  }
});

// ============================================
// RETURN RESULTS
// ============================================

console.log(`Successfully extracted ${products.length} products`);

// If no products found, return debug information
if (products.length === 0) {
  return [{
    json: {
      error: 'No products found',
      debug: {
        htmlLength: html.length,
        htmlPreview: html.substring(0, 500),
        triedSelectors: SELECTORS,
        suggestion: 'Inspect the website HTML and update SELECTORS in the code'
      }
    }
  }];
}

// Return products in N8N format
return products.map(product => ({
  json: product
}));
