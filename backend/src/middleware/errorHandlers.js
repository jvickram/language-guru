const { now } = require('../utils/time');

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

const errorHandler = (err, req, res, next) => {
  console.error(`${now()} unhandled_error`, err);
  res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
