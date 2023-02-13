module.exports = async function getdata(page, cmt_lengths) {
  const dimension = await page.evaluate(async (cmt_lengths) => {
    let data = '';
    let video = new Array();
    let image_href = new Array();
    let comments = new Array();
    let children = new Array();
    let imagemore = 0;
    let userhref =
      (user_name =
      content =
      posthref =
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
      date_cmt =
      user_cmt_id =
      user_name_cmt =
      user_cmt_href =
      cotent_cmtchild =
      user_cmtchild_id =
      user_name_cmtchild =
      user_cmtchild_href =
      cotent_cmt_text =
      cotent_cmtchild_text =
      date_cmtchild =
      imgComment =
        '');
    let count_comments_config = 0;
    let token = require('DTSGInitialData').token;
    let count_like_cmt = (count_like_cmtchild = count_like_cmtchild2 = 0);

    // document.querySelectorAll('div').forEach((e) => {
    //   if (e.hasAttribute('aria-describedby')) {
    //     post = e[0];
    //   }
    // });
    let ismain = true;
    let isuser = true;
    let iscontent = true;
    let iscomment = true;
    let iscate = true;
    let contens = '';
    let post = document.querySelectorAll('[role="main"]')[2];
    try {
      if (!post) {
        let post1 =
          document.querySelectorAll('[role="article"]')[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[0];
        if (post1.childNodes.length > 5) {
          contens = post1.childNodes[7].childNodes[0];
        } else {
          contens = post1.childNodes[1].childNodes[0];
        }
      } else {
        try {
          if (
            post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1]
          ) {
            contens =
              post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1]
                .childNodes[0].childNodes[0];
          } else if (
            post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
          ) {
            contens =
              post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[1].childNodes[0];
          }
        } catch (e) {
          try {
            if (
              post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[7].childNodes[0]
            ) {
              contens =
                post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[7].childNodes[0].childNodes[0];
            }
          } catch (e) {
            if (
              document.querySelector('[aria-posinset="1"]').childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[7]
            ) {
              contens =
                document.querySelector('[aria-posinset="1"]').childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[7].childNodes[0].childNodes[0];
            } else {
              contens =
                document.querySelector('[aria-posinset="1"]').childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[1].childNodes[0];
            }
          }
        }
      }
    } catch (e) {
      let div = document.querySelectorAll('div');
      div.forEach(async (item) => {
        if (item.childNodes.length > 13) {
          contens = item.childNodes[7].childNodes[0].childNodes[0];
        }
      });
      ismain = false;
      console.log('érroe main');
    }
    console.log(contens);

    try {
      try {
        if (
          contens.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[0].childNodes.length > 1
        ) {
          admin =
            contens.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[0].childNodes[0].childNodes;
        } else {
          admin =
            contens.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[0].childNodes;
        }
        admin.forEach((element) => {
          if (element.nodeName == 'SPAN') {
            userhref = element.children[0].href ? element.childNodes[0].href : element.childNodes[0].href;
            user_name = element.childNodes[0].innerText
              ? element.childNodes[0].innerText
              : element.childNodes[0].innerText;
            user_id = element.childNodes[0].href
              ? element.childNodes[0].href.split('/')[6]
              : element.childNodes[0].href.split('/')[6];
          }
        });
      } catch (e) {
        console.log('error user ');
        isuser = false;
      }
      try {
        contens.childNodes[2].childNodes.forEach((element, index) => {
          element.querySelectorAll('[role="button"]').forEach(async (e) => {
            if (e.innerText.indexOf('Xem ảnh') > -1) {
              await e.click();
            }
          });
          if (element.className == '') {
            element.childNodes[0].childNodes.forEach(function (node) {
              if (node.nodeName == 'SPAN') {
                for (let c = 0; c < node.childNodes.length; c++) {
                  let con_fil = node.childNodes[c].innerHTML
                    .replaceAll(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/g, '')
                    .replaceAll(/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g, '');
                  content += con_fil;
                }
              } else {
                for (let c = 0; c < node.childNodes[0].childNodes[0].childNodes.length; c++) {
                  let con_fil = node.childNodes[0].childNodes[0].childNodes[c].innerHTML
                    .replaceAll(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/g, '')
                    .replaceAll(/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g, '');
                  content += con_fil;
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
            element.childNodes[0].childNodes[0].childNodes[0].querySelectorAll('a').forEach((el) => {
              if (el.href.indexOf('video') > -1) {
                video.push(el.href.split('/')[5]);
              }
            });
            element.childNodes[0].childNodes[0].childNodes[0].querySelectorAll('img').forEach((el) => {
              image_href.push(el.currentSrc);
            });

            if (content == '') {
              content = element.childNodes[0].childNodes[0].childNodes[0].innerHTML;
            }
            element.childNodes[0].childNodes[0].childNodes[0].querySelectorAll('div').forEach((el) => {
              if (el.innerText.indexOf('+') > -1) {
                imagemore = el.innerText.split('+')[1];
                return;
              }
            });
          }
        });
      } catch (e) {
        console.log('error content ');
        iscontent = false;
      }

      let divlikecomshare = contens;

      let likecomshare = '';
      let divcommment = '';

      // lấy categori có thì  divlikecomshare  = 5
      try {
        if (divlikecomshare.childNodes.length == 5) {
          categori = divlikecomshare.childNodes[3].innerText;
          likecomshare = divlikecomshare.childNodes[4].childNodes[0].childNodes[0].childNodes[0].childNodes[0];
          divcommment = divlikecomshare.childNodes[4].childNodes[0].childNodes[0].childNodes[1].childNodes;
        } else {
          categori = '';
          likecomshare = divlikecomshare.childNodes[3].childNodes[0].childNodes[0].childNodes[0].childNodes[0];

          divcommment = divlikecomshare.childNodes[3].childNodes[0].childNodes[0].childNodes[1].childNodes;
        }

        if (likecomshare.childNodes.length > 1) {
          let likecomshares = likecomshare.childNodes[0].childNodes[0].childNodes;
          likecomshares.forEach((element, index) => {
            if (index == 0) {
              element.childNodes[1].querySelectorAll('span').forEach((el) => {
                if (el.textContent.split(' ')[0].indexOf('Tất') < 0) {
                  likes = el.textContent.split(' ')[0];
                  return;
                }
              });
            }
            if (index == 1) {
              count_comments = element.childNodes[1] ? element.childNodes[1].textContent.split(' ')[0] : '0';
              shares = element.childNodes[2] ? element.childNodes[2].textContent.split(' ')[0] : '0';
            }
          });
        }
      } catch (e) {
        console.log('error: categori ');
        iscate = false;
      }

      post_id = posthref.split('/')[6];
      let resultvideos = [];
      try {
        if (video.length > 0) {
          for (let i = 0; i < video.length; i++) {
            const id_video = video[i];
            async function getvideos() {
              let c = function (d, e) {
                  let f = [],
                    a;
                  for (a in d)
                    if (d.hasOwnProperty(a)) {
                      let g = e ? e + '[' + a + ']' : a,
                        b = d[a];
                      f.push(
                        null !== b && 'object' == typeof b
                          ? c(b, g)
                          : encodeURIComponent(g) + '=' + encodeURIComponent(b)
                      );
                    }
                  return f.join('&');
                },
                b = async function (a, b) {
                  return await fetch('https://www.facebook.com/api/graphql/', {
                    method: 'POST',
                    headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    body: c({
                      doc_id: a,
                      variables: JSON.stringify(b),
                      fb_dtsg: require('DTSGInitialData').token,
                      server_timestamps: !0,
                    }),
                  });
                };
              console.log('Getting info...'), await new Promise((r) => setTimeout(r, 4000));
              await b('5279476072161634', {
                UFI2CommentsProvider_commentsKey: 'CometTahoeSidePaneQuery',
                caller: 'CHANNEL_VIEW_FROM_PAGE_TIMELINE',
                displayCommentsContextEnableComment: null,
                displayCommentsContextIsAdPreview: null,
                displayCommentsContextIsAggregatedShare: null,
                displayCommentsContextIsStorySet: null,
                displayCommentsFeedbackContext: null,
                feedbackSource: 41,
                feedLocation: 'TAHOE',
                focusCommentID: null,
                privacySelectorRenderLocation: 'COMET_STREAM',
                renderLocation: 'video_channel',
                scale: 1,
                streamChainingSection: !1,
                useDefaultActor: !1,
                videoChainingContext: null,
                videoID: id_video,
              })
                .then((a) => a.text())
                .then((b) => {
                  try {
                    let a = JSON.parse(b.split('\n')[0]),
                      m = a.data.video.playable_url_quality_hd || a.data.video.playable_url;
                    console.log(m);
                    resultvideos.push(m);
                  } catch (d) {
                    console.log('\u26A0\uFE0FFailed to extract data. Maybe this script is no longer effective.');
                  }
                })
                .catch((a) => {
                  console.error('\u26A0\uFE0FFailed to get data');
                });
              console.log('adsadads');
            }
            await getvideos();
            await new Promise((r) => setTimeout(r, 4000));
          }
        }

        console.log(resultvideos);
        await new Promise((r) => setTimeout(r, 4000));
      } catch (e) {
        console.log('error video dowload');
      }

      data = {
        // id: data.length ? data.length + 1 : 1,
        // userhref: userhref == '' ? 'undefined - undefined' : userhref,
        videos: resultvideos ? resultvideos : [],
        commentList: comments ? comments : [],

        user: user_name == '' ? 'undefined - undefined' : user_name,
        date: '',
        contentList: content ? content : '',
        linkImgs: image_href ? image_href : '',
        countLike: likes ? likes : '',
        linkPost: posthref ? posthref : '',
        idPost: post_id ? post_id : '',
        imageList: [],
        //categori: categori ? categori : '',
        countComment: count_comments ? count_comments : '',
        user_id: user_id ? user_id : '',
        count_comments_config: count_comments_config,
        countShare: shares ? shares : '',
        iscate: iscate,
        //iscomment: iscomment,
        iscontent: iscontent,
        ismain: ismain,
        isuser: isuser,
        token: token ? token : '',
        imagemore: imagemore,
      };
      (count_comments_config = imagemore = 0),
        (userhref =
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
          date_cmt =
            '');
      video = [];
      comments = [];
      image_href = [];
    } catch (error) {
      console.log(error);
    }
    console.log(data);
    return data;
  }, cmt_lengths);
  return dimension;
};
