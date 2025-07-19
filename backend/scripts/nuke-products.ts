import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function nukeProductsAndCategories() {
  // Nuke products
  try {
    const res = await axios.get(`${API_BASE}/products`);
    const products = res.data.products || res.data;
    let deleted = 0;
    for (const product of products) {
      try {
        await axios.delete(`${API_BASE}/products/${product.id}`);
        deleted++;
        if (deleted % 25 === 0) console.log(`Deleted ${deleted} products...`);
      } catch (err: any) {
        console.error(`Failed to delete product '${product.name}':`, err.message);
      }
    }
    console.log(`Done! Deleted ${deleted} products.`);
  } catch (err: any) {
    console.error('Failed to fetch products:', err.message);
  }

  // Nuke categories
  try {
    const res = await axios.get(`${API_BASE}/categories`);
    const categories = Array.isArray(res.data) ? res.data : (res.data.categories || []);
    let deleted = 0;
    for (const category of categories) {
      try {
        await axios.delete(`${API_BASE}/categories/${category.id}`);
        deleted++;
        if (deleted % 10 === 0) console.log(`Deleted ${deleted} categories...`);
      } catch (err: any) {
        console.error(`Failed to delete category '${category.name}':`, err.message);
      }
    }
    console.log(`Done! Deleted ${deleted} categories.`);
  } catch (err: any) {
    console.error('Failed to fetch categories:', err.message);
  }
}

nukeProductsAndCategories().catch(err => {
  console.error('Script error:', err);
});
