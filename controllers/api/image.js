const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');
const loadmoremedia = require('../../middlewares/loadmore_media');
const getimage = require('../../middlewares/getimage');
require('dotenv').config();
const Post = require('../../models/post');
const Image = require('../../models/image');

module.exports = async function main(req) {
  try {
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

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);
    const pages = await browser.pages();
    if (pages.length > 1) {
      await pages[0].close();
    }

    let images = await Image.find();
    let flag_image = true;
    for (let i = 0; i < images.length; i++) {
      for (let j = 0; j < images[i].link_img.length; j++) {
        try {
          let result = await fetch(images[i].link_img[j].link);
          result = await result.blob();
          if (result.type.split('/')[0] !== 'image') {
            flag_image = false;
            break;
          } else {
            flag_image = true;
          }
        } catch (e) {
          flag_image = false;
          break;
        }
      }
      if (!flag_image) {
        try {
          const context = browser.defaultBrowserContext();
          context.overridePermissions(images[i].link_post, ['geolocation', 'notifications']);
          fs.appendFile('error.txt', JSON.stringify(images[i].link_post, null, 2) + '\r\n', async (err) => {
            if (err) throw err;
          });
          console.log(images[i].link_post);
        } catch (e) {
          console.log('1', e);
        }
        try {
          await page.goto(images[i].link_post, {
            waitUntil: 'networkidle2',
          });
          await new Promise((r) => setTimeout(r, 4000));

          await getimage(page).then(async function (data) {
            let results = data;
            if (data.imagemore > 0) {
              results = await loadmoremedia(page, data);
            }
            try {
              await Image.findByIdAndUpdate(
                images[i]._id,
                {
                  link_img: results.linkImgs.map((linkImgs) => ({
                    link: linkImgs,
                    statusbar: 'active',
                  })),
                  update_at: Date.now(),
                },
                { new: true }
              );
            } catch (e) {
              console.log(e);
            }
          });
        } catch (e) {
          console.log('lỗi error');
        }
      }
    }

    await browser.close();
  } catch (err) {
    console.log('lỗi server', err);
    fs.appendFile('error.txt', JSON.stringify(err, null, 2) + '\r\n', (err) => {
      if (err) throw err;
    });
  }
};
