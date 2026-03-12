const { now } = require('../utils/time');

const requestLogger = (req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    const elapsedMs = Date.now() - started;
    console.log(`${now()} ${req.method} ${req.originalUrl} ${res.statusCode} ${elapsedMs}ms`);
  });
  next();
};

module.exports = {
  requestLogger,
};
