import express from 'express';
import cors from 'cors';
import path from 'path';
import next from 'next';
import knex from 'knex';
import config from '../knexfile';

import productsRouter from './routes/products';
import usersRouter from './routes/users';
import categoriesRouter from './routes/categories';
import cartsRouter from './routes/carts';
import ordersRouter from './routes/orders';
import cartItemsRouter from './routes/cart_items';
import conversationsRouter from './routes/conversations';
import messagesRouter from './routes/messages';
import notificationsRouter from './routes/notifications';
import paymentMethodsRouter from './routes/payment_methods';
import paymentMethodTypesRouter from './routes/payment_method_types';
import orderItemsRouter from './routes/order_items';
import reviewsRouter from './routes/reviews';
import rolesRouter from './routes/roles';
import searchIndexRouter from './routes/search_index';
import transactionsRouter from './routes/transactions';
import agentRouter from './routes/agent';

import cookieParser from 'cookie-parser';
import { apiRateLimiter, securityHeaders, corsMiddleware, csrfProtection } from './middleware/security';

const environment = process.env.NODE_ENV || 'development';

const db = knex(config[environment]);

const isTest = !!process.env.JEST_WORKER_ID;
let nextApp: any, handle: any;
if (!isTest) {
  const dev = process.env.NODE_ENV !== 'production';
  nextApp = next({ dev, dir: path.resolve(__dirname, '../../frontend') });
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
    } catch (err) {
      console.error('❌ Database connection or migration failed:', err);
      // process.exit(1); // Allow frontend testing without DB by not exiting
    }
  })();
} else {
  console.log('Skipping DB validation: NODE_ENV is not set or TEST environment');
  startServer();
}




// Factory function to create the Express app (for both server and tests)
export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

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
          client: config[environment]?.client,
          connection: config[environment]?.connection
        }
      });
    } catch (err) {
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      res.status(500).json({ error: 'Failed to fetch database info', details: message });
    }
  });

  // Mount modular routers
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/carts', cartsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/cart-items', cartItemsRouter);
  app.use('/api/conversations', conversationsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/order-items', orderItemsRouter);
  app.use('/api/payment-methods', paymentMethodsRouter);
  app.use('/api/payment-method-types', paymentMethodTypesRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/roles', rolesRouter);
  app.use('/api/search-index', searchIndexRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/api/agent', agentRouter);

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
export default createApp;
