const { async } = require('@firebase/util');
const Post = require('../../models/post');
const Posttype = require('../../models/posttype');
const redis = require('redis');
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');

class Postapi {
  async getPost(req, res) {
    let redisClient = redis.createClient({
      legacyMode: true,
      socket: {
        port: 6379,
        host: '127.0.0.1',
      },
    });
    await redisClient.connect();
    // redisClient.get('bao', async (err, data) => {
    //   if (err) console.log(err);
    //   if (data != null) {
    //     return res.json(JSON.parse(data));
    //   } else {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 100000000000000;
    let post_type = req.query.posttype;
    let search = req.query?.search;
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
    let posts = await Post.find({ posttype: posttype_id._id }).count();
    //await redisClient.set('bao', post);

    await res.json({
      count_pages: parseInt(Math.ceil(posts / limit)) || 1,
      count_posts: parseInt(posts),
      data: post,
    });
    // }
    // });
  }
  async search(req, res, next) {
    Post.find(req);
  }
  async getPost_id(req, res, next) {
    Post.findById(req.params.id, async function (err, post) {
      if (err) {
        await res.status(500).send(err);
      } else {
        if (post !== null) {
          await res.json(post);
        } else {
          await res.send('Not Found');
        }
      }
    });
  }
  async deletePost_id(req, res, next) {
    Post.findByIdAndRemove(req.params.id, async function (err, post) {
      if (err) {
        await res.status(500).send(err);
      } else {
        await res.json({ data: `delete ${post._id} success` });
      }
    });
  }
}
module.exports = new Postapi();
