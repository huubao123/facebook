const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');
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
module.exports = async function main(req, res, next) {
  try {
    const url = req.body.url;
    const lengths = req.body.length_post == '' ? 0 : req.body.length_post;
    const username = req.body.username;
    const password = req.body.password;
    const cmt_length = req.body.length_comment == '' ? 0 : req.body.like;
    const like = req.body.like == '' ? 0 : req.body.like;
    const comment = req.body.comment == '' ? 0 : req.body.like;
    const share = req.body.share == '' ? 0 : req.body.like;
    const craw_id = crypto.randomBytes(16).toString('hex');

    if (!url || url == '') {
      res.json('url is required');
    }
    if (!lengths || lengths == 0) {
      res.json('length is required');
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
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    });
    const page = await browser.newPage();
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

    res.send('đợi chút rồi chuyển get lấy data nha');
    await page.goto('https://www.google.com', {
      waitUntil: 'load',
    });

    await getlink((length = lengths)).then(async function (result) {
      fs.writeFile('item.txt', JSON.stringify(result, null, 2), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
      const app = initializeApp.initializeApp(firebaseConfig);
      const database = getDatabase(app);
      const postListRefs = ref(database, '/craw_list_length/' + craw_id);
      set(postListRefs, {
        craw_id: craw_id,
        url: url,
        length: lengths,
      });
      let linkPost = new Array();
      for (let i = 0; i < length; i++) {
        try {
          await getdata().then(async function (results) {
            if (results[0].a == undefined) {
              console.log(abc);
            }
            const app = initializeApp.initializeApp(firebaseConfig);
            const database = getDatabase(app);
            const postListRefs = ref(
              database,
              '/craw_list/' + url.split('/')[4].replace(/[#:.,$]/g, '') + '/' + craw_id
            );
            const newPostRef = push(postListRefs);
            set(newPostRef, {
              id: i,
              post_link: result[i].post_link,
              statusbar: 'active',
            });
          });
        } catch (e) {
          console.log('lỗi back');
          const app = initializeApp.initializeApp(firebaseConfig);
          const database = getDatabase(app);
          const postListRefs = ref(database, '/craw_list/' + craw_id);
          const newPostRef = push(postListRefs);
          set(newPostRef, {
            id: i,
            post_link: result[i].post_link,
            statusbar: 'error',
          });
        }
      }
    });
    await browser.close();
  } catch (err) {
    console.log('lỗi server', err);
  }
};

async function getlink(length) {
  data = [];
  for (let i = 0; i < length; i++) {
    try {
      data.push({
        id: data.length ? data.length + 1 : 1,
        post_link: 'google.com',
      });
    } catch (error) {
      console.log(error);
    }
  }
  return data;
}
async function getdata() {
  data = [];
  try {
    var textArray = ['true', 'false'];
    var randomNumber = Math.floor(Math.random() * textArray.length);

    if (textArray[randomNumber] == 'true') {
      data.push({
        a: 'a',
        b: 'b',
      });
    } else {
      console.log(abc);
    }
  } catch (e) {
    console.log('lỗi getdata');
  }
  return data;
}
