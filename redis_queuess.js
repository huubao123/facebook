const Queue = require('bull');
const axios = require('axios');
const pagequeue = new Queue('page', { redis: { port: 6379, host: '127.0.0.1' } });
const youtube = new Queue('youtube', { redis: { port: 6379, host: '127.0.0.1' } });
const fs = require('fs');
const page1queue = new Queue('page1', { redis: { port: 6379, host: '127.0.0.1' } });
const schedule = new Queue('schedule', { redis: { port: 6379, host: '127.0.0.1' } });
const update = new Queue('update', { redis: { port: 6379, host: '127.0.0.1' } });
const queue1 = new Queue('group1', { redis: { port: 6379, host: '127.0.0.1' } });
const test = new Queue('test', { redis: { port: 6379, host: '127.0.0.1' } });
const queue = new Queue('queue', { redis: { port: 6379, host: '127.0.0.1' } });
const api = new Queue('api', { redis: { port: 6379, host: '127.0.0.1' } });

const day = new Queue('day', { redis: { port: 6379, host: '127.0.0.1' } });
const mount = new Queue('mount', { redis: { port: 6379, host: '127.0.0.1' } });
const week = new Queue('week', { redis: { port: 6379, host: '127.0.0.1' } });
const del = new Queue('del', { redis: { port: 6379, host: '127.0.0.1' } });

const private_queue = new Queue('private_queue', { redis: { port: 6379, host: '127.0.0.1' } });
const private_day = new Queue('private_day', { redis: { port: 6379, host: '127.0.0.1' } });
const private_week = new Queue('private_week', { redis: { port: 6379, host: '127.0.0.1' } });
const private_mount = new Queue('private_mount', { redis: { port: 6379, host: '127.0.0.1' } });

const youtube_queue = new Queue('youtube_queue', { redis: { port: 6379, host: '127.0.0.1' } });
const youtube_day = new Queue('youtube_day', { redis: { port: 6379, host: '127.0.0.1' } });
const youtube_week = new Queue('youtube_week', { redis: { port: 6379, host: '127.0.0.1' } });
const youtube_mount = new Queue('youtube_mount', { redis: { port: 6379, host: '127.0.0.1' } });

const deletejob = require('./middlewares/deletejob');
const youtube_pro = require('./middlewares/youtube');
const group = require('././controllers/api/group');
const group1 = require('././controllers/api/group1');
const private = require('././controllers/api/private');
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
youtube_day.process(async (job, done) => {
  await youtube_pro(job);
  job.progress(100);
  done();
});
youtube_mount.process(async (job, done) => {
  await youtube_pro(job);
  job.progress(100);
  done();
});
youtube_queue.process(async (job, done) => {
  await youtube_pro(job);
  job.progress(100);
  done();
});
youtube_week.process(async (job, done) => {
  await youtube_pro(job);
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
private_queue.process(async (job, done) => {
  await private(job);
  done();
});
private_day.process(async (job, done) => {
  await private(job);
  done();
});
private_week.process(async (job, done) => {
  await private(job);
  done();
});
private_mount.process(async (job, done) => {
  await private(job);
  done();
});
del.process(async (job, done) => {
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
    if (element.is_active == 0) {
      try {
        await deletejob(element.short_description.split('/')[4]);
        let p = await private_day.getJob(element.short_description.split('/')[4]);
        let nop = await day.getJob(element.short_description.split('/')[4]);
        await p?.remove();
        await nop?.remove();
      } catch (e) {}
    }
  });
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
    console.error(e);
    return done(e);
  }

  post.data.data?.forEach(async (element) => {
    if (element.session_tags.type_crawl[0]?.title == 'Youtube') {
      let update = new Date(element.updated_at).getTime();
      let today = dayjs().format('YYYY-MM-DD HH:mm:ss');
      let pass = dayjs(new Date(today).getTime() - 60 * 60000).format('YYYY-MM-DD HH:mm:ss');
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
              lengths: detail.data.data.formData.custom_fields.count
                ? detail.data.data.formData.custom_fields.count
                : 1,
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
        // Group công khai
        if (parseInt(schedules) === 0) {
          try {
            await deletejob(element.short_description.split('search_query=')[1]);
          } catch (e) {}
          schedule = {
            jobId: element.short_description.split('search_query=')[1],
            delay: delay,
          };
          await youtube_queue.add(
            { data: datas.data.data, jobId: element.short_description.split('search_query=')[1] },
            schedule
          );
        } else if (parseInt(schedules) === 1) {
          await deletejob(element.short_description.split('search_query=')[1]);
          const d = new Date(detail.data.data.published_start);
          let hour = d.getHours() > 23 ? 23 : d.getHours();
          let minute = d.getMinutes() > 59 ? 59 : d.getMinutes();
          schedule = {
            jobId: element.short_description.split('search_query=')[1],
            repeat: { cron: `${minute} ${hour} * * *` },
          };
          try {
            console.log(datas.data.data, element.short_description.split('search_query=')[1]);
            await new Promise((r) => setTimeout(r, 4000));

            await youtube_day.add(
              { data: datas.data.data, jobId: element.short_description.split('search_query=')[1] },
              schedule
            );
          } catch (e) {
            console.log(e);
          }
        } else if (parseInt(schedules) === 2) {
          await deletejob(element.short_description.split('search_query=')[1]);
          const d = new Date(detail.data.data.published_start);
          let hour = d.getHours() > 23 ? 23 : d.getHours();
          let minute = d.getMinutes() > 59 ? 59 : d.getMinutes();
          let day = d.getDay() > 6 ? 6 : d.getDay();
          schedule = {
            jobId: element.short_description.split('search_query=')[1],
            repeat: { cron: `${minute} ${hour} * * ${day}` },
          };
          await youtube_week.add(
            { data: datas.data.data, jobId: element.short_description.split('search_query=')[1] },
            schedule
          );
        } else if (parseInt(schedules) === 3) {
          await deletejob(element.short_description.split('search_query=')[1]);
          const d = new Date(detail.data.data.published_start);
          let hour = d.getHours() > 23 ? 23 : d.getHours();
          let date = d.getDate() > 28 ? 28 : d.getDate();
          schedule = {
            jobId: element.short_description.split('search_query=')[1],
            repeat: { cron: `0 ${hour} ${date} * *` },
          };
          await youtube_mount.add(
            { data: datas.data.data, jobId: element.short_description.split('search_query=')[1] },
            schedule
          );
        }
      }
    } else if (element?.session_tags?.type_crawl[0]?.title == 'Facebook') {
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
              lengths: detail.data.data.formData.custom_fields.count
                ? detail.data.data.formData.custom_fields.count
                : 1,
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
            await private_queue.add(
              { data: datas.data.data, jobId: element.short_description.split('/')[4] },
              schedule
            );
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
            await private_mount.add(
              { data: datas.data.data, jobId: element.short_description.split('/')[4] },
              schedule
            );
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
    }
  });
  done();
});
api.process(async (job, done) => {
  const head = {
    Authorization: 'e5szHrsAFsaE7dpaVeWykEOMGgkU4thG',
  };
  try {
    let array1 = [10, 20, 50, 100];
    for (const element of array1) {
      console.log(element);
      let getdata = await axios({
        method: 'get',
        url: `https://deal-sourcing-mgs-api.mangoads.com.vn/api/v1/posts?limit=${element}&page=1&search[type:is]=company&sort=created_at&search_type=and&search[is_active:in]=1`,
        headers: head,
      });
      for (let j = 0; j < getdata.data.meta.last_page; j++) {
        try {
          await new Promise((r) => setTimeout(r, 4000));
          let getdata = await axios({
            method: 'get',
            url: `https://deal-sourcing-mgs-api.mangoads.com.vn/api/v1/posts?limit=${element}&page=${
              j + 1
            }&search[type:is]=company&sort=created_at&search_type=and&search[is_active:in]=1`,
            headers: head,
          });
          console.log(getdata.data.meta.current_page);
        } catch (e) {}
      }
    }
  } catch (e) {
    console.log(e);
  }
  done();
});
