const { async } = require('@firebase/util');
const Post = require('../../models/post');
const Posttype = require('../../models/posttype');
const redis = require('redis');
let redisClient = redis.createClient({
  legacyMode: true,
  socket: {
    port: 6379,
    host: '127.0.0.1',
  },
});
redisClient.connect();
class Postapi {
  async getPost(req, res) {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 100000000000000;
    let post_type = req.query.posttype;
    let search = req.query.search ? req.query.search : '';
    redisClient.get(`posts?page=${page}&limit=${limit}&posttype=${post_type}&search${search}`, async (err, data) => {
      if (err) console.log(err);
      if (data != null) {
        let datas = JSON.parse(data);
        return res.json({
          count_pages: datas.count_pages,
          count_posts: datas.count_posts,
          data: datas.data,
        });
      } else {
        let skip = (page - 1) * limit;
        if (post_type == undefined) {
          res.json({ data: 'error', error: 'no posttype' });
          return;
        }
        let posttype_id = await Posttype.findOne({ name: post_type });
        if (posttype_id === null) {
          res.json({ data: 'error', error: 'no such posttype' });
          return;
        } //https://www.facebook.com/groups/j2team.community/posts/1980870165578427/
        let post = await Post.find({ posttype: posttype_id._id, post_link: { $regex: search } })
          .sort([['create_at', -1]])
          .skip(skip)
          .limit(limit)
          .lean();
        post.forEach(async (element, index) => {
          delete element.post_link;
        });
        let posts = await Post.find({ posttype: posttype_id._id, post_link: { $regex: search } }).count();
        let data = {
          count_pages: parseInt(Math.ceil(posts / limit)) || 1,
          count_posts: parseInt(posts),
          data: post,
        };

        await redisClient.set(
          `posts?page=${page}&limit=${limit}&posttype=${post_type}&search${search}`,
          JSON.stringify(data)
        );
        res.json({ count_pages: parseInt(Math.ceil(posts / limit)) || 1, count_posts: parseInt(posts), data: post });
      }
    });
  }
  async getall(req, res, next) {
    let posts = await Post.find().lean();
    for (let i = 0; i < posts.length; i++) {
      for (let j = i + 1; j < posts.length; j++) {
        if (posts[j].post_link === posts[i].post_link) {
          console.log(posts[j].post_link);
        }
      }
    }
    // delete element.basic_fields;
    // delete element.custom_fields;
    // delete element._id;
    // delete element.create_at;
    // delete element.__v;
    // delete element.posttype;
    // delete element.group_id;
    // res.json(posts);
  }
  async getPost_id(req, res, next) {
    redisClient.get(`posts/${req.params.id}`, async (err, data) => {
      if (err) console.log(err);
      if (data != null) {
        let datas = JSON.parse(data);
        return res.json(datas);
      } else {
        Post.findById(req.params.id, async function (err, post) {
          if (err) {
            await res.status(500).send(err);
          } else {
            if (post !== null) {
              res.json(post);
              redisClient.set(`posts/${req.params.id}`, JSON.stringify(post));
            } else {
              res.status(404).send('Not Found');
            }
          }
        });
      }
    });
  }
  async deletePost_id(req, res, next) {
    Post.findByIdAndRemove(req.params.id, async function (err, post) {
      if (err) {
        await res.status(404).send(err);
      } else {
        await res.json({ data: `delete ${req.params.id} success` });
        redisClient.keys('*', async (err, keys) => {
          if (err) return;
          if (keys) {
            keys.map(async (key) => {
              if (
                key.indexOf('page') > -1 ||
                key.indexOf('limit') > -1 ||
                key.indexOf('search') > -1 ||
                key.indexOf(req.params.id) > -1
              ) {
                redisClient.del(key);
              }
            });
          }
        });
      }
    });
  }
}

module.exports = new Postapi();
