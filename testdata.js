const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');
const loadmoremedia = require('./middlewares/loadmore_media');
const getdata = require('./middlewares/getdata_post_page');
const autoScroll_post = require('./middlewares/autoscrollpost');
const genSlug = require('./middlewares/genslug');
const Post = require('./models/post');
const Post_filter_no = require('./models/post_filter_no');

const Trash = require('./models/trash');
const Posttype = require('./models/posttype');
const Images = require('./models/image');
const Page = require('./models/page');
const Queue = require('bull');
const image = new Queue('image', { redis: { port: 6379, host: '127.0.0.1' } });
const downloadImage = require('./middlewares/downloadimage');

require('dotenv').config();
let link_page =
  'https://vi-vn.facebook.com/Thammykangnam/,https://vi-vn.facebook.com/EMCAS.Hospital/,https://www.facebook.com/BenhVienThamMyVietMy/,https://www.facebook.com/BVTMMEDIKA/,https://www.facebook.com/benhvienthammygangwhoo/,https://vi-vn.facebook.com/ThamMyXuanHuong/,https://vi-vn.facebook.com/BenhVienNgocPhu/,https://www.facebook.com/thammythucuc.com.vn/,https://www.facebook.com/BenhVienJtAngel/,https://vi-vn.facebook.com/benhvienthammyworldwide/,https://www.facebook.com/seoulcenter.vn/,https://www.facebook.com/bvtmsaohan/,https://m.facebook.com/Thammykangnam/posts/,https://www.facebook.com/Thammykangnam/posts/-kangnam-s%C3%A0i-g%C3%B2n-m%E1%BB%9F-c%E1%BB%ADa-tr%E1%BB%9F-l%E1%BA%A1i-%EF%B8%8F-gi%E1%BA%A3m-s%C3%A2u-30-ph%E1%BA%ABu-thu%E1%BA%ADt-th%E1%BA%A9m-m%E1%BB%B9-c%E1%BA%AFt-m%C3%AD-ch%E1%BB%89-c%C3%B2n-/2678968078873892/,https://vi-vn.facebook.com/Thammykangnam/posts/,https://www.facebook.com/benhvienthammyhieploi/,https://m.facebook.com/BenhVienThamMyVietMy/posts/,https://www.facebook.com/tsprsvn/,https://vi-vn.facebook.com/thammysaigon/,https://www.facebook.com/Thammykangnam/photos/a.380259948744728/1089864637784252/?type=3,https://vi-vn.facebook.com/ThamMyXuanHuong/posts/2952275288157792/,https://www.facebook.com/groups/toansongngutieuhoc/,https://business.facebook.com/BVTMMEDIKA/posts,https://www.facebook.com/BenhVienPTTMGRAND/,https://m.facebook.com/people/B%E1%BB%87nh-Vi%E1%BB%87n-Th%E1%BA%A9m-M%E1%BB%B9-175-S%C3%A0i-G%C3%B2n-C%C6%A1-S%E1%BB%9F-1/100083218698015/,https://www.facebook.com/ThamMyVienDongANgheAn/,https://www.facebook.com/ThamMyXuanHuong/posts/-n%C3%A2ng-cung-m%C3%A0y-gi%E1%BA%A3i-ph%C3%A1p-th%E1%BA%A9m-m%E1%BB%B9-gi%C3%BAp-x%C3%B3a-nh%C3%B2a-d%E1%BA%A5u-hi%E1%BB%87u-tu%E1%BB%95i-t%C3%A1c-n%C6%A1i-%C4%91%C3%B4i-m%E1%BA%AFtt%E1%BB%AB-t/2587199147998743/,https://www.facebook.com/359285057508884/posts/bvtm-kangnam-t%E1%BB%95-ch%E1%BB%A9c-h%E1%BB%99i-th%E1%BA%A3o-khoa-h%E1%BB%8Dc-an-to%C3%A0n-trong-ph%E1%BA%ABu-thu%E1%BA%ADt-t%E1%BA%A1o-h%C3%ACnh-th%E1%BA%A9m-m%E1%BB%B9/2341484592622244/,https://www.facebook.com/ThamMyXuanHuong/posts/%EF%B8%8F-nh%C6%B0%E1%BB%A3c-c%C6%A1-n%C3%A2ng-mi-b%E1%BA%A9m-sinh-c%C6%A1-h%E1%BB%99i-n%C3%A0o-cho-%C4%91%C3%B4i-m%E1%BA%AFt-tr%C3%B2n-%C4%91%E1%BA%B9p-%C4%91%E1%BA%BFn-ngay-vi%E1%BB%87n-th%E1%BA%A9m-m/2553379578047367/,https://www.facebook.com/benhvienthammyAVA/,https://www.facebook.com/Thammykangnam/posts/-n%E1%BA%BFu-bi%E1%BA%BFt-th%E1%BA%A9m-m%E1%BB%B9-t%E1%BB%B1-nhi%C3%AAn-th%E1%BA%BF-n%C3%A0y-th%C3%AC-%C4%91%C3%A3-%C4%91i-l%C3%A0m-s%E1%BB%9Bm-h%C6%A1n%EF%B8%8F%EF%B8%8F-th%E1%BB%B1c-hi%E1%BB%87n-3-d%E1%BB%8Bch-v%E1%BB%A5-n/2091572967613409/,https://www.facebook.com/benhvienthammyjwhanquoc/,https://es-la.facebook.com/Thammykangnam/posts/2614768741960493/,https://www.facebook.com/lienjangplasticsurgeryvietnam/,https://m.facebook.com/BenhVienJtAngel/posts/?ref=page_internal&mt_nav=0,https://www.facebook.com/@BenhVienPTTMGRAND/,https://www.facebook.com/Thammykangnam/posts/1061376653966384/,https://m.facebook.com/B%E1%BB%87nh-Vi%E1%BB%87n-Th%E1%BA%A9m-M%E1%BB%B9-175-S%C3%A0i-G%C3%B2n-Chi-Nh%C3%A1nh-T%C3%A2y-Ninh-100789652561423/?ref=page_internal,https://m.facebook.com/Thammykangnam/posts/2579036718867029/,https://vi-vn.facebook.com/benhvienthammyhieploi/,https://vi-vn.facebook.com/Thammykangnam/posts/440971842673538/,https://www.facebook.com/Thammykangnam/posts/t%C6%B0_v%E1%BA%A5n_th%E1%BA%A9m_m%E1%BB%B9-t%E1%BB%ABng-%C4%91%E1%BB%99n-c%E1%BA%B1m-h%E1%BB%8Fng-th%C3%AC-s%E1%BB%ADa-l%E1%BA%A1i-c%C3%B3-%C4%91%E1%BA%B9p-kh%C3%B4ngc%C3%A2u-h%E1%BB%8Fi-em-%C4%91%C3%A3-t%E1%BB%ABng-%C4%91i-p/704775716293148/,https://www.facebook.com/ThamMyVienDongACanTho/,https://vi-vn.facebook.com/Thammykangnam/posts/c%C3%B3_th%E1%BB%83_b%E1%BA%A1n_ch%C6%B0a_bi%E1%BA%BFt_kn-quy-tr%C3%ACnh-ph%E1%BA%ABu-thu%E1%BA%ADt-th%E1%BA%A9m-m%E1%BB%B9-chu%E1%BA%A9n-korean-beauty-triangl/1067013366736046/,https://www.facebook.com/Thammykangnam/posts/t%C6%B0_v%E1%BA%A5n_th%E1%BA%A9m_m%E1%BB%B9-chi-ph%C3%AD-t%E1%BA%A9y-n%E1%BB%91t-ru%E1%BB%93i-tr%C3%AAn-m%E1%BA%B7tth%C6%B0a-b%C3%A1c-s%E1%BB%B9-hi%E1%BB%87n-t%E1%BA%A1i-tr%C3%AAn-m%E1%BA%B7t-em-c%C3%B3-/437724056331650/,https://www.facebook.com/Thammykangnam/posts/t%C6%B0_v%E1%BA%A5n_th%E1%BA%A9m_m%E1%BB%B9-t%E1%BA%AFm-tr%E1%BA%AFng-to%C3%A0n-th%C3%A2n-m%E1%BB%99t-l%E1%BA%A7n-duy-nh%E1%BA%A5t-h%E1%BA%BFt-bao-nhi%C3%AAu-ti%E1%BB%81nch%C3%A0o-chuy%C3%AA/526479597456095/,https://www.facebook.com/Thammykangnam/posts/t%C6%B0_v%E1%BA%A5n_th%E1%BA%A9m_m%E1%BB%B9-sau-khi-t%E1%BA%AFm_tr%E1%BA%AFng-c%C3%B3-c%E1%BA%A7n-t%E1%BA%AFm-d%C6%B0%E1%BB%A1ng-kh%C3%B4ngch%C3%A0o-th%E1%BA%A9m-m%E1%BB%B9-vi%E1%BB%87n-kangnam/479640005473388/,https://vi-vn.facebook.com/Viewps.vn/,https://vi-vn.facebook.com/Thammykangnam/posts/tin_t%E1%BB%A9c_th%E1%BA%A9m_m%E1%BB%B9_kn-chia-s%E1%BA%BB-kinh-nghi%E1%BB%87m-n%C3%A2ng-m%C5%A9i-gi%C3%BAp-b%E1%BA%A1n-c%C3%B3-k%E1%BA%BFt-qu%E1%BA%A3-t%E1%BB%91t-nh%E1%BA%A5t-hot/1117002328403816/,https://www.facebook.com/thammyvienda/,https://m.facebook.com/Thammykangnam/posts/2166476700123035/,https://m.facebook.com/Thammykangnam/posts/3575224469248244/?locale2=bg_BG,https://www.facebook.com/359285057508884/posts/%EF%B8%8Fph%E1%BA%ABu-thu%E1%BA%ADt-h%C3%A0m-h%C3%B4-c%C3%B3-ai-tin-n%E1%BB%95i-%C4%91%C3%A2y-l%C3%A0-c%C3%B9ng-1-ng%C6%B0%E1%BB%9Di-kh%C3%B4ng%EF%B8%8Fho%C3%A0n-to%C3%A0n-kh%C3%A1c-bi%E1%BB%87t-c/2848214291949269/,https://m.facebook.com/Thammykangnam/posts/2024660824304624/?locale2=ja_JP,https://vi-vn.facebook.com/Thammykangnam/photos/th%E1%BA%A9m-m%E1%BB%B9-vi%E1%BB%87n-kangnam-%C4%91%E1%BB%8Ba-ch%E1%BB%89-t%E1%BA%A1o-m%C3%A1-l%C3%BAm-%C4%91%E1%BB%93ng-ti%E1%BB%81n-uy-t%C3%ADnt%E1%BB%AB-khi-ph%C6%B0%C6%A1ng-ph%C3%A1p-t%E1%BA%A1o-m/444951118942277/,https://www.facebook.com/Thammykangnam/photos/a.380259948744728/864015000369218/?type=3,https://m.facebook.com/150928010024052,https://www.facebook.com/benhvienthammyhanquocdrnamsaigon/,https://m.facebook.com/871723373678976,https://m.facebook.com/309511114120074,https://www.facebook.com/Thammykangnam/photos/a.380259948744728/964189487018435/?type=3,https://www.facebook.com/Nguyenphuonghoa.thammyvienquocte/,https://www.facebook.com/Thammykangnam/posts/t%C6%B0_v%E1%BA%A5n_th%E1%BA%A9m_m%E1%BB%B9-c%E1%BA%AFt-m%C3%AD-m%E1%BA%AFt-b%E1%BB%8B-h%E1%BB%8Fng-c%C3%B3-kh%E1%BA%AFc-ph%E1%BB%A5c-%C4%91%C6%B0%E1%BB%A3c-kh%C3%B4ngxin-ch%C3%A0o-b%C3%A1c-s%C4%A9-m%E1%BA%A5y-th%C3%A1/750830605020992/,https://www.facebook.com/Thammykangnam/posts/c%C3%B3_th%E1%BB%83_b%E1%BA%A1n_ch%C6%B0a_bi%E1%BA%BFt-ti%C3%AAm-ch%E1%BA%A5t-l%C3%A0m-%C4%91%E1%BA%A7y-c%C3%B3-th%E1%BB%83-%C3%A1p-d%E1%BB%A5ng-cho-tr%C6%B0%E1%BB%9Dng-h%E1%BB%A3p-n%C3%A0o-ti%C3%AAm-tr/732416866862366/,https://www.facebook.com/shespsvn/,https://m.facebook.com/Thammykangnam/posts/4888582527912425/?comment_id=1015788622404819,https://www.facebook.com/Thammykangnam/posts/-c%C4%83ng-da-x%C3%B3a-nh%C4%83n-duy-tr%C3%AC-hi%E1%BB%87u-qu%E1%BA%A3-bao-l%C3%A2u-c%C4%83ng-da-b%E1%BA%B1ng-ch%E1%BB%89-collagen-3-5-n%C4%83m-c%C4%83n/3671211962982827/,https://vi-vn.facebook.com/Thammykangnam/live_videos/?ref=page_internal,https://www.facebook.com/Thammykangnam/posts/t%C6%B0_v%E1%BA%A5n_th%E1%BA%A9m_m%E1%BB%B9-x%C3%B3a-x%C4%83m-mi-m%E1%BA%AFt-ph%E1%BA%A3i-m%E1%BA%A5y-l%E1%BA%A7n-m%E1%BB%9Bi-h%E1%BA%BFt-ho%C3%A0n-to%C3%A0n%C4%91%E1%BB%A3t-v%E1%BB%ABa-r%E1%BB%93i-em-c%C3%B3-%C4%91i/756839984420054/,https://m.facebook.com/Thammykangnam/photos/th%E1%BA%A9m-m%E1%BB%B9-vi%E1%BB%87n-kangnam-th%C6%B0%C6%A1ng-hi%E1%BB%87u-s%E1%BB%91-1-th%E1%BA%A9m-m%E1%BB%B9-c%C3%B4ng-ngh%E1%BB%87-h%C3%A0n-qu%E1%BB%91c-t%E1%BB%B1-h%C3%A0o-l%C3%A0-th%E1%BA%A9m-/527381687365886/,https://www.facebook.com/Thammykangnam/posts/th%E1%BA%A9m-m%E1%BB%B9-vi%E1%BB%87n-kangnam-th%C6%B0%C6%A1ng-hi%E1%BB%87u-s%E1%BB%91-1-th%E1%BA%A9m-m%E1%BB%B9-c%C3%B4ng-ngh%E1%BB%87-h%C3%A0n-qu%E1%BB%91c-t%E1%BB%B1-h%C3%A0o-l%C3%A0-th%E1%BA%A9m-/527381820699206/,https://www.facebook.com/people/B%E1%BB%87nh-Vi%E1%BB%87n-Th%E1%BA%A9m-M%E1%BB%B9-175-S%C3%A0i-G%C3%B2n-C%C6%A1-S%E1%BB%9F-B%C3%ACnh-Thu%E1%BA%ADn/100076969597611/,https://m.facebook.com/429509331775577,https://m.facebook.com/Thammykangnam/posts/3695850380518985/,https://www.facebook.com/Thammykangnam/posts/c%C3%B3_th%E1%BB%83_b%E1%BA%A1n_ch%C6%B0a_bi%E1%BA%BFt-thu-nh%E1%BB%8F-%C4%91%E1%BA%A7u-m%C5%A9i-c%C3%B3-nh%E1%BB%AFng-%C6%B0u-%C4%91i%E1%BB%83m-n%E1%BB%95i-b%E1%BA%ADt-g%C3%ACthu-nh%E1%BB%8F-%C4%91%E1%BA%A7u-m%C5%A9i-/725834554187264/,https://m.facebook.com/Thammykangnam/posts/3073155146121848/?locale2=es_LA,https://m.facebook.com/pages/category/Plastic-Surgeon/Thammykangnam/posts/?locale2=fr_FR,https://ms-my.facebook.com/pages/category/Beauty-Salon/B%E1%BB%87nh-Vi%E1%BB%87n-Th%E1%BA%A9m-M%E1%BB%B9-175-S%C3%A0i-G%C3%B2n-Chi-Nh%C3%A1nh-T%C3%A2y-Ninh-100789652561423/,https://www.facebook.com/Benhvienthammydonga/,https://m.facebook.com/ThamMyXuanHuong/posts/3247384601980191/?comment_id=3247784315273553,https://ms-my.facebook.com/pages/B%E1%BB%87nh-Vi%E1%BB%87n-Th%E1%BA%A9m-M%E1%BB%B9-175-S%C3%A0i-G%C3%B2n-Chi-Nh%C3%A1nh-B%E1%BA%BFn-Tre/112816244520694/,https://www.facebook.com/Thammykangnam/posts/t%C6%B0_v%E1%BA%A5n_th%E1%BA%A9m_m%E1%BB%B9_kngi%C3%A1-%C4%91%E1%BB%99n-c%E1%BA%B1m-h%C3%A0n-qu%E1%BB%91c-l%C3%A0-bao-nhi%C3%AAu-t%E1%BA%A1i-bvtm-kangnam-c%C3%A2u-h%E1%BB%8Fi-t%C6%B0-v/849402475163804/,https://m.facebook.com/Thammykangnam/?locale=de_DE,https://www.facebook.com/Thammykangnam/posts/-m%C3%B4i-x%E1%BA%A5u-ki%E1%BB%83u-n%C3%A0o-ch%E1%BB%89nh-ki%E1%BB%83u-%E1%BA%A5y-s%E1%BB%ADa-m%C3%B4i-d%C3%A0y-s%E1%BA%B9o-l%E1%BB%87ch-kh%C3%B4ng-kh%C3%B3-c%C3%B3-t%E1%BA%A1o-h%C3%ACnh-m%C3%B4i-3/2989200014517362/,https://m.facebook.com/455158909210619,https://www.facebook.com/Thammykangnam/posts/-s%C4%83n-th%E1%BA%BB-th%E1%BA%A9m-m%E1%BB%B9-h%E1%BA%B9n-ng%C3%A0y-ch%E1%BB%89nh-h%C3%A0m-mua-th%E1%BA%BB-member-5tr-v%E1%BB%9Bi-gi%C3%A1-35tr-mua-th%E1%BA%BB-silv/3732139236890099/,https://www.facebook.com/Thammykangnam/posts/-ph%E1%BA%ABu-thu%E1%BA%ADt-ch%E1%BB%89nh-h%C3%ACnh-h%C3%A0m-m%E1%BA%B7t-m%E1%BB%99t-trong-nh%E1%BB%AFng-ph%E1%BA%ABu-thu%E1%BA%ADt-c%E1%BA%A7n-c%C3%B4ng-ngh%E1%BB%87-v%C3%A0-ekip-/3931478750289479/,https://m.facebook.com/profile.php?id=100083434984713,https://ja-jp.facebook.com/Thammykangnam/,https://www.facebook.com/Thammykangnam/photos/a.380259948744728/582235245213863/?type=3,https://www.facebook.com/benhvienthammy.yuno/,https://www.facebook.com/Thammykangnam/posts/-th%C3%A1ng-8-th%E1%BA%A9m-m%E1%BB%B9-%C4%91%E1%BA%B7t-c%E1%BB%8Dc-kangnam-off-t%E1%BB%9Bi-60-t%E1%BA%B7ng-th%C3%AAm-t%E1%BB%9Bi-4-tri%E1%BB%87u-ti%E1%BB%81n-m%E1%BA%B7t-tr%E1%BA%A3-g/3910305779073443/,https://www.facebook.com/VNbanobagi/,https://es-la.facebook.com/Thammykangnam/photos/%D0%BD%C3%BA%D1%82-%D0%BC%E1%BB%A1-laser-lipo-h%E1%BA%BFt-ngay-%D0%BC%E1%BB%A1-th%E1%BB%ABa-d%C3%A1%CE%BDg-%C4%91%E1%BA%B9p-nh%C6%B0-%D0%BC%C6%A1-%D0%BC%E1%BB%A1-kh%C3%B4ng-t%C3%ADch-t%E1%BB%A5-l%E1%BA%A1i-t%E1%BA%B7ng-nga/845172792253439/,https://m.facebook.com/Thammykangnam/photos/a.380259948744728/1077857398984976/?type=3&locale2=pt_BR,https://m.facebook.com/1306904006134824,https://m.facebook.com/2627688194022623,https://zh-tw.facebook.com/benhviendaihocyduoc/posts/1701536236697355/,https://www.facebook.com/groups/523860158502219/,https://m.facebook.com/benhviendaihocyduoc/photos/l%E1%BB%B1a-ch%E1%BB%8Dn-c%C6%A1-s%E1%BB%9F-l%C3%A0m-%C4%91%E1%BA%B9p-th%C3%B4ng-minh-an-to%C3%A0nquan-ni%E1%BB%87m-t%E1%BB%91t-g%E1%BB%97-h%C6%A1n-t%E1%BB%91t-n%C6%B0%E1%BB%9Bc-s%C6%A1n-t%E1%BB%AB-th/1701535363364109/?locale2=fa_IR,https://ne-np.facebook.com/bvquyhoa/posts/5738624102825255/,https://www.facebook.com/vananspa.hcm/photos/a.167307470562277/281052182521138/?type=3,https://m.facebook.com/3055709094552427,https://ne-np.facebook.com/photo/?fbid=3622154894477462&set=ecnf.100000489605863,https://ne-np.facebook.com/ngocdungbeautycenter/videos/s%E1%BB%9F-h%E1%BB%AFu-ngay-su%E1%BA%A5t-tr%E1%BA%A3i-nghi%E1%BB%87m-s%E1%BB%9Bm-c%C6%A1-s%E1%BB%9F-l%C3%A0m-%C4%91%E1%BA%B9p-%C4%91%E1%BA%B3ng-c%E1%BA%A5p-5-sao-t%E1%BA%A1i-h%C3%A0-th%C3%A0nh-ngay-/293706752093396/,https://www.facebook.com/ebe.mobi/,https://vi-vn.facebook.com/TMNEVADA/photos/a.802636686522794/4958320160954405/?type=3,https://www.facebook.com/vanhoathanglong/,https://www.facebook.com/pages/Khoa-T%E1%BA%A1o-M%E1%BA%ABu-V%C3%A0-Ch%C4%83m-S%C3%B3c-S%E1%BA%AFc-%C4%90%E1%BA%B9p/439147346183378,https://www.facebook.com/khoataohinhthammy/,https://www.facebook.com/kellyspadongha/,https://hi-in.facebook.com/photo/?fbid=10158488840556973&set=g.1166106920440331,https://m.facebook.com/134099824825104,https://www.facebook.com/diendantaynguyen/photos/%C4%91%E1%BA%AFk-l%E1%BA%AFk-d%E1%BB%8Bch-v%E1%BB%A5-th%E1%BA%A9m-m%E1%BB%B9-chui-ngang-nhi%C3%AAn-ho%E1%BA%A1t-%C4%91%E1%BB%99ng-ch%E1%BB%89-c%E1%BA%A7n-l%C6%B0%E1%BB%9Bt-face-l%C6%B0%E1%BB%9Bt-web-v%E1%BB%9B/3548416455209064/,https://m.facebook.com/2365358067088750,https://m.facebook.com/3752015804820741,https://www.facebook.com/canhhoaspa36/,https://www.facebook.com/ThammyvienHoaiAnh/,https://www.facebook.com/Thammykangnam/photos/a.380259948744728/3722928391144517/?type=3,https://vi-vn.facebook.com/tccdhn/,https://www.facebook.com/kimacademy.official/,https://m.facebook.com/thongtinhanquoc/photos/a.10150205065910878.310905.102974175877/10153475133215878/,https://m.facebook.com/186577119624608,https://m.facebook.com/1749129848583230,https://www.facebook.com/thammyvienbacsitu/photos/a.951084124965197/4163290457077865/?type=3,https://www.facebook.com/ngocdungbeautycenter/photos/a.2964970203743248/2962795497294052/?type=3,https://www.facebook.com/123nguyenha/,https://www.facebook.com/ThamMyVienSi/,https://nb-no.facebook.com/snowwhite.dn/,https://www.facebook.com/trongthanhthammy/,https://www.facebook.com/connectviet365/videos/khai-tr%C6%B0%C6%A1ng-c%C6%A1-s%E1%BB%9F-l%C3%A0m-%C4%91%E1%BA%B9p/1699094883782180/,https://www.facebook.com/1457119674476319,https://www.facebook.com/Spa-H%C6%B0%C6%A1ng-M%E1%BA%ADn-c%C6%A1-s%E1%BB%9F-2-1171648852870395/,https://ms-my.facebook.com/lahaclinic/videos/spa-ph%C3%B2ng-kh%C3%A1m-m%E1%BB%8Dc-l%C3%AAn-nh%C6%B0-n%E1%BA%A5m-%C4%91%C3%A2u-m%E1%BB%9Bi-l%C3%A0-c%C6%A1-s%E1%BB%9F-uy-t%C3%ADn/1462177320956041/,https://he-il.facebook.com/photo/?fbid=10223151647408878&set=ecnf.1513096102,https://ms-my.facebook.com/beatbinhphuoc/posts/b%C3%ACnh-ph%C6%B0%E1%BB%9Bc-c%C6%A1-s%E1%BB%9F-l%C3%A0m-%C4%91%E1%BA%B9p-h%C3%A1t-cho-nhau-nghe-karaoke-massage-bar-v%C5%A9-tr%C6%B0%E1%BB%9Dng-tr%C3%B2-ch%C6%A1/1837944133068738/,https://www.facebook.com/thammyvienhoakybsminhBVTrungVuong/photos/a.272329966766312/272363173429658/?type=3,https://ne-np.facebook.com/101158631290984/photos/ch%E1%BB%A9ng-ch%E1%BB%89-h%C3%A0nh-ngh%E1%BB%81-spa-phun-th%C3%AAu-t%C3%B3c-nailtrang-%C4%91i%E1%BB%83m%EF%B8%8F-b%E1%BA%A1n-l%C3%A0m-v%E1%BB%81-spa-phun-th%C3%AAu-t/647819976624844/,https://ms-my.facebook.com/bstuanduong.vn/videos/l%C3%A0m-%C4%91%E1%BA%B9p-ph%E1%BA%A3i-t%C3%ACm-c%C6%A1-s%E1%BB%9F-uy-t%C3%ADn-k%E1%BA%BFt-qu%E1%BA%A3-s%E1%BB%ADa-m%C3%AD-ngay-sau-30-ph%C3%BAt-t%E1%BA%A1i-tu%E1%BA%A5n-d%C6%B0%C6%A1ng/710975650221281/,https://www.facebook.com/hoisinhvienvietnamthanhphohanoi/photos/a.310430053004684/519294512118236/?type=3,https://www.facebook.com/media/set/?set=a.357655437680671.1073741828.293716300741252&type=3,https://m.facebook.com/3837088553040370,https://m.facebook.com/1120637181611305,https://www.facebook.com/hashtag/phunmoi/,https://m.facebook.com/480188086719840,https://www.facebook.com/tochucthicapchungchihanhnghe/,https://m.facebook.com/Th%E1%BA%A9m-m%E1%BB%B9-vi%E1%BB%87n-SHE-chuy%C3%AAn-ch%C4%83m-s%C3%B3c-l%C3%A0m-%C4%91%E1%BA%B9p-1154299484756417/posts/,https://m.facebook.com/drhoangtuan.halong/photos/a.321805681829031/723633598312902/?type=3,https://www.facebook.com/reviewspa.tmv.cotam/,https://www.facebook.com/thammyvienthienhatienhai/,https://m.facebook.com/215439543497117,https://www.facebook.com/AnhDiorBeauty/photos/a.1800373843539990/2346695752241127/?type=3,https://www.facebook.com/2665281367045882,https://vi-vn.facebook.com/phuonganhbeautyspa/,https://m.facebook.com/164628198629744,https://www.facebook.com/ThuCucClinicsVN/photos/a.722639054555618/1973042219515289/?type=3,https://www.facebook.com/MaiBeautyClinic/,https://vi-vn.facebook.com/trangtikeyti/,https://m.facebook.com/VienMatQuocTe/photos/a.633558093340612/2669538839742517/?type=3&locale=hi_IN&_rdr,https://m.facebook.com/920622291747839/,https://www.facebook.com/hashtag/dieutrimun/,https://m.facebook.com/Th%E1%BA%A9m-M%E1%BB%B9-Vi%E1%BB%87n-Qu%E1%BB%91c-T%E1%BA%BF-Mina-C%E1%BA%A7n-Th%C6%A1-L%C3%A0m-%C4%91%E1%BA%B9p-T%E1%BA%A1i-Nh%C3%A0-104430444876788/posts/,https://m.facebook.com/187745216247034,https://www.facebook.com/thongtanxatudo/photos/a.879658782175298/1922962577844908/?type=3,https://ms-my.facebook.com/clesy.nsenga,https://www.facebook.com/SeoulSpa.Vn.BinhPhuoc/photos/a.116334216387933/284508002903886/?type=3,https://www.facebook.com/groups/882768658741222/,https://www.facebook.com/106433947893349/photos/a.106458851224192/123924749477602/?type=3,https://www.facebook.com/TTTMXuanHung/,https://www.facebook.com/mailisagroup/,https://www.facebook.com/thammybeautycenterbytam/,https://www.facebook.com/vuongquoctrimun/,https://www.facebook.com/vienthammykim.hcm/,https://m.facebook.com/Th%E1%BA%A9m-M%E1%BB%B9-Vi%E1%BB%87n-Th%E1%BB%A7y-Ti%C3%AAn-287422441436430/,https://vi-vn.facebook.com/thammyvienbacsitu/,https://www.facebook.com/thammyvienedena/,https://vi-vn.facebook.com/ThamMyXuanHuong/,https://www.facebook.com/ThammyOrchard/,https://www.facebook.com/thammylinhanh.vn/,https://www.facebook.com/tmvethics/,https://www.facebook.com/thammyvienquocteaura/,https://vi-vn.facebook.com/pages/category/beauty-salon/Th%E1%BA%A9m-M%E1%BB%B9-Vi%E1%BB%87n-Th%E1%BB%A7y-Ti%C3%AAn-287422441436430/,https://www.facebook.com/ThamMyVienADONA/,https://www.facebook.com/tmvseoulspa.vn.thuduc/,https://www.facebook.com/ThamMyVienMIRA/,https://www.facebook.com/TMVQT.CHARMED/,https://www.facebook.com/BenhVienThamMyVietMy/,https://www.facebook.com/opheliabeautycenter/,https://www.facebook.com/Thammyvienanhkhoi/,https://www.facebook.com/mimosalongbien/,https://www.facebook.com/seoulcenter.vn/,https://www.facebook.com/medicskinvietnam/,https://m.facebook.com/mailisagroup/posts/,https://www.facebook.com/SeoulSpa.Vn.TienGiang/,https://www.facebook.com/thammysaigonn/,https://m.facebook.com/2383432278550270,https://www.facebook.com/VIENSACDEPSOHEE/,https://www.facebook.com/pages/category/spa-beauty-personal-care/Th%E1%BA%A9m-m%E1%BB%B9-vi%E1%BB%87n-Thuys-325500900953747/,https://www.facebook.com/mycatspa/,https://www.facebook.com/tmvhoanmy/,https://www.facebook.com/Thammybichhoa/,https://www.facebook.com/jolliedclinic.vn/,https://vi-vn.facebook.com/ThamMyXuanHuong/posts/2952275288157792/,https://www.facebook.com/seoulspa.vn.vinhlong/,https://m.facebook.com/mailisagroup/live_videos/?locale2=vi_VN,https://www.facebook.com/596642684081372,https://www.facebook.com/SlinaClinic/,https://www.facebook.com/pages/category/beauty-salon/Th%E1%BA%A9m-M%E1%BB%B9-Vi%E1%BB%87n-108-C%C6%A1-S%E1%BB%9F-Tuy%C3%AAn-Quang-107349384681589/,https://www.facebook.com/ThamMyVienLian/,https://www.facebook.com/Thammyviensline/,https://www.facebook.com/3963653996992219,https://www.facebook.com/people/Th%E1%BA%A9m-M%E1%BB%B9-Vi%E1%BB%87n-TT-B%E1%BA%AFc-Ninh/100063705115996/,https://m.facebook.com/197249362113461,https://m.facebook.com/237373656934754,https://www.facebook.com/1368895153267900,https://www.facebook.com/749320429104101,https://www.facebook.com/SeoulSpa.Vn.VungTau/,https://www.facebook.com/myviennamphuong/,https://www.facebook.com/ngochuongvietnam/,https://m.facebook.com/811137052749745,https://www.facebook.com/LacianaCosmestic/,https://www.facebook.com/daynghespa/,https://m.facebook.com/675874403001908,https://m.facebook.com/853773921852694,https://www.facebook.com/329027771009911,https://m.facebook.com/3161306270593732,https://www.facebook.com/seoulspa.vn.dian/,https://vi-vn.facebook.com/thammytrangdung/,https://www.facebook.com/vienthammychidep/,https://www.facebook.com/thaoxinhcngovap/,https://www.facebook.com/vienthammyohara/,https://www.facebook.com/groups/toansongngutieuhoc/,https://www.facebook.com/mailisagroup/live_videos,https://m.facebook.com/ThamMyVienMIRA/posts/,https://www.facebook.com/309890543180178,https://www.facebook.com/1128981127541810,https://m.facebook.com/281237783643163,https://m.facebook.com/3536389993050535,https://m.facebook.com/1311953678995099,https://www.facebook.com/2833412600262353,https://www.facebook.com/413665106662526,https://m.facebook.com/150849080195132,https://m.facebook.com/697401704264677,https://www.facebook.com/vienthammybangkok/,https://m.facebook.com/1327975537602799,https://m.facebook.com/546489996041304,https://m.facebook.com/976739025850899,https://www.facebook.com/298446460772313,https://www.facebook.com/SeoulSpa.Vn.BaoLoc/,https://m.facebook.com/738167260430836,https://www.facebook.com/benhvienthammyjwhanquoc/,https://m.facebook.com/407916900603273,https://m.facebook.com/170890441486191,https://www.facebook.com/ThamMyVienDongANgheAn/,https://www.facebook.com/478515160205635,https://m.facebook.com/3257769897641012,https://www.facebook.com/1189686498115586,https://www.facebook.com/SeoulSpa.Vn.BinhDuong/,https://www.facebook.com/ThamMyXuanHuong/posts/-n%C3%A2ng-cung-m%C3%A0y-gi%E1%BA%A3i-ph%C3%A1p-th%E1%BA%A9m-m%E1%BB%B9-gi%C3%BAp-x%C3%B3a-nh%C3%B2a-d%E1%BA%A5u-hi%E1%BB%87u-tu%E1%BB%95i-t%C3%A1c-n%C6%A1i-%C4%91%C3%B4i-m%E1%BA%AFtt%E1%BB%AB-t/2587199147998743/,https://m.facebook.com/757050044997806,https://m.facebook.com/2349008385156802,https://m.facebook.com/538435716568736,https://www.facebook.com/189059132988599,https://m.facebook.com/2740412312942267,https://m.facebook.com/142478090807665,https://www.facebook.com/churrascariaspettus/,https://m.facebook.com/833064797281987,https://www.facebook.com/NhaKhoaParis/,https://www.facebook.com/NHAKHOAKIM/,https://www.facebook.com/nhakhoaanna/,https://www.facebook.com/nhakhoaasia/,https://www.facebook.com/trongrangsaigon/,https://www.facebook.com/NhaKhoaDelia/,https://www.facebook.com/nhakhoadongnam/,https://www.facebook.com/nhakhoalananhVN/,https://www.facebook.com/nhakhoafamily.vn/,https://www.facebook.com/nhakhoahanseoul/,https://www.facebook.com/dainamdental/,https://www.facebook.com/NhaKhoaMinhKhai/,https://www.facebook.com/thuyanhclinic/,https://www.facebook.com/NhaKhoaQuocTeVietPhapHN/,https://www.facebook.com/rangbaongoc/,https://www.facebook.com/nhakhoaocare/,https://www.facebook.com/nhakhoaparkway/,https://www.facebook.com/nhakhoakorea/,https://www.facebook.com/nhakhoa.implant.danang/,https://www.facebook.com/nhakhoadrhung.com.vn/,https://www.facebook.com/Nhakhoahanoitimesmile/,https://vi-vn.facebook.com/nhakhoa.nhungoc/,https://www.facebook.com/nhakhoatrongrangtphcm/,https://www.facebook.com/nhakhoa235/,https://vi-vn.facebook.com/Nhakhoapt.net/,https://www.facebook.com/nhakhoacaothang/,https://vi-vn.facebook.com/Nhakhoavietcuong/,https://www.facebook.com/nk.dongnama/,https://www.facebook.com/nucuoivietmientrung/,https://www.facebook.com/NhaKhoaCheese/,https://www.facebook.com/NhaKhoaNguyenLam/,https://vi-vn.facebook.com/nhakhoanicesmile/,https://www.facebook.com/nhakhoahungcuong.com.vn/,https://www.facebook.com/NhakhoathammyStar/,https://www.facebook.com/nhakhoaocean/,https://www.facebook.com/NhaKhoaArtDentist/,https://www.facebook.com/BSBuiThanhTrieu/,https://www.facebook.com/niengrang.vietsmile/,https://www.facebook.com/HETHONGNHAKHOASAIGONQUOCTE/,https://www.facebook.com/nhakhoatrehanoi/,https://www.facebook.com/NhaKhoa.HoangTuan/,https://www.facebook.com/nhakhoaflora/,https://www.facebook.com/nhakhoaparis.nguyenthaihoc/,https://m.facebook.com/people/Nha-Khoa-SV/100053217289237/,https://www.facebook.com/NhaKhoaBlossom/,https://vi-vn.facebook.com/nhakhoamekong/,https://www.facebook.com/nhakhoasydney/,https://vi-vn.facebook.com/imednhakhoa/,https://www.facebook.com/MIDDentalClinic/,https://www.facebook.com/NhaKhoaThongMinhAuris/,https://www.facebook.com/NhaKhoaGTGT/,https://www.facebook.com/tuyendungnhakhoakim/,https://www.facebook.com/Hiromidentalclinic/,https://www.facebook.com/vatlieunhakhoa.net/,https://www.facebook.com/NhakhoaParisHaiPhong/,https://www.facebook.com/nhakhoawestway/,https://www.facebook.com/Nhakhoathiensu/,https://www.facebook.com/Dentos.vn/,https://www.facebook.com/jpdentist.hcm2/,https://www.facebook.com/Nhakhoapt.net/,https://www.facebook.com/NhakhoaparisDanang/,https://www.facebook.com/NHAKHOAKIM/posts/,https://m.facebook.com/121392306660689,https://vi-vn.facebook.com/NhaKhoaTheHeMoi/,https://www.facebook.com/pages/category/dentist/Nha-Khoa-Kim-2250370235077864/,https://www.facebook.com/NhaKhoaHappys/,https://m.facebook.com/107162494841276,https://www.facebook.com/niengrang3c/,https://www.facebook.com/nhakhoakaiyenclinic/,https://www.facebook.com/idcdanangdentist/,https://www.facebook.com/nhakhoaphuong365/,https://m.facebook.com/2628296317430962,https://www.facebook.com/NhakhoaManhHung/,https://m.facebook.com/155256476056803,https://m.facebook.com/1046012819186640,https://www.facebook.com/NHAKHOAKIM/posts/-n%E1%BA%BFu-b%E1%BA%A1n-%C4%91ang-sinh-s%E1%BB%91ng-%E1%BB%9F-tpm%E1%BB%B9-tho-ti%E1%BB%81n-giang-th%C3%AC-b%E1%BA%A1n-kh%C3%B4ng-th%E1%BB%83-b%E1%BB%8F-qua-th%C3%B4ng-tin/1457403487681955/,https://www.facebook.com/nhakhoatriviet/,https://www.facebook.com/nhakhoaphucnguyenbmt/,https://www.facebook.com/NKVipLab/,https://m.facebook.com/753120282145549,https://m.facebook.com/drhaithedentist/posts/194187059016419/,https://www.facebook.com/nhakhoahandaothaibinh/,https://m.facebook.com/327069561203243,https://m.facebook.com/134242115101020,https://www.facebook.com/nhakhoaquocanhcm/,https://vi-vn.facebook.com/pages/category/Orthodontist/NHA-KHOA-BA-%C4%90%C3%8CNH-222780271852288/,https://www.facebook.com/nbidental/,https://www.facebook.com/nhakhoadaisy.vn/,https://m.facebook.com/1719826514840321,https://m.facebook.com/149583970444486,https://www.facebook.com/nhakhoavietanh/,https://www.facebook.com/NhakhoaDrBao/,https://www.facebook.com/parkwaysaigon/,https://www.facebook.com/quangkhai.nhakhoa/,https://m.facebook.com/100072603034395,https://www.facebook.com/nhakhoanganphuong/,https://m.facebook.com/3689167557857225,https://www.facebook.com/nhakhoaprocarehanoi/,https://www.facebook.com/mysmileclinic.vn/,https://www.facebook.com/half.abeautyspa/,https://vi-vn.facebook.com/nhobeautyspa/,https://www.facebook.com/half.abeautyspa/posts/-cu%E1%BB%91i-tu%E1%BA%A7n-v%E1%BB%ABa-qua-%C2%BD-beauty-spa-%C4%91%C3%A3-%C4%91%C6%B0%E1%BB%A3c-ti%E1%BA%BFp-%C4%91%C3%B3n-c%C3%B4-n%C3%A0ng-vie-nguy%E1%BB%85n-xinh-%C4%91%E1%BA%B9p-c%E1%BA%A3m/124948858855512/,https://www.facebook.com/miabeautyspavn/,https://vi-vn.facebook.com/MaiBeautyClinic/,https://www.facebook.com/combeautyspa/,https://www.facebook.com/ccbeautysaigon/,https://www.facebook.com/BonBeautySpa.0938462186/,https://www.facebook.com/TrangBeautySpa.Clinic/,https://m.facebook.com/people/Lux-Beauty-Spa-G%E1%BB%99i-%C4%91%E1%BA%A7u-d%C6%B0%E1%BB%A1ng-sinh/100083258560973/,https://www.facebook.com/maibeautyspa.q7/,https://www.facebook.com/gembeauty.clinic/,https://www.facebook.com/SorellaBeautySpa/,https://www.facebook.com/ShiSpa.vn/,https://www.facebook.com/svietbeautyspa/,https://www.facebook.com/hyspa.vn/,https://www.facebook.com/Merbeautyspa/,https://facebook.com/100063906620940,https://www.facebook.com/shynhbeautynguyengiatri/,https://www.facebook.com/9Carat/,https://www.facebook.com/186224453277932,https://www.facebook.com/HighlandBeautySpa/,https://vi-vn.facebook.com/TheBeautySpa/photos/,https://m.facebook.com/2320408388029194,https://vi-vn.facebook.com/lalabeautyspa.vn/,https://www.facebook.com/iseulspa/,https://m.facebook.com/398772947329419,https://m.facebook.com/123103123027804,https://m.facebook.com/2769224956676811,https://www.facebook.com/beautyspavungtau/,https://m.facebook.com/114803937244924,https://m.facebook.com/2250789301892403,https://m.facebook.com/455155728221826,https://m.facebook.com/1429268390615740,https://m.facebook.com/127880415768130,https://www.facebook.com/CrystalBeautySpaAcademy/,https://www.facebook.com/luxurybeautyspaquynhon/,https://m.facebook.com/156584336376537,https://m.facebook.com/289411081674510,https://m.facebook.com/286199009449667,https://m.facebook.com/1104921233269187,https://m.facebook.com/109184674407239,https://m.facebook.com/374934287235868,https://www.facebook.com/baborspavn/,https://m.facebook.com/104295631417256,https://www.facebook.com/737423273286720,https://m.facebook.com/228830941952656,https://www.facebook.com/SpaViettaiNhat/,https://www.facebook.com/shynhbeautyspacantho/,https://www.facebook.com/femmebeautyspadn/,https://www.facebook.com/depcungskybeautyspa/,https://m.facebook.com/211835247123381,https://m.facebook.com/4403756189654039,https://m.facebook.com/105785041438780,https://www.facebook.com/MisshaBeautySpa/,https://m.facebook.com/2874534649425923,https://m.facebook.com/1696623950456529,https://m.facebook.com/288256206346935,https://ne-np.facebook.com/MaiBeautyClinic/photos/-mai-beauty-spa-khai-tr%C6%B0%C6%A1ng-c%C6%A1-s%E1%BB%9F-th%E1%BB%A9-3-t%E1%BA%A1i-g%C3%B2-v%E1%BA%A5p-mai-beauty-spa-%C4%91ang-tr%C3%AAn-con-/2760625870717462/,https://m.facebook.com/315611515814968,https://m.facebook.com/2543401685897907,https://m.facebook.com/152465379942326,https://m.facebook.com/111618704179622,https://m.facebook.com/1355622651473337,https://m.facebook.com/1884988021638938,https://m.facebook.com/525572598852696,https://m.facebook.com/169661458254498,https://m.facebook.com/1217914905220750,https://m.facebook.com/3456960241071486,https://m.facebook.com/668436657161700,https://m.facebook.com/1375353132827591,https://m.facebook.com/225410282432544,https://m.facebook.com/318052423152246,https://m.facebook.com/2710728225811062,https://www.facebook.com/depbeautyspa/,https://m.facebook.com/120938480056408,https://m.facebook.com/1343362236009349,https://m.facebook.com/279368240353998,https://m.facebook.com/174204151226969,https://m.facebook.com/195811968729925,https://m.facebook.com/710221316316567,https://m.facebook.com/2265824550388878,https://m.facebook.com/195340475286660,https://m.facebook.com/158010589336723,https://m.facebook.com/174347281220976,https://m.facebook.com/250429426388075,https://m.facebook.com/969125433570565,https://m.facebook.com/257009152396769,https://m.facebook.com/1405311913171077,https://m.facebook.com/1397642790597167,https://it-it.facebook.com/zahedidental/,https://m.facebook.com/197919768854597,https://m.facebook.com/134595931657097,https://m.facebook.com/201370485112126,https://m.facebook.com/955731114854867,https://m.facebook.com/633710690819829,https://m.facebook.com/235316807009643,https://m.facebook.com/chuyengiatrimuntangoc/,https://www.facebook.com/ansspavn/,https://www.facebook.com/laspa.hcm/,https://www.facebook.com/saspasaigon/,https://www.facebook.com/ansspapremium/,https://www.facebook.com/antayspa/,https://www.facebook.com/thespabarvn/,https://www.facebook.com/garden.spa.357/,https://www.facebook.com/senspa.vietnam/,https://www.facebook.com/inspaquan12.vn/,https://www.facebook.com/lamspahcm/,https://www.facebook.com/ngospa1/,https://www.facebook.com/JasmineSpa.vn/,https://www.facebook.com/profile.php?id=100054981864642,https://www.facebook.com/KoiSpaForMen/,https://www.facebook.com/suspanhatrang/,https://www.facebook.com/YBSpa.vn/,https://www.facebook.com/ShiSpa.vn/,https://www.facebook.com/Quyet.DesembreVietNam/,https://www.facebook.com/camonspathaodien/,https://www.facebook.com/OmamoriSpa/,https://www.facebook.com/salemspadanang/,https://www.facebook.com/nadam.com.vn/,https://www.facebook.com/duyenspadermalogica/,https://www.facebook.com/torispa/,https://www.facebook.com/JjimJilBangQ3/,https://www.facebook.com/vyspa.vn/,https://www.facebook.com/DIYOUMediSpa/,https://www.facebook.com/mommyspa/,https://www.facebook.com/JustSpaandYou/,https://www.facebook.com/coconutspa.com.vn/,https://www.facebook.com/hanoiurbanoasisspa/,https://www.facebook.com/oanispadn/,https://www.facebook.com/senspanhatrang/,https://www.facebook.com/orientspahanoi/,https://www.facebook.com/chuyenchamsocvatrilieuda/,https://www.facebook.com/dreamspa449/,https://www.facebook.com/heraspavn/,https://www.facebook.com/leindochina/,https://www.facebook.com/teraspa/,https://www.facebook.com/www.tuxedo.vn/,https://www.facebook.com/ChamSpaNail/,https://www.facebook.com/lavieenrosespa/,https://www.facebook.com/paradisespa.vn/,https://www.facebook.com/camiaresortspa/,https://www.facebook.com/gaspagroups/,https://vi-vn.facebook.com/kawaiispa/posts/,https://www.facebook.com/MyspaVietnam/,https://www.facebook.com/lauraspa134/,https://www.facebook.com/mybagspavn/,https://www.facebook.com/serenespahanoi/,https://www.facebook.com/callaspa/,https://www.facebook.com/bongspavn/,https://www.facebook.com/skincarewithher/,https://www.facebook.com/media/set/?set=a.586803622711583&type=3,https://www.facebook.com/SabaiSpaVietnam/,https://www.facebook.com/saparelaxhotel/,https://www.facebook.com/HyattRegencyDanang/,https://www.facebook.com/metomspa/,https://www.facebook.com/spa100thaomoc/,https://www.facebook.com/excellencespa68/,https://www.facebook.com/SpaAnhLee/,https://www.facebook.com/sieuspa/,https://www.facebook.com/spasnowwhite/,https://www.facebook.com/mayspahanoi/,https://www.facebook.com/Lamspaquan1/,https://www.facebook.com/AnZenspa.massage/,https://www.facebook.com/1128924800605189,https://www.facebook.com/lamspaquan7/,https://www.facebook.com/BONSpa.beauty.mombabycare/,https://www.facebook.com/daynghespa/,https://www.facebook.com/landmark72spa/,https://www.facebook.com/depcungskybeautyspa/,https://www.facebook.com/Thewesthotelhanoi/,https://www.facebook.com/spaphanthi/,https://www.facebook.com/svanclinic.vn/,https://www.facebook.com/charmspadanang/,https://www.facebook.com/Minahotelspa/,https://www.facebook.com/Tiemcotam.vn/,https://www.facebook.com/ndcspa.saigon/,https://www.facebook.com/namspa/,https://www.facebook.com/ciciliadanang/,https://www.facebook.com/Mido-Spa-511475115882018/,https://www.facebook.com/TheOmSpaVietnam/,https://www.facebook.com/lasenspa/,https://www.facebook.com/AnspaDaNang/,https://www.facebook.com/mocspagarden/,https://www.facebook.com/HTSpaSaiGon/,https://www.facebook.com/gracehotelandspa/,https://www.facebook.com/EvianSpaHanoi/,https://www.facebook.com/laquespa/,https://www.facebook.com/MayuEsthetic/,https://www.facebook.com/AquaSpa2828/,https://www.facebook.com/VeniceSpaPhanRang/,https://www.facebook.com/ellisspa/,https://www.facebook.com/alisahotelspa/,https://www.facebook.com/myaspa.vn/,https://www.facebook.com/NamiSpaBeauty/,https://vi-vn.facebook.com/biz/jurong-singapore-sg/spa/,https://www.facebook.com/galleryboutiquehotel/,https://www.facebook.com/1900HairSalonSaiGon/,https://www.facebook.com/dangminhcuong1506/,https://www.facebook.com/chiendaikhairsalon/,https://www.facebook.com/1900hairsalon108nguyenhyquang/,https://www.facebook.com/hairsalonji/,https://www.facebook.com/hethongtocsinhanh/,https://www.facebook.com/hairsalonVuHoang/,https://www.facebook.com/luxehairsalon.vn/,https://www.facebook.com/theonehairsalonquan7/,https://www.facebook.com/sassihairsalonsg/,https://www.facebook.com/leehairsalon.vn/,https://www.facebook.com/hairsalonchitam/,https://www.facebook.com/salonmisu/,https://www.facebook.com/Khanghairsalon90/,https://www.facebook.com/HairSalonDatLiver/,https://www.facebook.com/pinkyhairshop/,https://vi-vn.facebook.com/Zussohairsalon/,https://www.facebook.com/salontuannguyenvip/,https://www.facebook.com/avoonghairsalon/,https://www.facebook.com/hairsalontricatwalk/,https://www.facebook.com/GIANGHairSalon1/,https://www.facebook.com/hanahairsalonnn/,https://www.facebook.com/JOJOKoreanHairSalon/,https://www.facebook.com/Venus248minhkhai/,https://www.facebook.com/Ziohair.vn/,https://www.facebook.com/1991.HAIR.SALON/,https://www.facebook.com/hairsalondong.vn/,https://www.facebook.com/huonghairsalonsince1992/,https://www.facebook.com/khuongminhcollection/,https://www.facebook.com/Tuhairsalon289KimMa/,https://www.facebook.com/vikeystudiohairsalon/,https://www.facebook.com/namhairsalon/,https://www.facebook.com/profile.php?id=100067386104571,https://m.facebook.com/hairsalonleephat/posts/,https://www.facebook.com/pages/category/Hair-Salon/Tanny-Vu-Hair-Salon-113834910415015/,https://www.facebook.com/hairsalonleephat/,https://www.facebook.com/gitocdeptanphu/,https://www.facebook.com/baosangtao/,https://www.facebook.com/jinhairsalondiemlamtocdep/,https://www.facebook.com/HairSalonNhatTam/,https://www.facebook.com/windhairsalon.hcm/,https://www.facebook.com/hairsalonhung.tocdep/,https://www.facebook.com/Venushairsalon86/,https://m.facebook.com/people/Lotus-Hair-Salon/100063549854520/,https://m.facebook.com/Ho%C3%A0-hair-salon-595024373918721/,https://www.facebook.com/bonjourhairsalon/,https://www.facebook.com/dung.loreal/,https://www.facebook.com/hairsalon.tam/,https://www.facebook.com/Emhairsalon/,https://www.facebook.com/365hairsalon/,https://www.facebook.com/abhairsalonhanoi/,https://www.facebook.com/NguyenHung.Hairsalon/,https://www.facebook.com/tomhandsome.hairstylist/,https://www.facebook.com/biz/hair-salon/?place_id=105704502795115,https://www.facebook.com/junahairsalon.chuyenthietketoc/,https://www.facebook.com/Trakyhairsalon66/,https://www.facebook.com/GuchiHairSalon/,https://www.facebook.com/kukai.hanoi/,https://facebook.com/100063745675901,https://www.facebook.com/Hinthairsalon/,https://www.facebook.com/caotoanmyhairsalon/,https://m.facebook.com/111759727648321,https://www.facebook.com/theone.thuduc/,https://www.facebook.com/haihairsalon/,https://www.facebook.com/athenahairdressingsalon/,https://www.facebook.com/JuBinChuyenGiaUonNhuom/,https://www.facebook.com/trakyhair68/,https://www.facebook.com/LeoLongHairSalon/,https://www.facebook.com/HeliosHairBeautySalonCS1/,https://www.facebook.com/hairsalonlamm/,https://www.facebook.com/trakyhair88/,https://www.facebook.com/hairsalonvothuan/,https://www.facebook.com/Doohairstudio/,https://www.facebook.com/people/Lotus-Hair-Salon/100063549854520/,https://www.facebook.com/biz/phu-tho-ph%C3%BA-th%E1%BB%8D-province-vn/hair-salon/,https://m.facebook.com/100064040227040,https://www.facebook.com/QHairSalon285/,https://m.facebook.com/3709968212369980,https://www.facebook.com/teehairsalon/,https://www.facebook.com/HAIRSALONTOTO/,https://www.facebook.com/56minhkhaihaibatrungHN/,https://www.facebook.com/salontocatuka/,https://www.facebook.com/biz/thanh-my-tay-ho-chi-minh-city-vn/hair-salon/,https://www.facebook.com/shs102/,https://www.facebook.com/biz/ben-cat-b%C3%ACnh-d%C6%B0%C6%A1ng-province-vn/hair-salon/,https://www.facebook.com/guHaNoi1/,https://www.facebook.com/hairsalon79atqt/,https://www.facebook.com/vinh0915116846/,https://www.facebook.com/tocdep94hahuygiap/,https://www.facebook.com/ThuHangHairSalon/,https://www.facebook.com/hairsalondechouchou/,https://www.facebook.com/vientocmiaa/,https://www.facebook.com/Salontocgovap/,https://www.facebook.com/tiepnguyenhair/,https://www.facebook.com/Oahouse51VanBao/,https://www.facebook.com/Trakyhairsalon/,https://www.facebook.com/MaiNguyenHairsalon/,https://m.facebook.com/4297262333622990,https://www.facebook.com/profile.php?id=100063781291018,https://www.facebook.com/mrarthairsalon/';
async function autoScroll(page, lengthss, like, comment, share, url) {
  const getdata = await page.evaluate(
    async (lengthss, like, comment, share, url) => {
      const data = await new Promise((resolve, reject) => {
        let totalHeight = 0;
        let distance = 1000;
        let length_feed = 0;
        let scroll = 0;
        let timer = setInterval(async () => {
          console.log(lengthss, like, comment, share);
          scroll += 1;
          if (scroll == 30) {
            clearInterval(timer);
            resolve();
          }
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy({
            top: distance,
            left: 100,
            behavior: 'smooth',
          });
          totalHeight += distance;

          if (
            window.performance.memory.jsHeapSizeLimit - window.performance.memory.jsHeapSizeLimit / 10 <
            window.performance.memory.totalJSHeapSize
          ) {
            clearInterval(timer);
            resolve();
          }

          try {
            let post = document.querySelectorAll('div');
            let newpost = Array.prototype.slice.call(post).filter((el) => el.childNodes.length === 15);
            newpost.forEach((post) => {
              for (const link of post.querySelectorAll('[role="link"]')) {
                if (link.href.indexOf(`posts`) > -1) {
                  length_feed += 1;
                  break;
                }
              }
            });
          } catch (e) {
            console.log('lỗi 2');
          }

          console.log(length_feed);
          if (length_feed - 5 >= lengthss) {
            clearInterval(timer);
            resolve();
          } else {
            length_feed = 0;
          }
          // document.querySelectorAll('[role="feed"]')[length_feed.length - 1].childNodes.forEach((item) => {
          //   if (item.className !== '' && item.nodeName == 'DIV') {
          //     length_post += 1;
          //   }
          // });
          let isbottom = document.body.scrollHeight;
          let istop = parseInt(document.documentElement.scrollTop + window.innerHeight);
          if (isbottom === istop) {
            clearInterval(timer);
            resolve();
          }

          //console.log(length_post);

          // if (post_length - 5 > _length) {
          //   clearInterval(timer);
          //   resolve();
          // }
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 2000);
      });
    },
    lengthss,
    like,
    comment,
    share,
    url
  );
  return 1;
}
async function main(req) {
  try {
    const lengths = 2;
    const cmt_length = -1;
    const conten_length = -1;
    const like = -1;
    const comment = -1;
    const share = -1;
    const post_type = 'page-jenacare';
    const craw_id = crypto.randomBytes(16).toString('hex');
    let page_id = '';
    let Posttype_id = '';
    let new_link_page = [];

    for (let i = 0; i < link_page.split(',').length; i++) {
      if (
        link_page.split(',')[i].indexOf('photo') > -1 ||
        link_page.split(',')[i].indexOf('?locale=de_DE') > -1 ||
        link_page.split(',')[i].indexOf('videos') > -1
      ) {
        let name_page = '';
        for (let j = 0; j < 4; j++) {
          if (j === 3) {
            name_page += link_page.split(',')[i].split('/')[j];
          } else {
            name_page += link_page.split(',')[i].split('/')[j] + '/';
          }
        }
        if (
          name_page.replace(/(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i, '')[
            name_page.replace(/(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i, '').length - 1
          ] !== '/'
        ) {
          new_link_page.push(
            'https://www.' + name_page.replace(/(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i, '') + '/'
          );
        } else {
          new_link_page.push('https://www.' + name_page.replace(/(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i, ''));
        }
      } else if (
        link_page.split(',')[i].indexOf('posts') > -1 ||
        link_page.split(',')[i].indexOf('groups') > -1 ||
        link_page.split(',')[i].indexOf('media') > -1 ||
        link_page.split(',')[i].indexOf('profile.php') > -1 ||
        link_page.split(',')[i].indexOf('hashtag') > -1
      ) {
        continue;
      } else {
        if (
          link_page.split(',')[i].replace(/(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i, '')[
            link_page.split(',')[i].replace(/(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i, '').length - 1
          ] !== '/'
        ) {
          new_link_page.push(
            'https://www.' + link_page.split(',')[i].replace(/(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i, '') + '/'
          );
        } else {
          new_link_page.push(
            'https://www.' + link_page.split(',')[i].replace(/(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i, '')
          );
        }
      }
    }
    new_link_page = [...new Set(new_link_page)];
    fs.writeFile('item1.txt', JSON.stringify(new_link_page, null, 2), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    return;
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disable-gpu-shader-disk-cache',
        '--media-cache-size=0',
        '--disk-cache-size=0',

        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--mute-audio',
        '--no-default-browser-check',
        '--autoplay-policy=user-gesture-required',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-notifications',
        '--disable-background-networking',
        '--disable-breakpad',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-sync',
        '--start-maximized',
      ],
      headless: false,
      defaultViewport: null,

      //product: 'chrome',
      devtools: true,
      executablePath: process.env.executablePath,
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);
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
    Posttype.findOne({ name: post_type }, async function (err, posttype) {
      if (posttype) {
        group_id = posttype._id;
      } else {
        let Posttypes = new Posttype({
          name: post_type,
          create_at: new Date(),
        });
        await Posttypes.save();
        Posttype_id = Posttypes._id;
      }
    });
    await page.goto('https://www.facebook.com', {
      waitUntil: 'load',
    });
    await page.type('#email', process.env.username_get_data2);
    await page.type('#pass', 'huubao123');
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 4000));
    for (let i = 0; i < new_link_page.length; i++) {
      try {
        await page.goto(new_link_page[i], {
          waitUntil: 'load',
        });
        const link = await page.evaluate(() => {
          return window.location.href;
        });
        if (
          link.indexOf('photos') > -1 ||
          link.indexOf('photo') > -1 ||
          link.indexOf('?locale=de_DE') > -1 ||
          link.indexOf('videos') > -1
        ) {
          let link_real = '';
          for (let j = 0; j < 4; j++) {
            link_real += link.split('/')[j] + '/';
          }
          link = link_real;
          await page.goto(new_link_page[i], {
            waitUntil: 'load',
          });
          await new Promise((r) => setTimeout(r, 2000));
        }

        const result = await page.evaluate(() => {
          return document.querySelectorAll('[dir="auto"]')
            ? document.querySelectorAll('[dir="auto"]')[1].innerText
            : document.querySelectorAll('h2')[0].textContent;
        });
        const page1 = await browser.newPage();
        await page1.goto(`${link}about`, {
          waitUntil: 'load',
        });
        await new Promise((r) => setTimeout(r, 4000));
        let info = await page1.evaluate(() => {
          try {
            let a = {};
            function aaa(text) {
              text = text
                .toLowerCase()
                .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
                .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
                .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
                .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
                .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
                .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
                .replace(/đ/g, 'd')
                .replace(/\s+/g, '-')
                .replace(/[^A-Za-z0-9_-]/g, '')
                .replace(/-+/g, '-');
              return text;
            }
            document.querySelectorAll('[role="main"] [role="button"]').forEach((el) => {
              if (el.innerText == 'Xem thêm') {
                el.click();
              }
            });

            document
              .querySelectorAll('[role="main"]')[1]
              .childNodes[3].childNodes[0].childNodes[0].childNodes.forEach((el) => {
                if (el.className === '') {
                  let string = '';
                  for (let i = 1; i < el.childNodes[0].childNodes.length; i++) {
                    string += el.childNodes[0].childNodes[i].innerText;
                  }
                  a[aaa(el.childNodes[0].childNodes[0].innerText)] = string;
                }
              });
            console.log(a);
            return a;
          } catch (e) {
            console.log(e);
            return '';
          }
        });
        await page1.close();
        if (info == {} || info == '') {
          console.log('......................');
          info = await page.evaluate(() => {
            try {
              let string = '';
              for (const el of document.querySelector('[role="contentinfo"]').parentNode.childNodes) {
                if (el.nodeName == 'DIV') {
                  el.querySelectorAll('[role="button"]').forEach((button) => {
                    if (button.innerText == 'Xem thêm') {
                      button.click();
                    }
                  });
                }
              }
              for (const el of document.querySelector('[role="contentinfo"]').parentNode.childNodes) {
                if (el.nodeName == 'DIV') {
                  string = el.innerText;
                  break;
                }
              }
              return string;
            } catch (e) {
              console.log(e);
              return '';
            }
          });
        }
        await new Promise((r) => setTimeout(r, 4000));
        Page.findOne({ url: link }, async function (err, page) {
          if (page) {
            page_id = page._id;
          } else {
            let pages = new Page({
              name: result,
              url: link,
              info: JSON.stringify(info),
              create_at: new Date(),
            });
            await pages.save();
            group_id = pages._id;
          }
        });
        await autoScroll(page, lengths, like, comment, share, link);
        await getlink(page, lengths, conten_length, like, comment, share, link).then(async function (result) {
          fs.writeFile('item1.txt', JSON.stringify(result, null, 2), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
          });
          for (let i = 0; i < lengths; i++) {
            try {
              await page.goto(result[i].post_link, {
                waitUntil: 'networkidle2',
              });
              try {
                await page.evaluate(async () => {
                  let div = document.querySelectorAll('[role = "button"]');
                  for (let i = 0; i < div.length; i++) {
                    if (
                      div[i].innerText.indexOf('Phù hợp nhất') !== -1 ||
                      div[i].innerText.indexOf('Mới nhất') !== -1 ||
                      div[i].innerText.indexOf('Tất cả bình luận') !== -1
                    ) {
                      await div[i].scrollIntoView();
                      break;
                    }
                  }
                });
              } catch (err) {}
              await page.evaluate(async () => {
                let div = document.querySelectorAll('[role = "button"]');
                for (let i = 0; i < div.length; i++) {
                  if (div[i].innerText.indexOf('Phù hợp nhất') !== -1 || div[i].innerText.indexOf('Mới nhất') !== -1) {
                    await div[i].click();
                    break;
                  }
                }
              });
              await page.evaluate(async () => {
                let div = document.querySelectorAll('[role="menuitem"]');
                for (let i = 0; i < div.length; i++) {
                  if (div[i].innerText.indexOf('Tất cả bình luận') !== -1) {
                    await div[i].click();
                    break;
                  }
                }
              });
              await autoScroll_post(page);

              await getdata(page, cmt_length).then(async function (data) {
                fs.writeFile('item111.txt', JSON.stringify(data, null, 2), (err) => {
                  if (err) throw err;
                  console.log('The file has been saved!');
                });
                let results = data;
                if (parseInt(data.imagemore) > 0) {
                  results = await loadmoremedia(page1, data);
                }

                let titles = '';
                let short_descriptions = '';
                let short_description = results.contentList ? results.contentList.replaceAll(/(<([^>]+)>)/gi, '') : '';
                for (let i = 0; i < 100; i++) {
                  let lengths = short_description.split(' ').length;
                  short_descriptions += short_description.split(' ')[i] + ' ';
                  if (lengths - 1 === i) {
                    break;
                  }
                }
                for (let i = 0; i < 100; i++) {
                  let lengths = short_description.length;
                  titles += short_description[i];
                  if (lengths - 1 === i) {
                    break;
                  }
                }
                let Image_id = [];
                if (results.linkImgs.length > 0) {
                  for (let i = 0; i < results.linkImgs.length; i++) {
                    let result_id_image = await downloadImage(results.linkImgs[i], post_type);
                    Image_id.push(result_id_image);
                  }
                }
                if (results.commentList.length > 0) {
                  for (let i = 0; i < results.commentList.length; i++) {
                    if (results.commentList[i].imageComment && results.commentList[i].imageComment != '') {
                      const imageid = crypto.randomBytes(10).toString('hex');
                      let datas = {
                        link: results.commentList[i].imageComment,
                        posttype: post_type,
                        imageid: imageid,
                      };
                      image.add({ data: datas });
                      results.commentList[i].imageComment = `images/${post_type}/${imageid}`;
                    }
                    if (results.commentList[i].children.length > 0) {
                      for (let j = 0; j < results.commentList[i].children.length; j++) {
                        if (
                          results.commentList[i].children[j].imageComment &&
                          results.commentList[i].children[j].imageComment !== ''
                        ) {
                          const imageid = crypto.randomBytes(10).toString('hex');
                          let datas = {
                            link: results.commentList[i].children[j].imageComment,
                            posttype: post_type,
                            imageid: imageid,
                          };
                          image.add({ data: datas });

                          results.commentList[i].children[j].imageComment = `images/${post_type}/${imageid}`;
                        }
                      }
                    }
                  }
                }

                let basic_fields = {
                  title: titles,
                  short_description: short_descriptions,
                  long_description: results.contentList
                    ? results.contentList.replaceAll('https://l.facebook.com/l.php?', '')
                    : '',
                  slug: '',
                  featured_image: Image_id[0] ? Image_id[0] : [],
                  session_tags: {
                    tags: [],
                  },
                  categorialue: [],
                  key: '',
                  name: '',
                  type: post_type,
                  attributes: [],
                  is_active: 1,
                  status: 'publish',
                  seo_tags: {
                    meta_title: 'New Post Facebook',
                    meta_description: 'New Post Facebook',
                  },
                };
                let custom_fields = {
                  video: results.videos,
                  date: results.date ? results.date : '',
                  post_id: results.idPost ? results.idPost : '',
                  post_link: result[i].post_link ? result[i].post_link : '',
                  user_id: results.user_id ? results.user_id : 'undefined',
                  user_name: results.user ? results.user : 'undefined',
                  count_like: results.countLike
                    ? results.countLike.toString().split(' ')[0].indexOf(',') > -1
                      ? parseInt(results.countLike.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                      : parseInt(results.countLike.toString().split(' ')[0].replace('K', '000'))
                    : 0,
                  count_comment: results.countComment
                    ? results.countComment.toString().split(' ')[0].indexOf(',') > -1
                      ? parseInt(results.countComment.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                      : parseInt(results.countComment.toString().split(' ')[0].replace('K', '000'))
                    : 0,
                  count_share: results.countShare
                    ? results.countShare.toString().split(' ')[0].indexOf(',') > -1
                      ? parseInt(results.countShare.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                      : parseInt(results.countShare.toString().split(' ')[0].replace('K', '000'))
                    : 0,
                  featured_image: Image_id[0] ? Image_id[0] : [],
                  comments: results.commentList
                    ? results.commentList.map((item) => ({
                        date: item.date ? item.date : '',
                        content: item.contentComment,
                        count_like: item.countLike
                          ? item.countLike.toString().split(' ')[0].indexOf(',') > -1
                            ? parseInt(item.countLike.toString().split(' ')[0].replace('K', '00').replace(',', ''))
                            : parseInt(item.countLike.toString().split(' ')[0].replace('K', '000'))
                          : 0,
                        user_id: item.userIDComment,
                        user_name: item.usernameComment,
                        imgComment: item.imageComment ? item.imageComment : '',
                        children: item.children
                          ? item.children.map((child) => ({
                              date: child.date ? child.date : '',
                              content: child.contentComment,
                              count_like: child.countLike
                                ? child.countLike.toString().split(' ')[0].indexOf(',') > -1
                                  ? parseInt(
                                      child.countLike.toString().split(' ')[0].replace('K', '00').replace(',', '')
                                    )
                                  : parseInt(child.countLike.toString().split(' ')[0].replace('K', '000'))
                                : 0,
                              user_id: child.userIDComment,
                              user_name: child.usernameComment,
                              imageComment: child.imageComment ? child.imageComment : '',
                            }))
                          : [],
                      }))
                    : [],
                };
                try {
                  let trash = await Trash.find();
                  let id = await trash[0].ids.find((id) => id == results.idPost);
                  if (id) {
                    console.log(id);
                  } else {
                    Post_filter_no.findOne(
                      { post_link: result[i].post_link, posttype: Posttype_id },
                      async function (err, post) {
                        if (err) {
                          console.log(err);
                        } else {
                          if (post === null) {
                            let posts = new Post_filter_no({
                              basic_fields: JSON.stringify(basic_fields),
                              custom_fields: JSON.stringify(custom_fields),
                              post_link: result[i].post_link,
                              group_page_id: page_id,
                              posttype: Posttype_id,
                              length_comments: parseInt(cmt_length),
                              title: titles,
                              create_at: new Date(),
                              status: 'active',
                              filter: false,
                            });
                            await posts.save();
                            console.log(posts._id);
                            if (results.linkImgs.length > 0) {
                              let image = new Images({
                                link_img: Image_id,
                                idPost: posts._id,
                                link_post: result[i].post_link,
                                update_at: new Date(),
                              });
                              await image.save();
                            }
                          } else {
                            await Post_filter_no.findByIdAndUpdate(
                              post._id,
                              {
                                basic_fields: JSON.stringify(basic_fields),
                                custom_fields: JSON.stringify(custom_fields),
                                title: titles,
                                create_at: new Date(),
                                length_comments: parseInt(cmt_length),
                                status: 'update',
                                filter: false,
                              },
                              { new: true }
                            );
                            console.log(post._id);
                            if (results.linkImgs.length > 0) {
                              await Images.findByIdAndUpdate(
                                post._id,
                                {
                                  link_img: Image_id,
                                  update_at: new Date(),
                                },
                                { new: true }
                              );
                            }
                          }
                        }
                      }
                    );
                  }
                } catch (e) {
                  console.log(e);
                }
              });
            } catch (e) {
              console.log(e);
              console.log('lỗi error');
            }
          }

          // // await browser2.close();
        });
      } catch (e) {}
    }
  } catch (err) {
    console.log('lỗi server', err);
  }
}

async function getlink(page, lengths, conten_length, like, comment, share, url) {
  const dimension = await page.evaluate(
    async (lengths, conten_length, like, comment, share, url) => {
      let data_link = [];

      let post = document.querySelectorAll('div');
      let newpost = Array.prototype.slice.call(post).filter((el) => el.childNodes.length === 15);
      for (const post of newpost) {
        for (const link of post.querySelectorAll('[role="link"]')) {
          if (link.href.indexOf(`posts`) > -1) {
            let href = link.href.split('?comment_id')[0];
            data_link.push({
              id: data_link.length > 0 ? data_link.length : 0,
              post_link: href,
            });
            break;
          }
        }
        if (data_link.length + 1 > lengths) {
          break;
        }
      }

      console.log(data_link);

      return data_link;
    },
    lengths,
    conten_length,
    like,
    comment,
    share,
    url
  );
  return dimension;
}
main();
