const mongoose = require('mongoose');
const { createMemoryStore } = require('./memoryStore');
const { createMongoStore } = require('./mongoStore');
const { now } = require('../utils/time');

const createStoreManager = (config) => {
  let store = createMemoryStore();

  return {
    init: async () => {
      if (config.dataStore === 'mongo' && config.mongoUri) {
        store = await createMongoStore(config);
        console.log(`${now()} datastore=mongo connected`);
      } else {
        store = createMemoryStore();
        console.log(`${now()} datastore=memory loaded`);
      }
    },
    getStore: () => store,
    getMode: () => store.mode,
    close: async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    },
  };
};

module.exports = {
  createStoreManager,
};
