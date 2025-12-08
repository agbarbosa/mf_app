/**
 * N8N Code Node - Extract Images from DGL Product HTML
 *
 * USAGE:
 * 1. Add a Code node after your HTTP Request/HTML node
 * 2. Paste this entire code
 * 3. The output will include all image URLs for each product
 */

const cheerio = require('cheerio');

// Get all items from previous node
const items = $input.all();
const results = [];

items.forEach((item) => {
  // Get the product_html array from your data
  const htmlArray = item.json.product_html;

  if (!htmlArray || !Array.isArray(htmlArray)) {
    console.log('No product_html array found');
    return;
  }

  // Process each HTML string in the array
  htmlArray.forEach((htmlString, productIndex) => {
    const $ = cheerio.load(htmlString);

    // ===========================================
    // METHOD 1: Extract from JSON-LD (RECOMMENDED - Best Quality)
    // ===========================================
    const jsonLdScript = $('script[type="application/ld+json"]').html();
    let productData = {};

    if (jsonLdScript) {
      try {
        const structuredData = JSON.parse(jsonLdScript);

        productData = {
          name: structuredData.name || '',
          imageUrl: structuredData.image || '',
          productUrl: structuredData.offers?.url || '',
          price: parseFloat(structuredData.offers?.price) || null,
          priceCurrency: structuredData.offers?.priceCurrency || 'BRL',
          sku: structuredData.sku || '',
          brand: structuredData.brand?.name || '',
          availability: structuredData.offers?.availability || '',
          stock: parseInt(structuredData.offers?.inventoryLevel?.value) || 0,
          weight: parseFloat(structuredData.weight?.value) || null,
          description: structuredData.description || ''
        };

        // Make image URL absolute
        if (productData.imageUrl && productData.imageUrl.startsWith('//')) {
          productData.imageUrl = 'https:' + productData.imageUrl;
        }
      } catch (e) {
        console.log('Error parsing JSON-LD:', e.message);
      }
    }

    // ===========================================
    // METHOD 2: Extract from IMG tag (Fallback)
    // ===========================================
    const imgElement = $('.product-item-image img, .js-product-item-image-private').first();

    // Get main image
    let imgSrc = imgElement.attr('src') || imgElement.attr('data-src') || '';
    if (imgSrc && imgSrc.startsWith('//')) {
      imgSrc = 'https:' + imgSrc;
    }

    // Get srcset for multiple sizes
    const srcset = imgElement.attr('srcset') || imgElement.attr('data-srcset') || '';
    const imageSizes = {};

    if (srcset) {
      const srcsetParts = srcset.split(',');
      srcsetParts.forEach(part => {
        const match = part.trim().match(/^(.+?)\s+(\d+)w$/);
        if (match) {
          let url = match[1].trim();
          const width = match[2];

          // Make URL absolute
          if (url.startsWith('//')) {
            url = 'https:' + url;
          }

          imageSizes[width + 'w'] = url;
        }
      });
    }

    // Get product name (fallback)
    const productName = productData.name || $('.item-name, .js-item-name').text().trim();

    // Get product URL (fallback)
    let productUrl = productData.productUrl || $('.item-link').first().attr('href') || '';
    if (productUrl && !productUrl.startsWith('http')) {
      productUrl = 'https://dglequipamentos.com.br' + productUrl;
    }

    // Get price (fallback)
    let price = productData.price;
    if (!price) {
      const priceText = $('.item-price, .js-price-display').text().trim();
      const priceMatch = priceText.match(/[\d.,]+/);
      if (priceMatch) {
        price = parseFloat(priceMatch[0].replace(/\./g, '').replace(',', '.'));
      }
    }

    // ===========================================
    // BUILD FINAL OBJECT
    // ===========================================

    // Determine best image URL
    const bestImageUrl = productData.imageUrl ||
                        imageSizes['480w'] ||
                        imageSizes['320w'] ||
                        imageSizes['240w'] ||
                        imgSrc;

    results.push({
      json: {
        // Basic Info
        productName: productName,
        productUrl: productUrl,
        sku: productData.sku || '',
        brand: productData.brand || '',

        // Main Image (Highest Quality)
        imageUrl: bestImageUrl,

        // Multiple Image Sizes (if available)
        imageThumbnail: imageSizes['240w'] || bestImageUrl,
        imageMedium: imageSizes['320w'] || bestImageUrl,
        imageLarge: imageSizes['480w'] || bestImageUrl,

        // All available sizes as object
        allImageSizes: imageSizes,

        // Pricing
        price: price,
        priceCurrency: productData.priceCurrency || 'BRL',

        // Stock & Availability
        availability: productData.availability || '',
        stock: productData.stock || 0,

        // Additional Info
        weight: productData.weight || null,
        description: productData.description || '',

        // Metadata
        extractedAt: new Date().toISOString(),
        productIndex: productIndex + 1
      }
    });
  });
});

// Return all extracted products
return results;

// ===========================================
// ALTERNATIVE: Simple Image-Only Extraction
// ===========================================

/*
// If you ONLY need the image URL, use this simpler version:

const cheerio = require('cheerio');
const results = [];

$input.all().forEach((item) => {
  const htmlArray = item.json.product_html;

  htmlArray.forEach((html) => {
    const $ = cheerio.load(html);

    // Get image from JSON-LD
    const jsonLd = JSON.parse($('script[type="application/ld+json"]').html());
    const imageUrl = jsonLd.image.startsWith('//') ? 'https:' + jsonLd.image : jsonLd.image;

    results.push({
      json: {
        imageUrl: imageUrl,
        productName: jsonLd.name
      }
    });
  });
});

return results;
*/
