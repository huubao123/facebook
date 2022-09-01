const puppeteer = require('puppeteer');
const fs = require('fs');

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
async function autoScrollpost(page) {
  const getdata = await page.evaluate(async () => {
    const data = await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 500;
      let n = 0;
      let timer = setInterval(async () => {
        let scrool = new Array();
        let scrollHeight = document.body.scrollHeight;
        //window.scrollBy(0, distance);
        n += 1;
        totalHeight += distance;
        if (
          window.performance.memory.jsHeapSizeLimit -
            window.performance.memory.jsHeapSizeLimit / 10 <
          window.performance.memory.totalJSHeapSize
        ) {
          clearInterval(timer);
          resolve();
        }
        // if (n == 10) {
        //   clearInterval(timer);
        //   resolve();
        // }
        let isbottom = document.body.scrollHeight;
        let istop = parseInt(document.documentElement.scrollTop + window.innerHeight) + 1;
        if (isbottom === istop) {
          clearInterval(timer);
          resolve();
        }
        let div = document.querySelectorAll('[role = "button"]');
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
            await scrool.push('đã hết');
          } else {
            await scrool.push(div[i].innerText);
          }
        }
        checkcom = (await scrool.indexOf('đã hết')) > -1;
        if (!checkcom) {
          console.log(n);
          clearInterval(timer);
          resolve();
        }
        // console.log(scrool);
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
  return;
}

module.exports = async function main(req, res, next) {
  try {
    const url = req.body.url;
    const username = req.body.username;
    const password = req.body.password;
    const cmt_length = req.body.cmt_length;
    if (!url) {
      res.json('url is required');
    }
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
    await page.goto('https://www.facebook.com', {
      waitUntil: 'load',
    });

    await page.type('#email', username);
    await page.type('#pass', password);
    await page.keyboard.press('Enter');

    //await new Promise((r) => setTimeout(r, 4000));
    await page.waitForSelector('div', { hidden: true });
    await page.goto(url, {
      waitUntil: 'networkidle2',
    });
    // await page.waitForSelector('*');
    // await new Promise((r) => setTimeout(r, 4000));
    await page.evaluate(async () => {
      let div = document.querySelectorAll('[role = "button"]');
      for (let i = 0; i < div.length; i++) {
        if (div[i].innerText.indexOf('liên quan nhất') !== -1) {
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
    await getdata(page, (cmt_lengths = cmt_length)).then(async function (result) {
      fs.writeFile('item1.txt', JSON.stringify(result, null, 2), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
      const app = initializeApp.initializeApp(firebaseConfig);
      const database = getDatabase(app);
      const postListRef = ref(database, '/postList1/' + result.post_id);
      set(postListRef, {
        user_name: result.user_name,
        video: result.video,
        content: result.content + result.categori,
        count_comment: result.count_comment,
        count_like: result.count_like,
        count_share: result.count_share,
        user_id: result.user_id,
        post_id: result.post_id,
        post_link: result.post_link,
        featured_image: result.featured_image,
        comments: result.comments,
      });
    });

    //await browser.close();
  } catch (err) {
    console.log('lỗi server', err);
  }
};
async function getdata(page, cmt_lengths) {
  const dimension = await page.evaluate(async (cmt_lengths) => {
    let video = new Array();
    let image_href = new Array();
    let comments = new Array();
    let children = new Array();
    let userhref =
      (user_name =
      content =
      categori =
      likes =
      count_comments =
      imgComment_cmt =
      shares =
      time =
      videohref =
      user_id =
      post_id =
      cotent_cmt =
      user_cmt_id =
      user_name_cmt =
      user_cmt_href =
      cotent_cmtchild =
      user_cmtchild_id =
      user_name_cmtchild =
      user_cmtchild_href =
      cotent_cmt_text =
      cotent_cmtchild_text =
      imgComment =
        '');
    let count_like_cmt = (count_like_cmtchild = 0);
    //
    post = document.querySelector('[role="article"]').childNodes[0];
    let contens =
      post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0];
    try {
      contens.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes.forEach(
        (ele) => {
          if (ele.className == '') {
            posthref = ele.childNodes[0].childNodes[0].href;
            post_id = ele.childNodes[0].childNodes[0].href.split('/')[6];
          }
        }
      );
      if (
        contens.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
          .childNodes[0].childNodes[0].childNodes.length > 1
      ) {
        admin =
          contens.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0]
            .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes;
      } else {
        admin =
          contens.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0]
            .childNodes[0].childNodes[0].childNodes[0].childNodes;
      }
      admin.forEach((element) => {
        if (element.nodeName == 'SPAN') {
          userhref = element.children[0].href
            ? element.childNodes[0].href
            : element.childNodes[0].href;
          user_name = element.children[0].innerText
            ? element.children[0].innerText
            : element.children[0].innerText;
          user_id = element.children[0].href
            ? element.children[0].href.split('/')[6]
            : element.childNodes[0].href.split('/')[6];
        }
      });
      contens.childNodes[2].childNodes.forEach((element, index) => {
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
        } else if (element.nodeName == 'BLOCKQUOTE') {
          console.log('BLOCKQUOTE', content);
          // content =
          //   element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML
          //     .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
          //     .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
          //     .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');

          // content =
          //   element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
          //     .innerHTML;
        } else {
          if (
            element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length == 2
          ) {
            checkitemlength =
              element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes;
            if (checkitemlength.length == 7) {
              if (checkitemlength[5].childNodes.length == 11) {
                video.push(
                  checkitemlength[5].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].href.split(
                    '/'
                  )[5]
                );
              } else if (checkitemlength[5].childNodes.length == 10) {
                video.push(
                  checkitemlength[5].childNodes[6].childNodes[0].childNodes[0].childNodes[0].childNodes[0].href.split(
                    '/'
                  )[5]
                );
              }
            } else if (checkitemlength.length == 6) {
              if (checkitemlength[4].childNodes.length == 11) {
                video.push(
                  checkitemlength[4].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].href.split(
                    '/'
                  )[5]
                );
              } else if (checkitemlength[4].childNodes.length == 10) {
                video.push(
                  checkitemlength[4].childNodes[6].childNodes[0].childNodes[0].childNodes[0].childNodes[0].href.split(
                    '/'
                  )[5]
                );
              }
            }
          } else if (
            element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length == 1
          ) {
            if (
              element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes.length > 1
            ) {
              if (
                !element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].href
              ) {
                for (
                  let j = 0;
                  j <
                  element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                    .childNodes.length;
                  j++
                ) {
                  element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[
                    j
                  ].childNodes[0].href.indexOf('videos') > 0
                    ? video.push(
                        element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[
                          j
                        ].childNodes[0].href
                          .split('/')[6]
                          .split('?')[0]
                      )
                    : image_href.push(
                        element.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                          .childNodes[0].childNodes[j].childNodes[0].childNodes[0].childNodes[0]
                          .childNodes[0].childNodes[0].currentSrc
                      );
                }
              }
            } else {
              element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                function (element) {
                  if (element.childNodes[0].childNodes[0].nodeName == 'IMG') {
                    image_href.push(element.childNodes[0].childNodes[0].currentSrc);
                  } else {
                    console.log('Warning: Invalid', element.childNodes);
                    if (element.childNodes.length == 3) {
                      for (let k = 0; k < element.childNodes.length; k++) {
                        image_href.push(
                          element.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                            .childNodes[0].href
                        );
                      }
                    } else {
                      element.childNodes.forEach(function (element) {
                        if (element.childNodes.length == 2) {
                          console.log('image 3', element.childNodes);
                          image_href.push(
                            element.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                              .childNodes[0].childNodes[0].childNodes[0].childNodes[0].currentSrc
                          );
                        } else {
                          image_href.push(
                            element.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                              .childNodes[0].childNodes[0].childNodes[0].childNodes[0].currentSrc
                          );
                        }
                      });
                    }
                  }
                }
              );
            }
          }
        }
      });
      let divlikecomshare =
        post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0];
      let likecomshare = '';
      let divcommment = '';

      // lấy categori có thì  divlikecomshare  = 5
      if (divlikecomshare.childNodes.length == 5) {
        categori = divlikecomshare.childNodes[3].innerText;
        likecomshare =
          divlikecomshare.childNodes[4].childNodes[0].childNodes[0].childNodes[0].childNodes[0];
        divcommment =
          divlikecomshare.childNodes[4].childNodes[0].childNodes[0].childNodes[1].childNodes;
      } else {
        categori = '';
        likecomshare =
          divlikecomshare.childNodes[3].childNodes[0].childNodes[0].childNodes[0].childNodes[0];

        divcommment =
          divlikecomshare.childNodes[3].childNodes[0].childNodes[0].childNodes[1].childNodes;
      }

      if (likecomshare.childNodes.length > 1) {
        let likecomshares = likecomshare.childNodes[0].childNodes[0].childNodes;
        likecomshares.forEach((element, index) => {
          if (index == 0) {
            likes = element.childNodes ? element.childNodes[1].textContent.split(' ')[0] : '0';
          }
          if (index == 1) {
            count_comments = element.childNodes[1]
              ? element.childNodes[1].textContent.split(' ')[0]
              : '0';
            shares = element.childNodes[2] ? element.childNodes[2].textContent.split(' ')[0] : '0';
          }
        });
      }

      divcommment.forEach((element) => {
        if (element.nodeName == 'UL') {
          element.childNodes.forEach((elementss) => {
            try {
              if (elementss.childNodes[0].childNodes.length == 2) {
                if (
                  elementss.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                    .children[0].childNodes[0].childNodes[0].childNodes &&
                  elementss.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                    .children[0].childNodes[0].childNodes[0].childNodes.nodeName == 'SPAN'
                ) {
                  console.log('abc', elementss.childNodes[0].childNodes);
                  elementss.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].children[0].childNodes[0].childNodes[0].childNodes.forEach(
                    (elementsss, index) => {
                      if (elementsss.nodeName == 'SPAN' && index == 0) {
                        user_cmt_href = elementsss.childNodes[0].childNodes[0].href;
                        user_name_cmt = elementsss.childNodes[0].childNodes[0].innerText;
                        user_cmt_id = elementsss.childNodes[0].childNodes[0].href.split('/')[6];
                      } else if (elementsss.nodeName == 'DIV') {
                        for (let l = 0; l < elementsss.childNodes[0].childNodes.length; l++) {
                          cotent_cmt += elementsss.childNodes[0].childNodes[l].innerHTML
                            .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                            .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                            .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
                          cotent_cmt_text += elementsss.childNodes[0].childNodes[l].innerText
                            .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                            .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                            .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
                        }
                        if (cotent_cmt_text.length < cmt_lengths) {
                          cotent_cmt_text = '';
                          console.log(abc);
                        } else {
                          cotent_cmt_text = '';
                        }
                      }
                    }
                  );
                }
                // comment mới
                elementss.childNodes[0].childNodes[1].childNodes[1].childNodes.forEach(
                  (element, index) => {
                    if (index == 1 && element.className == '') {
                      diw_newcmt =
                        elementss.childNodes[0].childNodes[1].childNodes[1].childNodes[1];
                    } else if (index == 1 && element.className !== '') {
                      diw_newcmt =
                        elementss.childNodes[0].childNodes[1].childNodes[1].childNodes[0];
                    }
                  }
                );

                if (
                  diw_newcmt.childNodes[0].childNodes[0].childNodes[0].childNodes.length > 1 &&
                  elementss.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                    .children[0].childNodes[0].childNodes[0].childNodes[0].nodeName !== 'SPAN'
                ) {
                  console.log('asd', elementss.childNodes[0].childNodes);
                  // cũ có hình ảnh
                  elementss.childNodes[0].childNodes[1].childNodes[1].childNodes.forEach(
                    (elementsss, index) => {
                      if (elementsss.nodeName == 'DIV' && index == 1) {
                        if (elementsss.childNodes[0].childNodes.length > 1) {
                          count_like_cmt =
                            elementsss.childNodes[0].childNodes[1].innerText == ''
                              ? 1
                              : elementsss.childNodes[0].childNodes[1].innerText;
                        }
                        imgComment = elementsss.childNodes[0].childNodes[0].childNodes[0]
                          .childNodes[0].childNodes[0].childNodes[0]
                          ? elementsss.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                              .childNodes[0].childNodes[0].currentSrc
                          : '';
                      }
                    }
                  );
                  // đếm like comment
                  console.log('diw_newcmt', diw_newcmt);
                  if (diw_newcmt.childNodes[0].childNodes[0].childNodes[1]) {
                    count_like_cmt =
                      diw_newcmt.childNodes[0].childNodes[0].childNodes[1].innerText == ''
                        ? 1
                        : diw_newcmt.childNodes[0].childNodes[0].childNodes[1].innerText;
                  }
                  diw_newcmt.childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                    (cmt, index) => {
                      if (cmt.nodeName == 'SPAN' && index == 0) {
                        user_cmt_href = cmt.childNodes[0].childNodes[0].href;
                        user_name_cmt = cmt.childNodes[0].childNodes[0].innerText;
                        user_cmt_id = cmt.childNodes[0].childNodes[0].href.split('/')[6];
                      } else if (cmt.nodeName == 'DIV') {
                        for (let l = 0; l < cmt.childNodes[0].childNodes.length; l++) {
                          cotent_cmt += cmt.childNodes[0].childNodes[l].innerHTML
                            .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                            .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                            .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
                          cotent_cmt_text += cmt.childNodes[0].childNodes[l].innerText
                            .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                            .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                            .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
                        }
                        if (cotent_cmt_text.length < cmt_lengths) {
                          cotent_cmt_text = '';
                          console.log(abc);
                        } else {
                          cotent_cmt_text = '';
                        }
                      }
                    }
                  );
                } else if (
                  diw_newcmt.childNodes[0].childNodes[0].childNodes[0].childNodes.length == 1 &&
                  elementss.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                    .children[0].childNodes[0].childNodes[0].childNodes[0].nodeName !== 'SPAN'
                ) {
                  console.log('qwe', diw_newcmt.childNodes);
                  // đếm like comment
                  if (diw_newcmt.childNodes[0].childNodes[0].childNodes.length > 1) {
                    count_like_cmt =
                      diw_newcmt.childNodes[0].childNodes[0].childNodes[1].innerText == ''
                        ? 1
                        : diw_newcmt.childNodes[0].childNodes[0].childNodes[1].innerText;
                  }

                  elementss.childNodes[0].childNodes[1].childNodes[1].childNodes.forEach(
                    (elementsss, index) => {
                      if (elementsss.nodeName == 'DIV' && index == 1) {
                        //console.log('1', elementsss);
                        imgComment =
                          elementsss.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                            .childNodes[0].childNodes[0].currentSrc;
                      }
                    }
                  );
                  diw_newcmt.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                    (child, index) => {
                      if (child.nodeName == 'SPAN' && index == 0) {
                        user_cmt_href = child.childNodes[0].childNodes[0].href;
                        user_name_cmt = child.childNodes[0].childNodes[0].innerText;
                        user_cmt_id = child.childNodes[0].childNodes[0].href.split('/')[6];
                      } else if (child.nodeName == 'DIV') {
                        for (let l = 0; l < child.childNodes[0].childNodes.length; l++) {
                          cotent_cmt += child.childNodes[0].childNodes[l].innerHTML
                            .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                            .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                            .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
                          cotent_cmt_text += child.childNodes[0].childNodes[l].innerText
                            .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                            .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                            .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
                        }
                        if (cotent_cmt_text.length < cmt_lengths) {
                          cotent_cmt_text = '';
                          console.log(abc);
                        } else {
                          cotent_cmt_text = '';
                        }
                      } else if (child.nodeName == 'A') {
                        user_cmt_href = child.href;
                        user_name_cmt = child.innerText;
                        user_cmt_id = child.href.split('/')[6];
                        cotent_cmt = 'Icon Facebook';
                      }
                    }
                  );
                }
                if (
                  elementss.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                    .children[0].childNodes[0].childNodes[0].childNodes[0].nodeName == 'SPAN'
                ) {
                  if (elementss.childNodes[1].childNodes[0].childNodes.length > 0) {
                    elementss.childNodes[1].childNodes[0].childNodes.forEach((cmt_old) => {
                      if (cmt_old.nodeName == 'UL') {
                        for (let m = 0; m < cmt_old.childNodes.length; m++) {
                          try {
                            cmt_old.childNodes[
                              m
                            ].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                              (child, index) => {
                                if (child.nodeName == 'SPAN' && index == 0) {
                                  user_cmtchild_href = child.childNodes[0].childNodes[0].href;
                                  user_name_cmtchild = child.childNodes[0].childNodes[0].innerText;
                                  user_cmtchild_id =
                                    child.childNodes[0].childNodes[0].href.split('/')[6];
                                } else if (child.nodeName == 'DIV') {
                                  for (let l = 0; l < child.childNodes[0].childNodes.length; l++) {
                                    cotent_cmtchild += child.childNodes[0].childNodes[l].innerHTML
                                      .replace(
                                        /([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/,
                                        ''
                                      )
                                      .replace(
                                        /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                        ''
                                      )
                                      .replace(
                                        /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                        ''
                                      );
                                    cotent_cmtchild_text += child.childNodes[0].childNodes[
                                      l
                                    ].innerText
                                      .replace(
                                        /([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/,
                                        ''
                                      )
                                      .replace(
                                        /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                        ''
                                      )
                                      .replace(
                                        /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                        ''
                                      );
                                  }
                                  if (cotent_cmtchild_text.length < cmt_lengths) {
                                    cotent_cmtchild_text = '';
                                    console.log(abc);
                                  } else {
                                    cotent_cmtchild_text = '';
                                  }
                                }
                              }
                            );

                            // if (
                            //   elementsss.childNodes[m].childNodes[1]
                            //     .className == ''
                            // ) {
                            //   children2 =
                            //     elementsss.childNodes[m].childNodes[1]
                            //       .childNodes[0].childNodes;
                            //   for (let n = 0; n < children2.length; n++) {
                            //     children2[n].childNodes[0].childNodes[
                            //       children2[n].childNodes[0].childNodes.length -
                            //         1
                            //     ].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                            //       (child) => {
                            //         if (child.nodeName == 'SPAN') {
                            //           user_cmtchild_href =
                            //             child.childNodes[0].childNodes[0].href;
                            //           user_name_cmtchild =
                            //             child.childNodes[0].childNodes[0]
                            //               .innerText;
                            //           user_cmtchild_id =
                            //             child.childNodes[0].childNodes[0].href.split(
                            //               '/'
                            //             )[6];
                            //         } else if (child.nodeName == 'DIV') {
                            //           cotent_cmtchild =
                            //             child.childNodes[0].childNodes[0]
                            //               .innerHTML;
                            //         }
                            //       }
                            //     );
                            //   }
                            // }
                            children.push({
                              user_name: user_name_cmtchild,
                              user_id: user_cmtchild_id,
                              content: cotent_cmtchild,
                              imgComment: imgComment_cmt,
                              count_like: count_like_cmtchild,
                            });
                            user_cmtchild_href =
                              user_name_cmtchild =
                              user_cmtchild_id =
                              cotent_cmtchild =
                              imgComment_cmt =
                                '';
                            count_like_cmtchild = 0;
                          } catch (e) {
                            console.log('children error');
                            console.log(e);
                          }
                        }
                      }
                    });
                  }
                } else {
                  elementss.childNodes[1].childNodes[0].childNodes.forEach((elementsss) => {
                    if (elementsss.nodeName == 'UL') {
                      for (let m = 0; m < elementsss.childNodes.length; m++) {
                        console.log('child1', elementsss.childNodes[m].childNodes);
                        try {
                          // thử comment_child1 mới có thêm 1 thẻ div
                          if (elementsss.childNodes[m].childNodes.length == 3) {
                            children_div = elementsss.childNodes[m].childNodes[1].childNodes[
                              elementsss.childNodes[m].childNodes[0].childNodes.length - 1
                            ].childNodes[1].childNodes[0].childNodes[0]
                              ? elementsss.childNodes[m].childNodes[1].childNodes[
                                  elementsss.childNodes[m].childNodes[0].childNodes.length - 1
                                ].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                                  .childNodes[0].childNodes
                              : elementsss.childNodes[m].childNodes[1].childNodes[
                                  elementsss.childNodes[m].childNodes[0].childNodes.length - 1
                                ].childNodes[1].childNodes[1].childNodes[0].childNodes[0]
                                  .childNodes[0].childNodes;
                          } else {
                            children_div = elementsss.childNodes[m].childNodes[0].childNodes[
                              elementsss.childNodes[m].childNodes[0].childNodes.length - 1
                            ].childNodes[1].childNodes[0].childNodes[0]
                              ? elementsss.childNodes[m].childNodes[0].childNodes[
                                  elementsss.childNodes[m].childNodes[0].childNodes.length - 1
                                ].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                                  .childNodes[0].childNodes
                              : elementsss.childNodes[m].childNodes[0].childNodes[
                                  elementsss.childNodes[m].childNodes[0].childNodes.length - 1
                                ].childNodes[1].childNodes[1].childNodes[0].childNodes[0]
                                  .childNodes[0].childNodes;
                          }
                          // cmtchild1 mới  cũ có hình ảnh
                          if (
                            children_div[0].parentNode.parentNode.parentNode.parentNode.parentNode
                              .childNodes.length == 3
                          ) {
                            imgComment_cmt =
                              children_div[0].parentNode.parentNode.parentNode.parentNode.parentNode
                                .childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes
                                .length > 2
                                ? children_div[0].parentNode.parentNode.parentNode.parentNode
                                    .parentNode.childNodes[1].childNodes[0].childNodes[0]
                                    .childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                                    .currentSrc
                                : '';
                            if (
                              children_div[0].parentNode.parentNode.parentNode.parentNode.parentNode
                                .childNodes[1].childNodes[0].childNodes[1]
                            ) {
                              count_like_cmtchild =
                                children_div[0].parentNode.parentNode.parentNode.parentNode
                                  .parentNode.childNodes[1].childNodes[0].childNodes[1].innerText ==
                                ''
                                  ? 1
                                  : children_div[0].parentNode.parentNode.parentNode.parentNode
                                      .parentNode.childNodes[1].childNodes[0].childNodes[1]
                                      .innerText;
                            }
                            // cmtchild1 mới có hình ảnh
                          } else if (
                            children_div[0].parentNode.parentNode.parentNode.parentNode.parentNode
                              .childNodes.length == 4
                          ) {
                            imgComment_cmt =
                              children_div[0].parentNode.parentNode.parentNode.parentNode.parentNode
                                .childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes
                                .length > 2
                                ? children_div[0].parentNode.parentNode.parentNode.parentNode
                                    .parentNode.childNodes[2].childNodes[0].childNodes[0]
                                    .childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                                    .currentSrc
                                : '';
                            if (
                              children_div[0].parentNode.parentNode.parentNode.parentNode.parentNode
                                .childNodes[2].childNodes[0].childNodes[1]
                            ) {
                              count_like_cmtchild =
                                children_div[0].parentNode.parentNode.parentNode.parentNode
                                  .parentNode.childNodes[2].childNodes[0].childNodes[1].innerText ==
                                ''
                                  ? 1
                                  : children_div[0].parentNode.parentNode.parentNode.parentNode
                                      .parentNode.childNodes[2].childNodes[0].childNodes[1]
                                      .innerText;
                            }
                            // đếm like khi cmtchild1 cũ không có hình
                          }
                          if (children_div[0].parentNode.parentNode.childNodes[1]) {
                            count_like_cmtchild =
                              children_div[0].parentNode.parentNode.childNodes[1].innerText == ''
                                ? 1
                                : children_div[0].parentNode.parentNode.childNodes[1].innerText;
                          } else if (
                            children_div[0].parentNode.parentNode.parentNode.parentNode.parentNode
                              .childNodes[1].childNodes[0].childNodes[0].childNodes[1]
                          ) {
                            //đếm like khi cmtchild1 mới không có hình
                            count_like_cmtchild =
                              children_div[0].parentNode.parentNode.parentNode.parentNode.parentNode
                                .childNodes[1].childNodes[0].childNodes[0].childNodes[1] == ''
                                ? 1
                                : children_div[0].parentNode.parentNode.parentNode.parentNode
                                    .parentNode.childNodes[1].childNodes[0].childNodes[0]
                                    .childNodes[1].innerText;
                          } else {
                            count_like_cmtchild = 0;
                          }

                          // lấy thông tin cmt
                          if (children_div.length > 1) {
                            children_div.forEach((child, index) => {
                              if (child.nodeName == 'SPAN' && index == 0) {
                                user_cmtchild_href = child.childNodes[0].childNodes[0].href;
                                user_name_cmtchild = child.childNodes[0].childNodes[0].innerText;
                                user_cmtchild_id =
                                  child.childNodes[0].childNodes[0].href.split('/')[6];
                              } else if (child.nodeName == 'DIV') {
                                for (let l = 0; l < child.childNodes[0].childNodes.length; l++) {
                                  cotent_cmtchild += child.childNodes[0].childNodes[l].innerHTML
                                    .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                                    .replace(
                                      /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                      ''
                                    )
                                    .replace(
                                      /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                      ''
                                    );
                                  cotent_cmtchild_text += child.childNodes[0].childNodes[
                                    l
                                  ].innerText
                                    .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                                    .replace(
                                      /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                      ''
                                    )
                                    .replace(
                                      /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                      ''
                                    );
                                }
                                if (cotent_cmtchild_text.length < cmt_lengths) {
                                  cotent_cmtchild_text = '';
                                  console.log(abc);
                                } else {
                                  cotent_cmtchild_text = '';
                                }
                              }
                            });
                          } else {
                            children_div[0].childNodes[0].childNodes.forEach((child, index) => {
                              if (child.nodeName == 'SPAN' && index == 0) {
                                user_cmtchild_href = child.childNodes[0].childNodes[0].href;
                                user_name_cmtchild = child.childNodes[0].childNodes[0].innerText;
                                user_cmtchild_id =
                                  child.childNodes[0].childNodes[0].href.split('/')[6];
                              } else if (child.nodeName == 'DIV') {
                                for (let l = 0; l < child.childNodes[0].childNodes.length; l++) {
                                  cotent_cmtchild += child.childNodes[0].childNodes[l].innerHTML
                                    .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                                    .replace(
                                      /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                      ''
                                    )
                                    .replace(
                                      /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                      ''
                                    );
                                  cotent_cmtchild_text += child.childNodes[0].childNodes[
                                    l
                                  ].innerText
                                    .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                                    .replace(
                                      /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                      ''
                                    )
                                    .replace(
                                      /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                      ''
                                    );
                                }
                                if (cotent_cmtchild_text.length < cmt_lengths) {
                                  cotent_cmtchild_text = '';
                                  console.log(abc);
                                } else {
                                  cotent_cmtchild_text = '';
                                }
                              }
                            });
                          }

                          children.push({
                            user_name: user_name_cmtchild,
                            user_id: user_cmtchild_id,
                            content: cotent_cmtchild,
                            imgComment: imgComment_cmt,
                            count_like: count_like_cmtchild,
                          });
                          user_cmtchild_href =
                            user_name_cmtchild =
                            user_cmtchild_id =
                            cotent_cmtchild =
                            imgComment_cmt =
                              '';
                          count_like_cmtchild = 0;

                          if (
                            elementsss.childNodes[m].childNodes[1] &&
                            elementsss.childNodes[m].childNodes[1].className == ''
                          ) {
                            children2 =
                              elementsss.childNodes[m].childNodes[1].childNodes[0].childNodes;
                            console.log(children2);
                            for (let n = 0; n < children2.length; n++) {
                              try {
                                children22 =
                                  children2[n].childNodes[0].childNodes[
                                    children2[n].childNodes[0].childNodes.length - 1
                                  ].childNodes[1].childNodes;
                                children22.forEach((element, index) => {
                                  // kiểm tra comments mới có thì index = 1
                                  if (element.className == '' && index == 1) {
                                    // lấy thông tin child2 cmt
                                    element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                                      (child, index) => {
                                        if (child.nodeName == 'SPAN' && index == 0) {
                                          user_cmtchild_href =
                                            child.childNodes[0].childNodes[0].href;
                                          user_name_cmtchild =
                                            child.childNodes[0].childNodes[0].innerText;
                                          user_cmtchild_id =
                                            child.childNodes[0].childNodes[0].href.split('/')[6];
                                        } else if (child.nodeName == 'DIV') {
                                          for (
                                            let l = 0;
                                            i < child.childNodes[0].childNodes.length;
                                            l++
                                          ) {
                                            cotent_cmtchild += child.childNodes[0].childNodes[
                                              l
                                            ].innerHTML
                                              .replace(
                                                /([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/,
                                                ''
                                              )
                                              .replace(
                                                /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                                ''
                                              )
                                              .replace(
                                                /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                                ''
                                              );
                                            cotent_cmtchild_text += child.childNodes[0].childNodes[
                                              l
                                            ].innerText
                                              .replace(
                                                /([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/,
                                                ''
                                              )
                                              .replace(
                                                /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                                ''
                                              )
                                              .replace(
                                                /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                                ''
                                              );
                                          }
                                          if (cotent_cmtchild_text.length < cmt_lengths) {
                                            cotent_cmtchild_text = '';
                                            console.log(abc);
                                          } else {
                                            cotent_cmtchild_text = '';
                                          }
                                        }
                                      }
                                    );
                                    // đếm like khi có hình
                                    if (element.nodeName == 'DIV' && index == 2) {
                                      if (children22[2].childNodes[0].childNodes.length > 1) {
                                        count_like_cmtchild =
                                          children22[2].childNodes[0].childNodes[1].innerText == ''
                                            ? 1
                                            : children22[1].childNodes[0].childNodes[1].innerText;
                                      }

                                      imgComment_cmt =
                                        children22[2].childNodes[0].childNodes[1].childNodes[0]
                                          .childNodes[0].childNodes[0].childNodes.length > 2
                                          ? children22[2].childNodes[0].childNodes[1].childNodes[0]
                                              .childNodes[0].childNodes[0].childNodes[0]
                                              .childNodes[0].childNodes[0].currentSrc
                                          : '';
                                    } else {
                                      // đếm like khi không có hình
                                      if (children22[1].childNodes[0].childNodes[0].childNodes[1]) {
                                        count_like_cmtchild =
                                          children22[1].childNodes[0].childNodes[0].childNodes[1]
                                            .innerText == ''
                                            ? 1
                                            : children22[1].childNodes[0].childNodes[0]
                                                .childNodes[1].innerText;
                                      }
                                    }
                                    // kiểm tra comments child 2 cũ thì làm dưới
                                  } else if (index == 1 && element.className !== '') {
                                    // đếm like khi có hình
                                    if (children22.length > 2) {
                                      if (children22[1].childNodes[0].childNodes.length > 1) {
                                        count_like_cmtchild =
                                          children22[1].childNodes[0].childNodes[1].innerText == ''
                                            ? 1
                                            : children22[1].childNodes[0].childNodes[1].innerText;
                                      }
                                      imgComment_cmt = children22[1].childNodes[0].childNodes[0]
                                        .childNodes[0].childNodes[0].childNodes[0]
                                        ? children22[1].childNodes[0].childNodes[0].childNodes[0]
                                            .childNodes[0].childNodes[0].childNodes[0].currentSrc
                                        : '';
                                      // lấy thông tin khi có hình
                                      children22[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                                        (child, index) => {
                                          if (child.nodeName == 'SPAN' && index == 0) {
                                            user_cmtchild_href =
                                              child.childNodes[0].childNodes[0].href;
                                            user_name_cmtchild =
                                              child.childNodes[0].childNodes[0].innerText;
                                            user_cmtchild_id =
                                              child.childNodes[0].childNodes[0].href.split('/')[6];
                                          } else if (child.nodeName == 'DIV') {
                                            for (
                                              let l = 0;
                                              l < child.childNodes[0].childNodes.length;
                                              l++
                                            ) {
                                              cotent_cmtchild += child.childNodes[0].childNodes[
                                                l
                                              ].innerHTML
                                                .replace(
                                                  /([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/,
                                                  ''
                                                )
                                                .replace(
                                                  /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                                  ''
                                                )
                                                .replace(
                                                  /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                                  ''
                                                );
                                              cotent_cmtchild_text +=
                                                child.childNodes[0].childNodes[l].innerText
                                                  .replace(
                                                    /([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/,
                                                    ''
                                                  )
                                                  .replace(
                                                    /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                                    ''
                                                  )
                                                  .replace(
                                                    /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                                    ''
                                                  );
                                            }
                                            if (cotent_cmtchild_text.length < cmt_lengths) {
                                              cotent_cmtchild_text = '';
                                              console.log(abc);
                                            } else {
                                              cotent_cmtchild_text = '';
                                            }
                                          }
                                        }
                                      );
                                    } else {
                                      // đếm like khi không có hình
                                      if (
                                        children22[0].childNodes[0].childNodes[0].childNodes
                                          .length > 1
                                      ) {
                                        count_like_cmtchild =
                                          children22[0].childNodes[0].childNodes[0].childNodes[1]
                                            .innerText == ''
                                            ? 1
                                            : children22[0].childNodes[0].childNodes[0]
                                                .childNodes[1].innerText;
                                      }
                                      // lấy thông tin cmt child 2
                                      children22[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                                        (child, index) => {
                                          if (child.nodeName == 'SPAN' && index == 0) {
                                            user_cmtchild_href =
                                              child.childNodes[0].childNodes[0].href;
                                            user_name_cmtchild =
                                              child.childNodes[0].childNodes[0].innerText;
                                            user_cmtchild_id =
                                              child.childNodes[0].childNodes[0].href.split('/')[6];
                                          } else if (child.nodeName == 'DIV') {
                                            for (
                                              var l = 0;
                                              l < child.childNodes[0].childNodes.length;
                                              l++
                                            ) {
                                              cotent_cmtchild += child.childNodes[0].childNodes[
                                                l
                                              ].innerHTML
                                                .replace(
                                                  /([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/,
                                                  ''
                                                )
                                                .replace(
                                                  /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                                  ''
                                                )
                                                .replace(
                                                  /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                                  ''
                                                );
                                              cotent_cmtchild_text +=
                                                child.childNodes[0].childNodes[l].innerText
                                                  .replace(
                                                    /([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/,
                                                    ''
                                                  )
                                                  .replace(
                                                    /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                                                    ''
                                                  )
                                                  .replace(
                                                    /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                                                    ''
                                                  );
                                            }
                                            if (cotent_cmtchild_text.length < cmt_lengths) {
                                              cotent_cmtchild_text = '';
                                              console.log(abc);
                                            } else {
                                              cotent_cmtchild_text = '';
                                            }
                                          }
                                        }
                                      );
                                    }
                                  }
                                });

                                children.push({
                                  user_name: user_name_cmtchild,
                                  user_id: user_cmtchild_id,
                                  content: cotent_cmtchild,
                                  imgComment: imgComment_cmt,
                                  count_like: count_like_cmtchild,
                                });
                                user_cmtchild_href =
                                  user_name_cmtchild =
                                  user_cmtchild_id =
                                  cotent_cmtchild =
                                  imgComment_cmt =
                                    '';
                                count_like_cmtchild = 0;
                              } catch (err) {
                                console.log('children2 error');
                                console.log(err);
                              }
                            }
                          }
                        } catch (e) {
                          console.log('children error');
                          console.log(e);
                        }
                      }
                    }
                  });
                }
              } else {
                console.log(
                  'cmt _1 ',
                  elementss.childNodes[0].childNodes[0].childNodes[1].childNodes
                );
                // cũ nè
                if (
                  elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0]
                ) {
                  divcommment =
                    elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0]
                      .childNodes[0].childNodes[0].childNodes;
                  if (elementss.childNodes[0].childNodes[0].childNodes[1].childNodes.length > 2) {
                    if (
                      elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[1]
                        .childNodes[0].childNodes.length > 1
                    ) {
                      count_like_cmt =
                        elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[1]
                          .childNodes[0].childNodes[1].innerText == ''
                          ? 1
                          : elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[1]
                              .childNodes[0].childNodes[1].innerText;
                    }
                    imgComment = elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[1]
                      .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                      ? elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[1]
                          .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                          .childNodes[0].currentSrc
                      : '';
                  }
                  if (
                    elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0]
                      .childNodes[0].childNodes.length == 2
                  ) {
                    count_like_cmt =
                      elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[0]
                        .childNodes[0].childNodes[0].childNodes[1].innerText == ''
                        ? 1
                        : elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[0]
                            .childNodes[0].childNodes[0].childNodes[1].innerText;
                  }
                } else {
                  // cmt mới
                  divcommment =
                    elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0]
                      .childNodes[0].childNodes[0].childNodes;
                  if (
                    elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[2].nodeName ==
                    'DIV'
                  ) {
                    imgComment =
                      elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[2]
                        .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                        .childNodes[0].currentSrc;
                    if (
                      elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[2]
                        .childNodes[0].childNodes[1]
                    ) {
                      count_like_cmt =
                        elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[2]
                          .childNodes[0].childNodes[1].innerText == ''
                          ? 1
                          : elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[2]
                              .childNodes[0].childNodes[1].innerText;
                    }
                  } else {
                    if (
                      elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[1]
                        .childNodes[0].childNodes[0].childNodes[1]
                    ) {
                      count_like_cmt =
                        elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[1]
                          .childNodes[0].childNodes[0].childNodes[1].innerText == ''
                          ? 1
                          : elementss.childNodes[0].childNodes[0].childNodes[1].childNodes[1]
                              .childNodes[0].childNodes[0].childNodes[1].innerText;
                    }
                  }
                }

                if (divcommment.length > 1) {
                  divcommment.forEach((element, index) => {
                    if (element.nodeName == 'SPAN' && index == 0) {
                      user_cmt_href = element.childNodes[0].childNodes[0].href;
                      user_name_cmt = element.childNodes[0].childNodes[0].innerText;
                      user_cmt_id = element.childNodes[0].childNodes[0].href.split('/')[6];
                    } else if (element.nodeName == 'DIV') {
                      for (let l = 0; l < element.childNodes[0].childNodes.length; l++) {
                        cotent_cmt += element.childNodes[0].childNodes[l].innerHTML
                          .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                          .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                          .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
                        cotent_cmt_text += element.childNodes[0].childNodes[l].innerText
                          .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                          .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                          .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
                      }
                      if (cotent_cmt_text.length < cmt_lengths) {
                        cotent_cmt_text = '';
                        console.log(abc);
                      } else {
                        cotent_cmt_text = '';
                      }
                    }
                  });
                } else if (divcommment.length == 1) {
                  divcommment[0].childNodes[0].childNodes.forEach((element, index) => {
                    if (element.nodeName == 'SPAN' && index == 0) {
                      user_cmt_href = element.childNodes[0].childNodes[0].href;
                      user_name_cmt = element.childNodes[0].childNodes[0].innerText;
                      user_cmt_id = element.childNodes[0].childNodes[0].href.split('/')[6];
                    } else if (element.nodeName == 'DIV') {
                      for (let l = 0; l < element.childNodes[0].childNodes.length; l++) {
                        cotent_cmt += element.childNodes[0].childNodes[l].innerHTML
                          .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                          .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                          .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
                        cotent_cmt_text += element.childNodes[0].childNodes[l].innerText
                          .replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, '')
                          .replace(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, '')
                          .replace(/^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/, '');
                      }
                      if (cotent_cmt_text.length < cmt_lengths) {
                        cotent_cmt_text = '';
                        console.log(abc);
                      } else {
                        cotent_cmt_text = '';
                      }
                    }
                  });
                }
              }
              comments.push({
                content: cotent_cmt,
                user_name: user_name_cmt,
                user_id: user_cmt_id,
                user_cmt_href: user_cmt_href,
                imgComment: imgComment,
                count_like: count_like_cmt,
                children: children,
              });
              cotent_cmt = user_cmt_id = user_name_cmt = user_cmt_href = imgComment = '';
              count_like_cmt = count_like_cmtchild = 0;
              children = [];
            } catch (error) {
              console.log('error cmt');
              console.log(error);
            }
          });
        }
      });

      data = {
        // id: data.length ? data.length + 1 : 1,
        userhref: userhref ? userhref : '',
        user_name: user_name ? user_name : '',
        content: content ? content : '',
        categori: categori ? categori : '',
        count_comment: count_comments ? count_comments : '',
        user_id: user_id ? user_id : '',
        count_like: likes ? likes : '',
        count_share: shares ? shares : '',
        post_id: post_id ? post_id : '',
        post_link: posthref ? posthref : '',
        video: video ? video : '',
        featured_image: image_href ? image_href : '',
        comments: comments ? comments : [],
      };
      userhref =
        user_name =
        posthref =
        user_id =
        content =
        categori =
        image_href =
        likes =
        count_comments =
        shares =
        post_id =
        time =
          '';
      video = [];
      comments = [];
      image_href = [];
    } catch (error) {
      console.log(error);
    }

    return data;
  }, cmt_lengths);
  return dimension;
}
