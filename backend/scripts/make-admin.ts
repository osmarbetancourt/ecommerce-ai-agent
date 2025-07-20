import knex from 'knex';
import config from '../knexfile';

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

async function makeAdmin(email: string) {
  try {
    // Adjust field name if your schema uses something other than 'role'
    const updated = await db('user').where({ email }).update({ role: 'admin' });
    if (updated) {
      console.log(`User '${email}' is now an admin.`);
    } else {
      console.log(`User '${email}' not found.`);
    }
  } catch (err) {
    console.error('Error updating user:', err);
  } finally {
    await db.destroy();
  }
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'oaba.dev@gmail.com';
makeAdmin(ADMIN_EMAIL);
