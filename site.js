const fbdl = require("fbdl-core");
const url = "https://www.facebook.com/thaithuy.work/videos/1139523030325156/?idorvanity=364997627165697&__cft__[0]=AZVHNhzvrwDb1zNVQjnKtvujk2b1hvjd5WaCrlGg6_Zm4BvdGp7HRRS3LJUOBu74IlP6YFFqYRaW3kklqxbVb0LFxNDQ7uoJFK_WkCFKDLqKWHoYKV25I5csgtuCzMelPMAdEjO7J75wTFqvLv2anVGq26p_BmFM2jt8-IVj9rp8zCnV965RJj7B-QbHOWR-u5hD4JVrsuuP9_YiUAXHURYeanOpczzVP5IzH2BFeh7MbA&__tn__=%2B%3FFH-R";

fbdl.getInfo(url)
    .then(console.log); 