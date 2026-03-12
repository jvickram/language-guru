const createRateLimitMiddleware = (requestLimit) => {
  const requestsByIp = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const minuteBucket = Math.floor(Date.now() / 60000);
    const key = `${ip}:${minuteBucket}`;
    const current = requestsByIp.get(key) || 0;

    requestsByIp.set(key, current + 1);
    if (current + 1 > requestLimit) {
      return res.status(429).json({ error: 'Too many requests, try again later.' });
    }

    if (requestsByIp.size > 5000) {
      const oldBucket = minuteBucket - 2;
      for (const mapKey of requestsByIp.keys()) {
        if (Number(mapKey.split(':').pop()) < oldBucket) {
          requestsByIp.delete(mapKey);
        }
      }
    }

    return next();
  };
};

module.exports = {
  createRateLimitMiddleware,
};
