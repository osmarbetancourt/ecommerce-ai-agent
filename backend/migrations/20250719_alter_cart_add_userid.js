// 20250719_alter_cart_add_userid.js (Knex migration)
/**
 * @param {import('knex')} knex
 */
exports.up = async function(knex) {
  // Add user_id column to cart, FK to user(id), enforce one cart per user
  await knex.schema.alterTable('cart', (table) => {
    table.integer('user_id').references('id').inTable('user').notNullable().unique();
  });
};

/**
 * @param {import('knex')} knex
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('cart', (table) => {
    table.dropColumn('user_id');
  });
};
