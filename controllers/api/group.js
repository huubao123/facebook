const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');
const Queue = require('bull');

const initializeApp = require('firebase/app');
const getDatabase = require('firebase/database').getDatabase;
const set = require('firebase/database').set;
const ref = require('firebase/database').ref;
const push = require('firebase/database').push;
const loadmoremedia = require('../../middlewares/loadmore_media');
const getdata = require('../../middlewares/getdata_post_group');
const autoScroll_post = require('../../middlewares/autoscrollpost');
const createMedia = require('../../middlewares/media');
const genSlug = require('../../middlewares/genslug');
require('dotenv').config();
const downloadImage = require('../../middlewares/downloadimage');
const Post = require('../../models/post');
const Post_filter_no = require('../../models/post_filter_no');
const image = new Queue('image', { redis: { port: 6379, host: '127.0.0.1' } });

const Trash = require('../../models/trash');
const Group = require('../../models/group');
const Posttype = require('../../models/posttype');
const Images = require('../../models/image');
const redis = require('redis');
let redisClient = redis.createClient({
  legacyMode: true,
  socket: {
    port: 6379,
    host: '127.0.0.1',
  },
});
redisClient.connect();

//const bigquery = require('./bigquery');
const axios = require('axios');
const firebaseConfig = {
  apiKey: 'AIzaSyA8SytL-Kim6L_CSNvYUmVTH2nf6d-cE6c',
  authDomain: 'facebookpup-4fde6.firebaseapp.com',
  databaseURL: 'https://facebookpup-4fde6-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'facebookpup-4fde6',
  storageBucket: 'facebookpup-4fde6.appspot.com',
  messagingSenderId: '207611940130',
  appId: '1:207611940130:web:3cebdcc6c0a6f19e58297b',
  measurementId: 'G-3LDE9KDMV2',
};
// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object

async function autoScroll(page, lengthss, like, comment, share) {
  const getdata = await page.evaluate(
    async (lengthss, like, comment, share) => {
      const data = await new Promise((resolve, reject) => {
        let totalHeight = 0;
        let distance = 500;
        let timer = setInterval(async () => {
          let post = document.querySelectorAll('[role="feed"]')[0].childNodes;
          let post_length = document.querySelectorAll('[role="feed"]')[0].childNodes.length;
          console.log(lengthss, like, comment, share);
          console.log(post_length);
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy({
            top: distance,
            left: 100,
            behavior: 'smooth',
          });
          totalHeight += distance;
          for (let i = 1; i < post_length - 3; i++) {
            try {
              let lengths =
                post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[0].childNodes[0].childNodes[7] !== undefined
                  ? post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                      .childNodes[0].childNodes[0].childNodes[0].childNodes[7].childNodes[0].childNodes[0].childNodes
                  : post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                      .childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes;
              lengths[2].querySelectorAll('div').forEach(async (element) => {
                if (element.innerText.indexOf('Xem thêm') !== -1) {
                  await element.click();
                }
              });
            } catch (err) {}
          }

          if (
            window.performance.memory.jsHeapSizeLimit - window.performance.memory.jsHeapSizeLimit / 10 <
            window.performance.memory.totalJSHeapSize
          ) {
            clearInterval(timer);
            resolve();
          }

          let isbottom = document.body.scrollHeight;
          let istop = parseInt(document.documentElement.scrollTop + window.innerHeight);
          if (isbottom === istop) {
            clearInterval(timer);
            resolve();
          }

          if (parseInt(post_length) - 5 >= parseInt(lengthss)) {
            clearInterval(timer);
            resolve();
          }
          // if (post_length - 5 > _length) {
          //   clearInterval(timer);
          //   resolve();
          // }
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 1000);
      });
    },
    lengthss,
    like,
    comment,
    share
  );
  return;
}
module.exports = async function main(req) {
  try {
    await req.progress(10);
    console.log(req.data.data);
    const url = req.data.data.link;
    const lengths = req.data.data.lengths == '' ? 0 : parseInt(req.data.data.lengths);
    const cmt_length = req.data.data.length_comment == '' ? 0 : req.data.data.length_comment;
    const conten_length = req.data.data.length_content == '' ? 0 : req.data.data.length_content;
    const name = url.split('/')[3] == 'groups' ? url.split('/')[4] : url.split('/')[3];
    const like = req.data.data.like ? req.data.data.like : 0;
    const comment = req.data.data.comment ? req.data.data.comment : 0;
    const share = req.data.data.share ? req.data.data.share : 0;
    const post_type = req.data.data.post_type ? req.data.data.post_type : '';
    const craw_id = crypto.randomBytes(16).toString('hex');
    let group_id = '';
    let Posttype_id = '';
    const browser2 = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disable-gpu-shader-disk-cache',
        '--media-cache-size=0',
        '--disk-cache-size=0',

        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--mute-audio',
        '--no-default-browser-check',
        '--autoplay-policy=user-gesture-required',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-notifications',
        '--disable-background-networking',
        '--disable-breakpad',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-sync',
      ],
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized'],

      //product: 'chrome',
      devtools: false,
      executablePath: process.env.executablePath, // windows
      //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // MacOS
    });
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disable-gpu-shader-disk-cache',
        '--media-cache-size=0',
        '--disk-cache-size=0',

        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--mute-audio',
        '--no-default-browser-check',
        '--autoplay-policy=user-gesture-required',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-notifications',
        '--disable-background-networking',
        '--disable-breakpad',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-sync',
      ],
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized'],

      //product: 'chrome',
      devtools: true,
      executablePath: process.env.executablePath, // windows
    });
    const context = browser.defaultBrowserContext();
    //        URL                  An array of permissions
    context.overridePermissions('https://www.facebook.com', ['geolocation', 'notifications']);
    const context2 = browser2.defaultBrowserContext();
    //        URL                  An array of permissions
    context2.overridePermissions('https://www.facebook.com', ['geolocation', 'notifications']);
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);
    const pages = await browser.pages();
    if (pages.length > 1) {
      await pages[0].close();
    }
    // await page.setRequestInterception(true);
    // page.on('request', (request) => {
    //   if (/google|cloudflare/.test(request.url())) {
    //     request.abort();
    //   } else {
    //     request.continue();
    //   }
    // });

    try {
      await page.goto('https://www.facebook.com', {
        waitUntil: 'load',
      });
      await new Promise((r) => setTimeout(r, 4000));
      await page.type('#email', process.env.user_name_scrool2);
      await page.type('#pass', 'huubao123');
      await page.keyboard.press('Enter');

      await new Promise((r) => setTimeout(r, 4000));

      await page.goto(url, {
        waitUntil: 'load',
      });
      //aaa
      await page.waitForSelector('h1', { visible: true });
      await page.waitForFunction('document.querySelector("h1")');
    } catch (e) {
      console.log(e);
    }
    const result = await page.evaluate(() => {
      return document.querySelectorAll('h1')[1]
        ? document.querySelectorAll('h1')[1].textContent
        : document.querySelectorAll('h1')[0].textContent;
    });
    let group = await Group.findOne({ url: url });
    if (group) {
      group_id = group._id;
    } else {
      let groups = new Group({
        name: result,
        url: url,
        create_at: new Date(),
      });
      await groups.save();
      group_id = groups._id;
    }
    Posttype.findOne({ name: post_type }, async function (err, posttype) {
      if (posttype) {
        Posttype_id = posttype._id;
        let flag_group = true;
        for (let i = 0; i < posttype.groups.length; i++) {
          if (posttype.groups[i].toString() === group_id.toString()) {
            flag_group = true;
            break;
          } else {
            flag_group = false;
          }
        }
        if (!flag_group) {
          await Posttype.findByIdAndUpdate(
            posttype._id,
            { $push: { groups: group_id } },
            { safe: true, upsert: true, new: true }
          );
        }
      } else {
        let Posttypes = new Posttype({
          name: post_type,
          create_at: new Date(),
          groups: group_id,
        });
        await Posttypes.save();
        Posttype_id = Posttypes._id;
      }
    });

    await autoScroll(page, lengths, like, comment, share);
    await getlink(page, conten_length, like, comment, share).then(async function (result) {
      let proces = 0;
      await browser.close();
      const page1 = await browser2.newPage();
      await page1.setDefaultTimeout(60000);
      const pages = await browser2.pages();
      if (pages.length > 1) {
        await pages[0].close();
      }
      await page1.goto('https://www.facebook.com', {
        waitUntil: 'load',
      });
      await page1.type('#email', process.env.username_get_data1);
      await page1.type('#pass', 'huubao123');
      await page1.keyboard.press('Enter');
      await new Promise((r) => setTimeout(r, 4000));

      //await page1.waitForSelector('div', { hidden: true });
      for (let i = 0; i < result.length; i++) {
        try {
          fs.appendFile('error.txt', JSON.stringify(result[i].post_link, null, 2) + '\r\n', (err) => {
            if (err) throw err;
          });
          console.log(result[i].post_link);
        } catch (e) {
          console.log(e);
        }
        proces += (Math.round(Math.round((result.length * 80) / 100) / result.length) / result.length) * 100;
        console.log('Processing ' + parseInt(proces.toFixed(2)));
        await req.progress(parseInt(proces.toFixed(2)));
        try {
          await page1.goto(result[i].post_link, {
            waitUntil: 'networkidle2',
          });
          try {
            await page1.evaluate(async () => {
              let div = document.querySelectorAll('[role = "button"]');
              for (let i = 0; i < div.length; i++) {
                if (
                  div[i].innerText.indexOf('liên quan nhất') !== -1 ||
                  div[i].innerText.indexOf('Gần đây nhất') !== -1 ||
                  div[i].innerText.indexOf('Tất cả bình luận') !== -1
                ) {
                  await div[i].scrollIntoView();
                }
              }
            });
          } catch (err) {}
          await page1.evaluate(async () => {
            let div = document.querySelectorAll('[role = "button"]');
            for (let i = 0; i < div.length; i++) {
              if (
                div[i].innerText.indexOf('liên quan nhất') !== -1 ||
                div[i].innerText.indexOf('Gần đây nhất') !== -1
              ) {
                await div[i].click();
              }
            }
          });
          await page1.evaluate(async () => {
            let div = document.querySelectorAll('[role="menuitem"]');
            for (let i = 0; i < div.length; i++) {
              if (div[i].innerText.indexOf('Tất cả bình luận') !== -1) {
                await div[i].click();
              }
            }
          });
          await autoScroll_post(page1);
          await getdata(page1, cmt_length).then(async function (data) {
            let results = data;
            console.log(data.imagemore);
            if (parseInt(data.imagemore) > 0) {
              results = await loadmoremedia(page1, data);
            }

            let titles = '';
            let short_descriptions = '';
            let arrVid = null;
            let arrImage = null;
            let flagimage = true;
            let flagvideo = true;
            let Image_id = new Array();
            let short_description = results.contentList ? results.contentList.replaceAll(/(<([^>]+)>)/gi, '') : '';
            for (let i = 0; i < 100; i++) {
              let lengths = short_description.split(' ').length;
              short_descriptions += short_description.split(' ')[i] + ' ';
              if (lengths - 1 == i) {
                break;
              }
            }
            for (let i = 0; i < 100; i++) {
              let lengths = short_description.length;
              titles += short_description[i];
              if (lengths - 1 == i) {
                break;
              }
            }
            try {
              if (results.commentList.length > 0) {
                for (let i = 0; i < results.commentList.length; i++) {
                  if (results.commentList[i].imageComment && results.commentList[i].imageComment != '') {
                    let result_id_image = await downloadImage(results.commentList[i].imageComment, post_type);
                    results.commentList[i].imageComment = result_id_image;
                  }
                  if (results.commentList[i].children.length > 0) {
                    for (let j = 0; j < results.commentList[i].children.length; j++) {
                      if (
                        results.commentList[i].children[j].imageComment &&
                        results.commentList[i].children[j].imageComment !== ''
                      ) {
                        let result_id_images = await downloadImage(
                          results.commentList[i].children[j].imageComment,
                          post_type
                        );
                        results.commentList[i].children[j].imageComment = result_id_images;
                      }
                    }
                  }
                }
              }
            } catch (e) {}

            if (results.linkImgs.length > 0) {
              for (let i = 0; i < results.linkImgs.length; i++) {
                let result_id_image = await downloadImage(results.linkImgs[i], post_type);
                Image_id.push(result_id_image);
              }
            }

            let basic_fields = {
              title: titles,
              short_description: short_descriptions,
              long_description: results.contentList
                ? results.contentList.replaceAll('https://l.facebook.com/l.php?', '')
                : '',
              slug: '',
              featured_image: Image_id[0] ? Image_id[0] : '',
              session_tags: {
                tags: [],
              },
              categorialue: [],
              key: '',
              name: '',
              type: post_type,
              attributes: [],
              status: 'publish',
              is_active: 1,
              seo_tags: {
                meta_title: 'New Post Facebook',
                meta_description: 'New Post Facebook',
              },
            };

            let custom_fields = {
              video: results.videos,
              date: results.date ? results.date : '',
              post_id: results.idPost ? results.idPost : '',
              post_link: result[i].post_link ? result[i].post_link : '',
              user_id: results.user_id ? results.user_id : 'undefined',
              user_name: results.user ? results.user : 'undefined',
              count_like: results.countLike
                ? results.countLike.toString().split(' ')[0].indexOf(',') > -1
                  ? parseInt(results.countLike.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                  : parseInt(results.countLike.toString().split(' ')[0].replace('K', '000'))
                : 0,
              count_comment: results.countComment
                ? results.countComment.toString().split(' ')[0].indexOf(',') > -1
                  ? parseInt(results.countComment.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                  : parseInt(results.countComment.toString().split(' ')[0].replace('K', '000'))
                : 0,
              count_share: results.countShare
                ? results.countShare.toString().split(' ')[0].indexOf(',') > -1
                  ? parseInt(results.countShare.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                  : parseInt(results.countShare.toString().split(' ')[0].replace('K', '000'))
                : 0,
              featured_image: Image_id[0] ? Image_id : [],
              comments: results.commentList
                ? results.commentList.map((item) => ({
                    date: item.date,
                    content: item.contentComment,
                    count_like: item.countLike
                      ? item.countLike.toString().split(' ')[0].indexOf(',') > -1
                        ? parseInt(item.countLike.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                        : parseInt(item.countLike.toString().split(' ')[0].replace('K', '000'))
                      : 0,
                    user_id: item.userIDComment,
                    user_name: item.usernameComment,
                    imgComment: item.imageComment ? item.imageComment : '',
                    children: item.children
                      ? item.children.map((child) => ({
                          date: child.date,
                          content: child.contentComment,
                          count_like: child.countLike
                            ? child.countLike.toString().split(' ')[0].indexOf(',') > -1
                              ? parseInt(child.countLike.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                              : parseInt(child.countLike.toString().split(' ')[0].replace('K', '000'))
                            : 0,
                          user_id: child.userIDComment,
                          user_name: child.usernameComment,
                          imgComment: child.imageComment ? child.imageComment : '',
                        }))
                      : [],
                  }))
                : [],
            };
            //await bigquery(basic_fields, custom_fields);
            try {
              let trash = await Trash.find();
              let id = await trash[0].ids.find((id) => id == results.idPost);
              if (id) {
                console.log(id);
              } else {
                Post_filter_no.findOne(
                  { post_link: result[i].post_link, posttype: Posttype_id },
                  async function (err, post) {
                    if (err) {
                      console.log(err);
                    } else {
                      if (post === null) {
                        let posts = new Post_filter_no({
                          basic_fields: JSON.stringify(basic_fields),
                          custom_fields: JSON.stringify(custom_fields),
                          post_link: result[i].post_link,
                          group_page_id: group_id,
                          posttype: Posttype_id,
                          length_comments: parseInt(cmt_length),
                          title: titles,
                          create_at: new Date(),
                          status: 'active',
                          filter: false,
                        });
                        await posts.save();
                        console.log(posts._id);
                      } else {
                        await Post_filter_no.findByIdAndUpdate(
                          post._id,
                          {
                            basic_fields: JSON.stringify(basic_fields),
                            custom_fields: JSON.stringify(custom_fields),
                            title: titles,
                            create_at: new Date(),
                            length_comments: parseInt(cmt_length),
                            status: 'update',
                            filter: false,
                          },
                          { new: true }
                        );
                        console.log(post._id);
                      }
                    }
                  }
                );
              }
            } catch (e) {
              console.log(e);
            }
          });
        } catch (e) {
          console.log(e);
          console.log('lỗi error');
        }
      }
      await browser2.close();
    });
  } catch (err) {
    console.log('lỗi server', err);
    fs.appendFile('error.txt', JSON.stringify(err, null, 2) + '\r\n', (err) => {
      if (err) throw err;
    });
  }
};

async function getlink(page, conten_length, like, comment, share) {
  const dimension = await page.evaluate(
    async (conten_length, like, comment, share) => {
      let post = document.querySelectorAll('[role="feed"]')[0].childNodes;
      let data = [];
      for (let i = 1; i < post.length; i++) {
        try {
          let posts_href = '';
          let count_like = (count_comment = count_share = count_content = 0);
          let content = '';
          let lengths =
            post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[0].childNodes[0].childNodes[7] !== undefined
              ? post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[0].childNodes[0].childNodes[7].childNodes[0].childNodes[0].childNodes
              : post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes;
          lengths[2].childNodes.forEach((element, index) => {
            if (element.className == '') {
              element.childNodes[0].childNodes.forEach(function (node) {
                if (node.nodeName == 'SPAN') {
                  for (let c = 0; c < node.childNodes.length; c++) {
                    content += node.childNodes[c].innerText
                      .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                      .replace(/^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, '');
                  }
                } else {
                  for (let c = 0; c < node.childNodes[0].childNodes[0].childNodes.length; c++) {
                    content += node.childNodes[0].childNodes[0].childNodes[c].innerText
                      .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                      .replace(/^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, '');
                  }
                }
              });
            }
          });
          if (lengths.length == 5) {
            div_commment_yes = lengths[4].childNodes[0];
          } else {
            div_commment_yes = lengths[3].childNodes[0];
          }
          div = div_commment_yes.querySelectorAll('a[role="link"]');
          let likecomshares =
            div_commment_yes.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes;
          likecomshares.forEach((element, index) => {
            if (index == 0) {
              count_like = element.childNodes
                ? element.childNodes[1].textContent.split(' ')[0].indexOf(',') > -1
                  ? element.childNodes[1].textContent.split(' ')[0].replace('K', '00').replace(',', '')
                  : element.childNodes[1].textContent.split(' ')[0].replace('K', '000')
                : 0;
            }
            if (index == 1) {
              count_comment = element.childNodes[1]
                ? element.childNodes[1].textContent.split(' ')[0].indexOf(',') > -1
                  ? element.childNodes[1].textContent.split(' ')[0].replace('K', '00').replace(',', '')
                  : element.childNodes[1].textContent.split(' ')[0].replace('K', '000')
                : 0;
              count_share = element.childNodes[2]
                ? element.childNodes[2].textContent.split(' ')[0].indexOf(',') > -1
                  ? element.childNodes[2].textContent.split(' ')[0].replace('K', '00').replace(',', '')
                  : element.childNodes[2].textContent.split(' ')[0].replace('K', '000')
                : 0;
            }
          });
          if (
            parseInt(count_like) < like ||
            parseInt(count_comment) < comment ||
            parseInt(count_share) < share ||
            content.split(' ').length < conten_length
          ) {
            console.log(asd);
          }
          if (!div) {
            i += 1;
          } else {
            for (let k = 0; k < div.length; k++) {
              if (div[k].href?.indexOf('posts') !== -1) {
                for (let j = 0; j < 7; j++) {
                  posts_href += div[k].href.split('/')[j] + '/';
                }
                break;
              }
            }
            data.push({
              id: data.length ? data.length + 1 : 1,
              post_link: posts_href == '' ? asd : posts_href,
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
      console.log(data);
      data.filter(async function (e) {
        return e;
      });
      return data;
    },
    conten_length,
    like,
    comment,
    share
  );
  return dimension;
}
