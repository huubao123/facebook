const puppeteer = require('puppeteer');
const fs = require('fs');

const initializeApp = require('firebase/app');
// const fire = require('firebase/app');

const getDatabase = require('firebase/database').getDatabase;
const set = require('firebase/database').set;
const ref = require('firebase/database').ref;
const push = require('firebase/database').push;
const firebaseConfig = {
  apiKey: 'AIzaSyA8SytL-Kim6L_CSNvYUmVTH2nf6d-cE6c',
  authDomain: 'facebookpup-4fde6.firebaseapp.com',
  databaseURL:
    'https://facebookpup-4fde6-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'facebookpup-4fde6',
  storageBucket: 'facebookpup-4fde6.appspot.com',
  messagingSenderId: '207611940130',
  appId: '1:207611940130:web:3cebdcc6c0a6f19e58297b',
  measurementId: 'G-3LDE9KDMV2',
};
// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object

async function autoScroll(page, _length) {
  const getdata = await page.evaluate(async (_length) => {
    const data = await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 500;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        let post_length =
          document.querySelectorAll('[role="feed"]')[0].childNodes.length;
        if (post_length - 3 > _length) {
          clearInterval(timer);
          resolve();
        }
        document.querySelectorAll('[role = "button"]').forEach((el) => {
          if (
            el.innerText.indexOf('Xem thêm') !== -1 ||
            el.innerText.indexOf('phản hồi') !== -1 ||
            el.innerText.indexOf('câu trả lời') !== -1
          ) {
            el.click();
          }
        });
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  }, _length);
  return;
}
module.exports = async function main(req, res) {
  const url = req.body.url;
  const lengths = req.body.length;
  const username = req.body.username;
  const password = req.body.password;
  if (!url) {
    res.json('url is required');
  }
  if (!lengths) {
    res.json('length is required');
  }
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
    // headless: false,
    // defaultViewport: null,
    // args: ['--start-maximized'],
    // product: 'chrome',
    // devtools: true,
    // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  res.send('đợi tí rồi chuyển thành get rồi lấy data nha');

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
  await page.goto('https://www.facebook.com', {
    waitUntil: 'load',
  });
  await page.type('#email', username);
  await page.type('#pass', password);
  await page.keyboard.press('Enter');
  await page.waitForSelector('div', { hidden: true });
  await page.goto(url, {
    //https://www.facebook.com/groups/j2team.community.girls
    //https://www.facebook.com/groups/364997627165697
    waitUntil: 'load',
  });
  await autoScroll(page, (length = lengths));
  console.log('scroll done');
  await takedata(page, (length = lengths)).then(async function (result) {
    // fs.writeFile('item.txt', JSON.stringify(result, null, 2), (err) => {
    //   if (err) throw err;
    //   console.log('The file has been saved!');
    // });

    for (let i = 0; i < result.length; i++) {
      const app = initializeApp.initializeApp(firebaseConfig);
      const database = getDatabase(app);
      const postListRef = ref(database, '/postList');
      const newPostRef = push(postListRef);
      set(newPostRef, {
        user_name: result[i].user_name,
        video: result[i].video,
        content: result[i].content + result[i].categori,
        count_comment: result[i].count_comment,
        count_like: result[i].count_like,
        count_share: result[i].count_share,
        user_id: result[i].user_id,
        post_id: result[i].post_id,
        post_link: result[i].post_link,
        featured_image: result[i].featured_image,
        comments: result[i].comments,
      });
    }
  });

  await browser.close();
};
async function takedata(page, length) {
  const dimension = await page.evaluate(async (length) => {
    post = document.querySelectorAll('[role="feed"]')[0].childNodes;
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
      imgComment =
      count_like_cmt =
      count_like_cmtchild =
        '');
    //
    let data = [];
    for (let i = 1; i < length + 1; i++) {
      try {
        let contens =
          post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[0].childNodes[1];
        console.log(
          contens.childNodes[0].childNodes[1].childNodes[0].childNodes[1]
            .childNodes[0].childNodes
        );
        contens.childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes.forEach(
          (ele) => {
            if (ele.className == '') {
              posthref = ele.childNodes[0].childNodes[0].href;
              post_id = ele.childNodes[0].childNodes[0].href.split('/')[6];
            }
          }
        );
        contens.childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
          (element) => {
            if (element.nodeName == 'SPAN') {
              userhref = element.childNodes[0].childNodes[0].href
                ? element.childNodes[0].childNodes[0].href
                : element.childNodes[0].childNodes[0].childNodes[0].href;
              user_name = element.childNodes[0].innerText
                ? element.childNodes[0].innerText
                : element.childNodes[0].childNodes[0].childNodes[0].innerText;
              user_id = element.childNodes[0].childNodes[0].href
                ? element.childNodes[0].childNodes[0].href.split('/')[6]
                : element.childNodes[0].childNodes[0].childNodes[0].href.split(
                    '/'
                  )[6];
            }
          }
        );
        contens.childNodes[0].childNodes[2].childNodes.forEach(
          (element, index) => {
            if (index == 1) {
              if (
                element.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes.length == 2
              ) {
                checkitemlength =
                  element.childNodes[0].childNodes[0].childNodes[0]
                    .childNodes[0].childNodes[0].childNodes[1].childNodes[0]
                    .childNodes[1].childNodes[0].childNodes;
                if (checkitemlength.length == 7) {
                  if (checkitemlength[5].childNodes.length == 11) {
                    video.push(
                      checkitemlength[5].childNodes[7].childNodes[0].childNodes[0].childNodes[0].childNodes[0].href.split(
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
                      checkitemlength[4].childNodes[7].childNodes[0].childNodes[0].childNodes[0].childNodes[0].href.split(
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
                element.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes.length == 1
              ) {
                if (
                  element.childNodes[0].childNodes[0].childNodes[0]
                    .childNodes[0].childNodes[0].childNodes.length > 1
                ) {
                  for (
                    let j = 0;
                    j <
                    element.childNodes[0].childNodes[0].childNodes[0]
                      .childNodes[0].childNodes[0].childNodes.length;
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
                          element.childNodes[0].childNodes[0].childNodes[0]
                            .childNodes[0].childNodes[0].childNodes[j]
                            .childNodes[0].href
                        );
                  }
                } else {
                  element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                    function (element) {
                      if (
                        element.childNodes[0].childNodes[0].nodeName == 'IMG'
                      ) {
                        image_href.push(
                          element.childNodes[0].childNodes[0].currentSrc
                        );
                      } else {
                        if (element.childNodes.length == 3) {
                          for (let k = 0; k < element.childNodes.length; k++) {
                            image_href.push(
                              element.childNodes[0].childNodes[0].childNodes[0]
                                .childNodes[0].childNodes[0].href
                            );
                          }
                        } else {
                          element.childNodes.forEach(function (element) {
                            if (element.childNodes.length == 2) {
                              element.childNodes.forEach(function (element) {
                                image_href.push(
                                  element.childNodes[0].childNodes[0]
                                    .childNodes[0].href
                                );
                              });
                            } else {
                              image_href.push(
                                element.childNodes[0].childNodes[0].href
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
            if (index == 0) {
              console.log(element.childNodes);
              element.childNodes[0].childNodes.forEach(function (node) {
                if (node.nodeName == 'SPAN') {
                  content = node.childNodes[0].innerHTML;
                } else {
                  content = node.innerHTML;
                }
              });
            } else if (element.nodeName == 'BLOCKQUOTE') {
              content =
                element.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].innerHTML;
            }
          }
        );
        let divlikecomshare =
          post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[0].childNodes[1].childNodes[0];
        let likecomshare = '';
        let divcommment = '';
        if (divlikecomshare.childNodes.length == 5) {
          categori = divlikecomshare.childNodes[3].innerText;
        } else {
          categori = '';
        }

        if (
          post[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[0].childNodes[1].childNodes[0].childNodes.length == 5
        ) {
          likecomshare = divlikecomshare.childNodes[4].childNodes[0]
            .childNodes[0].childNodes[0].childNodes[0]
            ? divlikecomshare.childNodes[4].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[0]
            : undefined;
          divcommment =
            divlikecomshare.childNodes[4].childNodes[0].childNodes[0]
              .childNodes[1].childNodes;
        } else {
          likecomshare = divlikecomshare.childNodes[3].childNodes[0]
            .childNodes[0].childNodes[0].childNodes[0]
            ? divlikecomshare.childNodes[3].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[0]
            : undefined;
          divcommment =
            divlikecomshare.childNodes[3].childNodes[0].childNodes[0]
              .childNodes[1].childNodes;
        }

        if (likecomshare) {
          let likecomshares =
            likecomshare.childNodes[0].childNodes[0].childNodes;
          likecomshares.forEach((element, index) => {
            if (index == 0) {
              likes = element.childNodes
                ? element.childNodes[1].textContent.substring(
                    0,
                    element.childNodes[1].textContent.indexOf(' ')
                  )
                : '0';
            }
            if (index == 1) {
              count_comments = element.childNodes[1]
                ? element.childNodes[1].textContent.substring(
                    0,
                    element.childNodes[1].textContent.indexOf(' ')
                  )
                : '0';
              shares = element.childNodes[2]
                ? element.childNodes[2].textContent.substring(
                    0,
                    element.childNodes[1].textContent.indexOf(' ')
                  )
                : '0';
            }
          });
        }

        divcommment.forEach((element) => {
          if (element.nodeName == 'UL') {
            element.childNodes.forEach((elementss) => {
              try {
                if (elementss.childNodes[0].childNodes.length == 2) {
                  if (
                    elementss.childNodes[0].childNodes[1].childNodes[0]
                      .childNodes[0].childNodes[0].children[0].childNodes[0]
                      .childNodes[0].childNodes &&
                    elementss.childNodes[0].childNodes[1].childNodes[0]
                      .childNodes[0].childNodes[0].children[0].childNodes[0]
                      .childNodes[0].childNodes.nodeName == 'SPAN'
                  ) {
                    elementss.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].children[0].childNodes[0].childNodes[0].childNodes.forEach(
                      (elementsss, index) => {
                        if (elementsss.nodeName == 'SPAN' && index == 0) {
                          user_cmt_href =
                            elementsss.childNodes[0].childNodes[0].href;
                          user_name_cmt =
                            elementsss.childNodes[0].childNodes[0].innerText;
                          user_cmt_id =
                            elementsss.childNodes[0].childNodes[0].href.split(
                              '/'
                            )[6];
                        } else if (elementsss.nodeName == 'DIV') {
                          for (
                            let l = 0;
                            l < elementsss.childNodes[0].childNodes.length;
                            l++
                          ) {
                            cotent_cmt +=
                              elementsss.childNodes[0].childNodes[l].innerHTML;
                          }
                        }
                      }
                    );
                  }
                  // comment mới nhất hay chưa đọc
                  elementss.childNodes[0].childNodes[1].childNodes[1].childNodes.forEach(
                    (element, index) => {
                      if (index == 1 && element.className == '') {
                        diw_newcmt =
                          elementss.childNodes[0].childNodes[1].childNodes[1]
                            .childNodes[1];
                      } else if (index == 1 && element.className !== '') {
                        diw_newcmt =
                          elementss.childNodes[0].childNodes[1].childNodes[1]
                            .childNodes[0];
                      }
                    }
                  );

                  if (
                    diw_newcmt.childNodes[0].childNodes[0].childNodes[0]
                      .childNodes.length > 1 &&
                    elementss.childNodes[0].childNodes[1].childNodes[0]
                      .childNodes[0].childNodes[0].children[0].childNodes[0]
                      .childNodes[0].childNodes[0].nodeName !== 'SPAN'
                  ) {
                    elementss.childNodes[0].childNodes[1].childNodes[1].childNodes.forEach(
                      (elementsss, index) => {
                        if (elementsss.nodeName == 'DIV' && index == 1) {
                          if (elementsss.childNodes[0].childNodes.length > 1) {
                            count_like_cmt =
                              elementsss.childNodes[0].childNodes[1]
                                .innerText == ''
                                ? 1
                                : elementsss.childNodes[0].childNodes[1]
                                    .innerText;
                          }
                          imgComment =
                            elementsss.childNodes[0].childNodes[0].childNodes[0]
                              .childNodes[0].childNodes[0].href;
                        }
                      }
                    );
                    // đếm like comment
                    if (
                      diw_newcmt.childNodes[0].childNodes[0].childNodes.length >
                      1
                    ) {
                      if (
                        diw_newcmt.childNodes[0].childNodes[0].childNodes[1]
                          .innerText == ''
                      ) {
                        count_like_cmt = 1;
                      } else {
                        count_like_cmt =
                          diw_newcmt.childNodes[0].childNodes[0].childNodes[1]
                            .innerText;
                      }
                    }
                    diw_newcmt.childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                      (cmt, index) => {
                        if (cmt.nodeName == 'SPAN' && index == 0) {
                          user_cmt_href = cmt.childNodes[0].childNodes[0].href;
                          user_name_cmt =
                            cmt.childNodes[0].childNodes[0].innerText;
                          user_cmt_id =
                            cmt.childNodes[0].childNodes[0].href.split('/')[6];
                        } else if (cmt.nodeName == 'DIV') {
                          for (
                            let l = 0;
                            l < cmt.childNodes[0].childNodes.length;
                            l++
                          ) {
                            cotent_cmt +=
                              cmt.childNodes[0].childNodes[l].innerHTML;
                          }
                        }
                      }
                    );
                  } else if (
                    diw_newcmt.childNodes[0].childNodes[0].childNodes[0]
                      .childNodes.length == 1 &&
                    elementss.childNodes[0].childNodes[1].childNodes[0]
                      .childNodes[0].childNodes[0].children[0].childNodes[0]
                      .childNodes[0].childNodes[0].nodeName !== 'SPAN'
                  ) {
                    // đếm like comment
                    if (
                      diw_newcmt.childNodes[0].childNodes[0].childNodes.length >
                      1
                    ) {
                      count_like_cmt =
                        diw_newcmt.childNodes[0].childNodes[0].childNodes[1]
                          .innerText == ''
                          ? 1
                          : (count_like_cmt =
                              diw_newcmt.childNodes[0].childNodes[0]
                                .childNodes[1].innerText);
                    }

                    elementss.childNodes[0].childNodes[1].childNodes[1].childNodes.forEach(
                      (elementsss, index) => {
                        if (elementsss.nodeName == 'DIV' && index == 1) {
                          //console.log('1', elementsss);
                          imgComment =
                            elementsss.childNodes[0].childNodes[0].childNodes[0]
                              .childNodes[0].childNodes[0].href;
                        }
                      }
                    );
                    diw_newcmt.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                      (child, index) => {
                        if (child.nodeName == 'SPAN' && index == 0) {
                          user_cmt_href =
                            child.childNodes[0].childNodes[0].href;
                          user_name_cmt =
                            child.childNodes[0].childNodes[0].innerText;
                          user_cmt_id =
                            child.childNodes[0].childNodes[0].href.split(
                              '/'
                            )[6];
                        } else if (child.nodeName == 'DIV') {
                          for (
                            let l = 0;
                            l < child.childNodes[0].childNodes.length;
                            l++
                          ) {
                            cotent_cmt +=
                              child.childNodes[0].childNodes[l].innerHTML;
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
                    elementss.childNodes[0].childNodes[1].childNodes[0]
                      .childNodes[0].childNodes[0].children[0].childNodes[0]
                      .childNodes[0].childNodes[0].nodeName == 'SPAN'
                  ) {
                    if (
                      elementss.childNodes[1].childNodes[0].childNodes.length >
                      0
                    ) {
                      elementss.childNodes[1].childNodes[0].childNodes.forEach(
                        (cmt_old) => {
                          if (cmt_old.nodeName == 'UL') {
                            for (
                              let m = 0;
                              m < cmt_old.childNodes.length;
                              m++
                            ) {
                              try {
                                cmt_old.childNodes[
                                  m
                                ].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                                  (child, index) => {
                                    if (
                                      child.nodeName == 'SPAN' &&
                                      index == 0
                                    ) {
                                      user_cmtchild_href =
                                        child.childNodes[0].childNodes[0].href;
                                      user_name_cmtchild =
                                        child.childNodes[0].childNodes[0]
                                          .innerText;
                                      user_cmtchild_id =
                                        child.childNodes[0].childNodes[0].href.split(
                                          '/'
                                        )[6];
                                    } else if (child.nodeName == 'DIV') {
                                      for (
                                        let l = 0;
                                        l <
                                        child.childNodes[0].childNodes.length;
                                        l++
                                      ) {
                                        cotent_cmtchild +=
                                          child.childNodes[0].childNodes[l]
                                            .innerHTML;
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
                                    '';
                              } catch (e) {
                                console.log('children error');
                                console.log(e);
                              }
                            }
                          }
                        }
                      );
                    }
                  } else {
                    elementss.childNodes[1].childNodes[0].childNodes.forEach(
                      (elementsss) => {
                        if (elementsss.nodeName == 'UL') {
                          for (
                            let m = 0;
                            m < elementsss.childNodes.length;
                            m++
                          ) {
                            try {
                              // thử comment_child mới có thêm 1 thẻ div
                              if (
                                elementsss.childNodes[m].childNodes.length == 3
                              ) {
                                children_div = elementsss.childNodes[m]
                                  .childNodes[1].childNodes[
                                  elementsss.childNodes[m].childNodes[0]
                                    .childNodes.length - 1
                                ].childNodes[1].childNodes[0].childNodes[0]
                                  ? elementsss.childNodes[m].childNodes[1]
                                      .childNodes[
                                      elementsss.childNodes[m].childNodes[0]
                                        .childNodes.length - 1
                                    ].childNodes[1].childNodes[0].childNodes[0]
                                      .childNodes[0].childNodes[0].childNodes
                                  : elementsss.childNodes[m].childNodes[1]
                                      .childNodes[
                                      elementsss.childNodes[m].childNodes[0]
                                        .childNodes.length - 1
                                    ].childNodes[1].childNodes[1].childNodes[0]
                                      .childNodes[0].childNodes[0].childNodes;
                              } else {
                                children_div = elementsss.childNodes[m]
                                  .childNodes[0].childNodes[
                                  elementsss.childNodes[m].childNodes[0]
                                    .childNodes.length - 1
                                ].childNodes[1].childNodes[0].childNodes[0]
                                  ? elementsss.childNodes[m].childNodes[0]
                                      .childNodes[
                                      elementsss.childNodes[m].childNodes[0]
                                        .childNodes.length - 1
                                    ].childNodes[1].childNodes[0].childNodes[0]
                                      .childNodes[0].childNodes[0].childNodes
                                  : elementsss.childNodes[m].childNodes[0]
                                      .childNodes[
                                      elementsss.childNodes[m].childNodes[0]
                                        .childNodes.length - 1
                                    ].childNodes[1].childNodes[1].childNodes[0]
                                      .childNodes[0].childNodes[0].childNodes;
                              }
                              // cmt cũ có hình ảnh
                              if (
                                children_div[0].parentNode.parentNode.parentNode
                                  .parentNode.parentNode.childNodes.length == 3
                              ) {
                                imgComment_cmt =
                                  children_div[0].parentNode.parentNode
                                    .parentNode.parentNode.parentNode
                                    .childNodes[1].childNodes[0].childNodes[0]
                                    .childNodes[0].childNodes.length > 2
                                    ? children_div[0].parentNode.parentNode
                                        .parentNode.parentNode.parentNode
                                        .childNodes[1].childNodes[0]
                                        .childNodes[0].childNodes[0]
                                        .childNodes[0].childNodes[0].href
                                    : 'không phải hình ';
                                if (
                                  children_div[0].parentNode.parentNode
                                    .parentNode.parentNode.parentNode
                                    .childNodes[1].childNodes[0].childNodes[1]
                                ) {
                                  count_like_cmtchild =
                                    children_div[0].parentNode.parentNode
                                      .parentNode.parentNode.parentNode
                                      .childNodes[1].childNodes[0].childNodes[1]
                                      .innerText == ''
                                      ? 1
                                      : children_div[0].parentNode.parentNode
                                          .parentNode.parentNode.parentNode
                                          .childNodes[1].childNodes[0]
                                          .childNodes[1].innerText;
                                }
                                // cmt_mới có hình ảnh
                              } else if (
                                children_div[0].parentNode.parentNode.parentNode
                                  .parentNode.parentNode.childNodes.length == 4
                              ) {
                                imgComment_cmt =
                                  children_div[0].parentNode.parentNode
                                    .parentNode.parentNode.parentNode
                                    .childNodes[2].childNodes[0].childNodes[0]
                                    .childNodes[0].childNodes.length > 2
                                    ? children_div[0].parentNode.parentNode
                                        .parentNode.parentNode.parentNode
                                        .childNodes[2].childNodes[0]
                                        .childNodes[0].childNodes[0]
                                        .childNodes[0].childNodes[0].href
                                    : 'không phải hình';
                                if (
                                  children_div[0].parentNode.parentNode
                                    .parentNode.parentNode.parentNode
                                    .childNodes[2].childNodes[0].childNodes[1]
                                ) {
                                  count_like_cmtchild =
                                    children_div[0].parentNode.parentNode
                                      .parentNode.parentNode.parentNode
                                      .childNodes[2].childNodes[0].childNodes[1]
                                      .innerText == ''
                                      ? 1
                                      : children_div[0].parentNode.parentNode
                                          .parentNode.parentNode.parentNode
                                          .childNodes[2].childNodes[0]
                                          .childNodes[1].innerText;
                                }
                                // đếm like khi không có hình
                              } else {
                                if (
                                  children_div[0].parentNode.parentNode
                                    .childNodes.length > 1
                                ) {
                                  count_like_cmtchild =
                                    children_div[0].parentNode.parentNode
                                      .childNodes[1].innerText == ''
                                      ? 1
                                      : children_div[0].parentNode.parentNode
                                          .childNodes[1].innerText;
                                }
                              }
                              // lấy thông tin cmt
                              if (children_div.length > 1) {
                                children_div.forEach((child, index) => {
                                  if (child.nodeName == 'SPAN' && index == 0) {
                                    user_cmtchild_href =
                                      child.childNodes[0].childNodes[0].href;
                                    user_name_cmtchild =
                                      child.childNodes[0].childNodes[0]
                                        .innerText;
                                    user_cmtchild_id =
                                      child.childNodes[0].childNodes[0].href.split(
                                        '/'
                                      )[6];
                                  } else if (child.nodeName == 'DIV') {
                                    for (
                                      let l = 0;
                                      l < child.childNodes[0].childNodes.length;
                                      l++
                                    ) {
                                      cotent_cmtchild +=
                                        child.childNodes[0].childNodes[l]
                                          .innerHTML;
                                    }
                                  }
                                });
                              } else {
                                children_div[0].childNodes[0].childNodes.forEach(
                                  (child, index) => {
                                    if (
                                      child.nodeName == 'SPAN' &&
                                      index == 0
                                    ) {
                                      user_cmtchild_href =
                                        child.childNodes[0].childNodes[0].href;
                                      user_name_cmtchild =
                                        child.childNodes[0].childNodes[0]
                                          .innerText;
                                      user_cmtchild_id =
                                        child.childNodes[0].childNodes[0].href.split(
                                          '/'
                                        )[6];
                                    } else if (child.nodeName == 'DIV') {
                                      for (
                                        let l = 0;
                                        l <
                                        child.childNodes[0].childNodes.length;
                                        l++
                                      ) {
                                        cotent_cmtchild +=
                                          child.childNodes[0].childNodes[l]
                                            .innerHTML;
                                      }
                                    }
                                  }
                                );
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
                                count_like_cmtchild =
                                imgComment_cmt =
                                  '';

                              if (
                                elementsss.childNodes[m].childNodes[1] &&
                                elementsss.childNodes[m].childNodes[1]
                                  .className == ''
                              ) {
                                children2 =
                                  elementsss.childNodes[m].childNodes[1]
                                    .childNodes[0].childNodes;
                                for (let n = 0; n < children2.length; n++) {
                                  try {
                                    children22 =
                                      children2[n].childNodes[0].childNodes[
                                        children2[n].childNodes[0].childNodes
                                          .length - 1
                                      ].childNodes[1].childNodes;
                                    children22.forEach((element, index) => {
                                      // kiểm tra comments mới có thì index = 1
                                      if (
                                        element.className == '' &&
                                        index == 1
                                      ) {
                                        // lấy thông tin child2 cmt
                                        element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                                          (child, index) => {
                                            if (
                                              child.nodeName == 'SPAN' &&
                                              index == 0
                                            ) {
                                              user_cmtchild_href =
                                                child.childNodes[0]
                                                  .childNodes[0].href;
                                              user_name_cmtchild =
                                                child.childNodes[0]
                                                  .childNodes[0].innerText;
                                              user_cmtchild_id =
                                                child.childNodes[0].childNodes[0].href.split(
                                                  '/'
                                                )[6];
                                            } else if (
                                              child.nodeName == 'DIV'
                                            ) {
                                              cotent_cmtchild =
                                                child.childNodes[0]
                                                  .childNodes[0].innerHTML;
                                            }
                                          }
                                        );
                                        // đếm like khi có hình
                                        if (
                                          element.nodeName == 'DIV' &&
                                          index == 2
                                        ) {
                                          if (
                                            children22[2].childNodes[0]
                                              .childNodes.length > 1
                                          ) {
                                            count_like_cmtchild =
                                              children22[1].childNodes[0]
                                                .childNodes[1].innerText == ''
                                                ? 1
                                                : children22[1].childNodes[0]
                                                    .childNodes[1].innerText;
                                          }
                                          imgComment_cmt = children22[1]
                                            .childNodes[0].childNodes[1]
                                            .childNodes[0].childNodes[0]
                                            .childNodes[0].childNodes[0]
                                            .childNodes[0].href
                                            ? children22[1].childNodes[0]
                                                .childNodes[1].childNodes[0]
                                                .childNodes[0].childNodes[0]
                                                .childNodes[0].childNodes[0]
                                                .href
                                            : '';
                                        } else {
                                          console.log('aaaaa', children22);
                                          // đếm like khi không có hình
                                          // if (
                                          //   children22[0].childNodes[0]
                                          //     .childNodes[0].childNodes.length >
                                          //   1
                                          // ) {
                                          //   count_like_cmtchild =
                                          //     children22[0].childNodes[0]
                                          //       .childNodes[0].childNodes[1]
                                          //       .innerText == ''
                                          //       ? 1
                                          //       : children22[0].childNodes[0]
                                          //           .childNodes[0].childNodes[1]
                                          //           .innerText;
                                          // }
                                        }
                                        // kiểm tra comments child 2 mới không thì làm dưới
                                      } else if (
                                        index == 1 &&
                                        element.className !== ''
                                      ) {
                                        // đếm like khi có hình
                                        if (children22.length > 2) {
                                          if (
                                            children22[1].childNodes[0]
                                              .childNodes.length > 1
                                          ) {
                                            count_like_cmtchild =
                                              children22[1].childNodes[0]
                                                .childNodes[1].innerText == ''
                                                ? 1
                                                : children22[1].childNodes[0]
                                                    .childNodes[1].innerText;
                                          }
                                          imgComment_cmt = children22[1]
                                            .childNodes[0].childNodes[0]
                                            .childNodes[0].childNodes[0]
                                            .childNodes[0].href
                                            ? children22[1].childNodes[0]
                                                .childNodes[0].childNodes[0]
                                                .childNodes[0].childNodes[0]
                                                .href
                                            : '';
                                          // lấy thông tin khi có hình
                                          children22[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                                            (child, index) => {
                                              if (
                                                child.nodeName == 'SPAN' &&
                                                index == 0
                                              ) {
                                                user_cmtchild_href =
                                                  child.childNodes[0]
                                                    .childNodes[0].href;
                                                user_name_cmtchild =
                                                  child.childNodes[0]
                                                    .childNodes[0].innerText;
                                                user_cmtchild_id =
                                                  child.childNodes[0].childNodes[0].href.split(
                                                    '/'
                                                  )[6];
                                              } else if (
                                                child.nodeName == 'DIV'
                                              ) {
                                                cotent_cmtchild =
                                                  child.childNodes[0]
                                                    .childNodes[0].innerHTML;
                                              }
                                            }
                                          );
                                        } else {
                                          // đếm like khi không có hình
                                          if (
                                            children22[0].childNodes[0]
                                              .childNodes[0].childNodes.length >
                                            1
                                          ) {
                                            count_like_cmtchild =
                                              children22[0].childNodes[0]
                                                .childNodes[0].childNodes[1]
                                                .innerText == ''
                                                ? 1
                                                : children22[0].childNodes[0]
                                                    .childNodes[0].childNodes[1]
                                                    .innerText;
                                          }
                                          // lấy thông tin cmt child 2
                                          children22[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                                            (child, index) => {
                                              if (
                                                child.nodeName == 'SPAN' &&
                                                index == 0
                                              ) {
                                                user_cmtchild_href =
                                                  child.childNodes[0]
                                                    .childNodes[0].href;
                                                user_name_cmtchild =
                                                  child.childNodes[0]
                                                    .childNodes[0].innerText;
                                                user_cmtchild_id =
                                                  child.childNodes[0].childNodes[0].href.split(
                                                    '/'
                                                  )[6];
                                              } else if (
                                                child.nodeName == 'DIV'
                                              ) {
                                                cotent_cmtchild =
                                                  child.childNodes[0]
                                                    .childNodes[0].innerHTML;
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
                                      count_like_cmtchild =
                                      imgComment_cmt =
                                        '';
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
                      }
                    );
                  }
                } else {
                  console.log(
                    'cmt _1 ',
                    elementss.childNodes[0].childNodes[0].childNodes[1]
                  );
                  if (
                    elementss.childNodes[0].childNodes[0].childNodes[1]
                      .childNodes[0].childNodes[0]
                  ) {
                    divcommment =
                      elementss.childNodes[0].childNodes[0].childNodes[1]
                        .childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                        .childNodes;
                    if (
                      elementss.childNodes[0].childNodes[0].childNodes[1]
                        .childNodes.length > 2
                    ) {
                      if (
                        elementss.childNodes[0].childNodes[0].childNodes[1]
                          .childNodes[1].childNodes[0].childNodes.length == 2
                      ) {
                        count_like_cmt =
                          elementss.childNodes[0].childNodes[0].childNodes[1]
                            .childNodes[1].childNodes[0].childNodes[1]
                            .innerText == ''
                            ? 1
                            : elementss.childNodes[0].childNodes[0]
                                .childNodes[1].childNodes[1].childNodes[0]
                                .childNodes[1].innerText;
                      }
                      imgComment =
                        elementss.childNodes[0].childNodes[0].childNodes[1]
                          .childNodes[1].childNodes[0].childNodes[0]
                          .childNodes[0].childNodes[0].childNodes[0].href;
                    }
                    if (
                      elementss.childNodes[0].childNodes[0].childNodes[1]
                        .childNodes[0].childNodes[0].childNodes[0].childNodes
                        .length == 2
                    ) {
                      count_like_cmt = elementss.childNodes[0].childNodes[0]
                        .childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                        .childNodes[1].innerText
                        ? elementss.childNodes[0].childNodes[0].childNodes[1]
                            .childNodes[0].childNodes[0].childNodes[0]
                            .childNodes[1].innerText
                        : 1;
                    } else {
                      count_like_cmt = 0;
                    }
                  } else {
                    // cmt mới
                    divcommment =
                      elementss.childNodes[0].childNodes[0].childNodes[1]
                        .childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                        .childNodes;
                    if (
                      elementss.childNodes[0].childNodes[0].childNodes[1]
                        .childNodes[2].nodeName == 'DIV'
                    ) {
                      imgComment =
                        elementss.childNodes[0].childNodes[0].childNodes[1]
                          .childNodes[2].childNodes[0].childNodes[0]
                          .childNodes[0].childNodes[0].childNodes[0].href;
                      if (
                        elementss.childNodes[0].childNodes[0].childNodes[1]
                          .childNodes[2].childNodes[0].childNodes[1]
                      ) {
                        count_like_cmt =
                          elementss.childNodes[0].childNodes[0].childNodes[1]
                            .childNodes[2].childNodes[0].childNodes[1]
                            .innerText == ''
                            ? 1
                            : elementss.childNodes[0].childNodes[0]
                                .childNodes[1].childNodes[2].childNodes[0]
                                .childNodes[1].innerText;
                      }
                    } else {
                      if (
                        elementss.childNodes[0].childNodes[0].childNodes[1]
                          .childNodes[1].childNodes[0].childNodes[0]
                          .childNodes[1]
                      ) {
                        count_like_cmt =
                          elementss.childNodes[0].childNodes[0].childNodes[1]
                            .childNodes[1].childNodes[0].childNodes[0]
                            .childNodes[1].innerText == ''
                            ? 1
                            : elementss.childNodes[0].childNodes[0]
                                .childNodes[1].childNodes[1].childNodes[0]
                                .childNodes[0].childNodes[1].innerText;
                      }
                    }
                  }

                  if (divcommment.length > 1) {
                    divcommment.forEach((element, index) => {
                      if (element.nodeName == 'SPAN' && index == 0) {
                        user_cmt_href =
                          element.childNodes[0].childNodes[0].href;
                        user_name_cmt =
                          element.childNodes[0].childNodes[0].innerText;
                        user_cmt_id =
                          element.childNodes[0].childNodes[0].href.split(
                            '/'
                          )[6];
                      } else if (element.nodeName == 'DIV') {
                        for (
                          let l = 0;
                          l < element.childNodes[0].childNodes.length;
                          l++
                        ) {
                          cotent_cmt +=
                            element.childNodes[0].childNodes[l].innerHTML;
                        }
                      }
                    });
                  } else if (divcommment.length == 1) {
                    divcommment[0].childNodes[0].childNodes.forEach(
                      (element, index) => {
                        if (element.nodeName == 'SPAN' && index == 0) {
                          user_cmt_href =
                            element.childNodes[0].childNodes[0].href;
                          user_name_cmt =
                            element.childNodes[0].childNodes[0].innerText;
                          user_cmt_id =
                            element.childNodes[0].childNodes[0].href.split(
                              '/'
                            )[6];
                        } else if (element.nodeName == 'DIV') {
                          for (
                            let l = 0;
                            l < element.childNodes[0].childNodes.length;
                            l++
                          ) {
                            cotent_cmt +=
                              element.childNodes[0].childNodes[l].innerHTML;
                          }
                        }
                      }
                    );
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
                cotent_cmt =
                  user_cmt_id =
                  user_name_cmt =
                  user_cmt_href =
                  imgComment =
                  count_like_cmt =
                  count_like_cmtchild =
                    '';
                children = [];
              } catch (error) {
                console.log('error cmt');
                console.log(error);
              }
            });
          }
        });

        data.push({
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
        });
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
        console.error(error);
      }
    }

    return data;
  }, length);
  return dimension;
}
