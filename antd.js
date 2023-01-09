const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');
const { async } = require('@firebase/util');
const Antd = require('./models/antd');
async function main(req) {
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
      devtools: true,
      executablePath: process.env.executablePath, // windows
    });
    const context = browser.defaultBrowserContext();
    //        URL                  An array of permissions
    context.overridePermissions('https://ant.design/components/button', ['geolocation', 'notifications']);
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
      await page.goto('https://ant.design/components/button', {
        waitUntil: 'load',
      });
      await getlink(page).then(async (data) => {
        for (let i = 1; i < 5; i++) {
          await page.goto(`${data[i].link}/#api`);
          await getData(page).then(async (api) => {
            for (let i = 0; i < api.length; i++) {
              try {
                fs.writeFile(`${api[i].name}.txt`, JSON.stringify(api[i], null, 2), (err) => {
                  if (err) throw err;
                  console.log('The file has been saved!');
                });
              } catch (e) {}
            }
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
    await browser.close();
  } catch (err) {
    console.log('lỗi server', err);
    fs.appendFile('error.txt', JSON.stringify(err, null, 2) + '\r\n', (err) => {
      if (err) throw err;
    });
  }
}
main();
async function getlink(page) {
  const dimension = await page.evaluate(() => {
    let link = [];
    document
      .querySelectorAll('.main-menu-inner')[0]
      .querySelectorAll('.ant-menu-item.ant-menu-item-only-child')
      .forEach((item) => {
        link.push({
          id: link.length ? link.length + 1 : 1,
          link: item.querySelector('a').href,
        });
      });
    return link;
  });
  return dimension;
}
async function getData(page) {
  const getdata = await page.evaluate(async () => {
    let table = [];
    document.querySelectorAll('.dumi-default-table').forEach((tab) => {
      let a = {};
      tab.querySelectorAll('tbody')[0].childNodes.forEach((el) => {
        let string = [];
        el.childNodes[1]?.querySelectorAll('code')?.forEach((el) => {
          string.push(el.innerText);
        });
        el.childNodes[2]?.querySelectorAll('code')?.forEach((el) => {
          string.push(el.innerText);
        });
        if (
          el.childNodes[2]?.querySelectorAll('code')?.length > 0 ||
          el.childNodes[1]?.querySelectorAll('code')?.length > 0
        ) {
          a[el.childNodes[0].innerText] = {
            title: el.childNodes[0].innerText,
            type: 'string',
            widget: 'select',
            choices: string.map((child) => ({
              key: child,
              value: child,
            })),
            description: el.childNodes[1].innerText,
          };
        } else if (el.childNodes[2]?.innerText == 'boolean') {
          a[el.childNodes[0].innerText] = {
            title: el.childNodes[0].innerText,
            type: 'string',
            widget: 'boolean',
            description: el.childNodes[1].innerText,
          };
        } else {
          a[el.childNodes[0].innerText] = {
            title: el.childNodes[0].innerText,
            type: 'string',
            widget: 'shortAnswer',
            description: el.childNodes[1].innerText,
          };
        }
      });
      console.log(tab.previousElementSibling.nodeName);
      table.push({
        name:
          tab.previousElementSibling.nodeName == 'H3' ||
          tab.previousElementSibling.nodeName == 'H4' ||
          tab.previousElementSibling.nodeName == 'H2'
            ? `${document.querySelectorAll('h1')[1].innerText}.` + tab.previousElementSibling.innerText
            : tab.previousElementSibling.previousElementSibling.nodeName == 'H3' ||
              tab.previousElementSibling.previousElementSibling.nodeName == 'H4' ||
              tab.previousElementSibling.previousElementSibling.nodeName == 'H2'
            ? `${document.querySelectorAll('h1')[1].innerText}.` +
              tab.previousElementSibling.previousElementSibling.innerText
            : tab.previousElementSibling.previousElementSibling.previousElementSibling.nodeName == 'H3' ||
              tab.previousElementSibling.previousElementSibling.previousElementSibling.nodeName == 'H4' ||
              tab.previousElementSibling.previousElementSibling.previousElementSibling.nodeName == 'H2'
            ? `${document.querySelectorAll('h1')[1].innerText}.` +
              tab.previousElementSibling.previousElementSibling.previousElementSibling.innerText
            : '',
        type: 'object',
        dependencies: {},
        required: [],
        properties: a,
      });
    });
    console.log(table);
    return table;
  });
  return getdata;
}
