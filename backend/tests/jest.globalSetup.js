const knex = require('knex');
const config = require('../knexfile');
const db = knex(config['test']);

module.exports = async () => {
  if (process.env.NODE_ENV === 'test') {
    await db.raw(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE;';
        END LOOP;
      END $$;
    `);
    await db.destroy();
  }
};
