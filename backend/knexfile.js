module.exports = {
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
      extension: 'js',
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
      extension: 'js',
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
      extension: 'js',
    },
  },
};
