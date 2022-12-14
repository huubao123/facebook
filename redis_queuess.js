const Queue = require('bull');
const axios = require('axios');
const queue = new Queue('queue', { redis: { port: 6379, host: '127.0.0.1' } });
const pagequeue = new Queue('page', { redis: { port: 6379, host: '127.0.0.1' } });
const page1queue = new Queue('page1', { redis: { port: 6379, host: '127.0.0.1' } });
const schedule = new Queue('schedule', { redis: { port: 6379, host: '127.0.0.1' } });
const update = new Queue('update', { redis: { port: 6379, host: '127.0.0.1' } });
const queue1 = new Queue('group1', { redis: { port: 6379, host: '127.0.0.1' } });
const test = new Queue('test', { redis: { port: 6379, host: '127.0.0.1' } });
const day = new Queue('day', { redis: { port: 6379, host: '127.0.0.1' } });
const mount = new Queue('mount', { redis: { port: 6379, host: '127.0.0.1' } });
const week = new Queue('week', { redis: { port: 6379, host: '127.0.0.1' } });

const private_queue = new Queue('private_queue', { redis: { port: 6379, host: '127.0.0.1' } });
const private_day = new Queue('private_day', { redis: { port: 6379, host: '127.0.0.1' } });
const private_week = new Queue('private_week', { redis: { port: 6379, host: '127.0.0.1' } });
const private_mount = new Queue('private_mount', { redis: { port: 6379, host: '127.0.0.1' } });
const deletejob = require('./middlewares/deletejob');

const group = require('././controllers/api/group');
const group1 = require('././controllers/api/group1');
const dayjs = require('dayjs');
const headers = {
  Authorization: 'J12sMWQnZSYCZtPGPWzImcbIMyO8K3yb',
};

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
update.process(async (job, done) => {
  let post = '';
  try {
    post = await axios({
      method: 'get',
      url: `https://mgs-api-v2.internal.mangoads.com.vn/api/v1/posts?limit=100000000&page=1&search[type:is]=device-crawl-1&sort=created_at&search_type=and`,
      headers: headers,
    });
  } catch (e) {
    return done(e);
  }

  post.data.data?.forEach(async (element) => {
    let update = new Date(element.updated_at).getTime();

    let today = dayjs().format('YYYY-MM-DD HH:mm:ss');
    let pass = dayjs(new Date(today).getTime() - 15 * 60000).format('YYYY-MM-DD HH:mm:ss');
    if (new Date(pass).getTime() < update && update < new Date(today).getTime()) {
      const detail = await axios({
        method: 'get',
        url: 'https://mgs-api-v2.internal.mangoads.com.vn/api/v1/posts/' + element.id,
        headers: headers,
      });
      let schedules = detail.data.data.formData.custom_fields.schedule
        ? detail.data.data.formData.custom_fields.schedule
        : 0;
      const datas = {
        data: {
          data: {
            link: element.short_description ? element.short_description : '',
            lengths: detail.data.data.formData.custom_fields.count ? detail.data.data.formData.custom_fields.count : 1,
            length_comment: detail.data.data.formData.custom_fields.filter.length_comment
              ? detail.data.data.formData.custom_fields.filter.length_comment
              : 1,
            length_content: detail.data.data.formData.custom_fields.filter.length_content
              ? detail.data.data.formData.custom_fields.filter.length_content
              : 1,
            like: detail.data.data.formData.custom_fields.filter.like
              ? detail.data.data.formData.custom_fields.filter.like
              : 1,
            comment: detail.data.data.formData.custom_fields.filter.comment
              ? detail.data.data.formData.custom_fields.filter.comment
              : 1,
            share: detail.data.data.formData.custom_fields.filter.share
              ? detail.data.data.formData.custom_fields.filter.share
              : 1,
            post_type: detail.data.data.formData.custom_fields.posttype[0].key
              ? detail.data.data.formData.custom_fields.posttype[0].key
              : '',
          },
        },
      };
      const currentTime = new Date().getTime();
      const processAt = detail.data.data.formData.custom_fields.datetime
        ? new Date(detail.data.data.formData.custom_fields.datetime).getTime()
        : new Date().getTime();

      const delay = processAt - currentTime;
      let schedule = {};
      console.log(detail.data.data.categories.length);
      if (detail.data.data.categories.length > 0) {
        // group riêng tư
        if (schedules == 0) {
          try {
            await deletejob(element.short_description.split('/')[4]);
            let p = await private_day.getJob(element.short_description.split('/')[4]);
            let nop = await day.getJob(element.short_description.split('/')[4]);
            await p?.remove();
            await nop?.remove();
          } catch (e) {}
          schedule = {
            jobId: element.short_description.split('/')[4],
            delay: delay,
          };
          await private_queue.add({ data: datas.data.data, jobId: element.short_description.split('/')[4] }, schedule);
        } else if (schedules == 1) {
          await deletejob(element.short_description.split('/')[4]);
          const d = new Date(detail.data.data.published_start);
          let hour = d.getHours() > 23 ? 23 : d.getHours();
          let minute = d.getMinutes() > 59 ? 59 : d.getMinutes();
          schedule = {
            jobId: element.short_description.split('/')[4],
            repeat: { cron: `${minute} ${hour} * * *` },
          };

          await private_day.add({ data: datas.data.data, jobId: element.short_description.split('/')[4] }, schedule);
        } else if (schedules == 2) {
          await deletejob(element.short_description.split('/')[4]);

          const d = new Date(detail.data.data.published_start);
          let hour = d.getHours() > 23 ? 23 : d.getHours();
          let minute = d.getMinutes() > 59 ? 59 : d.getMinutes();
          let day = d.getDay() > 6 ? 6 : d.getDay();
          schedule = {
            jobId: element.short_description.split('/')[4],
            repeat: { cron: `${minute} ${hour} * * ${day}` },
          };
          await private_week.add({ data: datas.data.data, jobId: element.short_description.split('/')[4] }, schedule);
        } else if (schedules == 3) {
          await deletejob(element.short_description.split('/')[4]);
          const d = new Date(detail.data.data.published_start);
          let hour = d.getHours() > 23 ? 23 : d.getHours();
          let date = d.getDate() > 28 ? 28 : d.getDate();
          schedule = {
            jobId: element.short_description.split('/')[4],
            repeat: { cron: `0 ${hour} ${date} * *` },
          };
          await private_mount.add({ data: datas.data.data, jobId: element.short_description.split('/')[4] }, schedule);
        }
      } else {
        // Group công khai
        if (schedules == 0) {
          try {
            await deletejob(element.short_description.split('/')[4]);
            let p = await private_day.getJob(element.short_description.split('/')[4]);
            let nop = await day.getJob(element.short_description.split('/')[4]);
            await p?.remove();
            await nop?.remove();
          } catch (e) {}
          schedule = {
            jobId: element.short_description.split('/')[4],
            delay: delay,
          };
          await queue.add({ data: datas.data.data, jobId: element.short_description.split('/')[4] }, schedule);
        } else if (schedules == 1) {
          await deletejob(element.short_description.split('/')[4]);
          const d = new Date(detail.data.data.published_start);
          let hour = d.getHours() > 23 ? 23 : d.getHours();
          let minute = d.getMinutes() > 59 ? 59 : d.getMinutes();
          schedule = {
            jobId: element.short_description.split('/')[4],
            repeat: { cron: `${minute} ${hour} * * *` },
          };

          await day.add({ data: datas.data.data, jobId: element.short_description.split('/')[4] }, schedule);
        } else if (schedules == 2) {
          await deletejob(element.short_description.split('/')[4]);
          const d = new Date(detail.data.data.published_start);
          let hour = d.getHours() > 23 ? 23 : d.getHours();
          let minute = d.getMinutes() > 59 ? 59 : d.getMinutes();
          let day = d.getDay() > 6 ? 6 : d.getDay();
          schedule = {
            jobId: element.short_description.split('/')[4],
            repeat: { cron: `${minute} ${hour} * * ${day}` },
          };
          await week.add({ data: datas.data.data, jobId: element.short_description.split('/')[4] }, schedule);
        } else if (schedules == 3) {
          await deletejob(element.short_description.split('/')[4]);
          const d = new Date(detail.data.data.published_start);
          let hour = d.getHours() > 23 ? 23 : d.getHours();
          let date = d.getDate() > 28 ? 28 : d.getDate();
          schedule = {
            jobId: element.short_description.split('/')[4],
            repeat: { cron: `0 ${hour} ${date} * *` },
          };
          await mount.add({ data: datas.data.data, jobId: element.short_description.split('/')[4] }, schedule);
        }
      }
    }
  });
  done();
});
