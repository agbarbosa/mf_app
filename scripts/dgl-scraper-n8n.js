/**
 * DGL Equipamentos Product Scraper for N8N
 *
 * This script scrapes product information from dglequipamentos.com.br
 * and returns structured JSON data.
 *
 * Usage in N8N:
 * 1. Add a "Code" node (JavaScript)
 * 2. Copy this entire code into the node
 * 3. Set the search query in the code
 * 4. The output will be JSON with product information
 *
 * Note: This website may require browser-like headers or even Puppeteer
 * if it has JavaScript rendering or bot protection.
 */

// ===================================================================
// METHOD 1: Using HTTP Request + Cheerio (for static HTML)
// Use this in N8N with "HTTP Request" node + "Code" node
// ===================================================================

/**
 * Parse HTML and extract products using Cheerio
 * Use this function in a Code node AFTER an HTTP Request node
 */
const cheerio = require('cheerio');

// Get HTML from previous HTTP Request node
const html = $input.item.json.body || $input.item.json.html;

// Load HTML into Cheerio
const $ = cheerio.load(html);

// Initialize products array
const products = [];

// ===================================================================
// IMPORTANT: Update these selectors based on the actual HTML structure
// You need to inspect the website to find the correct CSS selectors
// ===================================================================

// Common e-commerce selectors to try (you'll need to verify these):
const productSelectors = {
  // Try these container selectors - inspect the page to find the right one
  containers: [
    '.product-item',
    '.product',
    '.item-product',
    '.product-card',
    '[data-product]',
    '.grid-item',
    '.search-result-item'
  ],

  // Product detail selectors (relative to container)
  name: [
    '.product-name',
    '.product-title',
    'h2',
    'h3',
    '.title',
    '[data-product-name]'
  ],

  price: [
    '.product-price',
    '.price',
    '.valor',
    '.preco',
    '[data-product-price]',
    '.price-current'
  ],

  image: [
    '.product-image img',
    '.product-img img',
    'img[data-product-image]',
    '.image img'
  ],

  link: [
    'a[href*="/product"]',
    'a.product-link',
    '.product-name a',
    'a[data-product-url]'
  ]
};

// Helper function to try multiple selectors
function findElement($parent, selectors) {
  for (const selector of selectors) {
    const element = $parent.find(selector).first();
    if (element.length > 0) {
      return element;
    }
  }
  return null;
}

// Helper function to find container
function findContainers($, selectors) {
  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      return elements;
    }
  }
  return $();
}

// Find product containers
const productContainers = findContainers($, productSelectors.containers);

console.log(`Found ${productContainers.length} potential product containers`);

// Extract data from each product
productContainers.each((index, element) => {
  const $product = $(element);

  // Extract product details
  const nameElement = findElement($product, productSelectors.name);
  const priceElement = findElement($product, productSelectors.price);
  const imageElement = findElement($product, productSelectors.image);
  const linkElement = findElement($product, productSelectors.link);

  const name = nameElement ? nameElement.text().trim() : '';
  const priceText = priceElement ? priceElement.text().trim() : '';
  const imageUrl = imageElement ? imageElement.attr('src') || imageElement.attr('data-src') : '';
  const productUrl = linkElement ? linkElement.attr('href') : '';

  // Parse price (remove currency symbols and convert to number)
  const priceMatch = priceText.match(/[\d.,]+/);
  const price = priceMatch ? parseFloat(priceMatch[0].replace('.', '').replace(',', '.')) : null;

  // Build absolute URL if relative
  const absoluteUrl = productUrl && !productUrl.startsWith('http')
    ? `https://dglequipamentos.com.br${productUrl}`
    : productUrl;

  const absoluteImageUrl = imageUrl && !imageUrl.startsWith('http')
    ? `https://dglequipamentos.com.br${imageUrl}`
    : imageUrl;

  // Only add if we found at least a name or link
  if (name || productUrl) {
    products.push({
      name: name,
      price: price,
      priceFormatted: priceText,
      imageUrl: absoluteImageUrl,
      productUrl: absoluteUrl,
      position: index + 1
    });
  }
});

// Return the results
return products.map(product => ({
  json: product
}));

// ===================================================================
// METHOD 2: Complete N8N HTTP Request + Code Setup
// ===================================================================

/*
N8N Workflow Setup:

NODE 1: HTTP Request
- Method: GET
- URL: https://dglequipamentos.com.br/search/?q={{$json.searchQuery}}
- Headers:
  - User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
  - Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*\/*;q=0.8
  - Accept-Language: pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7
  - Referer: https://dglequipamentos.com.br/
- Response Format: String

NODE 2: Code (JavaScript)
- Copy the code from line 33 to 131 above

NODE 3: (Optional) Set for pagination or further processing
*/

// ===================================================================
// METHOD 3: Using Puppeteer (if website requires JavaScript rendering)
// Use this in N8N with a "Code" node
// ===================================================================

/*
const puppeteer = require('puppeteer');

// Search query
const searchQuery = 'carretel automatico para diesel';
const encodedQuery = encodeURIComponent(searchQuery);
const url = `https://dglequipamentos.com.br/search/?q=${encodedQuery}`;

// Launch browser
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ]
});

const page = await browser.newPage();

// Set user agent to avoid bot detection
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

// Set viewport
await page.setViewport({ width: 1920, height: 1080 });

// Navigate to search page
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Wait for products to load (adjust selector based on actual page)
await page.waitForSelector('.product-item, .product, .item-product', { timeout: 10000 }).catch(() => {
  console.log('Product selector not found, continuing anyway...');
});

// Extract product data
const products = await page.evaluate(() => {
  const results = [];

  // Try different selectors
  const selectors = ['.product-item', '.product', '.item-product', '.product-card'];
  let productElements = [];

  for (const selector of selectors) {
    productElements = document.querySelectorAll(selector);
    if (productElements.length > 0) break;
  }

  productElements.forEach((product, index) => {
    // Extract name
    const nameEl = product.querySelector('.product-name, .product-title, h2, h3');
    const name = nameEl ? nameEl.textContent.trim() : '';

    // Extract price
    const priceEl = product.querySelector('.product-price, .price, .valor, .preco');
    const priceText = priceEl ? priceEl.textContent.trim() : '';
    const priceMatch = priceText.match(/[\d.,]+/);
    const price = priceMatch ? parseFloat(priceMatch[0].replace('.', '').replace(',', '.')) : null;

    // Extract image
    const imgEl = product.querySelector('img');
    const imageUrl = imgEl ? (imgEl.src || imgEl.dataset.src || '') : '';

    // Extract link
    const linkEl = product.querySelector('a');
    const productUrl = linkEl ? linkEl.href : '';

    if (name || productUrl) {
      results.push({
        name,
        price,
        priceFormatted: priceText,
        imageUrl,
        productUrl,
        position: index + 1
      });
    }
  });

  return results;
});

await browser.close();

// Return results for N8N
return products.map(product => ({ json: product }));
*/
