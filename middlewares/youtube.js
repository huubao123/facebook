const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');
const downloadImage = require('./downloadImage');
const Post = require('../models/post');
const Post_filter_no = require('../models/post_filter_no');

const Trash = require('../models/trash');
const Group = require('../models/group');
const Posttype = require('../models/posttype');
const Images = require('../models/image');
async function autoScroll_video(page) {
  const getdata = await page.evaluate(async () => {
    const data = await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 10000;
      let scrool = 0;
      let commment = 0;
      let scrollstop = 0;
      let timer = setInterval(async () => {
        scrool += 1;
        window.scrollBy({
          top: distance,
          left: 100,
          behavior: 'smooth',
        });
        totalHeight += distance;

        if (
          window.performance.memory.jsHeapSizeLimit - window.performance.memory.jsHeapSizeLimit / 10 <
          window.performance.memory.totalJSHeapSize
        ) {
          clearInterval(timer);
          resolve();
        }
        document.querySelectorAll('[aria-expanded="false"]#more').forEach(async (e, i) => {
          if (e.innerText == 'Read more') {
            e.click();
          }
        });
        if (scrool === 5) {
          commment = parseInt(document.querySelectorAll('h2#count [dir="auto"]')[0].innerText);
          if (commment < 100) {
            scrollstop = 10;
          } else if (commment < 1000) {
            scrollstop = 100;
          } else if (commment < 1000) {
            scrollstop = 200;
          } else {
            scrollstop = 300;
          }
        }
        document.querySelectorAll('[aria-label="Show more replies"]').forEach(async (e, i) => {
          e.click();
        });
        document.querySelectorAll('#more-replies').forEach(async (e, i) => {
          await e.click();
        });
        let isbottom = document.body.scrollHeight;
        let istop = parseInt(document.documentElement.scrollTop + window.innerHeight);
        if (isbottom === istop) {
          clearInterval(timer);
          resolve();
        }
        console.log(scrollstop);
        if (scrool >= scrollstop + 6) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
  return;
}
async function autoScroll(page, lengths) {
  const getdata = await page.evaluate(async (lengths) => {
    const data = await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 10000;
      let timer = setInterval(async () => {
        let video = document.querySelectorAll('a#thumbnail');
        console.log(lengths, video.length);
        window.scrollBy({
          top: distance,
          left: 100,
          behavior: 'smooth',
        });
        totalHeight += distance;

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

        if (video.length - 5 >= parseInt(lengths) * 2) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  }, lengths);
  return;
}
module.exports = async function main(req) {
  console.log(req.data.data);
  try {
    let length = req.data.data.lengths ? req.data.data.lengths : 300;
    let link = req.data.data.link;
    let post_type = req.data.data.post_type ? req.data.data.post_type : 'youtube';
    let length_comment = req.data.data.length_comment ? req.data.data.length_comment : 1;
    let length_content = req.data.data.length_content ? req.data.datalength_content : 1;
    let like = req.data.data.like ? req.data.data.like : 1;
    let view = req.data.data.share ? req.data.data.share : 1;
    let comment = req.data.data.comment ? req.data.data.comment : 1;

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
    context.overridePermissions('https://www.youtube.com', ['geolocation', 'notifications']);
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
      await page.goto(link, {
        waitUntil: 'load',
      });
      await autoScroll(page, length);
      await getlink(page, length).then(async (data) => {
        console.log(data.length);
        for (let i = 1; i < data.length; i++) {
          await page.goto(data[i].post_link, {
            waitUntil: 'load',
          });
          await page.waitForFunction('document.querySelector("h1")');
          await page.waitForFunction('document.querySelectorAll("div#description #description-inner")');
          await autoScroll_video(page);
          let des = await page.evaluate(async () => {
            let video = {};
            document.querySelectorAll('div#description #description-inner')[0].click();
            video.content = document.querySelectorAll('div#description #description-inner')[0].innerText;
            video.count_comment = document.querySelectorAll('h2#count [dir="auto"]')[0].innerText;
            video.count_like = document.querySelector('#segmented-like-button').innerText;
            video.count_view = document.querySelectorAll('yt-formatted-string#info')[0].innerText.split(' ')[0];
            video.date =
              document.querySelectorAll('yt-formatted-string#info')[0].innerText.split(' ')[3] +
              ' ' +
              document.querySelectorAll('yt-formatted-string#info')[0].innerText.split(' ')[4];
            video.user_name = document.querySelectorAll('#above-the-fold div#text-container #text a')[0].innerText;
            video.user_href = document.querySelectorAll('#above-the-fold div#text-container #text a')[0].href;
            video.user_id = document
              .querySelectorAll('#above-the-fold div#text-container #text a')[0]
              .href.split('/')[3];
            return video;
          });
          let result = await getdata(page);
          if (
            comment > parseInt(des.count_comment) ||
            length_content > des.content.split(' ').length ||
            like > parseInt(des.count_like) ||
            view > parseInt(des.count_view)
          ) {
            console.log('aaa');
          } else {
            let titles = '';
            let short_descriptions = '';

            let short_description = des.content ? des.content : '';
            for (let i = 0; i < 100; i++) {
              let lengths = short_description.split(' ').length;
              short_descriptions += short_description.split(' ')[i] + ' ';
              if (lengths - 1 == i) {
                break;
              }
            }
            for (let i = 0; i < 10; i++) {
              let lengths = short_description.split(' ').length;
              titles += short_description.split(' ')[i] + ' ';
              if (lengths - 1 == i) {
                break;
              }
            }

            let basic_fields = {
              title: titles,
              short_description: short_descriptions,
              long_description: des.content ? des.content.replaceAll('https://l.facebook.com/l.php?u=', '') : '',
              slug: '',
              featured_image: data[i].thumbnail ? [data[i].thumbnail] : [],
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
                meta_title: 'New Video Youtube',
                meta_description: 'New Video Youtube',
              },
            };
            let custom_fields = {
              date: des.date ? des.date : '',
              post_id: data[i].post_link ? data[i].post_link.split('watch?v=')[1] : '',
              post_link: data[i].post_link ? data[i].post_link : '',
              user_id: des.user_id ? des.user_id : 'undefined',
              user_name: des.user_name ? des.user_name : 'undefined',
              count_like: des.count_like
                ? des.count_like.toString().split(' ')[0].indexOf(',') > -1
                  ? parseInt(des.count_like.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                  : parseInt(des.count_like.toString().split(' ')[0].replace('K', '000'))
                : 0,
              count_comment: des.count_comment
                ? des.count_comment.toString().split(' ')[0].indexOf(',') > -1
                  ? parseInt(des.count_comment.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                  : parseInt(des.count_comment.toString().split(' ')[0].replace('K', '000'))
                : 0,
              count_share: des.count_view
                ? des.count_view.toString().split(' ')[0].indexOf(',') > -1
                  ? parseInt(des.count_view.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                  : parseInt(des.count_view.toString().split(' ')[0].replace('K', '000'))
                : 0,
              featured_image: data[i].thumbnail ? [data[i].thumbnail] : [],
              comments: result
                ? result.map((item) => ({
                    date: item.date,
                    content: item.content,
                    count_like: item.like
                      ? item.like.toString().split(' ')[0].indexOf(',') > -1
                        ? parseInt(item.like.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                        : parseInt(item.like.toString().split(' ')[0].replace('K', '000'))
                      : 0,
                    user_id: item.user_name,
                    user_name: item.user_name,
                    children: item.children
                      ? item.children.map((child) => ({
                          date: child.date,
                          content: child.content,
                          count_like: child.like
                            ? child.like.toString().split(' ')[0].indexOf(',') > -1
                              ? parseInt(child.like.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                              : parseInt(child.like.toString().split(' ')[0].replace('K', '000'))
                            : 0,
                          user_id: child.userIDComment,
                          user_name: child.user_name,
                        }))
                      : [],
                  }))
                : [],
            };
            let Posttype_id = '';
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

            try {
              let trash = await Trash.find();
              let id = await trash[0].ids.find((id) => id == data[i].post_link.split('watch?v=')[1]);
              if (id) {
                await Trash.findByIdAndUpdate(trash[0]._id, {
                  $pull: { ids: data[i].post_link.split('watch?v=')[1] },
                });
                let posts = new Post_filter_no({
                  basic_fields: JSON.stringify(basic_fields),
                  custom_fields: JSON.stringify(custom_fields),
                  post_link: data[i].post_link,
                  posttype: Posttype_id,
                  title: titles,
                  create_at: new Date(),
                  status: 'update',
                  length_comments: parseInt(cmt_length),
                  filter: false,
                });
                await posts.save();
                console.log(posts._id);
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
                          post_link: data[i].post_link,
                          posttype: Posttype_id,
                          length_comments: parseInt(length_comment),
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
                            length_comments: parseInt(length_comment),
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
          }
        }
      });

      await new Promise((r) => setTimeout(r, 4000));
    } catch (e) {
      console.log(e);
    }
  } catch (err) {
    console.log('lỗi server', err);
    fs.appendFile('error.txt', JSON.stringify(err, null, 2) + '\r\n', (err) => {
      if (err) throw err;
    });
  }
};
async function getlink(page, conten_length) {
  const dimension = await page.evaluate(async (conten_length) => {
    console.log(conten_length);
    let video = document.querySelectorAll('a#thumbnail');
    let data = [];
    console.log(video.length);
    let j = 0;
    for (let i = 1; i < video.length; i++) {
      if (video[i].href) {
        console.log(video[i].href);
        if (video[i].href.indexOf('watch') > -1) {
          video[i].querySelector('img').classList.add('yt-core-image--loaded');
          await new Promise((r) => setTimeout(r, 1000));

          data.push({
            id: data.length ? data.length + 1 : 1,
            post_link: video[i].href,
            thumbnail: video[i].childNodes[1].childNodes[0].src,
          });
          j++;
        }
      }
      if (j == conten_length + 1) {
        break;
      }
    }
    return data;
  }, conten_length);
  return dimension;
}
async function getdata(page) {
  return page.evaluate(async () => {
    let data = new Array();
    let user_name = '';
    let user_id = '';
    let content = '';
    let date = '';
    let date_child = '';
    let like = 0;
    let user_name_child = '';
    let content_child = '';
    let like_child = 0;
    let user_name_id_child = '';
    document.querySelector('#comments #contents').childNodes.forEach(async (comment) => {
      try {
        let children = new Array();
        user_name = comment.querySelector('#header').innerText.split('\n')[0].replaceAll('Pinned by', ' ');
        user_id = comment.querySelector('#header').querySelector('a').href.split('/')[4];
        date =
          comment.querySelector('#header').innerText.split('\n')[1].split(' ')[0] +
          ' ' +
          comment.querySelector('#header').innerText.split('\n')[1].split(' ')[1];
        content = comment.querySelector('#comment-content').innerText;
        like =
          comment.querySelector('#action-buttons').innerText.split('\n').length > 1
            ? comment.querySelector('#action-buttons').innerText.split('\n')[0]
            : 0;
        if (comment.querySelector('#replies #contents') !== null) {
          comment.querySelector('#replies #contents').childNodes.forEach(async (child) => {
            user_name_child = child.querySelector('#header').innerText.split('\n')[0].replaceAll('Pinned by', ' ');
            user_name_id_child = child.querySelector('#header').querySelector('a').href.split('/')[4];
            date_child =
              child.querySelector('#header').innerText.split('\n')[1].split(' ')[0] +
              ' ' +
              child.querySelector('#header').innerText.split('\n')[1].split(' ')[1];
            content_child = child.querySelector('#comment-content').innerText;
            like_child =
              child.querySelector('#action-buttons').innerText.split('\n').length > 1
                ? child.querySelector('#action-buttons').innerText.split('\n')[0]
                : 0;
            children.push({
              user_name: user_name_child,
              user_id: user_name_id_child,
              content: content_child,
              like: parseInt(like_child),
              date: date_child,
            });
            like_child = 0;
            user_name_child = '';
            content_child = '';
            date_child = '';
          });
        }

        data.push({
          user_name: user_name,
          user_id: user_id,
          content: content,
          like: parseInt(like),
          date: date,
          children: children,
        });
        user_id = '';
        user_name = '';
        content = '';
        like = 0;
        date = '';
        children = [];
      } catch (e) {}
    });
    console.log(data);
    return data;
  });
}
