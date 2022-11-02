module.exports = async (data) => {
  let response = null;
  let form = new FormData();
  console.log(data);
  if (length > 0) {
    map((item, index) => {
      form.append(`media[${index}][title]`, item.title);
      form.append(`media[${index}][alt]`, item.alt);
      form.append(`media[${index}][file]`, item.file);
    });
  }

  await axios({
    url: 'https://mgs-api-v2.internal.mangoads.com.vn/api/v1/media',
    method: 'post',
    data: form,
    headers: {
      'content-type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Requested-Store': 'default',
      accept: 'application/json',
      Authorization: 'iU9ld6uNhHIKvCIFURWqLyV0kfEGC7OD',
    },
  })
    .then(function (res) {
      response = res;
    })
    .catch(function (response) {
      //handle error
      response = null;
    });
  return response;
};
