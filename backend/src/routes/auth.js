const express = require('express');
const bcrypt = require('bcryptjs');
const { registerSchema, loginSchema } = require('../schemas/authSchemas');
const { signToken, sanitizeUser } = require('../services/authService');

const createAuthRouter = ({ config, storeManager }) => {
  const router = express.Router();

  router.post('/auth/register', async (req, res) => {
    const { value, error } = registerSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const store = storeManager.getStore();
    const existing = await store.findUserByEmail(value.email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const newUser = await store.createUser({
      username: (value.username || value.name).trim(),
      email: value.email.toLowerCase(),
      role: (value.role || value.targetRole || 'Software Engineer').trim(),
      passwordHash: bcrypt.hashSync(value.password, 10),
    });

    const token = signToken(newUser, config);
    return res.status(201).json({ token, user: sanitizeUser(newUser) });
  });

  router.post('/auth/login', async (req, res) => {
    const { value, error } = loginSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const store = storeManager.getStore();
    const user = await store.findUserByEmail(value.email);
    if (!user || !bcrypt.compareSync(value.password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let effectiveUser = user;
    const requestedRole = (value.role || value.targetRole || '').trim();
    if (requestedRole && requestedRole !== user.role) {
      effectiveUser = await store.updateUserRole(user.id, requestedRole);
    }

    const token = signToken(effectiveUser, config);
    return res.json({ token, user: sanitizeUser(effectiveUser) });
  });

  return router;
};

module.exports = {
  createAuthRouter,
};
