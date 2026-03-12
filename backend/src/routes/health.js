const express = require('express');
const { now } = require('../utils/time');

const createHealthRouter = ({ config, storeManager }) => {
  const router = express.Router();

  router.get('/health', async (req, res) => {
    res.json({
      status: 'ok',
      service: 'language-guru-api',
      env: config.env,
      datastore: storeManager.getMode(),
      timestamp: now(),
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  router.get('/ready', async (req, res) => {
    const ready = await storeManager.getStore().ready();
    if (!ready) {
      return res.status(503).json({ status: 'not_ready' });
    }
    return res.json({ status: 'ready' });
  });

  return router;
};

module.exports = {
  createHealthRouter,
};
