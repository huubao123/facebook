module.exports = async function getdata(page) {
  const dimension = await page.evaluate(async () => {
    let video = new Array();
    let image_href = new Array();
    let imagemore = 0;
    let contens = '';
    try {
      let post = document.querySelectorAll('[role="feed"]');
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
          console.log('adasd');
          let length =
            post[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
              .childNodes[0].childNodes[0].childNodes[0].childNodes;
          if (length.length > 1) {
            contens = length[1].childNodes[0];
          } else {
            contens = length[7].childNodes[0];
          }
        } catch (e) {
          console.log(e);
        }
      }
    } catch (e) {
      ismain = false;
      console.log('érroe main');
    }
    console.log(contens);
    try {
      try {
        contens.childNodes[2].childNodes.forEach((element, index) => {
          element.querySelectorAll('[role="button"]').forEach(async (e) => {
            if (e.innerText.indexOf('Xem ảnh') > -1) {
              await e.click();
            }
          });
          if (index === 1) {
            console.log(element.childNodes[0].childNodes[0].childNodes[0].childNodes);
            if (element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length == 2) {
              checkitemlength =
                element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1]
                  .childNodes[0].childNodes[1].childNodes[0].childNodes;
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
              } else if (checkitemlength.length == 8) {
                if (checkitemlength[6].childNodes.length == 11) {
                  video.push(
                    checkitemlength[4].childNodes[7].childNodes[0].childNodes[0].childNodes[0].childNodes[0].href.split(
                      '/'
                    )[5]
                  );
                } else if (checkitemlength[6].childNodes.length == 10) {
                  video.push(
                    checkitemlength[4].childNodes[6].childNodes[0].childNodes[0].childNodes[0].childNodes[0].href.split(
                      '/'
                    )[5]
                  );
                }
              }
            } else if (element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length == 1) {
              try {
                if (
                  element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length > 1
                ) {
                  if (!element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].href) {
                    for (
                      let j = 0;
                      j <
                      element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length;
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
                            element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[j]
                              .childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].currentSrc
                          );

                      try {
                        if (
                          j ==
                          element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes
                            .length -
                            1
                        ) {
                          const numberPattern = /\d+/g;

                          imagemore = parseInt(
                            element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[
                              j
                            ].childNodes[0].childNodes[1].innerText
                              .match(numberPattern)
                              .join('')
                          );
                        }
                      } catch (e) {}
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
                              element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].href
                            );
                          }
                        } else {
                          element.childNodes.forEach(function (element) {
                            if (element.childNodes.length == 2) {
                              console.log('image 3', element.childNodes);
                              image_href.push(
                                element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                                  .childNodes[0].childNodes[0].childNodes[0].currentSrc
                              );
                            } else {
                              image_href.push(
                                element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                                  .childNodes[0].childNodes[0].childNodes[0].currentSrc
                              );
                            }
                          });
                        }
                      }
                    }
                  );
                }
              } catch (e) {}
            } else {
              try {
                image_href.push(
                  element.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
                    .childNodes[0].childNodes[0].childNodes[0].currentSrc
                );
              } catch (e) {}

              if (content == '') {
                content = element.childNodes[0].childNodes[0].childNodes[0].innerHTML;
              }

              // for (var i = 0; i < 2; i++) {
              //   content += lengths[i].innerHTML;
              // }
            }
          }
        });
      } catch (e) {
        console.log(e);
        iscontent = false;
      }

      // lấy categori có thì  divlikecomshare  = 5

      data = {
        linkImgs: image_href ? image_href : '',
        imagemore: imagemore,
      };
      video = [];
      image_href = [];
    } catch (error) {
      console.log(error);
    }

    return data;
  });
  return dimension;
};
