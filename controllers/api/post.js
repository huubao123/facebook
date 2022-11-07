const Post = require('../../models/post');
const Posttype = require('../../models/posttype');
class Postapi {
  async getPost(req, res) {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    let post_type = req.query.posttype;
    let skip = (page - 1) * limit;
    if (post_type == undefined) {
      res.json({ data: 'erroe', error: 'no posttype' });
      return;
    }

    let posttype_id = await Posttype.findOne({ name: post_type });
    if (posttype_id === null) {
      res.json({ data: 'error', error: 'no such posttype' });
      return;
    }
    let post = await Post.find({ posttype: posttype_id._id })
      .sort([['create_at', -1]])
      .skip(skip)
      .limit(limit);
    let posts = await Post.find({ posttype: posttype_id._id }).count();
    await res.json({ count_pages: parseInt(Math.ceil(posts / limit)), count_posts: parseInt(posts), data: post });
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
