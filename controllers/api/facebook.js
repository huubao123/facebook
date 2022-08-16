const puppeteer = require('puppeteer');
const fs = require('fs');
const { request, globalAgent } = require('http');
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
        document
          .querySelectorAll(
            '.oajrlxb2.g5ia77u1.mtkw9kbi.tlpljxtp.qensuy8j.ppp5ayq2.goun2846.ccm00jje.s44p3ltw.mk2mc5f4.rt8b4zig.n8ej3o3l.agehan2d.sk4xxmp2.rq0escxv.nhd2j8a9.mg4g778l.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.tgvbjcpo.hpfvmrgz.jb3vyjys.qt6c0cv9.a8nywdso.l9j0dhe7.i1ao9s8h.esuyzwwr.f1sip0of.du4w35lb.n00je7tq.arfg74bv.qs9ysxi8.k77z8yql.pq6dq46d.btwxx1t3.abiwlrkh.lzcic4wl.bp9cbjyn.m9osqain.buofh1pr.g5gj957u.p8fzw8mz.gpro0wi8'
          )
          .forEach((el) => el.click());
        document
          .querySelectorAll('.j83agx80.buofh1pr.jklb3kyz.l9j0dhe7')
          .forEach((el) => el.click());
        document
          .querySelectorAll(
            '.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.gpro0wi8.oo9gr5id.lrazzd5p'
          )
          .forEach((el) => {
            if (el.nodeName == 'DIV') {
              el.click();
            }
          }); // document.querySelector('[aria-label="OK"]').click();

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
      '--single-process',
    ],
    // headless: false,
    // defaultViewport: null,
    // args: ['--start-maximized'],
    // product: 'chrome',
    // devtools: true,
    // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  res.json('đợi tí rồi chuyển thành get rồi lấy data nha');

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
  await page.waitForTimeout(3000);
  await page.goto(url, {
    //https://www.facebook.com/groups/j2team.community.girls
    //https://www.facebook.com/groups/364997627165697
    waitUntil: 'load',
  });
  await autoScroll(page, (length = lengths));
  console.log('scroll done');
  await takedata(page, (length = lengths)).then(async function (result) {
    // res.json('done');
    fs.writeFile(`item.txt`, JSON.stringify(result, null, 2), function (err) {
      if (err) throw err;
    });
  });

  await browser.close();
};
async function takedata(page, length) {
  const dimension = await page.evaluate(async (length) => {
    post = document.querySelectorAll('[role="feed"]')[0].childNodes;
    let video = new Array();
    let image_href = new Array();
    let commmets = new Array();
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
        contens.childNodes[0].childNodes[2].childNodes.forEach(function (
          element
        ) {
          if (element.className == 'l9j0dhe7') {
            if (
              element.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes.length == 2
            ) {
              checkitemlength =
                element.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[1].childNodes[0].childNodes[1]
                  .childNodes[0].childNodes;
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
                element.childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes.length > 1
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
                    if (element.childNodes[0].childNodes[0].nodeName == 'IMG') {
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
          if (
            element.className == '' ||
            element.className == 'ecm0bbzt hv4rvrfc ihqw7lf3 dati1w0a' ||
            element.className == 'dati1w0a ihqw7lf3 hv4rvrfc ecm0bbzt'
          ) {
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
        });
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
          likecomshares.forEach((element) => {
            if (
              element.className ==
              'bp9cbjyn j83agx80 buofh1pr ni8dbmo4 stjgntxs'
            ) {
              likes = element.childNodes
                ? element.childNodes[1].textContent.substring(
                    0,
                    element.childNodes[1].textContent.indexOf(' ')
                  )
                : '0';
            }
            if (element.className == 'bp9cbjyn j83agx80 pfnyh3mw p1ueia1e') {
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

        try {
          divcommment.forEach((element) => {
            if (element.nodeName == 'UL') {
              element.childNodes.forEach((elementss) => {
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
                          cotent_cmt =
                            elementsss.childNodes[0].childNodes[0].innerHTML;
                        }
                      }
                    );
                  }

                  if (
                    elementss.childNodes[0].childNodes[1].childNodes[1]
                      .childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                      .childNodes.length > 1 &&
                    elementss.childNodes[0].childNodes[1].childNodes[0]
                      .childNodes[0].childNodes[0].children[0].childNodes[0]
                      .childNodes[0].childNodes[0].nodeName !== 'SPAN'
                  ) {
                    elementss.childNodes[0].childNodes[1].childNodes[1].childNodes.forEach(
                      (elementsss, index) => {
                        if (elementsss.nodeName == 'DIV' && index == 1) {
                          imgComment =
                            elementsss.childNodes[0].childNodes[0].childNodes[0]
                              .childNodes[0].childNodes[0].href;
                        }
                      }
                    );
                    elementss.childNodes[0].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
                      (cmt, index) => {
                        if (cmt.nodeName == 'SPAN' && index == 0) {
                          user_cmt_href = cmt.childNodes[0].childNodes[0].href;
                          user_name_cmt =
                            cmt.childNodes[0].childNodes[0].innerText;
                          user_cmt_id =
                            cmt.childNodes[0].childNodes[0].href.split('/')[6];
                        } else if (cmt.nodeName == 'DIV') {
                          cotent_cmt =
                            cmt.childNodes[0].childNodes[0].innerHTML;
                        }
                      }
                    );
                  } else if (
                    elementss.childNodes[0].childNodes[1].childNodes[1]
                      .childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                      .childNodes.length == 1 &&
                    elementss.childNodes[0].childNodes[1].childNodes[0]
                      .childNodes[0].childNodes[0].children[0].childNodes[0]
                      .childNodes[0].childNodes[0].nodeName !== 'SPAN'
                  ) {
                    elementss.childNodes[0].childNodes[1].childNodes[1].childNodes.forEach(
                      (elementsss, index) => {
                        if (elementsss.nodeName == 'DIV' && index == 1) {
                          imgComment =
                            elementsss.childNodes[0].childNodes[0].childNodes[0]
                              .childNodes[0].childNodes[0].href;
                        }
                      }
                    );
                    elementss.childNodes[0].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.forEach(
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
                          cotent_cmt =
                            child.childNodes[0].childNodes[0].innerHTML;
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
                                // console.log(cmt_old.childNodes[m].childNodes[0].childNodes[1].childNodes)
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
                                      cotent_cmtchild =
                                        child.childNodes[0].childNodes[0]
                                          .innerHTML;
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
                                  user_cmtchild_href: user_cmtchild_href
                                    ? user_cmtchild_href
                                    : '',
                                  user_name_cmtchild: user_name_cmtchild
                                    ? user_name_cmtchild
                                    : '',
                                  user_cmtchild_id: user_cmtchild_id
                                    ? user_cmtchild_id
                                    : '',
                                  cotent_cmtchild: cotent_cmtchild
                                    ? cotent_cmtchild
                                    : '',
                                });
                                user_cmtchild_href =
                                  user_name_cmtchild =
                                  user_cmtchild_id =
                                  cotent_cmtchild =
                                    '';
                              } catch (e) {
                                console.log('children error');
                                console.log(e);
                                children.push({
                                  user_cmtchild_href: user_cmtchild_href
                                    ? user_cmtchild_href
                                    : '',
                                  user_name_cmtchild: user_name_cmtchild
                                    ? user_name_cmtchild
                                    : '',
                                  user_cmtchild_id: user_cmtchild_id
                                    ? user_cmtchild_id
                                    : '',
                                  cotent_cmtchild: cotent_cmtchild
                                    ? cotent_cmtchild
                                    : '',
                                  statusbar_cmtchild: '',
                                });
                                user_cmtchild_href =
                                  user_name_cmtchild =
                                  user_cmtchild_id =
                                  cotent_cmtchild =
                                    '';
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

                              if (
                                children_div[0].parentNode.parentNode.parentNode
                                  .parentNode.parentNode.childNodes.length > 2
                              ) {
                                if (
                                  children_div[0].parentNode.parentNode
                                    .parentNode.parentNode.parentNode
                                    .childNodes[1].childNodes[0].childNodes
                                    .length > 1
                                ) {
                                  imgComment_cmt =
                                    children_div[0].parentNode.parentNode
                                      .parentNode.parentNode.parentNode
                                      .childNodes[1].childNodes[0].childNodes[0]
                                      .childNodes[0].childNodes[0].childNodes[0]
                                      .href;
                                  count_like_cmtchild =
                                    children_div[0].parentNode.parentNode
                                      .parentNode.parentNode.parentNode
                                      .childNodes[1].childNodes[0].childNodes[1]
                                      .childNodes[0].childNodes[0].childNodes[0]
                                      .childNodes[0].innerHTML;
                                }
                              }
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
                                    cotent_cmtchild =
                                      child.childNodes[0].childNodes[0]
                                        .innerHTML;
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
                                      cotent_cmtchild =
                                        child.childNodes[0].childNodes[0]
                                          .innerHTML;
                                    }
                                  }
                                );
                              }
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
                                user_cmtchild_href: user_cmtchild_href
                                  ? user_cmtchild_href
                                  : '',
                                user_name_cmtchild: user_name_cmtchild
                                  ? user_name_cmtchild
                                  : '',
                                user_cmtchild_id: user_cmtchild_id
                                  ? user_cmtchild_id
                                  : '',
                                cotent_cmtchild: cotent_cmtchild
                                  ? cotent_cmtchild
                                  : '',
                                imgComment: imgComment_cmt
                                  ? imgComment_cmt
                                  : '',
                                count_like: count_like_cmtchild
                                  ? count_like_cmtchild
                                  : '',
                              });
                              user_cmtchild_href =
                                user_name_cmtchild =
                                user_cmtchild_id =
                                cotent_cmtchild =
                                imgComment_cmt =
                                count_like_cmtchild =
                                  '';
                              ('');
                            } catch (e) {
                              console.log('children error');
                              console.log(e);
                              children.push({
                                user_cmtchild_href: user_cmtchild_href
                                  ? user_cmtchild_href
                                  : '',
                                user_name_cmtchild: user_name_cmtchild
                                  ? user_name_cmtchild
                                  : '',
                                user_cmtchild_id: user_cmtchild_id
                                  ? user_cmtchild_id
                                  : '',
                                cotent_cmtchild: cotent_cmtchild
                                  ? cotent_cmtchild
                                  : '',
                                imgComment: imgComment_cmt
                                  ? imgComment_cmt
                                  : '',
                                count_like: count_like_cmtchild
                                  ? count_like_cmtchild
                                  : '',

                                statusbar_cmtchild: '',
                              });
                              user_cmtchild_href =
                                user_name_cmtchild =
                                user_cmtchild_id =
                                imgComment_cmt =
                                count_like_cmtchild =
                                cotent_cmtchild =
                                  '';
                            }
                          }
                        }
                      }
                    );
                  }
                } else {
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
                        .childNodes.length == 3
                    ) {
                      if (
                        elementss.childNodes[0].childNodes[0].childNodes[1]
                          .childNodes[1].childNodes[0].childNodes.length == 2
                      ) {
                        count_like_cmt = elementss.childNodes[0].childNodes[0]
                          .childNodes[1].childNodes[1].childNodes[0]
                          .childNodes[1].innerText
                          ? elementss.childNodes[0].childNodes[0].childNodes[1]
                              .childNodes[1].childNodes[0].childNodes[1]
                              .innerText
                          : 1;
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
                    divcommment =
                      elementss.childNodes[0].childNodes[0].childNodes[1]
                        .childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                        .childNodes;
                    count_like_cmt = 0;
                  }

                  // console.log([1].childNodes[0].childNodes[0].childNodes[0].childNodes
                  // elementss.childNodes[0].childNodes[0].childNodes
                  //[1].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes
                  //);
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
                        cotent_cmt =
                          element.childNodes[0].childNodes[0].innerHTML;
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
                          cotent_cmt =
                            element.childNodes[0].childNodes[0].innerHTML;
                        }
                      }
                    );
                  }
                }
                commmets.push({
                  content: cotent_cmt,
                  user_name_cmt: user_name_cmt,
                  user_cmt_id: user_cmt_id,
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
                    '';
                children = [];
              });
            }
          });
        } catch (error) {
          console.log('error cmt');
          console.log(error);
          commmets.push({
            content: cotent_cmt ? cotent_cmt : '',
            user_name_cmt: user_name_cmt ? user_name_cmt : '',
            user_cmt_id: user_cmt_id ? user_cmt_id : '',
            user_cmt_href: user_cmt_href ? user_cmt_href : '',
            children: children ? children : [],
            imgComment: imgComment ? imgComment : '',
            count_like: count_like_cmt ? count_like_cmt : '',
            statusbar_cmt: '',
          });
          cotent_cmt =
            user_cmt_id =
            user_name_cmt =
            user_cmt_href =
            imgComment =
              '';
          children = [];
        }

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
          posthref: posthref ? posthref : '',
          video: video ? video : '',
          featured_image: image_href ? image_href : '',
          commmets: commmets ? commmets : [],
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
        commmets = [];
        image_href = [];
      } catch (error) {
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
          posthref: posthref ? posthref : '',
          video: video ? video : '',
          featured_image: image_href ? image_href : '',
          commmets: commmets ? commmets : [],
          statusbar: 'error',
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
        commmets = [];
        image_href = [];
      }
    }

    return data;
  }, length);
  return dimension;
}
