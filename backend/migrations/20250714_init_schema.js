// 20250714_init_schema.js (CommonJS migration for Knex)

/**
 * @param {import('knex')} knex
 */
exports.up = async function(knex) {
  // Users table for Google OAuth
  await knex.schema.createTable('user', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('name', 100);
    table.string('google_id', 255).unique();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
  await knex.schema.createTable('category', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
  });

  await knex.schema.createTable('product', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.text('image_url');
    table.integer('category_id').references('id').inTable('category');
    // No stock_quantity for simplicity
  });
  // Orders table
  await knex.schema.createTable('order', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('user');
    table.decimal('total_price', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Order items table
  await knex.schema.createTable('order_item', (table) => {
    table.increments('id').primary();
    table.integer('order_id').references('id').inTable('order').onDelete('CASCADE');
    table.integer('product_id').references('id').inTable('product');
    table.integer('quantity').notNullable();
    table.decimal('price_at_purchase', 10, 2).notNullable();
  });

  await knex.schema.createTable('cart', (table) => {
    table.increments('id').primary();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('cart_item', (table) => {
    table.increments('id').primary();
    table.integer('cart_id').references('id').inTable('cart').onDelete('CASCADE');
    table.integer('product_id').references('id').inTable('product');
    table.integer('quantity').notNullable();
  });
};

/**
 * @param {import('knex')} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('order_item');
  await knex.schema.dropTableIfExists('order');
  await knex.schema.dropTableIfExists('cart_item');
  await knex.schema.dropTableIfExists('cart');
  await knex.schema.dropTableIfExists('product');
  await knex.schema.dropTableIfExists('category');
  await knex.schema.dropTableIfExists('user');
};