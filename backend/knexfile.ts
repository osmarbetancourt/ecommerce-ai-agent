import type { Knex } from 'knex';


const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST || 'db',
      port: +(process.env.DB_PORT || 5432),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'ecommerce',
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },
  test: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST || 'db_test',
      port: +(process.env.DB_PORT || 5432),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'ecommerce',
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST_PROD || process.env.POSTGRES_HOST || 'db',
      port: +(process.env.DB_PORT_PROD || process.env.DB_PORT || 5432),
      user: process.env.POSTGRES_USER_PROD || process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD_PROD || process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB_PROD || process.env.POSTGRES_DB || 'ecommerce',
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },
};

export default config;
