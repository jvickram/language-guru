require('dotenv').config();

const { getConfig, validateConfig } = require('./src/config');
const { createStoreManager } = require('./src/store');
const { createApp } = require('./src/app');
const { now } = require('./src/utils/time');

const config = getConfig();
validateConfig(config);

const storeManager = createStoreManager(config);
const app = createApp({ config, storeManager });

let server;

const start = async () => {
  await storeManager.init();
  server = app.listen(config.port, () => {
    console.log(`${now()} server_started port=${config.port} env=${config.env} datastore=${storeManager.getMode()}`);
  });
};

const shutdown = async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await storeManager.close();
  process.exit(0);
};

if (require.main === module) {
  start().catch((error) => {
    console.error(`${now()} startup_failed`, error);
    process.exit(1);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;
module.exports.start = start;