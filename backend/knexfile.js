module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'db',
      port: +(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'ecommerce',
    },
    migrations: {
      directory: './migrations',
      extension: 'js',
    },
  },
  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'db_test',
      port: +(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'ecommerce',
    },
    migrations: {
      directory: './migrations',
      extension: 'js',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST_PROD || process.env.DB_HOST || 'db',
      port: +(process.env.DB_PORT_PROD || process.env.DB_PORT || 5432),
      user: process.env.DB_USER_PROD || process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD_PROD || process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME_PROD || process.env.DB_NAME || 'ecommerce',
    },
    migrations: {
      directory: './migrations',
      extension: 'js',
    },
  },
};
