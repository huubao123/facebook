module.exports = async function loadmoremedia(page, data) {
  await page.evaluate(async () => {
    let contens = '';
    try {
      let post = document.querySelectorAll('[role="main"]')[2];
      if (!post) {
        let post1 =
          document.querySelectorAll('[role="article"]')[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[0].childNodes[0];
        if (post1.childNodes.length > 5) {
          contens = post1.childNodes[7].childNodes[0];
        } else {
          contens = post1.childNodes[1].childNodes[0];
        }
      } else {
        try {
          if (
            post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[0].childNodes[0].childNodes[1]
          ) {
            contens =
            post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
            .childNodes[0].childNodes[0].childNodes[1].childNodes[0];
          }
         else if (
            post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[1]
              .childNodes[0].childNodes[0].childNodes[0].childNodes[0]
          ) {
            contens =
              post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1]
                .childNodes[0];
          }
        } catch (e) {
          try {
            if (
              post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[7].childNodes[0]
            ) {
              contens =
                post.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[7].childNodes[0];
            }
          } catch (e) {
            if (
              document.querySelector('[aria-posinset="1"]').childNodes[0].childNodes[0]
                .childNodes[0].childNodes[0].childNodes[0].childNodes[7]
            ) {
              contens =
                document.querySelector('[aria-posinset="1"]').childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[0].childNodes[0].childNodes[7].childNodes[0];
            } else {
              contens =
                document.querySelector('[aria-posinset="1"]').childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0];
            }
          }
        }
      }
    } catch (e) {
      ismain = false;
    }
    contens.querySelectorAll('[role="link"]').forEach(async (e) => {
      if (e.childNodes.length > 2 && e.hasAttribute('href')) {
        await e.click();
      }
    });
  });
  const get_image_video = await page.evaluate(async (data) => {
    for (let i = 0; i < data.imagemore - 1; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      await document
        .querySelectorAll('[data-name="media-viewer-nav-container"]')[0]
        .querySelectorAll('[data-visualcompletion="ignore-dynamic"]')[1]
        .childNodes[0].click();

      await new Promise((r) => setTimeout(r, 1000));
      console.log(data);
      try {
        if (document.querySelectorAll('[data-visualcompletion="media-vc-image"]')[0].currentSrc)
          await data.linkImgs.push(
            document.querySelectorAll('[data-visualcompletion="media-vc-image"]')[0].currentSrc
          );
      } catch (e) {
        let id_video = window.location.href.split('/')[6];

        async function getvideos(id_video) {
          let video = '';
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
          console.log('Getting info...'), await new Promise((r) => setTimeout(r, 2000));
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
                video = m;
              } catch (d) {
                console.log(
                  '\u26A0\uFE0FFailed to extract data. Maybe this script is no longer effective.'
                );
              }
            })
            .catch((a) => {
              console.error('\u26A0\uFE0FFailed to get data');
            });
          console.log('adsadads');
          return video;
        }
        let result = await getvideos(id_video);
        await data.videos.push(result);
      }
    }
    await data.linkImgs.filter((item) => item);
    await data.videos.filter((item) => item);
    return data;
  }, data);
  return get_image_video;
};
