// const api = require('./middlewares/api');
const axios = require('axios');
const Queue = require('bull');
const queue = new Queue('group', { redis: { port: 6379, host: '127.0.0.1' } });
const schedule = new Queue('schedule', { redis: { port: 6379, host: '127.0.0.1' } });
const day = new Queue('day', { redis: { port: 6379, host: '127.0.0.1' } });
const mount = new Queue('mount', { redis: { port: 6379, host: '127.0.0.1' } });
const week = new Queue('week', { redis: { port: 6379, host: '127.0.0.1' } });
const headers = {
  authority: 'mgs-api-v2.internal.mangoads.com.vn',
  accept: 'application/json',
  'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
  authorization: 'mDiiDL3oncsffLc9IsxkmmVIA3XZLbDj',
  origin: 'https:mgs-admin-dev.mangoads.com.vn',
  referer: 'https:mgs-admin-dev.mangoads.com.vn/',
  'sec-ch-ua': '"Microsoft Edge";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.52',
  'x-requested-store': 'default',
  'x-requested-with': 'XMLHttpRequest',
};
module.exports = async function startserver(req, res) {
  try {
    const currentTime2 = new Date();
    // const processAt = new Date(req.body.datetime).getTime();

    //const delay = processAt - currentTime2;
    const nextDay = new Date(currentTime2);
    nextDay.setDate(currentTime2.getDate() + 1);
    nextDay.setHours(1, 0, 0);
    const delay2 = nextDay.getTime() - currentTime2.getTime();
    schedule.add({}, { delay: delay2 });
    res.status(200).send('done');
    // res.status(304).send('error datetime');
  } catch (e) {
    res.status(500).send(e);
  }
};
schedule.process(async (job, done) => {
  const post = await axios({
    method: 'get',
    url: 'https://mgs-api-v2.internal.mangoads.com.vn/api/v1/posts?limit=10&page=1&search[type:is]=device-crawl-1&sort=created_at&search_type=and',
    headers: headers,
  });
  post.data.data.forEach(async (element) => {
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
          link: element.title ? element.title : '',
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
    console.log(datas.data.data);
    console.log(schedules);
    let schedule = {};
    if (schedules == 0) {
      schedule = {
        delay: delay,
      };
      await queue.add({ data: datas.data.data }, schedule);
    } else if (schedules == 1) {
      schedule = {
        repeat: { cron: '0 17 * * *' },
      };
      await day.add({ data: datas.data.data }, schedule);
    } else if (schedules == 2) {
      schedule = {
        repeat: { cron: '0 0 * * 2' },
      };
      await week.add({ data: datas.data.data }, schedule);
    } else if (schedules == 3) {
      schedule = {
        repeat: { cron: '0 0 1 * *' },
      };
      await mount.add({ data: datas.data.data }, schedule);
    }
  });
  done();
});
