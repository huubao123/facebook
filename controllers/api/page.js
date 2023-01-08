const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');
const loadmoremedia = require('../../middlewares/loadmore_media');
const getdata = require('../../middlewares/getdata_post_page');
const autoScroll_post = require('../../middlewares/autoscrollpost');
const genSlug = require('../../middlewares/genslug');
const Post = require('../../models/post');
const Post_filter_no = require('../../models/post_filter_no');

const Trash = require('../../models/trash');
const Posttype = require('../../models/posttype');
const Images = require('../../models/image');
const Page = require('../../models/page');
const Queue = require('bull');
const image = new Queue('image', { redis: { port: 6379, host: '127.0.0.1' } });
const downloadImage = require('../../middlewares/downloadimage');

require('dotenv').config();

async function autoScroll(page, lengthss, like, comment, share, url) {
  const getdata = await page.evaluate(
    async (lengthss, like, comment, share, url) => {
      const data = await new Promise((resolve, reject) => {
        let totalHeight = 0;
        let distance = 1000;
        let length_feed = 0;
        let timer = setInterval(async () => {
          console.log(lengthss, like, comment, share);
          let scrollHeight = document.body.scrollHeight;
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
          let post = document.querySelectorAll('div');
          let newpost = Array.prototype.slice.call(post).filter((el) => el.childNodes.length === 15);
          try {
            newpost.forEach(async (el) => {
              el.childNodes[7].childNodes[0].childNodes[0].childNodes[2]
                .querySelectorAll('[role="button"]')
                .forEach(async (button) => {
                  if (button.innerText.indexOf('Xem thêm') > -1) {
                    button.click();
                  }
                });
            });
          } catch (e) {
            console.log('lỗi 1');
          }
          try {
            document.querySelectorAll('[role="link"]').forEach(async (link) => {
              if (link.href.indexOf(`${url}/posts`) > -1) {
                length_feed += 1;
              }
            });
          } catch (e) {
            console.log('lỗi 2');
          }

          console.log(length_feed);
          if (length_feed - 5 >= 10) {
            clearInterval(timer);
            resolve();
          } else {
            length_feed = 0;
          }
          // document.querySelectorAll('[role="feed"]')[length_feed.length - 1].childNodes.forEach((item) => {
          //   if (item.className !== '' && item.nodeName == 'DIV') {
          //     length_post += 1;
          //   }
          // });
          let isbottom = document.body.scrollHeight;
          let istop = parseInt(document.documentElement.scrollTop + window.innerHeight);
          if (isbottom === istop) {
            clearInterval(timer);
            resolve();
          }

          //console.log(length_post);

          // if (post_length - 5 > _length) {
          //   clearInterval(timer);
          //   resolve();
          // }
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 2000);
      });
    },
    lengthss,
    like,
    comment,
    share,
    url
  );
  return 1;
}
module.exports = async function main(req) {
  try {
    await req.progress(10);
    const url = req.data.data.link;
    const lengths = req.data.data.lengths == '' ? 0 : req.data.data.lengths;
    const cmt_length = req.data.data.length_comment == '' ? 0 : req.data.data.length_comment;
    const conten_length = req.data.data.length_content == '' ? 0 : req.data.data.length_content;
    const name = url.split('/')[3] == 'groups' ? url.split('/')[4] : url.split('/')[3];
    const like = req.data.data.like ? req.data.data.like : 0;
    const comment = req.data.data.comment ? req.data.data.comment : 0;
    const share = req.data.data.share ? req.data.data.share : 0;
    const post_type = req.data.data.post_type ? req.data.data.post_type : '';
    let page_id = '';
    let Posttype_id = '';

    Posttype.findOne({ name: post_type }, async function (err, posttype) {
      if (posttype) {
        group_id = posttype._id;
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
    // const app = initializeApp.initializeApp(firebaseConfig);
    // const database = getDatabase(app);
    // const postListRefs = ref(
    //   database,
    //   '/craw_list_length/' + name.replace(/[#:.,$]/g, '') + '/' + craw_id
    // );
    // await set(postListRefs, {
    //   craw_id: craw_id,
    //   length: lengths,
    //   cmt_length: cmt_length,
    //   like: like,
    //   share: share,
    //   comment: comment,
    //   content_length: conten_length,
    //   url: url,
    //   create_at: Date.now(),
    // });

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
        '--start-maximized',
      ],
      headless: false,
      defaultViewport: null,

      //product: 'chrome',
      devtools: true,
      executablePath: process.env.executablePath,
    });

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
        '--start-maximized',
      ],
      headless: false,
      defaultViewport: null,

      //product: 'chrome',
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
      await page.type('#email', process.env.username_get_data2);
      await page.type('#pass', 'huubao123');
      await page.keyboard.press('Enter');

      await new Promise((r) => setTimeout(r, 4000));
      // await page.waitForSelector('#pagelet_composer');
      // let content2 = await page.$$('#pagelet_composer');

      await page.goto(url, {
        waitUntil: 'load',
      });
      await new Promise((r) => setTimeout(r, 4000));
    } catch (e) {
      console.log(e);
    }

    const info = await page.evaluate(() => {
      try {
        document
          .querySelector('[role="contentinfo"]')
          .parentNode.childNodes[0].querySelectorAll('[role="button"]')
          .forEach((el) => {
            if (el.innerText == 'Xem thêm') {
              el.click();
            }
          });
        return document.querySelector('[role="contentinfo"]')
          ? document.querySelector('[role="contentinfo"]').parentNode.childNodes[0].innerText
          : '';
      } catch (e) {
        return '';
      }
    });
    const result = await page.evaluate(() => {
      return document.querySelector('h2[dir="auto"] [dir="auto"]')
        ? document.querySelector('h2[dir="auto"] [dir="auto"]').textContent
        : document.querySelectorAll('h2')[0].textContent;
    });
    Page.findOne({ url: url }, async function (err, page) {
      if (page) {
        page_id = page._id;
      } else {
        let pages = new Page({
          name: result,
          url: url,
          info: info,
          create_at: new Date(),
        });
        await pages.save();
        group_id = pages._id;
      }
    });
    Posttype.findOne({ name: post_type }, async function (err, posttype) {
      if (posttype) {
        Posttype_id = posttype._id;
        let flag_page = true;
        for (let i = 0; i < posttype.groups.length; i++) {
          if (posttype.pages[i] == page_id) {
            flag_page = true;
            break;
          } else {
            flag_page = false;
          }
        }
        if (!flag_page) {
          await Posttype.findByIdAndUpdate(
            posttype._id,
            { $push: { pages: page_id } },
            { safe: true, upsert: true, new: true }
          );
        }
      } else {
        let Posttypes = new Posttype({
          name: post_type,
          create_at: new Date(),
          pages: page_id,
        });
        await Posttypes.save();
        Posttype_id = Posttypes._id;
      }
    });

    // const postListRefss = ref(databases, 'Group/' + name.replace(/[#:.,$]/g, ''));
    // await set(postListRefss, {
    //   name: result,
    //   url: url,
    //   create_at: Date.now(),
    // });

    await autoScroll(page, lengths, like, comment, share, url);
    await getlink(page, conten_length, like, comment, share, url).then(async function (result) {
      fs.writeFile('item1.txt', JSON.stringify(result, null, 2), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });

      await browser.close();
      const page1 = await browser2.newPage();
      const pages = await browser2.pages();
      if (pages.length > 1) {
        await pages[0].close();
      }
      await page1.goto('https://www.facebook.com', {
        waitUntil: 'load',
      });
      await page1.type('#email', process.env.username_get_data2);
      await page1.type('#pass', 'huubao123');
      await page1.keyboard.press('Enter');

      await new Promise((r) => setTimeout(r, 4000));
      for (let i = 0; i < 1; i++) {
        try {
          await page1.goto(result[i].post_link, {
            waitUntil: 'networkidle2',
          });
          try {
            await page1.evaluate(async () => {
              let div = document.querySelectorAll('[role = "button"]');
              for (let i = 0; i < div.length; i++) {
                if (
                  div[i].innerText.indexOf('Phù hợp nhất') !== -1 ||
                  div[i].innerText.indexOf('Mới nhất') !== -1 ||
                  div[i].innerText.indexOf('Tất cả bình luận') !== -1
                ) {
                  await div[i].scrollIntoView();
                  break;
                }
              }
            });
          } catch (err) {}
          await page1.evaluate(async () => {
            let div = document.querySelectorAll('[role = "button"]');
            for (let i = 0; i < div.length; i++) {
              if (div[i].innerText.indexOf('Phù hợp nhất') !== -1 || div[i].innerText.indexOf('Mới nhất') !== -1) {
                await div[i].click();
                break;
              }
            }
          });
          await page1.evaluate(async () => {
            let div = document.querySelectorAll('[role="menuitem"]');
            for (let i = 0; i < div.length; i++) {
              if (div[i].innerText.indexOf('Tất cả bình luận') !== -1) {
                await div[i].click();
                break;
              }
            }
          });
          await autoScroll_post(page1);

          await getdata(page1, cmt_length).then(async function (data) {
            fs.writeFile('item111.txt', JSON.stringify(data, null, 2), (err) => {
              if (err) throw err;
              console.log('The file has been saved!');
            });
            let results = data;
            if (parseInt(data.imagemore) > 0) {
              results = await loadmoremedia(page1, data);
            }

            let titles = '';
            let short_descriptions = '';
            let short_description = results.contentList ? results.contentList.replaceAll(/(<([^>]+)>)/gi, '') : '';
            for (let i = 0; i < 100; i++) {
              let lengths = short_description.split(' ').length;
              short_descriptions += short_description.split(' ')[i] + ' ';
              if (lengths - 1 === i) {
                break;
              }
            }
            for (let i = 0; i < 100; i++) {
              let lengths = short_description.length;
              titles += short_description[i];
              if (lengths - 1 === i) {
                break;
              }
            }
            let Image_id = [];
            if (results.linkImgs.length > 0) {
              for (let i = 0; i < results.linkImgs.length; i++) {
                let result_id_image = await downloadImage(results.linkImgs[i], post_type);
                Image_id.push(result_id_image);
              }
            }
            if (results.commentList.length > 0) {
              for (let i = 0; i < results.commentList.length; i++) {
                if (results.commentList[i].imageComment && results.commentList[i].imageComment != '') {
                  const imageid = crypto.randomBytes(10).toString('hex');
                  let datas = {
                    link: results.commentList[i].imageComment,
                    posttype: post_type,
                    imageid: imageid,
                  };
                  image.add({ data: datas });
                  results.commentList[i].imageComment = `images/${post_type}/${imageid}`;
                }
                if (results.commentList[i].children.length > 0) {
                  for (let j = 0; j < results.commentList[i].children.length; j++) {
                    if (
                      results.commentList[i].children[j].imageComment &&
                      results.commentList[i].children[j].imageComment !== ''
                    ) {
                      const imageid = crypto.randomBytes(10).toString('hex');
                      let datas = {
                        link: results.commentList[i].children[j].imageComment,
                        posttype: post_type,
                        imageid: imageid,
                      };
                      image.add({ data: datas });

                      results.commentList[i].children[j].imageComment = `images/${post_type}/${imageid}`;
                    }
                  }
                }
              }
            }

            let basic_fields = {
              title: titles,
              short_description: short_descriptions,
              long_description: results.contentList
                ? results.contentList.replaceAll('https://l.facebook.com/l.php?', '')
                : '',
              slug: '',
              featured_image: Image_id[0] ? Image_id[0] : [],
              session_tags: {
                tags: [],
              },
              categorialue: [],
              key: '',
              name: '',
              type: post_type,
              attributes: [],
              is_active: 1,
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
              featured_image: Image_id[0] ? Image_id[0] : [],
              comments: results.commentList
                ? results.commentList.map((item) => ({
                    date: item.date ? item.date : '',
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
                          date: child.date ? child.date : '',
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
                          group_page_id: page_id,
                          posttype: Posttype_id,
                          length_comments: parseInt(cmt_length),
                          title: titles,
                          create_at: new Date(),
                          status: 'active',
                          filter: false,
                        });
                        await posts.save();
                        console.log(posts._id);
                        if (results.linkImgs.length > 0) {
                          let image = new Images({
                            link_img: Image_id,
                            idPost: posts._id,
                            link_post: result[i].post_link,
                            update_at: new Date(),
                          });
                          await image.save();
                        }
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
                        if (results.linkImgs.length > 0) {
                          await Images.findByIdAndUpdate(
                            post._id,
                            {
                              link_img: Image_id,
                              update_at: new Date(),
                            },
                            { new: true }
                          );
                        }
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

      // // await browser2.close();
    });
  } catch (err) {
    console.log('lỗi server', err);
  }
};

async function getlink(page, conten_length, like, comment, share, url) {
  const dimension = await page.evaluate(
    async (conten_length, like, comment, share, url) => {
      let post = document.querySelectorAll('div');
      async function filternumber(str) {
        let newString = '';
        if (str.indexOf('\n') > -1) {
          newString = await str.split('\n')[0];
          if (newString.indexOf(',') > -1) {
            newString = newString.replace('K', '00').replace(',', '');
          } else {
            newString = newString.replace('K', '000');
          }
        } else {
          newString = await str.split(' ')[0];
          if (str.indexOf(',') > -1) {
            newString = newString.replace('K', '00').replace(',', '');
          } else {
            newString = newString.replace('K', '000');
          }
        }
        return newString;
      }

      let newpost = Array.prototype.slice.call(post).filter((el) => el.childNodes.length === 15);
      let data_link = [];
      newpost.forEach(async (el) => {
        let likes = '';
        let comments = '';
        let shares = '';
        let contents = '';
        let href = '';
        likes =
          el.childNodes[7].childNodes[0].childNodes[0].childNodes[
            el.childNodes[7].childNodes[0].childNodes[0].childNodes.length - 1
          ].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[1].innerText;
        if (
          el.childNodes[7].childNodes[0].childNodes[0].childNodes[
            el.childNodes[7].childNodes[0].childNodes[0].childNodes.length - 1
          ].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes
            .length == 3
        ) {
          comments =
            el.childNodes[7].childNodes[0].childNodes[0].childNodes[
              el.childNodes[7].childNodes[0].childNodes[0].childNodes.length - 1
            ].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[1].innerText.split(
              ' '
            )[0];
          shares =
            el.childNodes[7].childNodes[0].childNodes[0].childNodes[
              el.childNodes[7].childNodes[0].childNodes[0].childNodes.length - 1
            ].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[2].innerText.split(
              ' '
            )[0];
        } else {
          if (
            el.childNodes[7].childNodes[0].childNodes[0].childNodes[
              el.childNodes[7].childNodes[0].childNodes[0].childNodes.length - 1
            ].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1]
              .childNodes[0].innerText.length > 1
          ) {
            comments =
              el.childNodes[7].childNodes[0].childNodes[0].childNodes[
                el.childNodes[7].childNodes[0].childNodes[0].childNodes.length - 1
              ].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].innerText.split(
                ' '
              )[0];

            shares =
              el.childNodes[7].childNodes[0].childNodes[0].childNodes[
                el.childNodes[7].childNodes[0].childNodes[0].childNodes.length - 1
              ].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[1].innerText.split(
                ' '
              )[0];
          }
        }
        likes = (await filternumber(likes)) ? await filternumber(likes) : 0;

        comments = (await filternumber(comments)) ? await filternumber(comments) : 0;
        shares = (await filternumber(shares)) ? await filternumber(shares) : 0;
        contents = el.childNodes[7].childNodes[0].childNodes[0].childNodes[2].innerText.split(' ').length;
        el.querySelectorAll('[role="link"]').forEach(async (link) => {
          if (link.href.indexOf(`${url}/posts`) > -1) {
            href = link.href.split('?comment_id')[0];
          }
        });
        if (
          parseInt(likes) < like ||
          parseInt(comments) < comments ||
          parseInt(shares) < share ||
          parseInt(contents) < conten_length
        ) {
          console.log('sss');
        } else {
          data_link.push({
            id: data_link.length > 0 ? data_link.length : 0,
            post_link: href,
          });
        }
      });
      console.log(data_link);

      return data_link;
    },
    conten_length,
    like,
    comment,
    share,
    url
  );
  return dimension;
}
