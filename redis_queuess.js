const Queue = require('bull');

const queue = new Queue('group', { redis: { port: 6379, host: '127.0.0.1' } });
const pagequeue = new Queue('page', { redis: { port: 6379, host: '127.0.0.1' } });
const page1queue = new Queue('page1', { redis: { port: 6379, host: '127.0.0.1' } });
const schedule = new Queue('schedule', { redis: { port: 6379, host: '127.0.0.1' } });
const queue1 = new Queue('group1', { redis: { port: 6379, host: '127.0.0.1' } });
const test = new Queue('test', { redis: { port: 6379, host: '127.0.0.1' } });
const day = new Queue('day', { redis: { port: 6379, host: '127.0.0.1' } });
const mount = new Queue('mount', { redis: { port: 6379, host: '127.0.0.1' } });
const week = new Queue('week', { redis: { port: 6379, host: '127.0.0.1' } });
const group = require('././controllers/api/group');
queue.process(async (job, done) => {
  await group(job);
  done();
});

test.process(async (job, done) => {
  job.progress(100);
  done();
});
pagequeue.process(async (job, done) => {
  await page(job);
  job.progress(100);
  done();
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
