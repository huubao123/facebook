module.exports = async function loadmoremedia(page) {
  const get_image_video = await page.evaluate(async () => {
    for (let i = 0; i < data.imagemore - 1; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        document
          .querySelector('[role="contentinfo"]')
          .parentNode.childNodes[0].querySelectorAll('[role="button"]')
          .forEach((el) => {
            if (el.innerText == 'Xem thêm') {
              el.click();
            }
          });
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
