const createCorsMiddleware = (config) => (req, res, next) => {
  const origin = req.headers.origin;
  const allowAll = config.allowedOrigins.includes('*');

  if (allowAll) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else if (origin && config.allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
};

module.exports = {
  createCorsMiddleware,
};
