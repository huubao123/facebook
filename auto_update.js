// const api = require('./middlewares/api');
const axios = require('axios');
const fs = require('fs');
var parser = require('cron-parser');
const Queue = require('bull');
const queue = new Queue('group', { redis: { port: 6379, host: '127.0.0.1' } });
const update = new Queue('update', { redis: { port: 6379, host: '127.0.0.1' } });
const day = new Queue('day', { redis: { port: 6379, host: '127.0.0.1' } });
const mount = new Queue('mount', { redis: { port: 6379, host: '127.0.0.1' } });
const week = new Queue('week', { redis: { port: 6379, host: '127.0.0.1' } });
(async function startserver() {
  await update.add(
    {},
    {
      repeat: { cron: '*/15 * * * *' },
    }
  );
})();
