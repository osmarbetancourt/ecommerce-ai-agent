
import fs from 'fs';
import readline from 'readline';
import { db } from '../src/index';

// Fixed categories
const FIXED_CATEGORIES = [
  'Bakery & Desserts',
  'Beverages & Water',
  'Breakfast',
  'Candy',
  'Cleaning Supplies',
  'Coffee',
  'Deli',
  'Floral',
  'Gift Baskets',
  'Household',
  'Kirkland Signature Grocery',
  'Laundry Detergent & Supplies',
  'Meat & Seafood',
  'Organic',
  'Pantry & Dry Goods',
  'Paper & Plastic Products',
  'Poultry',
  'Seafood',
  'Snacks',
];

const JSONL_PATH = __dirname + '/groceries_with_images_2.jsonl';
const MAX_PRODUCTS = 1400;

async function main() {
  // 1. Insert categories and store their IDs
  const categoryIdMap: Record<string, number> = {};
  for (const cat of FIXED_CATEGORIES) {
    try {
      // Try to insert category
      const [id] = await db('category').insert({ name: cat }).returning('id');
      categoryIdMap[cat] = typeof id === 'object' ? id.id : id;
    } catch (err: any) {
      // If already exists, fetch its ID
      try {
        const found = await db('category').where({ name: cat }).first();
        if (found) categoryIdMap[cat] = found.id;
      } catch (e) {
        console.error(`Failed to fetch category '${cat}':`, (e as any).message);
      }
    }
  }

  // 2. Read JSONL and import products
  const rl = readline.createInterface({
    input: fs.createReadStream(JSONL_PATH),
    crlfDelay: Infinity,
  });
  let imported = 0;
  for await (const line of rl) {
    if (imported >= MAX_PRODUCTS) break;
    if (!line.trim()) continue;
    let obj: any;
    try {
      obj = JSON.parse(line);
    } catch (err) {
      console.warn('Skipping invalid JSON:', line);
      continue;
    }
    const cat = obj['Sub Category'];
    if (!cat || !categoryIdMap[cat]) continue;
    // Prepare product payload
    const priceStr = obj['Price']?.replace(/[^\d.]/g, '');
    const price = priceStr ? parseFloat(priceStr) : null;
    if (!obj['Title'] || !price) continue;
    const payload = {
      name: obj['Title'],
      price,
      category_id: categoryIdMap[cat],
      description: obj['Product Description'] || obj['Feature'] || '',
      image_url: obj['image_url'] || '',
      // Add more fields as needed
    };
    try {
      await db('product').insert(payload);
      imported++;
      if (imported % 25 === 0) console.log(`Imported ${imported} products...`);
    } catch (err: any) {
      console.error(`Failed to import product '${payload.name}':`, err.message);
    }
  }
  console.log(`Done! Imported ${imported} products.`);
  await db.destroy();
}

main().catch(err => {
  console.error('Script error:', err);
});
