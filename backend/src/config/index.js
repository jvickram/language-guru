const getConfig = () => ({
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'language-guru-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dataStore: process.env.DATA_STORE || 'memory',
  mongoUri: process.env.MONGO_URI || '',
  requestLimit: Number(process.env.RATE_LIMIT_PER_MINUTE || 120),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '*').split(',').map((x) => x.trim()),
});

const validateConfig = (config) => {
  if (config.env === 'production' && config.jwtSecret === 'language-guru-dev-secret') {
    throw new Error('JWT_SECRET must be set in production');
  }
};

module.exports = {
  getConfig,
  validateConfig,
};
