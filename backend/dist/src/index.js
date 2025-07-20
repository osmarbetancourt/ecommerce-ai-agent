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
const products_1 = __importDefault(require("./routes/products"));
const users_1 = __importDefault(require("./routes/users"));
const categories_1 = __importDefault(require("./routes/categories"));
const carts_1 = __importDefault(require("./routes/carts"));
const orders_1 = __importDefault(require("./routes/orders"));
const cart_items_1 = __importDefault(require("./routes/cart_items"));
const conversations_1 = __importDefault(require("./routes/conversations"));
const messages_1 = __importDefault(require("./routes/messages"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const payment_methods_1 = __importDefault(require("./routes/payment_methods"));
const payment_method_types_1 = __importDefault(require("./routes/payment_method_types"));
const order_items_1 = __importDefault(require("./routes/order_items"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const roles_1 = __importDefault(require("./routes/roles"));
const search_index_1 = __importDefault(require("./routes/search_index"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
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
            //await db.migrate.latest();
            //console.log('✅ Database migrations ran successfully');
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
    app.use((0, cookie_parser_1.default)());
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
    // Mount modular routers
    app.use('/api/products', products_1.default);
    app.use('/api/categories', categories_1.default);
    app.use('/api/carts', carts_1.default);
    app.use('/api/orders', orders_1.default);
    app.use('/api/cart-items', cart_items_1.default);
    app.use('/api/conversations', conversations_1.default);
    app.use('/api/messages', messages_1.default);
    app.use('/api/users', users_1.default);
    app.use('/api/notifications', notifications_1.default);
    app.use('/api/order-items', order_items_1.default);
    app.use('/api/payment-methods', payment_methods_1.default);
    app.use('/api/payment-method-types', payment_method_types_1.default);
    app.use('/api/reviews', reviews_1.default);
    app.use('/api/roles', roles_1.default);
    app.use('/api/search-index', search_index_1.default);
    app.use('/api/transactions', transactions_1.default);
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
