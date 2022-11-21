const api = require('./middlewares/api');
const Queue = require('bull');
const group = require('./controllers/api/group')
const queue = new Queue('group', { redis: { port: 6379, host: '127.0.0.1' } });
const schedule = new Queue('schedule', { redis: { port: 6379, host: '127.0.0.1' } });
async function get() {
  schedule.add({},{ repeat: { cron: '3 13 * * *' }})//}
}
schedule.process(async(job,done)=>{
  const post = await api.get(
    '/api/v1/posts?limit=10&page=1&search[type:is]=device-crawl-1&sort=created_at&search_type=and'
  );
  post.data.data.forEach(async (element) => {
    const detail = await api.get('/api/v1/posts/' + element.id);
    const datas = {data:{
      data:{
        link : element.title ? element.title : '',
         lengths :detail.data.data.formData.custom_fields.count  ?detail.data.data.formData.custom_fields.count :  1,
         length_comment :detail.data.data.formData.custom_fields.filter.length_comment ? detail.data.data.formData.custom_fields.filter.length_comment : 1,
         length_content : detail.data.data.formData.custom_fields.filter.length_content ? detail.data.data.formData.custom_fields.filter.length_content :1,
         like : detail.data.data.formData.custom_fields.filter.like ?detail.data.data.formData.custom_fields.filter.like :1,
         comment:  detail.data.data.formData.custom_fields.filter.comment  ?detail.data.data.formData.custom_fields.filter.comment :1,
         share:  detail.data.data.formData.custom_fields.filter.share  ?detail.data.data.formData.custom_fields.filter.share :1,
         post_type:  detail.data.data.formData.custom_fields.posttype[0].key ? detail.data.data.formData.custom_fields.posttype[0].key : ''
      }
    }}
    await queue.add({ data: datas.data.data })
  });
  done();
});
queue.process(async (job, done) => {
  await group(job);
  done();
});
get()