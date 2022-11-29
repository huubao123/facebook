const Queue = require('bull');
const crypto = require('crypto');
const queue = new Queue('queue', { redis: { port: 6379, host: '127.0.0.1' } });
const day = new Queue('day', { redis: { port: 6379, host: '127.0.0.1' } });
const week = new Queue('week', { redis: { port: 6379, host: '127.0.0.1' } });
const mount = new Queue('mount', { redis: { port: 6379, host: '127.0.0.1' } });

module.exports = async function (req, res, next) {
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
      const d = new Date(req.body.published_start);
      let hour = d.getHours() > 23 ? 23 : d.getHours();
      let minute = d.getMinutes() > 59 ? 59 : d.getMinutes();
      schedule = {
        repeat: { cron: `${minute} ${hour} * * *` },
        jobId: jobId,
      };

      await day.add({ data: req.body, jobId: jobId }, schedule);
    } else if (req.body.schedule == 2) {
      const d = new Date(req.body.published_start);
      let hour = d.getHours() > 23 ? 23 : d.getHours();
      let minute = d.getMinutes() > 59 ? 59 : d.getMinutes();
      let day = d.getDay() > 6 ? 6 : d.getDay();
      schedule = {
        repeat: { cron: `${minute} ${hour} * * ${day}` },
        jobId: jobId,
      };
      await week.add({ data: req.body, jobId: jobId }, schedule);
    } else if (req.body.schedule == 3) {
      const d = new Date(req.body.published_start);
      let hour = d.getHours() > 23 ? 23 : d.getHours();
      let date = d.getDate() > 28 ? 28 : d.getDate();
      schedule = {
        repeat: { cron: `0 ${hour} ${date} * *` },
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
};
