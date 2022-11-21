const api = require("./middlewares/api");
const Queue = require("bull");
const group = require("./controllers/api/group");
const queue = new Queue("group", { redis: { port: 6379, host: "127.0.0.1" } });
const schedule = new Queue("schedule", { redis: { port: 6379, host: "127.0.0.1" } });
const day = new Queue("day", { redis: { port: 6379, host: "127.0.0.1" } });
const mount = new Queue("mount", { redis: { port: 6379, host: "127.0.0.1" } });
const week = new Queue("week", { redis: { port: 6379, host: "127.0.0.1" } });

async function get() {
  schedule.add({}, { repeat: { cron: "44 16 * * *" } }); //}
}
schedule.process(async (job, done) => {
  const post = await api.get(
    "/api/v1/posts?limit=10&page=1&search[type:is]=device-crawl-1&sort=created_at&search_type=and"
  );
  post.data.data.forEach(async (element) => {
    const detail = await api.get("/api/v1/posts/" + element.id);
    let schedules = detail.data.data.formData.custom_fields.schedule;
    const datas = {
      data: {
        data: {
          link: element.title ? element.title : "",
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
            : "",
        },
      },
    };
    const currentTime = new Date().getTime();

    const processAt = detail.data.data.formData.custom_fields.datetime
      ? new Date(detail.data.data.formData.custom_fields.datetime).getTime()
      : new Date().getTime();

    const delay = processAt - currentTime;
    let schedule = {};
    if (schedules == 0) {
      schedule = {
        delay: delay,
      };
      await queue.add({ data: datas.data.data }, schedule);
    } else if (schedules == 1) {
      schedule = {
        repeat: { cron: "0 17 * * *" },
      };
      await day.add({ data: datas.data.data }, schedule);
    } else if (schedules == 2) {
      schedule = {
        repeat: { cron: "0 0 * * 1" },
      };
      await week.add({ data: datas.data.data }, schedule);
    } else if (schedules == 3) {
      schedule = {
        repeat: { cron: "0 0 1 * *" },
      };
      await mount.add({ data: datas.data.data }, schedule);
    }
  });
  done();
});
queue.process(async (job, done) => {
  await group(job);
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
get();
