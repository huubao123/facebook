const puppeteer = require('puppeteer');
const fs = require('fs');
// let config = require('./config.json');
const e = require('express');
async function autoScroll(page) {
  const getdata = await page.evaluate(async () => {
    const data = await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 500;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (
          document.querySelectorAll('[role="feed"]')[0].childNodes.length - 3 >
          20
        ) {
          clearInterval(timer);
          resolve();
        }
        document
          .querySelectorAll(
            '.oajrlxb2.g5ia77u1.mtkw9kbi.tlpljxtp.qensuy8j.ppp5ayq2.goun2846.ccm00jje.s44p3ltw.mk2mc5f4.rt8b4zig.n8ej3o3l.agehan2d.sk4xxmp2.rq0escxv.nhd2j8a9.mg4g778l.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.tgvbjcpo.hpfvmrgz.jb3vyjys.qt6c0cv9.a8nywdso.l9j0dhe7.i1ao9s8h.esuyzwwr.f1sip0of.du4w35lb.n00je7tq.arfg74bv.qs9ysxi8.k77z8yql.pq6dq46d.btwxx1t3.abiwlrkh.lzcic4wl.bp9cbjyn.m9osqain.buofh1pr.g5gj957u.p8fzw8mz.gpro0wi8'
          )
          .forEach((el) => el.click());

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
  return;
}
async function main(req, res) {
  fs.readFile('controllers/api/item.txt', 'utf8', (err, data) => {
    if (err) throw err;
    res.json(JSON.parse(data));
  });

  //   const browser = await puppeteer.launch({
  //     headless: true,
  //     defaultViewport: null,
  //     args: ['--start-maximized'],
  //     ignoreHTTPSErrors: true,
  //     product: 'chrome',
  //     devtools: true,
  //     executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  //   });
  //   const page = await browser.newPage();
  //   const pages = await browser.pages();
  //   if (pages.length > 1) {
  //     await pages[0].close();
  //   }
  //   await page.setRequestInterception(true);
  //   page.on('request', (request) => {
  //     if (/google|cloudflare/.test(request.url())) {
  //       request.abort();
  //     } else {
  //       request.continue();
  //     }
  //   });
  //   await page.goto('https://www.facebook.com', {
  //     waitUntil: 'load',
  //   });
  //   await page.type('#email', config.username, { delay: 100 });
  //   await page.type('#pass', config.password, { delay: 100 });
  //   await page.keyboard.press('Enter');
  //   await page.waitForTimeout(5000);
  //   await page.goto('https://www.facebook.com/groups/697332711026460', {
  //     waitUntil: 'load',
  //   });
  //   await autoScroll(page);
  // await page.evaluate(() => {
  //   document
  //     .querySelectorAll(
  //       '.oajrlxb2.g5ia77u1.mtkw9kbi.tlpljxtp.qensuy8j.ppp5ayq2.goun2846.ccm00jje.s44p3ltw.mk2mc5f4.rt8b4zig.n8ej3o3l.agehan2d.sk4xxmp2.rq0escxv.nhd2j8a9.mg4g778l.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.tgvbjcpo.hpfvmrgz.jb3vyjys.qt6c0cv9.a8nywdso.l9j0dhe7.i1ao9s8h.esuyzwwr.f1sip0of.du4w35lb.n00je7tq.arfg74bv.qs9ysxi8.k77z8yql.pq6dq46d.btwxx1t3.abiwlrkh.lzcic4wl.bp9cbjyn.m9osqain.buofh1pr.g5gj957u.p8fzw8mz.gpro0wi8'
  //     )
  //     .forEach((el) => el.click());
  // });
  //   let datas = takedata(page);
  //   datas.then(function (result) {
  //     res.json(result);
  //   });
}
async function takedata(page) {
  const dimension = await page.evaluate(async () => {
    post = document.querySelectorAll('[role="feed"]')[0].childNodes;
    let video = new Array();
    let image_href = new Array();
    let commmets = new Array();
    let children = new Array();
    let userhref =
      (user_name =
      content =
      categori =
      imagehref =
      likes =
      count_comments =
      shares =
      time =
      videohref =
      user_id =
      post_id =
        '');
    let data = [];
    for (let i = 1; i < post.length - 3; i++) {
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
              userhref = element.childNodes[0].childNodes[0].href;
              user_name = element.childNodes[0].innerText;
              user_id = element.childNodes[0].childNodes[0].href.split('/')[6];
            } else {
              userhref = element.childNodes[0].childNodes[0].innerText;
              user_name = element.childNodes[0].innerText;
              user_id =
                element.childNodes[0].childNodes[0].innerText.split('/')[6];
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
                      for (let k = 0; k < element.childNodes.length; k++) {
                        image_href.push(
                          element.childNodes[0].childNodes[0].childNodes[0]
                            .childNodes[0].childNodes[0].href
                        );
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
                content = node.innerHTML;
              } else {
                content =
                  node.childNodes[0].childNodes[0].childNodes[0].innerHTML;
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
              console.log(element.childNodes);
              element.childNodes.forEach((element) => {
                if (element.childNodes.length == 2) {
                  commmets.push({
                    cotents:
                      element.childNodes[0].childNodes[1].childNodes[1]
                        .childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                        .childNodes[0].childNodes[0].childNodes[1].childNodes[0]
                        .childNodes[0].innerHTML,
                  });
                } else {
                  commmets.push({
                    cotents:
                      element.children[0].childNodes[0].childNodes[1]
                        .childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                        .childNodes[0].childNodes[0].childNodes[1].childNodes[0]
                        .childNodes[0].innerHTML,
                  });
                }
              });
              // [0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].innerHTML
              // [0].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].innerHTML

              // console.log(element.childNodes); // comment con [0].childNodes[1].childNodes[0].childNodes
            }
          });
        } catch (e) {
          console.log(e);
        }

        data.push({
          userhref: userhref,
          user_name: user_name,
          content: content,
          categori: categori,
          count_comments: count_comments,
          user_id: user_id,
          likes: likes,
          shares: shares,
          post_id: post_id,
          posthref: posthref,
          video: video,
          image_href: image_href,
          commmets: commmets,
        });
        userhref =
          user_name =
          user_id =
          content =
          categori =
          imagehref =
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
          statusbar: 'error',
        });
        userhref =
          user_name =
          content =
          categori =
          imagehref =
          likes =
          count_comments =
          user_id =
          shares =
          time =
          post_id =
            '';
        video = [];
        commmets = [];
        image_href = [];
      }
    }

    return data;
  });
  return dimension;
}
module.exports = main;
