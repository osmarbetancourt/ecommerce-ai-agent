"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const next_1 = __importDefault(require("next"));
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../knexfile"));
const environment = process.env.NODE_ENV || 'development';
const db = (0, knex_1.default)(knexfile_1.default[environment]);
const isTest = !!process.env.JEST_WORKER_ID;
let nextApp, handle;
if (!isTest) {
    const dev = process.env.NODE_ENV !== 'production';
    nextApp = (0, next_1.default)({ dev, dir: path_1.default.resolve(__dirname, '../../frontend') });
    handle = nextApp.getRequestHandler();
}
// Only run DB connection and migrations when running as main module (not when imported for tests)
if (require.main === module && process.env.NODE_ENV) {
    (async () => {
        try {
            await db.raw('SELECT 1');
            console.log('✅ Database connection successful');
            await db.migrate.latest();
            console.log('✅ Database migrations ran successfully');
            startServer();
        }
        catch (err) {
            console.error('❌ Database connection or migration failed:', err);
            // process.exit(1); // Allow frontend testing without DB by not exiting
        }
    })();
}
else {
    console.log('Skipping DB validation: NODE_ENV is not set or TEST environment');
    startServer();
}
// Factory function to create the Express app (for both server and tests)
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Healthcheck endpoint for Docker
    app.get('/health', (req, res) => {
        res.status(200).send('OK');
    });
    // Example API route
    app.get('/api/hello', (req, res) => {
        res.json({ message: 'Hello from backend!' });
    });
    // Endpoint to get current database info
    app.get('/api/dbinfo', async (req, res) => {
        try {
            // Works for PostgreSQL: returns the current database name
            const result = await db.raw('SELECT current_database() as name');
            const dbName = result.rows ? result.rows[0].name : (result[0]?.name || null);
            res.json({
                database: dbName,
                environment,
                config: {
                    client: knexfile_1.default[environment]?.client,
                    connection: knexfile_1.default[environment]?.connection
                }
            });
        }
        catch (err) {
            let message = 'Unknown error';
            if (err instanceof Error)
                message = err.message;
            res.status(500).json({ error: 'Failed to fetch database info', details: message });
        }
    });
    // Helper to ensure price is a number
    function normalizeProduct(product) {
        if (product && typeof product.price === 'string') {
            return { ...product, price: Number(product.price) };
        }
        return product;
    }
    // Helper to ensure total_price is a number
    function normalizeOrder(order) {
        if (order && typeof order.total_price === 'string') {
            return { ...order, total_price: Number(order.total_price) };
        }
        return order;
    }
    // Get all products
    app.get('/api/products', async (req, res) => {
        try {
            const products = await db('product').select('*');
            res.json(products.map(normalizeProduct));
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    });
    // Get a single product by ID
    app.get('/api/products/:id', async (req, res) => {
        try {
            const product = await db('product').where({ id: req.params.id }).first();
            if (!product)
                return res.status(404).json({ error: 'Product not found' });
            res.json(normalizeProduct(product));
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch product' });
        }
    });
    // Create a new product
    app.post('/api/products', async (req, res) => {
        try {
            const inserted = await db('product').insert(req.body).returning('id');
            let id;
            if (Array.isArray(inserted)) {
                if (typeof inserted[0] === 'object' && inserted[0] !== null && 'id' in inserted[0]) {
                    id = inserted[0].id;
                }
                else {
                    id = inserted[0];
                }
            }
            else {
                id = inserted;
            }
            const newProduct = await db('product').where({ id }).first();
            res.status(201).json(normalizeProduct(newProduct));
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to create product' });
        }
    });
    // Update a product by ID
    app.put('/api/products/:id', async (req, res) => {
        try {
            const updated = await db('product').where({ id: req.params.id }).update(req.body);
            if (!updated)
                return res.status(404).json({ error: 'Product not found' });
            const product = await db('product').where({ id: req.params.id }).first();
            res.json(normalizeProduct(product));
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to update product' });
        }
    });
    // Delete a product by ID
    app.delete('/api/products/:id', async (req, res) => {
        try {
            const deleted = await db('product').where({ id: req.params.id }).del();
            if (!deleted)
                return res.status(404).json({ error: 'Product not found' });
            res.json({ success: true });
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to delete product' });
        }
    });
    // ================= CATEGORY ENDPOINTS =================
    app.get('/api/categories', async (req, res) => {
        try {
            const categories = await db('category').select('*');
            res.json(categories);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    });
    app.get('/api/categories/:id', async (req, res) => {
        try {
            const category = await db('category').where({ id: req.params.id }).first();
            if (!category)
                return res.status(404).json({ error: 'Category not found' });
            res.json(category);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch category' });
        }
    });
    app.post('/api/categories', async (req, res) => {
        try {
            const inserted = await db('category').insert(req.body).returning('id');
            let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
            const newCategory = await db('category').where({ id }).first();
            res.status(201).json(newCategory);
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to create category' });
        }
    });
    app.put('/api/categories/:id', async (req, res) => {
        try {
            const updated = await db('category').where({ id: req.params.id }).update(req.body);
            if (!updated)
                return res.status(404).json({ error: 'Category not found' });
            const category = await db('category').where({ id: req.params.id }).first();
            res.json(category);
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to update category' });
        }
    });
    app.delete('/api/categories/:id', async (req, res) => {
        try {
            const deleted = await db('category').where({ id: req.params.id }).del();
            if (!deleted)
                return res.status(404).json({ error: 'Category not found' });
            res.json({ success: true });
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to delete category' });
        }
    });
    // ================= CART ENDPOINTS =================
    app.get('/api/carts', async (req, res) => {
        try {
            const carts = await db('cart').select('*');
            res.json(carts);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch carts' });
        }
    });
    app.get('/api/carts/:id', async (req, res) => {
        try {
            const cart = await db('cart').where({ id: req.params.id }).first();
            if (!cart)
                return res.status(404).json({ error: 'Cart not found' });
            const items = await db('cart_item').where({ cart_id: req.params.id });
            res.json({ ...cart, items });
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch cart' });
        }
    });
    app.post('/api/carts', async (req, res) => {
        try {
            const inserted = await db('cart').insert(req.body).returning('id');
            let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
            const newCart = await db('cart').where({ id }).first();
            res.status(201).json(newCart);
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to create cart' });
        }
    });
    app.put('/api/carts/:id', async (req, res) => {
        try {
            const updated = await db('cart').where({ id: req.params.id }).update(req.body);
            if (!updated)
                return res.status(404).json({ error: 'Cart not found' });
            const cart = await db('cart').where({ id: req.params.id }).first();
            res.json(cart);
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to update cart' });
        }
    });
    app.delete('/api/carts/:id', async (req, res) => {
        try {
            const deleted = await db('cart').where({ id: req.params.id }).del();
            if (!deleted)
                return res.status(404).json({ error: 'Cart not found' });
            res.json({ success: true });
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to delete cart' });
        }
    });
    // ================= ORDER ENDPOINTS =================
    app.get('/api/orders', async (req, res) => {
        try {
            const orders = await db('order').select('*');
            res.json(orders.map(normalizeOrder));
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    });
    app.get('/api/orders/:id', async (req, res) => {
        try {
            const order = await db('order').where({ id: req.params.id }).first();
            if (!order)
                return res.status(404).json({ error: 'Order not found' });
            const items = await db('order_item').where({ order_id: req.params.id });
            res.json({ ...normalizeOrder(order), items });
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch order' });
        }
    });
    app.post('/api/orders', async (req, res) => {
        try {
            const inserted = await db('order').insert(req.body).returning('id');
            let id = Array.isArray(inserted) ? (inserted[0]?.id ?? inserted[0]) : inserted;
            const newOrder = await db('order').where({ id }).first();
            res.status(201).json(normalizeOrder(newOrder));
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to create order' });
        }
    });
    app.put('/api/orders/:id', async (req, res) => {
        try {
            const updated = await db('order').where({ id: req.params.id }).update(req.body);
            if (!updated)
                return res.status(404).json({ error: 'Order not found' });
            const order = await db('order').where({ id: req.params.id }).first();
            res.json(normalizeOrder(order));
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to update order' });
        }
    });
    app.delete('/api/orders/:id', async (req, res) => {
        try {
            const deleted = await db('order').where({ id: req.params.id }).del();
            if (!deleted)
                return res.status(404).json({ error: 'Order not found' });
            res.json({ success: true });
        }
        catch (err) {
            res.status(400).json({ error: 'Failed to delete order' });
        }
    });
    // Only add Next.js catch-all if not in test
    if (!isTest && handle) {
        app.all('*', (req, res) => handle(req, res));
    }
    return app;
}
// Start server only if not in test
async function startServer() {
    if (!isTest) {
        await nextApp.prepare();
        const app = createApp();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
}
// Export for testing and server start
exports.default = createApp;
