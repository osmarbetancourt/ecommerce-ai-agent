// jest.setup.js
// Runs migrations for the test database before tests
const knex = require('knex');
const config = require('./knexfile');

module.exports = async () => {
  const db = knex(config.test);
  try {
    await db.migrate.latest();
    console.log('✅ Test DB migrated');
  } catch (err) {
    console.error('❌ Failed to migrate test DB:', err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
};
