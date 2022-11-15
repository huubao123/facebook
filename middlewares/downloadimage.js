const Fs = require('fs');
const Path = require('path');
const Axios = require('axios');
const crypto = require('crypto');
module.exports = async function downloadImage(url, post_type) {
  const imageid = crypto.randomBytes(10).toString('hex');
  const path_posttype = Path.resolve(__dirname, `../public/images/${post_type}`);
  if (!Fs.existsSync(path_posttype)) {
    Fs.mkdirSync(path_posttype);
  }
  let result = await fetch(url);
  result = await result.blob();
  let type = result.type.split('/')[1];
  const path = Path.resolve(__dirname, `../public/images/${post_type}`, `${imageid}.${type}`);
  const writer = Fs.createWriteStream(path);
  const response = await Axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  }).then(() => {
    return `images/${post_type}/${imageid}.${type}`;
  });
};
