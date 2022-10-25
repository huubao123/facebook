const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');
const initializeApp = require('firebase/app');
const getDatabase = require('firebase/database').getDatabase;
const set = require('firebase/database').set;
const ref = require('firebase/database').ref;
const push = require('firebase/database').push;
const loadmoremedia = require('../../middlewares/loadmore_media');
const getdata = require('../../middlewares/getdata');
require('dotenv').config();

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
const genSlug = (text) => {
  str = str
    .toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .replace(/-+/g, '-');
  return str;
};

async function autoScrollpost(page) {
  const getdata = await page.evaluate(async () => {
    const data = await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 500;
      let n = 0;
      let time = 0;
      let timer = setInterval(async () => {
        time += 1;
        let scrool = new Array();
        let scrollHeight = document.body.scrollHeight;
        // window.scrollBy(0, distance);
        //totalHeight += distance;
        //n += 1;
        // if (n == 10) {
        //   clearInterval(timer);
        //   resolve();
        // }
        if (
          window.performance.memory.jsHeapSizeLimit -
            window.performance.memory.jsHeapSizeLimit / 10 <
          window.performance.memory.totalJSHeapSize
        ) {
          clearInterval(timer);
          resolve();
        }
        if (time == 29) {
          clearInterval(timer);
          resolve();
        }
        let isbottom = document.body.scrollHeight;
        let istop = parseInt(document.documentElement.scrollTop + window.innerHeight) + 1;
        if (isbottom === istop) {
          clearInterval(timer);
          resolve();
        }
        let div = document.querySelectorAll('[role = "button"]');
        // if (n > 1) {
        //   for (let i = 0; i < div.length; i++) {
        //     scrool.push(div[i].innerText);
        //   }
        // }

        for (let i = 0; i < div.length; i++) {
          if (div[i].innerText.indexOf('Ẩn') !== -1) {
            div[i].style.display = 'none';
          } else if (
            div[i].innerText.indexOf('Xem thêm') !== -1 ||
            div[i].innerText.indexOf('phản hồi') !== -1 ||
            div[i].innerText.indexOf('câu trả lời') !== -1 ||
            div[i].innerText.indexOf('bình luận trước') !== -1
          ) {
            await div[i].click();
            scrool.push('đã hết');
          } else {
            scrool.push(div[i].innerText);
          }
        }
        checkcom = scrool.indexOf('đã hết') > -1;
        if (!checkcom) {
          clearInterval(timer);
          resolve();
        }

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 2000);
    });
  });
  return;
}
const createMedia = async (data) => {
  let response = null;
  let form = new FormData();
  console.log(data);
  if (length > 0) {
    map((item, index) => {
      form.append(`media[${index}][title]`, item.title);
      form.append(`media[${index}][alt]`, item.alt);
      form.append(`media[${index}][file]`, item.file);
    });
  }

  await axios({
    url: 'https://mgs-api-v2.internal.mangoads.com.vn/api/v1/media',
    method: 'post',
    data: form,
    headers: {
      'content-type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Requested-Store': 'default',
      accept: 'application/json',
      Authorization: 'iU9ld6uNhHIKvCIFURWqLyV0kfEGC7OD',
    },
  })
    .then(function (res) {
      response = res;
    })
    .catch(function (response) {
      //handle error
      response = null;
    });
  return response;
};

async function autoScroll(page, lengthss, like, comment, share) {
  const getdata = await page.evaluate(
    async (lengthss, like, comment, share) => {
      const data = await new Promise((resolve, reject) => {
        let totalHeight = 0;
        let distance = 500;
        let timer = setInterval(async () => {
          console.log(lengthss, like, comment, share);
          let length_post = 0;
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (
            window.performance.memory.jsHeapSizeLimit -
              window.performance.memory.jsHeapSizeLimit / 10 <
            window.performance.memory.totalJSHeapSize
          ) {
            clearInterval(timer);
            resolve();
          }

          let post_length = document.querySelectorAll('[role="feed"]')[0].childNodes.length;
          let isbottom = document.body.scrollHeight;
          let istop = parseInt(document.documentElement.scrollTop + window.innerHeight);
          if (isbottom === istop) {
            clearInterval(timer);
            resolve();
          }

          console.log(length_post);
          if (post_length - 5 >= lengthss) {
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
    const url = req.data.data.link;
    const lengths = req.data.data.count == '' ? 0 : req.data.data.count;
    const cmt_length = req.data.data.length_comment == '' ? 0 : req.data.data.length_comment;
    const conten_length = req.data.data.length_content == '' ? 0 : req.data.data.length_content;
    const name = url.split('/')[3] == 'groups' ? url.split('/')[4] : url.split('/')[3];
    const like = req.data.data.like ? req.data.data.like : 0;
    const comment = req.data.data.comment ? req.data.data.comment : 0;
    const share = req.data.data.share ? req.data.data.share : 0;
    const post_type = req.data.data.posttype ? req.data.data.posttype : '';
    const craw_id = crypto.randomBytes(16).toString('hex');
    const app = initializeApp.initializeApp(firebaseConfig);
    const database = getDatabase(app);
    const postListRefs = ref(
      database,
      '/craw_list_length/' + name.replace(/[#:.,$]/g, '') + '/' + craw_id
    );
    await set(postListRefs, {
      craw_id: craw_id,
      length: lengths,
      cmt_length: cmt_length,
      like: like,
      share: share,
      comment: comment,
      content_length: conten_length,
      url: url,
      create_at: Date.now(),
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
      devtools: false,
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', // windows
      //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // MacOS
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
      await page.type('#email', process.env.user_name);
      await page.type('#pass', 'huubao123');
      await page.keyboard.press('Enter');

      //await new Promise((r) => setTimeout(r, 4000));
      await page.waitForSelector('div', { hidden: true });
      await page.goto(url, {
        waitUntil: 'load',
      });
      //aaa
      await page.waitForFunction('document.querySelector("h1")');
    } catch (e) {
      console.log(e);
    }
    const result = await page.evaluate(() => {
      return document.querySelector('h1').textContent;
    });

    const apps = initializeApp.initializeApp(firebaseConfig);
    const databases = getDatabase(apps);
    const postListRefss = ref(databases, 'Group/' + name.replace(/[#:.,$]/g, ''));
    await set(postListRefss, {
      name: result,
      url: url,
      create_at: Date.now(),
    });

    await autoScroll(page, lengths, like, comment, share);
    // await page.evaluate(() => {
    //   document.querySelectorAll('a[role="link"][href="#"]').forEach(async (element) => {
    //     await element.focus();
    //     console.log('b');
    //   });
    // });

    await getlink(page, conten_length, like, comment, share).then(async function (result) {
      fs.writeFile('item.txt', JSON.stringify(result, null, 2), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
      let process = 0;
      for (let i = 0; i < result.length; i++) {
        process +=
          (Math.round(Math.round((result.length * 80) / 100) / result.length) / result.length) *
          100;
        console.log('Processing ' + parseInt(process.toFixed(2)));
        await req.progress(parseInt(process.toFixed(2)));
        try {
          // fs.writeFile('item.txt', JSON.stringify(result, null, 2), (err) => {
          //   if (err) throw err;s
          //   console.log('The file has been saved!');
          // });
          await page.goto(result[i].post_link, {
            waitUntil: 'networkidle2',
          });
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
              if (
                div[i].innerText.indexOf('liên quan nhất') !== -1 ||
                div[i].innerText.indexOf('Gần đây nhất') !== -1
              ) {
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
          await autoScrollpost(page);
          await getdata(page, cmt_length).then(async function (data) {
            let results = '';
            console.log(data);
            if (parseInt(data.imagemore) > 0) {
              results = await loadmoremedia(page, data);
              console.log(results);
            } else {
              results = data;
            }

            if (!results.ismain || !results.iscate || !results.iscontent || !results.isuser) {
              const error = ref(
                databases,
                'Error/' + name.replace(/[#:.,$]/g, '') + '/' + result[i].post_link.split('/')[6]
              );
              await set(error, {
                name: result[i].post_link,
                ismain: results.ismain,
                iscate: results.iscate,
                isuser: results.isuser,
                iscontent: results.iscontent,
              });
              return;
            }
            const app = initializeApp.initializeApp(firebaseConfig);
            const database = getDatabase(app);
            const postListRef = ref(
              database,
              'post_type/' +
                post_type +
                '/' +
                name.replace(/[#:.,$]/g, '') +
                '/' +
                result[i].post_link.split('/')[6]
            );
            let titles = '';
            let short_descriptions = '';
            let arrVid = null;
            let arrImage = null;
            let flagimage = true;
            let flagvideo = true;
            let short_description = results.contentList
              ? results.contentList.replaceAll(/(<([^>]+)>)/gi, '')
              : '';
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
            // if (results.videos.length > 2) {
            //   arrVid = await Promise.all(
            //     results.videos.map(async (video) => {
            //       let resultss = await fetch(video);
            //       resultss = await result.blob();
            //       if (resultss.size / 1024 / 1024 > 1) {
            //         return null;
            //       }
            //       let resultAddVid = await createMedia({
            //         data: [
            //           {
            //             alt: result[i].post_link.split('/')[6]
            //               ? result[i].post_link.split('/')[6]
            //               : '',
            //             title: result[i].post_link.split('/')[6]
            //               ? result[i].post_link.split('/')[6]
            //               : '',
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
            // if (results.imageList.length > 0) {
            //   arrImage = await Promise.all(
            //     results.imageList.map(async (image) => {
            //       let result = await fetch(image);
            //       result = await result.blob();
            //       let resultAddImage = await createMedia({
            //         data: [
            //           {
            //             alt: result[i].post_link.split('/')[6]
            //               ? result[i].post_link.split('/')[6]
            //               : '',
            //             title: result[i].post_link.split('/')[6]
            //               ? result[i].post_link.split('/')[6]
            //               : '',
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
              long_description: results.contentList
                ? results.contentList.replaceAll('https://l.facebook.com/l.php?', '')
                : '',
              slug: '',
              featured_image: results.linkImgs[0] ? results.linkImgs[0] : '',
              session_tags: {
                tags: [],
              },
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
              video: results.videos,
              date: results.date ? results.date : '',
              post_id: results.idPost ? results.idPost : '',
              post_link: result[i].post_link ? result[i].post_link : '',
              user_id: results.user_id ? results.user_id : 'undefined',
              user_name: results.user ? results.user : 'undefined',
              count_like: results.countLike
                ? results.countLike.toString().split(' ')[0].indexOf(',') > -1
                  ? parseInt(
                      results.countLike.toString().split(' ')[0].replace('K', '00').replace(',', '')
                    )
                  : parseInt(results.countLike.toString().split(' ')[0].replace('K', '000'))
                : 0,
              count_comment: results.countComment
                ? results.countComment.toString().split(' ')[0].indexOf(',') > -1
                  ? parseInt(
                      results.countComment
                        .toString()
                        .split(' ')[0]
                        .replace('K', '00')
                        .replace(',', '')
                    )
                  : parseInt(results.countComment.toString().split(' ')[0].replace('K', '000'))
                : 0,
              count_share: results.countShare
                ? results.countShare.toString().split(' ')[0].indexOf(',') > -1
                  ? parseInt(
                      results.countShare
                        .toString()
                        .split(' ')[0]
                        .replace('K', '00')
                        .replace(',', '')
                    )
                  : parseInt(results.countShare.toString().split(' ')[0].replace('K', '000'))
                : 0,
              featured_image: results.linkImgs ? results.linkImgs : '',
              comments: results.commentList
                ? results.commentList.map((item) => ({
                    content: item.contentComment,
                    count_like: item.countLike
                      ? item.countLike.toString().split(' ')[0].indexOf(',') > -1
                        ? parseInt(
                            item.countLike
                              .toString()
                              .split(' ')[0]
                              .replace('K', '00')
                              .replace(',', '')
                          )
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
                              ? parseInt(
                                  child.countLike
                                    .toString()
                                    .split(' ')[0]
                                    .replace('K', '00')
                                    .replace(',', '')
                                )
                              : parseInt(
                                  child.countLike.toString().split(' ')[0].replace('K', '000')
                                )
                            : 0,
                          user_id: child.userIDComment,
                          user_name: child.usernameComment,
                          imageComment: child.imageComment ? child.imageComment : '',
                        }))
                      : [],
                  }))
                : [],
            };
            //await bigquery(basic_fields, custom_fields);

            await set(postListRef, {
              basic_fields: basic_fields,
              custom_fields: custom_fields,
            });
            const postListRefss = ref(
              database,
              '/Listpost/' + name.replace(/[#:.,$]/g, '') + '/' + url.split('/')[6]
            );

            await set(postListRefss, {
              user: results.user,
              videos: results.videos,
              contentList: results.contentList,
              countComment: results.countComment,
              countLike: results.countLike,
              countShare: results.countShare,
              user_id: results.user_id,
              idPost: result[i].post_link.split('/')[6],
              linkPost: result[i].post_link,
              linkImgs: results.linkImgs,
              commentList: results.commentList,
              token: results.token,
              count_comments_config: results.count_comments_config,
              statusbar: 'active',
              create_at: Date.now(),
            });
            const postListRefs = ref(
              database,
              '/craw_list/' + name.replace(/[#:.,$]/g, '') + '/' + craw_id
            );
            const newPostRef = push(postListRefs);
            await set(newPostRef, {
              id: i,
              post_link: result[i].post_link,
              statusbar: 'active',
              countComment: results.countComment,
              countLike: results.countLike,
              countShare: results.countShare,
              count_comments_config: results.count_comments_config,
              create_at: Date.now(),
            });
          });
        } catch (e) {
          console.log(e);
          console.log('lỗi error');
          const app = initializeApp.initializeApp(firebaseConfig);
          const database = getDatabase(app);
          const postListRefss = ref(
            database,
            '/Listpost/' + name.replace(/[#:.,$]/g, '') + '/' + url.split('/')[6]
          );
          await set(postListRefss, {
            post_link: url,
            error: 'error' + e,
          });
          const postListRefs = ref(
            database,
            '/craw_list/' + name.replace(/[#:.,$]/g, '') + '/' + craw_id
          );
          const newPostRef = push(postListRefs);
          await set(newPostRef, {
            id: i,
            post_link: result[i].post_link,
            statusbar: 'error' + e,
          });
        }
      }
      // fs.writeFile('item2.txt', JSON.stringify(linkPost, null, 2), (err) => {
      //   if (err) throw err;
      //   console.log('The file1 has been saved!');
      // });
      // await page.goto('https://mgs-admin-dev.mangoads.com.vn/sign-in-cover?returnUrl=%2F', {
      //   waitUntil: 'load',
      // });
      // await page.type('[type="email"]', 'datpmwork+fleet@gmail.com', { delay: 100 });
      // await page.type('[type="password"]', 'NzgxN2QxNTZhZDUyNDQyMjViYTM3ZDc0', { delay: 100 });
      // await page.evaluate(async () => {
      //   document.querySelector('[type="button"]').click();
      // });
      // await new Promise((r) => setTimeout(r, 4000));
      // await page.goto('https://mgs-admin-dev.mangoads.com.vn/facebook/facebook10', {
      //   waitUntil: 'load',
      // });
      // await page.evaluate(async () => {
      //   document.querySelectorAll('textarea')[1].classList.add('my-class');
      // });
      // await new Promise((r) => setTimeout(r, 10000));
      // fs.readFile('item2.txt', async (err, data) => {
      //   data_parse = JSON.parse(data);

      //   await page.evaluate(async (data_parse) => {
      //     document.querySelectorAll('textarea')[0].innerHTML = JSON.stringify(data_parse);
      //     document.querySelectorAll('textarea')[1].innerHTML = data_parse[0].token;
      //   }, data_parse);
      //   await page.type('textarea', ' ', { delay: 0 });
      //   await page.type('.my-class', ' ', { delay: 0 });
      //   await page.evaluate(async () => {
      //     document.querySelectorAll('[type="button"]').forEach(async (button) => {
      //       if (button.innerText == 'ADD') {
      //         await button.click();
      //       }
      //     });
      //   });
      // });
    });
    //await browser.close();
  } catch (err) {
    console.log('lỗi server', err);
  }
};

async function getlink(page, conten_length, like, comment, share) {
  const dimension = await page.evaluate(
    async (conten_length, like, comment, share) => {
      post = document.querySelectorAll('[role="feed"]')[0].childNodes;
      let data = [];
      for (let i = 1; i < post.length; i++) {
        try {
          let posts_href = '';
          let count_like = (count_comment = count_share = count_content = 0);
          let content = '';
          let lengths =
            post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[7] !== undefined
              ? post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[7]
                  .childNodes[0].childNodes
              : post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1]
                  .childNodes[0].childNodes;
          lengths[2].childNodes.forEach((element, index) => {
            if (element.className == '') {
              element.childNodes[0].childNodes.forEach(function (node) {
                if (node.nodeName == 'SPAN') {
                  for (let c = 0; c < node.childNodes.length; c++) {
                    content += node.childNodes[c].innerHTML
                      .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                      .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                      .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
                  }
                } else {
                  for (let c = 0; c < node.childNodes[0].childNodes[0].childNodes.length; c++) {
                    content += node.childNodes[0].childNodes[0].childNodes[c].innerHTML
                      .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                      .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                      .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
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
            div_commment_yes.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes;
          likecomshares.forEach((element, index) => {
            if (index == 0) {
              count_like = element.childNodes
                ? element.childNodes[1].textContent.split(' ')[0].indexOf(',') > -1
                  ? element.childNodes[1].textContent
                      .split(' ')[0]
                      .replace('K', '00')
                      .replace(',', '')
                  : element.childNodes[1].textContent.split(' ')[0].replace('K', '000')
                : 0;
            }
            if (index == 1) {
              count_comment = element.childNodes[1]
                ? element.childNodes[1].textContent.split(' ')[0].indexOf(',') > -1
                  ? element.childNodes[1].textContent
                      .split(' ')[0]
                      .replace('K', '00')
                      .replace(',', '')
                  : element.childNodes[1].textContent.split(' ')[0].replace('K', '000')
                : 0;
              count_share = element.childNodes[2]
                ? element.childNodes[2].textContent.split(' ')[0].indexOf(',') > -1
                  ? element.childNodes[2].textContent
                      .split(' ')[0]
                      .replace('K', '00')
                      .replace(',', '')
                  : element.childNodes[2].textContent.split(' ')[0].replace('K', '000')
                : 0;
            }
          });
          if (
            parseInt(count_like) < like ||
            parseInt(count_comment) < comment ||
            parseInt(count_share) < share ||
            content.length < conten_length
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
