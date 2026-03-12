const jwt = require('jsonwebtoken');

const signToken = (user, config) =>
  jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  name: user.username,
  email: user.email,
  role: user.role,
  targetRole: user.role,
  createdAt: user.createdAt,
});

module.exports = {
  signToken,
  sanitizeUser,
};
