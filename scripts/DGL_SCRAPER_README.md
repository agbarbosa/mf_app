# DGL Equipamentos Product Scraper for N8N

This guide will help you scrape product information from **dglequipamentos.com.br** using N8N.

## 🎯 What This Does

Extracts product information from DGL Equipamentos search results into JSON format:
- Product name
- Price (both formatted and numeric)
- Image URL
- Product URL
- Position in search results

## 📋 Prerequisites

1. N8N installed and running
2. Access to the N8N workflow editor

## 🔍 Step 1: Inspect the Website to Find Selectors

Before using the scraper, you need to find the correct CSS selectors:

### How to Find Selectors:

1. **Open the search page** in your browser:
   ```
   https://dglequipamentos.com.br/search/?q=carretel%20automatico%20para%20diesel
   ```

2. **Right-click on a product** and select "Inspect" or "Inspect Element"

3. **Find the product container:**
   - Look for a repeating HTML element that wraps each product
   - Common examples: `<div class="product-item">`, `<article class="product">`, etc.
   - Note the CSS class or element type

4. **Find product details** (within the container):
   - **Name**: Look for `<h2>`, `<h3>`, or elements with classes like `product-name`, `product-title`
   - **Price**: Look for elements with classes like `price`, `product-price`, `valor`, `preco`
   - **Image**: Look for `<img>` tags, note the `src` or `data-src` attribute
   - **Link**: Look for `<a>` tags with the product URL

### Example HTML Structure:

```html
<div class="product-item">
  <a href="/produto/carretel-automatico">
    <img src="/images/product.jpg" alt="Product">
    <h3 class="product-name">Carretel Automático para Diesel</h3>
    <span class="price">R$ 1.299,00</span>
  </a>
</div>
```

In this example:
- Container: `.product-item`
- Name: `.product-name` or `h3`
- Price: `.price`
- Image: `img`
- Link: `a`

## 🚀 Step 2: Set Up N8N Workflow

### Option A: Simple HTTP Request + Code (Recommended First)

#### Node 1: HTTP Request

Create an HTTP Request node with these settings:

**Basic Settings:**
- **Method**: GET
- **URL**: `https://dglequipamentos.com.br/search/?q=carretel%20automatico%20para%20diesel`
  - Replace `carretel%20automatico%20para%20diesel` with your search query (URL encoded)

**Headers:** (Click "Add Option" → "Add Header")

Add these headers to mimic a real browser:

| Name | Value |
|------|-------|
| User-Agent | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36` |
| Accept | `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8` |
| Accept-Language | `pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7` |
| Referer | `https://dglequipamentos.com.br/` |
| Cache-Control | `no-cache` |

**Response:**
- **Response Format**: `String`

#### Node 2: Code (JavaScript)

Add a Code node and use this template:

```javascript
const cheerio = require('cheerio');

// Get HTML from HTTP Request node
const html = $input.item.json.body;

// Load HTML
const $ = cheerio.load(html);

const products = [];

// ⚠️ UPDATE THESE SELECTORS based on your inspection
const PRODUCT_CONTAINER = '.product-item';  // Update this!
const PRODUCT_NAME = '.product-name';        // Update this!
const PRODUCT_PRICE = '.price';              // Update this!
const PRODUCT_IMAGE = 'img';                 // Update this!
const PRODUCT_LINK = 'a';                    // Update this!

// Find all products
$(PRODUCT_CONTAINER).each((index, element) => {
  const $product = $(element);

  // Extract data
  const name = $product.find(PRODUCT_NAME).text().trim();
  const priceText = $product.find(PRODUCT_PRICE).text().trim();
  const imageUrl = $product.find(PRODUCT_IMAGE).attr('src') ||
                   $product.find(PRODUCT_IMAGE).attr('data-src') || '';
  const productUrl = $product.find(PRODUCT_LINK).attr('href') || '';

  // Parse price
  const priceMatch = priceText.match(/[\d.,]+/);
  const price = priceMatch ?
    parseFloat(priceMatch[0].replace(/\./g, '').replace(',', '.')) : null;

  // Make URLs absolute
  const absoluteUrl = productUrl.startsWith('http') ?
    productUrl : `https://dglequipamentos.com.br${productUrl}`;
  const absoluteImageUrl = imageUrl.startsWith('http') ?
    imageUrl : `https://dglequipamentos.com.br${imageUrl}`;

  // Add to results
  if (name || productUrl) {
    products.push({
      name,
      price,
      priceFormatted: priceText,
      imageUrl: absoluteImageUrl,
      productUrl: absoluteUrl,
      position: index + 1
    });
  }
});

// Return results
return products.map(product => ({ json: product }));
```

### Option B: Using Puppeteer (If website requires JavaScript)

If the website doesn't load products without JavaScript or has strong bot protection:

**Node: Code (JavaScript)**

```javascript
const puppeteer = require('puppeteer');

const searchQuery = 'carretel automatico para diesel';
const url = `https://dglequipamentos.com.br/search/?q=${encodeURIComponent(searchQuery)}`;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Wait for products (update selector!)
await page.waitForSelector('.product-item', { timeout: 10000 });

const products = await page.evaluate(() => {
  const results = [];

  // ⚠️ UPDATE THIS SELECTOR
  const productElements = document.querySelectorAll('.product-item');

  productElements.forEach((product, index) => {
    const nameEl = product.querySelector('.product-name, h2, h3');
    const priceEl = product.querySelector('.price, .product-price');
    const imgEl = product.querySelector('img');
    const linkEl = product.querySelector('a');

    const name = nameEl?.textContent.trim() || '';
    const priceText = priceEl?.textContent.trim() || '';
    const priceMatch = priceText.match(/[\d.,]+/);
    const price = priceMatch ?
      parseFloat(priceMatch[0].replace(/\./g, '').replace(',', '.')) : null;

    results.push({
      name,
      price,
      priceFormatted: priceText,
      imageUrl: imgEl?.src || '',
      productUrl: linkEl?.href || '',
      position: index + 1
    });
  });

  return results;
});

await browser.close();

return products.map(product => ({ json: product }));
```

## 🧪 Testing

1. **Execute the workflow** in N8N
2. **Check the output** - you should see JSON objects like:

```json
{
  "name": "Carretel Automático para Diesel",
  "price": 1299.00,
  "priceFormatted": "R$ 1.299,00",
  "imageUrl": "https://dglequipamentos.com.br/images/product.jpg",
  "productUrl": "https://dglequipamentos.com.br/produto/carretel-automatico",
  "position": 1
}
```

## 🐛 Troubleshooting

### No products found?

1. **Check if HTML was fetched**: Look at the HTTP Request output - you should see HTML content
2. **Verify selectors**: Your CSS selectors might be wrong. Re-inspect the website
3. **Check for bot protection**: The site might be blocking requests (403 error)
   - Try adding more headers
   - Use Puppeteer method instead

### Getting 403 Forbidden?

The website is blocking your request. Try:
1. Add all the headers mentioned above
2. Use a proxy service
3. Use Puppeteer (headless browser) instead

### Products have missing data?

- Some fields might use different selectors
- The website might lazy-load images (check for `data-src` instead of `src`)
- Prices might be in a different format

## 📝 Making It Dynamic

To make the search query dynamic in N8N:

1. Add a **Set** node before HTTP Request
2. Set a variable: `searchQuery` = your search term
3. In HTTP Request URL, use:
   ```
   https://dglequipamentos.com.br/search/?q={{encodeURIComponent($json.searchQuery)}}
   ```

## 🔄 Handling Pagination

If search results have multiple pages:

1. After extracting products, look for pagination links
2. Add logic to check for "next page" button
3. Loop through pages using N8N's loop functionality

Example pagination selector detection:
```javascript
const nextPageUrl = $('.pagination .next, .pagination a[rel="next"]').attr('href');
```

## 📚 Additional Resources

- [N8N Documentation](https://docs.n8n.io/)
- [Cheerio Documentation](https://cheerio.js.org/)
- [Puppeteer Documentation](https://pptr.dev/)
- [CSS Selectors Reference](https://www.w3schools.com/cssref/css_selectors.asp)

## ⚠️ Legal Notice

Always respect the website's Terms of Service and robots.txt. Use scrapers responsibly:
- Don't overload the server with requests
- Add delays between requests
- Respect rate limits
- Consider using the website's API if available

## 💡 Tips

1. **Start simple**: Use the HTTP Request + Cheerio method first
2. **Test selectors**: Use browser console to test CSS selectors: `document.querySelectorAll('.your-selector')`
3. **Add error handling**: Wrap code in try-catch blocks for production use
4. **Cache results**: Save results to avoid repeated scraping
5. **Add delays**: If scraping multiple pages, add delay nodes between requests

---

For questions or issues, refer to the main scraper file: `dgl-scraper-n8n.js`
