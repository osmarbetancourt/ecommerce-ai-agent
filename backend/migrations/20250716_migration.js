// 20250714_init_schema.js (CommonJS migration for Knex)

/**
 * @param {import('knex')} knex
 */
exports.up = async function(knex) {
  // Conversation table for chat history and agent memory
  await knex.schema.createTable('conversation', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('user').onDelete('CASCADE');
    table.string('topic', 255);
    table.text('context'); // serialized context or metadata
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
  // Create new tables only
  await knex.schema.createTable('role', (table) => {
    table.increments('id').primary();
    table.string('name', 32).notNullable().unique(); // e.g. user, admin, agent
    table.string('description', 255);
  });

  await knex.schema.createTable('search_index', (table) => {
    table.increments('id').primary();
    table.string('type', 32).notNullable(); // e.g. product, user
    table.integer('ref_id').notNullable(); // id of referenced entity
    table.text('keywords').notNullable(); // precomputed keywords/tags
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('message', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('user');
    table.integer('conversation_id').references('id').inTable('conversation').onDelete('CASCADE');
    table.string('sender', 32).notNullable(); // 'user', 'agent', 'system'
    table.text('content').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('notification', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('user');
    table.string('type', 32).notNullable(); // e.g. 'delivery', 'message', 'promo'
    table.text('content').notNullable();
    table.boolean('read').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Payment method type table (optional, for fixed types)
  await knex.schema.createTable('payment_method_type', (table) => {
    table.increments('id').primary();
    table.string('name', 32).notNullable().unique(); // e.g. card, paypal, bank_transfer
    table.string('description', 255);
  });

  // Payment method table for user payment options
  await knex.schema.createTable('payment_method', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('user').onDelete('CASCADE');
    table.integer('type_id').references('id').inTable('payment_method_type');
    table.string('provider', 64); // e.g. Visa, PayPal
    table.string('account', 128); // masked card number, email, etc.
    table.string('details', 255); // extra info if needed
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Transaction table for tracking payments
  await knex.schema.createTable('transaction', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('user').onDelete('CASCADE');
    table.integer('order_id').references('id').inTable('order').onDelete('CASCADE');
    table.integer('payment_method_id').references('id').inTable('payment_method');
    table.string('status', 32).notNullable().defaultTo('pending'); // pending, paid, failed
    table.decimal('amount', 10, 2).notNullable();
    table.string('transaction_id', 128);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Review table for product reviews
  await knex.schema.createTable('review', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('user').onDelete('CASCADE');
    table.integer('product_id').references('id').inTable('product').onDelete('CASCADE');
    table.integer('rating').notNullable(); // 1-5
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Alter previous tables to add new columns
  await knex.schema.alterTable('user', (table) => {
    table.string('role', 32).notNullable().defaultTo('user');
    table.string('address', 255);
    table.string('phone', 32);
    table.string('avatar_url', 255);
    table.timestamp('last_login');
  });

  await knex.schema.alterTable('product', (table) => {
    table.decimal('sale_price', 10, 2);
    table.boolean('on_sale').notNullable().defaultTo(false);
    table.integer('stock_quantity').notNullable().defaultTo(0);
    table.text('tags');
    table.string('amount_unit', 32);
  });

  await knex.schema.alterTable('order', (table) => {
    table.string('delivery_address', 255);
    table.string('delivery_status', 32).notNullable().defaultTo('pending');
    table.timestamp('delivery_eta');
    table.string('payment_status', 32).notNullable().defaultTo('pending');
  });
};

/**
 * @param {import('knex')} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('conversation');
  await knex.schema.dropTableIfExists('cart_item');
  await knex.schema.dropTableIfExists('notification');
  await knex.schema.dropTableIfExists('message');
  await knex.schema.dropTableIfExists('search_index');
  await knex.schema.dropTableIfExists('role');
  await knex.schema.dropTableIfExists('address');
  await knex.schema.dropTableIfExists('transaction');
  await knex.schema.dropTableIfExists('payment_method');
  await knex.schema.dropTableIfExists('payment_method_type');
  await knex.schema.dropTableIfExists('review');
  // Remove columns added to existing tables
  await knex.schema.alterTable('user', (table) => {
    table.dropColumn('role');
    table.dropColumn('address');
    table.dropColumn('phone');
    table.dropColumn('avatar_url');
    table.dropColumn('last_login');
  });

  await knex.schema.alterTable('product', (table) => {
    table.dropColumn('sale_price');
    table.dropColumn('on_sale');
    table.dropColumn('stock_quantity');
    table.dropColumn('tags');
    table.dropColumn('amount_unit');
  });

  await knex.schema.alterTable('order', (table) => {
    table.dropColumn('delivery_address');
    table.dropColumn('delivery_status');
    table.dropColumn('delivery_eta');
    table.dropColumn('payment_status');
  });
};
