// const api = require('./middlewares/api');
const axios = require('axios');
const fs = require('fs');
var parser = require('cron-parser');
const dayjs = require('dayjs');
const Queue = require('bull');
const queue = new Queue('group', { redis: { port: 6379, host: '127.0.0.1' } });
const update = new Queue('update', { redis: { port: 6379, host: '127.0.0.1' } });
const day = new Queue('day', { redis: { port: 6379, host: '127.0.0.1' } });
const mount = new Queue('mount', { redis: { port: 6379, host: '127.0.0.1' } });
const week = new Queue('week', { redis: { port: 6379, host: '127.0.0.1' } });
const private_queue = new Queue('private_queue', { redis: { port: 6379, host: '127.0.0.1' } });
const private_day = new Queue('private_day', { redis: { port: 6379, host: '127.0.0.1' } });
const private_week = new Queue('private_week', { redis: { port: 6379, host: '127.0.0.1' } });
const private_mount = new Queue('private_mount', { redis: { port: 6379, host: '127.0.0.1' } });
const youtube_queue = new Queue('youtube_queue', { redis: { port: 6379, host: '127.0.0.1' } });
const youtube_day = new Queue('youtube_day', { redis: { port: 6379, host: '127.0.0.1' } });
const youtube_week = new Queue('youtube_week', { redis: { port: 6379, host: '127.0.0.1' } });
const youtube_mount = new Queue('youtube_mount', { redis: { port: 6379, host: '127.0.0.1' } });

module.exports = async function (id) {
  try {
    const repeatableJobs = await private_day.getRepeatableJobs();
    const foundJob = repeatableJobs.find((job) => job.id === id);
    if (foundJob) {
      await private_day.removeRepeatableByKey(foundJob.key);
    }
  } catch (e) {}
  try {
    const repeatableJobs = await private_week.getRepeatableJobs();
    const foundJob = repeatableJobs.find((job) => job.id === id);
    if (foundJob) {
      await private_week.removeRepeatableByKey(foundJob.key);
    }
  } catch (e) {}
  try {
    const repeatableJobs = await private_mount.getRepeatableJobs();
    const foundJob = repeatableJobs.find((job) => job.id === id);
    if (foundJob) {
      await private_mount.removeRepeatableByKey(foundJob.key);
    }
  } catch (e) {}
  try {
    const repeatableJobs = await day.getRepeatableJobs();
    const foundJob = repeatableJobs.find((job) => job.id === id);
    if (foundJob) {
      await day.removeRepeatableByKey(foundJob.key);
    }
  } catch (e) {}
  try {
    const repeatableJobs = await week.getRepeatableJobs();
    const foundJob = repeatableJobs.find((job) => job.id === id);
    if (foundJob) {
      await week.removeRepeatableByKey(foundJob.key);
    }
  } catch (e) {}
  try {
    const repeatableJobs = await mount.getRepeatableJobs();
    const foundJob = repeatableJobs.find((job) => job.id === id);
    if (foundJob) {
      await mount.removeRepeatableByKey(foundJob.key);
    }
  } catch (e) {}
  try {
    const repeatableJobs = await youtube_day.getRepeatableJobs();
    const foundJob = repeatableJobs.find((job) => job.id === id);
    if (foundJob) {
      await youtube_day.removeRepeatableByKey(foundJob.key);
    }
  } catch (e) {
    console.log(e);
  }
  try {
    const repeatableJobs = await youtube_mount.getRepeatableJobs();
    const foundJob = repeatableJobs.find((job) => job.id === id);
    if (foundJob) {
      await youtube_mount.removeRepeatableByKey(foundJob.key);
    }
  } catch (e) {}
  try {
    const repeatableJobs = await youtube_week.getRepeatableJobs();
    const foundJob = repeatableJobs.find((job) => job.id === id);
    if (foundJob) {
      await youtube_week.removeRepeatableByKey(foundJob.key);
    }
  } catch (e) {}
};
