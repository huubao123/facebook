const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');
//const bigquery = require('./bigquery');
const loadmoremedia = require('../../middlewares/loadmore_media');
const getdata = require('../../middlewares/getdata_post_group');
const autoScroll_post = require('../../middlewares/autoscrollpost');
const createMedia = require('../../middlewares/media');
const genSlug = require('../../middlewares/genslug');
const Post = require('../../models/post');
const Post_detail = require('../../models/post_detail');
const Group = require('../../models/group');
const Posttype = require('../../models/posttype');

const initializeApp = require('firebase/app');

const getDatabase = require('firebase/database').getDatabase;
const set = require('firebase/database').set;
const ref = require('firebase/database').ref;
const push = require('firebase/database').push;
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

module.exports = async function main(req) {
  try {
    const url = req.data.data.link;
    let url_group = '';
    for (let i = 0; i < 5; i++) {
      url_group += url.split('/')[i];
    }
    const name = url.split('/')[3] == 'groups' ? url.split('/')[4] : url.split('/')[3];
    const cmt_length = req.data.data.length_comment ? req.data.data.length_comment : 0;
    let name_group = '';
    const post_type = req.data.data.posttype ? req.data.data.posttype : '';
    let group_id = '';
    let Posttype_id = '';
    const craw_id = crypto.randomBytes(16).toString('hex');

    Posttype.findOne({ name: post_type }, async function (err, posttype) {
      if (posttype) {
        Posttype_id = posttype._id;
      } else {
        let Posttypes = new Posttype({
          name: post_type,
          create_at: new Date(),
        });
        await Posttypes.save();
        Posttype_id = Posttypes._id;
      }
    });

    // const app = initializeApp.initializeApp(firebaseConfig);
    // const database = getDatabase(app);
    // const postListRefs = ref(database, '/craw_list_length/' + name.replace(/[#:.,$]/g, '') + '/' + craw_id);
    // await set(postListRefs, {
    //   craw_id: craw_id,
    //   length: 1,
    //   url: url,
    //   cmt_length: cmt_length,
    //   create_at: Date.now(),
    // });
    if (!cmt_length) {
      cmt_length = -1;
    }
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: [
        // '--no-sandbox',
        // '--disable-setuid-sandbox',
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
      product: 'chrome',
      devtools: true,
      executablePath: process.env.executablePath,
    });
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
      await page.type('#email', 'huubao4000@gmail.com');
      await page.type('#pass', 'huubao123');
      await page.keyboard.press('Enter');

      //await new Promise((r) => setTimeout(r, 4000));
      await page.waitForSelector('div', { hidden: true });

      if (url.indexOf('posts') !== -1) {
        for (let i = 0; i < 5; i++) {
          if (i === 4) {
            name_group += url.split('/')[i];
          } else {
            name_group += url.split('/')[i] + '/';
          }
        }
      }
      await page.goto(name_group, {
        waitUntil: 'networkidle2',
      });
      await page.waitForFunction('document.querySelector("h1")');
    } catch (e) {}

    let result = await page.evaluate(() => {
      return document.querySelectorAll('h1')[1]
        ? document.querySelectorAll('h1')[1].textContent
        : document.querySelectorAll('h1')[0].textContent;
    });
    Group.findOne({ url: name_group }, async function (err, group) {
      if (err) {
        console.log(err);
        return;
      }
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
    });
    // const postListRefss = ref(databases, 'Group/' + name.replace(/[#:.,$]/g, ''));
    // await set(postListRefss, {
    //   name: result,
    //   url: url_group,
    //   create_at: Date.now(),
    // });
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
      });
      // await page.waitForSelector('*');
      // await new Promise((r) => setTimeout(r, 4000));
      try {
        await page.evaluate(async () => {
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
      await page.evaluate(async () => {
        let div = document.querySelectorAll('[role = "button"]');
        for (let i = 0; i < div.length; i++) {
          if (div[i].innerText.indexOf('liên quan nhất') !== -1 || div[i].innerText.indexOf('Gần đây nhất') !== -1) {
            await div[i].click();
          }
        }
      });
      await page.evaluate(async () => {
        let div = document.querySelectorAll('[role="menuitem"]');
        for (let i = 0; i < div.length; i++) {
          if (div[i].innerText.indexOf('Tất cả bình luận') !== -1) {
            await div[i].click();
          }
        }
      });

      await autoScroll_post(page);
      await getdata(page, cmt_length).then(async function (data) {
        let result = data;
        if (data.imagemore > 0) {
          result = await loadmoremedia(page, data);
        }
        if (!result.ismain || !result.iscate || !result.iscontent || !result.isuser) {
          // const error = ref(databases, 'Error/' + name.replace(/[#:.,$]/g, '') + '/' + result.linkPost.split('/')[6]);
          // await set(error, {
          //   name: result.linkPost,
          //   ismain: result.ismain,
          //   iscate: result.iscate,
          //   iscomment: result.iscomment,
          //   isuser: result.isuser,
          //   iscontent: result.iscontent,
          // });
          return;
        }

        // const postListRef = ref(database, '/Listpost/' + name.replace(/[#:.,$]/g, '') + '/' + url.split('/')[6]);

        // set(postListRef, {
        //   user: result.user,
        //   videos: result.videos,
        //   contentList: result.contentList,
        //   countComment: result.countComment,
        //   countLike: result.countLike,
        //   countShare: result.countShare,
        //   user_id: result.user_id,
        //   idPost: url.split('/')[6],
        //   linkPost: url,
        //   linkImgs: result.linkImgs,
        //   commentList: result.commentList,
        //   token: result.token,
        //   count_comments_config: result.count_comments_config,
        //   statusbar: 'active',
        //   create_at: Date.now(),
        // });

        // const postListRefss = ref(
        //   database,
        //   'post_type/' + post_type + '/' + name.replace(/[#:.,$]/g, '') + '/' + url.split('/')[6]
        // );
        let titles = '';
        let short_descriptions = '';
        let arrVid = null;
        let arrImage = null;
        let flagimage = true;
        let flagvideo = true;
        let short_description = result.contentList ? result.contentList.replaceAll(/(<([^>]+)>)/gi, '') : '';
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
        // if (result.videos.length > 2) {
        //   console.log(result.videos);
        //   arrVid = await Promise.all(
        //     result.videos.map(async (video) => {
        //       let result = await fetch(video);
        //       result = await result.blob();
        //       if (result.size / 1024 / 1024 > 1) {
        //         return null;
        //       }
        //       let resultAddVid = await createMedia({
        //         data: [
        //           {
        //             alt: result.post_link.split('/')[6] ? result.post_link.split('/')[6] : '',
        //             title: result.post_link.split('/')[6] ? result.post_link.split('/')[6] : '',
        //             file: result,
        //           },
        //         ],
        //       });
        //       if (resultAddVid) {
        //         return { link_video: resultAddVid.data.data[0].path };
        //       } else {
        //         flagvideo = false;
        //         return;
        //       }
        //     })
        //   );
        // }
        // if (result.imageList.length > 0) {
        //   arrImage = await Promise.all(
        //     result.imageList.map(async (image) => {
        //       let result = await fetch(image);
        //       result = await result.blob();
        //       let resultAddImage = await createMedia({
        //         data: [
        //           {
        //             alt: result.post_link.split('/')[6] ? result.post_link.split('/')[6] : '',
        //             title: result.post_link.split('/')[6] ? result.post_link.split('/')[6] : '',
        //             file: result,
        //           },
        //         ],
        //       });
        //       if (resultAddImage) {
        //         return resultAddImage.data.data[0];
        //       } else {
        //         flagimage = false;
        //         return null;
        //       }
        //     })
        //   );
        // }
        // if (arrImage && arrImage.length > 0) {
        //   for (let j = 0; j < arrImage.length; j++) {
        //     if (arrImage[j] === undefined) {
        //       arrImage = undefined;
        //       break;
        //     }
        //   }
        // }
        // let arrImages = arrImage && arrImage.length !== 0 ? arrImage[0].id : null;
        let basic_fields = {
          title: titles,
          short_description: short_descriptions,
          long_description: result.contentList
            ? result.contentList.replaceAll('https://l.facebook.com/l.php?', '')
            : '',
          slug: '',
          featured_image: result.linkImgs[0] ? result.linkImgs[0] : '',
          session_tags: {
            tags: [],
          },
          is_active: 1,
          categorialue: [],
          key: '',
          name: '',
          type: post_type,
          attributes: [],
          status: 'publish',
          seo_tags: {
            meta_title: 'New Post Facebook',
            meta_description: 'New Post Facebook',
          },
        };
        let custom_fields = {
          video: result.videos,
          date: result.date ? result.date : '',
          post_id: result.idPost ? result.idPost : '',
          post_link: result.linkPost ? result.linkPost : '',
          user_id: result.user_id ? result.user_id : 'undefined',
          user_name: result.user ? result.user : 'undefined',
          count_like: result.countLike
            ? result.countLike.toString().split(' ')[0].indexOf(',') > -1
              ? parseInt(result.countLike.toString().split(' ')[0].replace('K', '00').replace(',', ''))
              : parseInt(result.countLike.toString().split(' ')[0].replace('K', '000'))
            : 0,
          count_comment: result.countComment
            ? result.countComment.toString().split(' ')[0].indexOf(',') > -1
              ? parseInt(result.countComment.toString().split(' ')[0].replace('K', '00').replace(',', ''))
              : parseInt(result.countComment.toString().split(' ')[0].replace('K', '000'))
            : 0,
          count_share: result.countShare
            ? result.countShare.toString().split(' ')[0].indexOf(',') > -1
              ? parseInt(result.countShare.toString().split(' ')[0].replace('K', '00').replace(',', ''))
              : parseInt(result.countShare.toString().split(' ')[0].replace('K', '000'))
            : 0,
          featured_image: result.linkImgs ? result.linkImgs : '',
          comments: result.commentList
            ? result.commentList.map((item) => ({
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
                      content: child.contentComment,
                      count_like: child.countLike
                        ? child.countLike.toString().split(' ')[0].indexOf(',') > -1
                          ? parseInt(child.countLike.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                          : parseInt(child.countLike.toString().split(' ')[0].replace('K', '000'))
                        : 0,
                      user_id: child.userIDComment,
                      user_name: child.usernameComment,
                      imageComment: child.imageComment ? child.imageComment : '',
                    }))
                  : [],
              }))
            : [],
        };
        data_post = {};
        try {
          //let posttype = await Posttype.findOne({name: post_type});
          Post.findOne({ post_link: url, posttype: Posttype_id }, async function (err, post) {
            if (err) {
              return;
            } else {
              if (post === null) {
                let posts = new Post({
                  basic_fields: JSON.stringify(basic_fields),
                  custom_fields: JSON.stringify(custom_fields),
                  post_link: url,
                  group_id: group_id,
                  posttype: Posttype_id,
                  create_at: new Date(),
                });
                await posts.save();
              } else {
                await Post.findByIdAndUpdate(
                  post._id,
                  {
                    basic_fields: JSON.stringify(basic_fields),
                    custom_fields: JSON.stringify(custom_fields),
                    create_at: new Date(),
                  },
                  { new: true }
                );
              }
            }
          });
          let postdetail = new Post_detail({
            group_id: group_id,
            title: titles,
            short_description: short_descriptions,
            long_description: result.contentList
              ? result.contentList.replaceAll('https://l.facebook.com/l.php?', '')
              : '',
            slug: '',
            featured_image: result.linkImgs[0] ? result.linkImgs[0] : '',
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
            video: result.videos,
            date: result.date ? result.date : '',
            post_id: result.idPost ? result.idPost : '',
            post_link: url,
            user_id: result.user_id ? result.user_id : 'undefined',
            user_name: result.user ? result.user : 'undefined',
            count_like: result.countLike
              ? result.countLike.toString().split(' ')[0].indexOf(',') > -1
                ? parseInt(result.countLike.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                : parseInt(result.countLike.toString().split(' ')[0].replace('K', '000'))
              : 0,
            count_comment: result.countComment
              ? result.countComment.toString().split(' ')[0].indexOf(',') > -1
                ? parseInt(result.countComment.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                : parseInt(result.countComment.toString().split(' ')[0].replace('K', '000'))
              : 0,
            count_share: result.countShare
              ? result.countShare.toString().split(' ')[0].indexOf(',') > -1
                ? parseInt(result.countShare.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                : parseInt(result.countShare.toString().split(' ')[0].replace('K', '000'))
              : 0,
            featured_image: result.linkImgs ? result.linkImgs : '',
            comments: result.commentList
              ? result.commentList.map((item) => ({
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
                        content: child.contentComment,
                        count_like: child.countLike
                          ? child.countLike.toString().split(' ')[0].indexOf(',') > -1
                            ? parseInt(child.countLike.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                            : parseInt(child.countLike.toString().split(' ')[0].replace('K', '000'))
                          : 0,
                        user_id: child.userIDComment,
                        user_name: child.usernameComment,
                        imageComment: child.imageComment ? child.imageComment : '',
                      }))
                    : [],
                }))
              : [],
          });

          await postdetail.save();
        } catch (e) {
          console.log(e);
        }
        //await bigquery(basic_fields, custom_fields);
        // await set(postListRefss, {
        //   basic_fields: basic_fields,
        //   custom_fields: custom_fields,
        // });
      });
    } catch (e) {
      console.log(e);
      console.log('lỗi error');
      // const postListRefss = ref(database, '/Listpost/' + name.replace(/[#:.,$]/g, '') + '/' + url.split('/')[6]);
      // await set(postListRefss, {
      //   post_link: url,
      //   error: 'error' + e,
      // });
    }

    await browser.close();
  } catch (err) {
    console.log('lỗi server', err);
  }
};
