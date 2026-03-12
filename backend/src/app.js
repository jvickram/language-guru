const express = require('express');
const { createCorsMiddleware } = require('./middleware/cors');
const { securityHeaders } = require('./middleware/securityHeaders');
const { createRateLimitMiddleware } = require('./middleware/rateLimit');
const { requestLogger } = require('./middleware/requestLogger');
const { createAuthMiddleware } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');
const { createHealthRouter } = require('./routes/health');
const { createAuthRouter } = require('./routes/auth');
const { createLearningRouter } = require('./routes/learning');

const createApp = ({ config, storeManager }) => {
  const app = express();
  app.set('trust proxy', 1);

  app.use(express.json({ limit: '1mb' }));
  app.use(createCorsMiddleware(config));
  app.use(securityHeaders);
  app.use(createRateLimitMiddleware(config.requestLimit));
  app.use(requestLogger);

  const authMiddleware = createAuthMiddleware({ config, storeManager });

  app.use('/api', createHealthRouter({ config, storeManager }));
  app.use('/api', createAuthRouter({ config, storeManager }));
  app.use('/api', createLearningRouter({ storeManager, authMiddleware }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = {
  createApp,
};
