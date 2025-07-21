
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
  // Insert categories in batches of 5
  const CAT_BATCH_SIZE = 5;
  let catBatch: string[] = [];
  for (const cat of FIXED_CATEGORIES) {
    catBatch.push(cat);
    if (catBatch.length === CAT_BATCH_SIZE || cat === FIXED_CATEGORIES[FIXED_CATEGORIES.length - 1]) {
      try {
        // Try to insert batch
        const inserted = await db('category')
          .insert(catBatch.map(name => ({ name })))
          .returning('id');
        catBatch.forEach((name, i) => {
          const id = inserted[i]?.id ?? inserted[i];
          categoryIdMap[name] = id;
          console.log(`Inserted category: '${name}' (ID: ${id})`);
        });
      } catch (err: any) {
        // If already exists, fetch their IDs
        for (const name of catBatch) {
          try {
            const found = await db('category').where({ name }).first();
            if (found) {
              categoryIdMap[name] = found.id;
              console.log(`Category already exists: '${name}' (ID: ${found.id})`);
            } else {
              console.error(`Category '${name}' not found after insert failure.`);
            }
          } catch (e) {
            console.error(`Failed to fetch category '${name}':`, (e as any).message);
          }
        }
      }
      catBatch = [];
    }
  }

  // 2. Read JSONL and import products
  const rl = readline.createInterface({
    input: fs.createReadStream(JSONL_PATH),
    crlfDelay: Infinity,
  });
  let imported = 0;
  // 2. Read JSONL and import products in batches
  const BATCH_SIZE = 5;
  let batch: any[] = [];
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
    batch.push(payload);
    if (batch.length === BATCH_SIZE || imported + batch.length >= MAX_PRODUCTS) {
      try {
        await db('product').insert(batch);
        imported += batch.length;
        console.log(`Imported ${imported} products...`);
      } catch (err: any) {
        batch.forEach(p => console.error(`Failed to import product '${p.name}':`, err.message));
      }
      batch = [];
    }
  }
  // Insert any remaining products in the last batch
  if (batch.length > 0) {
    try {
      await db('product').insert(batch);
      imported += batch.length;
      console.log(`Imported ${imported} products (final batch)...`);
    } catch (err: any) {
      batch.forEach(p => console.error(`Failed to import product '${p.name}':`, err.message));
    }
  }
  console.log(`Done! Imported ${imported} products.`);
  await db.destroy();
}

main().catch(err => {
  console.error('Script error:', err);
});
