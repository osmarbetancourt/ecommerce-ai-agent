
import knex from 'knex';
import config from '../knexfile';

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

async function nukeProductsAndCategories() {
  try {
    // Delete all products
    const deletedProducts = await db('product').del();
    console.log(`Deleted ${deletedProducts} products.`);

    // Delete all categories
    const deletedCategories = await db('category').del();
    console.log(`Deleted ${deletedCategories} categories.`);
  } catch (err) {
    console.error('Error nuking products or categories:', err);
  } finally {
    await db.destroy();
  }
}

nukeProductsAndCategories().catch(err => {
  console.error('Script error:', err);
});
