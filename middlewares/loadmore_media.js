module.exports = async function loadmoremedia(page, data) {
  await page.evaluate(async () => {
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
                .childNodes[0];
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
                  .childNodes[7].childNodes[0];
            }
          } catch (e) {
            if (
              document.querySelector('[aria-posinset="1"]').childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[7]
            ) {
              contens =
                document.querySelector('[aria-posinset="1"]').childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                  .childNodes[0].childNodes[7].childNodes[0];
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
          contens = item.childNodes[7].childNodes[0];
        }
      });
      ismain = false;
      console.log('érroe main');
    }
    console.log(contens);
    contens.querySelectorAll('[role="link"]').forEach(async (e) => {
      if (e.childNodes.length > 2 && e.hasAttribute('href')) {
        await e.click();
      }
    });
  });
  const get_image_video = await page.evaluate(async (data) => {
    for (let i = 0; i < data.imagemore - 1; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        await document
          .querySelectorAll('[data-name="media-viewer-nav-container"]')[0]
          .querySelectorAll('[data-visualcompletion="ignore-dynamic"]')[1]
          .childNodes[0].click();
      } catch (e) {
        console.log(e);
      }

      await new Promise((r) => setTimeout(r, 1000));
      try {
        if (document.querySelectorAll('[data-visualcompletion="media-vc-image"]')[0].currentSrc)
          await data.linkImgs.push(document.querySelectorAll('[data-visualcompletion="media-vc-image"]')[0].currentSrc);
      } catch (e) {}
    }
    await data.linkImgs.filter((item) => item);
    return data;
  }, data);
  return get_image_video;
};
