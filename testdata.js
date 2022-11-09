const Post = require('./models/post');
async function get() {
  Post.find(async (err, post) => {
    if (err) {
      console.log(err);
    }
    console.log(post.post_link);
  });
}
get();
