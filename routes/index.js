const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
const Post = require('.././models/post');
const Group = require('.././models/group');
const video = require('../controllers/sitemap');
const fs = require('fs');
const path = require('path');
const crawl_group = require('../controllers/api/crawl/group');
const Queue = require('bull');
const crypto = require('crypto');
const pagequeue = new Queue('page', { redis: { port: 6379, host: '127.0.0.1' } });
const page1queue = new Queue('page1', { redis: { port: 6379, host: '127.0.0.1' } });
const startserver = require('../controllers/startserver');
const queue1 = new Queue('group1', { redis: { port: 6379, host: '127.0.0.1' } });
const schedule = new Queue('schedule', { redis: { port: 6379, host: '127.0.0.1' } });
const update = new Queue('update', { redis: { port: 6379, host: '127.0.0.1' } });
const del = new Queue('del', { redis: { port: 6379, host: '127.0.0.1' } });
const api = new Queue('api', { redis: { port: 6379, host: '127.0.0.1' } });
const api1 = new Queue('api1', { redis: { port: 6379, host: '127.0.0.1' } });

const redis = require('redis');
let redisClient = redis.createClient({
  legacyMode: true,
  socket: {
    port: 6379,
    host: '127.0.0.1',
  },
});
redisClient.connect();
router.get('/', async function (req, res, next) {
  res.send('ok');
});

router.post('/add', video);
router.get('/crawl', startserver);
router.post('/auto', async function (req, res, next) {
  if (req.body.status) {
    console.log(req.body.status);
    await api.add({}, { repeat: { cron: '0 0 * * *' } });
    await api1.add({}, { repeat: { cron: '0 0 * * *' } });

    await update.add(
      {},
      {
        repeat: { cron: '*/15 * * * *' },
      }
    );
    await del.add(
      {},
      {
        repeat: { cron: '*/15 * * * *' },
      }
    );
  } else {
    await update.empty();
    await update.clean(0, 'active');
    await update.clean(0, 'completed');
    await update.clean(0, 'delayed');
  }
  res.send('ok');
});

router.post('/group', crawl_group);

router.get('/video:id', async function (req, res, next) {
  var options = {
    root: path.join(__dirname, '../public/video'),
  };
  console.log(options);
  res.sendFile(`${id}.mp4`, options);
});

router.put('/image', async function (req, res, next) {
  res.send('ok');
  await image.add();
});
router.get('/groups', async function (req, res, next) {
  let page = parseInt(req.query.page);
  let limit = parseInt(req.query.limit);
  let skip = (page - 1) * limit;
  let group = await Group.find()
    .sort([['create_at', -1]])
    .skip(skip)
    .limit(limit);
  res.json(group);
});
router.get('/groups/:id', async function (req, res, next) {
  await Group.findById(req.params.id, async function (err, post) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (post !== null) {
        res.json(post);
      } else {
        res.status(404).send('Not Found');
      }
    }
  });
});
router.delete('/key', async function (req, res) {
  redisClient.keys('*', async (err, keys) => {
    if (err) return;
    if (keys) {
      keys.map(async (key) => {
        if (key.indexOf('stalled-check') < 0) {
          redisClient.del(key);
        }
      });
    }
  });
  res.send('ok');
});
router.post('/post2', async (req, res, next) => {
  const arr = ['success', 'error'];
  res.json({ data: arr[Math.floor(Math.random() * arr.length)], status: 'adsdasds' });
});

router.post('/group1', async (req, res) => {
  try {
    const jobId = crypto.randomBytes(10).toString('hex');
    const currentTime = new Date().getTime();
    const processAt = new Date(req.body.datetime).getTime();
    const delay = processAt - currentTime;
    await queue1.add({ data: req.body, jobId: jobId }, { delay: delay, jobId: jobId });
    res.json({ data: 'success', statusbar: 'ok', jobId: jobId });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/page', async function (req, res, next) {
  const jobId = crypto.randomBytes(10).toString('hex');
  const currentTime = new Date().getTime();
  const processAt = new Date(req.body.datetime).getTime();
  const delay = processAt - currentTime;

  res.json({ data: 'success', statusbar: 'ok', jobId: jobId });

  await pagequeue.add({ data: req.body, jobId: jobId }, { delay: delay, jobId: jobId });
});

router.post('/page1', async function (req, res, next) {
  try {
    const jobId = crypto.randomBytes(10).toString('hex');
    const currentTime = new Date().getTime();
    const processAt = new Date(req.body.datetime).getTime();
    const delay = processAt - currentTime;

    await page1queue.add({ data: req.body, jobId: jobId }, { delay: delay, jobId: jobId });
    res.json({ data: 'success', statusbar: 'ok', jobId: jobId });
  } catch (err) {
    res.status(500).send(e);
  }
});

module.exports = router;
