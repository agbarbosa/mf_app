# N8N Image Extraction Guide for DGL Products

## Method 1: Using HTML Extract Node (Recommended)

### Setup in N8N:

**Node Configuration:**

1. **Loop Over Items** node (if you have multiple products)
   - Set to loop over `product_html` array

2. **HTML Extract** node
   - Input Field: `product_html` (or the field containing your HTML)
   - Extraction Values:

#### Option A: Extract from `<img>` tag

**CSS Selector:** `.product-item-image img, .item-image img`

**Attribute to extract:** `src` (for loaded images) or `data-srcset` (for lazy-loaded)

**Configuration:**
- Key: `imageUrl`
- CSS Selector: `.product-item-image img, .js-product-item-image-private`
- Return Value: `attribute`
- Attribute: `src`

#### Option B: Extract from JSON-LD (Better Quality)

The HTML contains structured data with cleaner image URLs:

**CSS Selector:** `script[type="application/ld+json"]`
**Return Value:** `html`

Then use a **Code** node to parse the JSON and extract the image:

```javascript
const jsonLdScript = $input.item.json.jsonLd;
const data = JSON.parse(jsonLdScript);
return {
  json: {
    imageUrl: data.image,
    productName: data.name,
    price: data.offers.price,
    sku: data.sku
  }
};
```

## Method 2: Using Code Node (Most Flexible)

This method gives you full control and can extract all image sizes:

```javascript
const cheerio = require('cheerio');

// Get the HTML from the array
const items = $input.all();
const results = [];

items.forEach((item, index) => {
  const htmlArray = item.json.product_html;

  htmlArray.forEach((html) => {
    const $ = cheerio.load(html);

    // Method 1: Extract from img tag
    const imgElement = $('.product-item-image img, .js-product-item-image-private').first();

    // Get main image URL
    let imageUrl = imgElement.attr('src') || imgElement.attr('data-src');

    // Get srcset for different sizes (if available)
    const srcset = imgElement.attr('srcset') || imgElement.attr('data-srcset');

    // Method 2: Extract from JSON-LD (cleaner, full-size image)
    const jsonLdScript = $('script[type="application/ld+json"]').html();
    let structuredData = null;

    if (jsonLdScript) {
      structuredData = JSON.parse(jsonLdScript);
    }

    // Prefer JSON-LD image (it's usually better quality)
    if (structuredData && structuredData.image) {
      imageUrl = structuredData.image;
    }

    // Make URL absolute if needed
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = 'https:' + imageUrl;
    }

    // Parse srcset to get all image sizes
    const imageSizes = [];
    if (srcset) {
      const srcsetParts = srcset.split(',');
      srcsetParts.forEach(part => {
        const [url, size] = part.trim().split(' ');
        imageSizes.push({
          url: url.startsWith('//') ? 'https:' + url : url,
          size: size || 'default'
        });
      });
    }

    // Extract product name for reference
    const productName = $('.item-name, .js-item-name').text().trim();

    // Extract product URL
    const productUrl = $('.item-link').attr('href');

    results.push({
      json: {
        productName,
        productUrl,
        imageUrl,
        imageSizes, // Array of different image sizes
        sku: structuredData?.sku || '',
        price: structuredData?.offers?.price || ''
      }
    });
  });
});

return results;
```

## Method 3: Extract Multiple Image Sizes

If you need different image sizes (240w, 320w, 480w):

```javascript
const cheerio = require('cheerio');

const html = $input.item.json.product_html[0]; // First HTML in array
const $ = cheerio.load(html);

const imgElement = $('.product-item-image img').first();
const srcset = imgElement.attr('srcset') || imgElement.attr('data-srcset') || '';

// Parse srcset
const images = {};

if (srcset) {
  const srcsetParts = srcset.split(',');
  srcsetParts.forEach(part => {
    const match = part.trim().match(/^(.+?)\s+(\d+)w$/);
    if (match) {
      const url = match[1].startsWith('//') ? 'https:' + match[1] : match[1];
      const width = match[2];
      images[`image_${width}w`] = url;
    }
  });
}

// Get main src
const mainSrc = imgElement.attr('src');
if (mainSrc) {
  images.image_main = mainSrc.startsWith('//') ? 'https:' + mainSrc : mainSrc;
}

return {
  json: images
};
```

## Method 4: Complete Product Extraction with Image

Full extraction including all product data:

```javascript
const cheerio = require('cheerio');

const results = [];
const htmlArray = $input.item.json.product_html;

htmlArray.forEach((html) => {
  const $ = cheerio.load(html);

  // Extract from JSON-LD (most reliable)
  const jsonLdScript = $('script[type="application/ld+json"]').html();
  const structuredData = jsonLdScript ? JSON.parse(jsonLdScript) : {};

  // Extract from HTML (fallback)
  const imgElement = $('.product-item-image img, .js-product-item-image-private').first();
  const srcset = imgElement.attr('srcset') || imgElement.attr('data-srcset');

  // Parse all image sizes
  const imageSizes = {};
  if (srcset) {
    srcset.split(',').forEach(part => {
      const match = part.trim().match(/^(.+?)\s+(\d+)w$/);
      if (match) {
        const url = match[1].startsWith('//') ? 'https:' + match[1] : match[1];
        imageSizes[match[2] + 'w'] = url;
      }
    });
  }

  // Get highest quality image
  const imageUrl = structuredData.image ||
                   imageSizes['480w'] ||
                   imageSizes['320w'] ||
                   imageSizes['240w'] ||
                   (imgElement.attr('src') || '').replace('//', 'https://');

  results.push({
    json: {
      // Product Info
      name: structuredData.name || $('.item-name').text().trim(),
      sku: structuredData.sku || '',
      brand: structuredData.brand?.name || '',

      // Pricing
      price: parseFloat(structuredData.offers?.price) || null,
      priceCurrency: structuredData.offers?.priceCurrency || 'BRL',

      // Images
      imageUrl, // Best quality image
      imageThumbnail: imageSizes['240w'] || imageUrl,
      imageMedium: imageSizes['320w'] || imageUrl,
      imageLarge: imageSizes['480w'] || imageUrl,
      allImageSizes: imageSizes,

      // URLs
      productUrl: structuredData.offers?.url || $('.item-link').attr('href'),

      // Stock
      availability: structuredData.offers?.availability || '',
      stock: parseInt(structuredData.offers?.inventoryLevel?.value) || 0,

      // Additional
      weight: parseFloat(structuredData.weight?.value) || null,
      description: structuredData.description || ''
    }
  });
});

return results;
```

## N8N Workflow Example

Here's a complete N8N workflow structure:

```
1. [Trigger/Input] - Your data with product_html array
    ↓
2. [Code Node] - Loop through product_html array and extract data (use Method 4 above)
    ↓
3. [Set Node] - Optional: Format the data
    ↓
4. [Output] - Use the extracted data
```

## Quick HTML Extract Node Settings

If you just want the image quickly:

**HTML Extract Node Settings:**

1. **Source Field:** `product_html`
2. **Add Extraction Value:**
   - **Key:** `imageUrl`
   - **CSS Selector:** `script[type="application/ld+json"]`
   - **Return Value:** `html`
3. **Add Code Node after:**
```javascript
const data = JSON.parse($input.item.json.imageUrl);
return {
  json: {
    imageUrl: data.image,
    productName: data.name
  }
};
```

## Image URL Formats in Your HTML

Your HTML contains images in these formats:

1. **480x480**: `//dcdn-us.mitiendanube.com/stores/006/548/119/products/[filename]-480-0.jpg`
2. **320x320**: `//dcdn-us.mitiendanube.com/stores/006/548/119/products/[filename]-320-0.jpg`
3. **240x240**: `//dcdn-us.mitiendanube.com/stores/006/548/119/products/[filename]-240-0.jpg`
4. **Original/Large**: From JSON-LD structured data

**Always prepend `https:` to these URLs!**

## Tips

1. **Use JSON-LD when possible** - It's cleaner and more reliable
2. **Handle lazy-loaded images** - Check both `src` and `data-srcset` attributes
3. **Make URLs absolute** - Add `https:` prefix to URLs starting with `//`
4. **Extract multiple sizes** - Parse `srcset` for responsive images
5. **Error handling** - Always check if elements exist before accessing attributes

## Testing

To test your extraction, use this simple code in a Code node:

```javascript
const cheerio = require('cheerio');
const html = $input.item.json.product_html[0];
const $ = cheerio.load(html);

// Quick test
console.log('Image src:', $('.product-item-image img').attr('src'));
console.log('Image srcset:', $('.product-item-image img').attr('srcset'));
console.log('JSON-LD:', $('script[type="application/ld+json"]').html());

return $input.all();
```
