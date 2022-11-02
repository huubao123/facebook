module.exports = async function autoScrollpost(page) {
  const getdata = await page.evaluate(async () => {
    const data = await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 500;
      let n = 0;
      let time = 0;
      let timer = setInterval(async () => {
        time += 1;
        let scrool = new Array();
        let scrollHeight = document.body.scrollHeight;
        // window.scrollBy(0, distance);
        //totalHeight += distance;
        //n += 1;
        // if (n == 10) {
        //   clearInterval(timer);
        //   resolve();
        // }
        if (
          window.performance.memory.jsHeapSizeLimit - window.performance.memory.jsHeapSizeLimit / 10 <
          window.performance.memory.totalJSHeapSize
        ) {
          clearInterval(timer);
          resolve();
        }
        if (time == 29) {
          clearInterval(timer);
          resolve();
        }
        let isbottom = document.body.scrollHeight;
        let istop = parseInt(document.documentElement.scrollTop + window.innerHeight) + 1;
        if (isbottom === istop) {
          clearInterval(timer);
          resolve();
        }
        let div = document.querySelectorAll('[role = "button"]');
        // if (n > 1) {
        //   for (let i = 0; i < div.length; i++) {
        //     scrool.push(div[i].innerText);
        //   }
        // }

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
            scrool.push('đã hết');
          } else {
            scrool.push(div[i].innerText);
          }
        }
        checkcom = scrool.indexOf('đã hết') > -1;
        if (!checkcom) {
          clearInterval(timer);
          resolve();
        }

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 2000);
    });
  });
  return;
};
