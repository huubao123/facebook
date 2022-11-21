const express = require('express');
const router = express.Router();
// const passport = require('passport');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
const group = require('../controllers/api/group');
const page1 = require('../controllers/api/page1');
const page = require('../controllers/api/page');
const Post = require('.././models/post');
const Group = require('.././models/group');
const group1 = require('../controllers/api/group1');
const video = require('../controllers/sitemap');
const fs = require('fs');
const Queue = require('bull');
const crypto = require('crypto');
const ipadd = require('.././middlewares/request_ip_address');
const image_job = require('.././controllers/api/image');
const queue = new Queue('group', { redis: { port: 6379, host: '127.0.0.1' } });
const pagequeue = new Queue('page', { redis: { port: 6379, host: '127.0.0.1' } });
const page1queue = new Queue('page1', { redis: { port: 6379, host: '127.0.0.1' } });

const queue1 = new Queue('group1', { redis: { port: 6379, host: '127.0.0.1' } });
const test = new Queue('test', { redis: { port: 6379, host: '127.0.0.1' } });
const day = new Queue('day', { redis: { port: 6379, host: '127.0.0.1' } });
const mount = new Queue('mount', { redis: { port: 6379, host: '127.0.0.1' } });
const week = new Queue('week', { redis: { port: 6379, host: '127.0.0.1' } });
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
  res.json({ aaa: 'aaaa' });
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
        redisClient.del(key);
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

router.post('/add', video);
router.post('/group', async function (req, res, next) {
  try {
    const ip = ipadd.getRequestIpAddress(req);
    const jobId = crypto.randomBytes(10).toString('hex');
    const currentTime = new Date().getTime();
    const processAt = new Date(req.body.datetime).getTime();
    const delay = processAt - currentTime;
    let schedule = {};
    if (req.body.schedule == 0) {
      schedule = {
        delay: delay,
        jobId: jobId,
      };
      await queue.add({ data: req.body, jobId: jobId }, schedule);
    } else if (req.body.schedule == 1) {
      schedule = {
        repeat: { cron: '0 17 * * *' },
        jobId: jobId,
      };
      await day.add({ data: req.body, jobId: jobId }, schedule);
    } else if (req.body.schedule == 2) {
      schedule = {
        repeat: { cron: '0 0 * * 1' },
        jobId: jobId,
      };
      await week.add({ data: req.body, jobId: jobId }, schedule);
    } else if (req.body.schedule == 3) {
      schedule = {
        repeat: { cron: '0 0 1 * *' },
        jobId: jobId,
      };
      await mount.add({ data: req.body, jobId: jobId }, schedule);
    }

    // code block

    res.json({ data: 'success', statusbar: 'ok', jobId: jobId });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});
queue.process(async (job, done) => {
  await group(job);
  done();
});

test.process(async (job, done) => {
  job.progress(100);
  done();
});

router.post('/page', async function (req, res, next) {
  const jobId = crypto.randomBytes(10).toString('hex');
  const currentTime = new Date().getTime();
  const processAt = new Date(req.body.datetime).getTime();
  const delay = processAt - currentTime;

  res.json({ data: 'success', statusbar: 'ok', jobId: jobId });

  await pagequeue.add({ data: req.body, jobId: jobId }, { delay: delay, jobId: jobId });
});
pagequeue.process(async (job, done) => {
  await page(job);
  job.progress(100);
  done();
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
page1queue.process(async (job, done) => {
  await page1(job);
  job.progress(100);
  done();
});
queue1.process(async (job, done) => {
  // await new Promise((r) => setTimeout(r, 4000));
  // console.log(job.data);
  await group1(job);
  done();
});
day.process(async (job, done) => {
  await group(job);
  done();
});
week.process(async (job, done) => {
  await group(job);
  done();
});
mount.process(async (job, done) => {
  await group(job);
  done();
});
module.exports = router;
