/**
 * DGL Scraper - Puppeteer Version for N8N
 *
 * Use this version if:
 * - The simple HTTP method returns empty results
 * - Products are loaded dynamically with JavaScript
 * - You're getting bot detection/403 errors
 *
 * SETUP:
 * 1. In N8N, create a Code node
 * 2. Paste this entire code
 * 3. Update SEARCH_QUERY and SELECTORS
 * 4. Ensure Puppeteer is available in your N8N environment
 */

const puppeteer = require('puppeteer');

// ============================================
// ⚠️ CONFIGURATION ⚠️
// ============================================

const CONFIG = {
  // Your search query
  searchQuery: 'carretel automatico para diesel',

  // Timeout in milliseconds
  timeout: 30000,

  // Wait for this selector before scraping (update based on site)
  waitForSelector: '.product-item, .product, .grid-item',

  // Base URL
  baseUrl: 'https://dglequipamentos.com.br'
};

const SELECTORS = {
  // Product container
  productContainer: '.product-item, .product, .grid-item, [data-product-id]',

  // Within each product
  name: '.product-name, .product-title, h2, h3, .title',
  price: '.price, .product-price, .valor, .preco',
  image: 'img',
  link: 'a',

  // Optional
  sku: '[data-sku]',
  availability: '.availability, .stock, .in-stock',
  description: '.description, .product-description'
};

// ============================================
// MAIN SCRAPER FUNCTION
// ============================================

async function scrapeProducts() {
  let browser;

  try {
    // Build search URL
    const searchUrl = `${CONFIG.baseUrl}/search/?q=${encodeURIComponent(CONFIG.searchQuery)}`;
    console.log(`Scraping: ${searchUrl}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();

    // Set realistic browser properties
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setViewport({
      width: 1920,
      height: 1080
    });

    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Referer': CONFIG.baseUrl
    });

    // Navigate to search page
    console.log('Loading page...');
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout
    });

    // Wait for products to load
    console.log('Waiting for products...');
    try {
      await page.waitForSelector(CONFIG.waitForSelector, {
        timeout: 10000
      });
    } catch (e) {
      console.log('Timeout waiting for products, continuing anyway...');
    }

    // Optional: Scroll to load lazy-loaded content
    await autoScroll(page);

    // Extract products
    console.log('Extracting product data...');
    const products = await page.evaluate((selectors) => {
      const results = [];

      // Helper to try multiple selectors
      const findElements = (parent, selectorString) => {
        const selectors = selectorString.split(',').map(s => s.trim());
        for (const selector of selectors) {
          const elements = parent.querySelectorAll(selector);
          if (elements.length > 0) return elements;
        }
        return [];
      };

      const findElement = (parent, selectorString) => {
        const selectors = selectorString.split(',').map(s => s.trim());
        for (const selector of selectors) {
          const element = parent.querySelector(selector);
          if (element) return element;
        }
        return null;
      };

      // Find all product containers
      const productContainers = findElements(document, selectors.productContainer);
      console.log(`Found ${productContainers.length} products`);

      productContainers.forEach((product, index) => {
        // Extract name
        const nameEl = findElement(product, selectors.name);
        const name = nameEl ? nameEl.textContent.trim() : '';

        // Extract price
        const priceEl = findElement(product, selectors.price);
        const priceText = priceEl ? priceEl.textContent.trim() : '';

        // Parse price
        let price = null;
        if (priceText) {
          const priceMatch = priceText.match(/[\d.,]+/);
          if (priceMatch) {
            price = parseFloat(
              priceMatch[0]
                .replace(/\./g, '')
                .replace(',', '.')
            );
          }
        }

        // Extract image
        const imgEl = findElement(product, selectors.image);
        const imageUrl = imgEl ?
          (imgEl.src || imgEl.dataset.src || imgEl.dataset.lazy || '') : '';

        // Extract link
        const linkEl = findElement(product, selectors.link);
        const productUrl = linkEl ? linkEl.href : '';

        // Extract SKU (optional)
        const skuEl = product.querySelector(selectors.sku);
        const sku = skuEl ? (skuEl.dataset.sku || skuEl.textContent.trim()) : '';

        // Extract availability (optional)
        const availEl = findElement(product, selectors.availability);
        const availability = availEl ? availEl.textContent.trim() : '';

        // Extract description (optional)
        const descEl = findElement(product, selectors.description);
        const description = descEl ? descEl.textContent.trim() : '';

        // Only add if we have useful data
        if (name || productUrl) {
          results.push({
            name,
            price,
            priceFormatted: priceText,
            imageUrl,
            productUrl,
            sku,
            availability,
            description,
            position: index + 1
          });
        }
      });

      return results;
    }, SELECTORS);

    // Add scrape metadata
    const enrichedProducts = products.map(product => ({
      ...product,
      searchQuery: CONFIG.searchQuery,
      scrapedAt: new Date().toISOString(),
      source: 'dglequipamentos.com.br'
    }));

    console.log(`Successfully scraped ${enrichedProducts.length} products`);

    await browser.close();
    return enrichedProducts;

  } catch (error) {
    if (browser) {
      await browser.close();
    }

    console.error('Scraping error:', error);

    return [{
      error: error.message,
      stack: error.stack,
      config: CONFIG,
      suggestion: 'Check selectors and network connectivity'
    }];
  }
}

// Helper function to auto-scroll page (loads lazy content)
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// ============================================
// EXECUTE AND RETURN RESULTS
// ============================================

const products = await scrapeProducts();

// Return in N8N format
return products.map(product => ({
  json: product
}));

// ============================================
// ALTERNATIVE: WITH PAGINATION SUPPORT
// ============================================

/*
async function scrapeWithPagination(maxPages = 5) {
  let allProducts = [];
  let currentPage = 1;

  while (currentPage <= maxPages) {
    // Update search URL with page parameter
    const searchUrl = `${CONFIG.baseUrl}/search/?q=${encodeURIComponent(CONFIG.searchQuery)}&page=${currentPage}`;

    // ... (same scraping logic as above)

    const products = await scrapePage(searchUrl);

    if (products.length === 0) {
      console.log('No more products found');
      break;
    }

    allProducts = allProducts.concat(products);
    currentPage++;

    // Add delay between pages (be respectful)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return allProducts;
}
*/

// ============================================
// TIPS FOR DEBUGGING
// ============================================

/*
1. Take screenshots to see what the browser sees:
   await page.screenshot({ path: 'screenshot.png', fullPage: true });

2. Get HTML to inspect:
   const html = await page.content();
   console.log(html);

3. Log console messages from the page:
   page.on('console', msg => console.log('PAGE LOG:', msg.text()));

4. Wait for specific conditions:
   await page.waitForFunction(() => {
     return document.querySelectorAll('.product').length > 0;
   });

5. Handle dialogs/popups:
   page.on('dialog', async dialog => {
     await dialog.dismiss();
   });
*/
