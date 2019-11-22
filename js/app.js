
var isNormalDomain = window.location.href.indexOf('app.umeweb.com')>-1?true:false;
var apiCommon = isNormalDomain?"http://app.umeweb.com/":"http://180.76.156.125:8080/";

var bannerURL = apiCommon + "cn_ume_api/app/api/banners", //banner轮播
  recommendURL = apiCommon + "cn_ume_api/app/api/tops", // 人气推荐栏目
  appURL = apiCommon + "cn_ume_api/app/api/recommends", //精品推荐
  firstURL = apiCommon + "cn_ume_api/app/api/hots", //首发app API
  singalURL = apiCommon + "cn_ume_api/app/api/others", //经典应用
  //singleGameURL = apiCommon + "cn_ume_api/app/api/apps?cid=1?offset=",
  categoryURL = apiCommon + "cn_ume_api/app/api/categories", //app分类 API
  offset = -10;
window.onload = function() {
  //顶部banner轮播图
  postBannerImg();

  //IconList 四个ICON的显示
  setIconList();

  //人气推荐-可左右滑动
  getRecommedApps(recommendURL, "recommend", false);

  //首发游戏
  getSingalApps(firstURL, 0);
  //单机游戏
  getSingalApps(singalURL, 1);
};

function refreshHtml(apps) {
  var boxes = "";
  $.each(apps, function(i, app) {
    var size = app["size"];
    // console.log(size);
    size = size == "" ? "**MB" : size;
    var downloadUrl = app["downloadUrl"];
    downloadUrl = downloadUrl == "" ? "#" : downloadUrl;
    boxes += '<li><div class="img"><a href="' + app["detailUrl"] +
      '" class="_trackEvent" data-action="click" data-label="单机游戏" data-name="' + app["title"] +
      '" onclick="_czc.push([\'_trackEvent\',\'单机游戏\',\'click\',\'' +
      app["title"] + '\', \'\', \'\']);">' +
      '<img src="' + app["icon"] + '" alt="' + app["title"] + '"> </a></div><div class="txt">' +
      '<p>' + app["title"] + '</p>';
    var line = "|";
    if (size != null) {
      boxes += '<p><span>网络游戏</span><span class="seporator">' + line + '</span><span>' + size + '</span></p>';
    } else {
      boxes += '<p><span>&nbsp;<span></p>';
    }
    boxes += '</div><a class="btn" href="' + downloadUrl + '" class="_trackEvent" data-action="download" data-label="单机游戏" data-name="' + app["title"] + '" onclick="_czc.push([\'_trackEvent\',\'单机游戏\',\'download\',\'' + app["title"] + '\', \'\', \'\']);">速装</a>';
    boxes += '</li>';
  });
  return boxes;
}
// 1.请求banner
function getBannerImg() {
  bannerURL = apiCommon + "cn_ume_api/app/api/banners";
  $.ajax({
    type: 'GET',
    url: bannerURL,
    dataType: 'json', //服务器返回json格式数据
    timeout: 10000, //超时时间设置为10秒；
    headers: {
      'Content-Type': 'application/json'
    },
    success: function(data) {
      if (data["status"] != "OK") {
        console.log("banner数据请求失败");
        return;
      }
      setBannerImg(0,data["apps"]);
    },
    error: function(xhr, type, errorThrown) {
      //异常处理；
      console.log("请求banner数据异常：" + type);
    }
  });

}
// 2.设置WeFIX参数
function getDataToPostWeFIX(){
  var params ={};
  var device_id = "860276040581386",
  ip = returnCitySN["cip"]?returnCitySN["cip"]:'116.25.45.37',
  requestId =  "4444444";
  try {
    var p = window.sumead.getAdParams();
    params = JSON.parse(p);
    device_id = params.device.imei?params.device.imei:device_id;
    requestId = params.device.androidid?params.device.androidid:requestId;
    var device ={
      "id": device_id,
      "idType": "imei",
      "ipv4": params.user.ip?params.user.ip:ip,
      "type": 1,
      "make": params.device.manufacturer?params.device.manufacturer:"",
      "brand": params.device.brand?params.device.brand:"",
      "model": params.device.model?params.device.model:"",
      "osv": params.device.osVersion?'Android '+params.device.osVersion:"",
      "h": params.device.screen_height,
      "w": params.device.screen_width,
      "network": params.user.networktype?params.user.networktype:2
    }
  } catch (e) {
    console.info(e);
    var device ={
      "id": device_id,
      "idType": "imei",
      "ipv4": ip,
      "type": 1
    }
  }
  var flowId = "F4Qw5zAkV6EbikDFAL6xbe",
    tagId = "jJSoGLTkyryMnbw2YjLrB",
    sourceId = "24LF3C2YfmCXFmerY4w74P",
    time = Date.parse(new Date()),
    text = "deviceId="+device_id+"&flowId="+flowId+"&sourceId="+sourceId,
    sign = md5(text+time);
  console.info(time);
  console.info(sign);

  var data = {
    "flowId": flowId,
    "tagId":tagId,
    "sourceId":sourceId,
    "device": device ,
    "requestId": requestId,
    "sign":sign ,
    "time": time
  }
  return data;
}
// 3.通过WeFIX参数请求广告数据
function postBannerImg(){
  bannerURL = 'http://exapi.w-fix.com/microb/api/ap/query';//
  var data =getDataToPostWeFIX();
  console.info(JSON.stringify(data));
  $.ajax({
    type: 'post',
    url: bannerURL,
    headers: {
      'Content-Type': 'application/json'
    },
    dataType: 'json',
    data: JSON.stringify(data),
    success: function(data) {
      console.info(data);
      if (data["code"] == 0) {
        setBannerImg(1,data["data"]);
      } else {
        getBannerImg();
      }
    },
    error: function(xhr, type, errorThrown) {
      //异常处理；
      console.log("请求banner数据异常：" + type);
    }
  });
  /*$.post(bannerURL, data, function(response){
    console.info(response)
  })*/
}
//设置banner
function setBannerImg(type,apps) {
  // 拼接dom
  var imgs = '';
  if(type==1){
    $.each(apps.addata.imageData, function(i, app) {
      imgs += '<div class="swiper-slide"><a href="javascript:void(0)" class="_trackEvent" data-label="banner" data-name="' + apps.addata["title"] + '"><img src="' + app["url"] + '" alt="' + apps.addata["title"] + '"></a></div>';
    });
  } else {
    $.each(apps, function (i, app) {
      imgs += '<div class="swiper-slide"><a href="' + apps[i]["downloadUrl"] + '" class="_trackEvent" data-label="banner" data-name="' + apps[i]["title"] + '" onclick="_czc.push([\'_trackEvent\',\'banner\',\'click\',\'' + apps[i]["title"] + '\', \'\', \'\']);"><img src="' + apps[i]["bannerUrl"] + '" alt="' + apps[i]["title"] + '"></a></div>';
    })
  }

  $("#banner-swipe .swiper-wrapper").html(imgs);
  $("#banner-swipe .swiper-container").append('<div class="pagination"></div>');

  // 初始化图片轮播
  var mySwiper = new Swiper('#banner-swipe .swiper-container', {
    autoplay: 2000, //可选选项，自动滑动
    loop: true, //可选选项，开启循环
    autoplayDisableOnInteraction: false,
    pagination: '.pagination',
    paginationType: 'bullets'
  });
  /*上报广告展示*/
  if(type == 1){
    var random = random4();
    var iframeHtml = '<iframe id="iframe_'+random+'" src="' + apps.track["display"] + '" width="0" height="0" frameborder="0"></iframe>'
    $('body').append(iframeHtml)
    /*点击广告*/
    $("#banner-swipe .swiper-wrapper a").click(function(){
      window._czc.push(['_trackEvent','banner','click',apps.addata["title"], '', '']);
      /*点击广告上报*/
      var random = random4();
      var iframeHtml = '<iframe id="iframe_'+random+'" src="' + apps.track["clk"] + '" width="0" height="0" frameborder="0"></iframe>'
      $('body').append(iframeHtml)
      //obj.attr('href',apps.track["landing"])
      setTimeout(function(){
        window.location.href = apps.track["landing"];
      }, 500);
    })
  }
}
/*获取4位随机数*/
function random4() {
  var data = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  var result = "";
  for (var i = 0; i < 4; i++) {
    var r = Math.floor(Math.random() * 62); //取得0-62间的随机数，目的是以此当下标取数组data里的值！
    result += data[r];
  }
  return result;
}
/*请求游戏分类*/
function setIconList() {
  // 拼接dom
  var ts = '';
  var tabsCategory = ["必备","精品","直播","游戏"];
  var imgUrlArr = ["./img/icon_r.png", "./img/icon_q.png", "./img/icon_s.png", "./img/icon_z.png"];
  var imgLinkArr = ["detail.html#appid=1", "detail.html#appid=2", "http://live.umeweb.cn/", "http://game.umeweb.cn/"];
  if (isNormalDomain) {
    imgUrlArr = ["../img/icon_r.png", "../img/icon_q.png", "../img/icon_s.png", "../img/icon_z.png"];
    imgLinkArr = ["detail#appid=1", "detail#appid=2", "http://live.umeweb.cn/", "http://game.umeweb.cn/"];
  }
  $.each(tabsCategory, function(i, tab) {
    if (i > 3) {
      return;
    }
    ts += '<li><a href="' + imgLinkArr[i] + '" class="_trackEvent" data-label="icon" data-name="' + tabsCategory[i] +
      '" onclick="_czc.push([\'_trackEvent\',\'icon\',\'click\',\'' + tabsCategory[i] + '\', \'\', \'\']);"><img src="' +
      imgUrlArr[i] + '" alt="' + tabsCategory[i] + '"></a><p>' + tabsCategory[i] + '</p></li>';
  });
  $("#icon-list ul").html(ts);
}

/**
 * [getRecommedApps 3.请求 人气推荐游戏 棋牌游戏 捕鱼游戏]
 * @Author   Linada
 * @DateTime 2018-04-10T13:44:15+0800
 * @param    {[type]}                 url    [分类请求路径]
 * @param    {[type]}                 id     [分类标签id]
 * @param    {Boolean}                isFour [是否只显示四个icon（即不可左右滑动）]
 * @return   {[type]}                        [description]
 */
function getRecommedApps(url, id, isFour) {
  $.ajax({
    type: 'GET',
    url: url,
    dataType: 'json', //服务器返回json格式数据
    timeout: 10000, //超时时间设置为10秒；
    headers: {
      'Content-Type': 'application/json'
    },
    success: function(data) {
      if (data["status"] != "OK") {
        console.log("热门游戏数据请求失败");
        return;
      }
      setRecommedApps(data["apps"], id, isFour);
    },
    error: function(xhr, type, errorThrown) {
      //异常处理；
      console.log("请求热门游戏数据异常：" + type);
    }
  });
}
// 人气推荐游戏 动态生成
function setRecommedApps(apps, id, isFour) {
  var boxes = '';
  var moreHref = id == "recommend"?"detail.html#appid=1":"detail.html#appid=2";
  if (isNormalDomain) {
    moreHref = id == "recommend"?"detail#appid=1":"detail#appid=2";
  }
  var moreHtml = '<li id="more" class="swiper-slide" ><div class="img"><a href="' + moreHref +
    '"> <img src="./img/moreimg.png" alt="more"> </a></div><p id="moreBtn">更多</p></li>';
  if(isNormalDomain){
    moreHtml = '<li id="more" class="swiper-slide" ><div class="img"><a href="' + moreHref +
      '"> <img src="../img/moreimg.png" alt="more"> </a></div><p id="moreBtn">更多</p></li>';
  }

  var text_czc = '';
  if (id === 'chess') {
    text_czc = '精品推荐';
  } else if (id === 'recommend') {
    text_czc = '人气推荐';
  }

  $.each(apps, function(i, app) {
    /*// 只显示 4 条数据
    if (i > 7 && isFour) {
        return;
    }*/
    var size = app["size"];
    size = size == "" ? "**MB" : size,
      downloadUrl = app["downloadUrl"];
    downloadUrl = downloadUrl == "" ? "#" : downloadUrl;
    boxes += '<li class="swiper-slide" ><div class="img"><a href="' + app["detailUrl"] +
      '" class="_trackEvent" data-action="click" data-label="' + id + '" data-name="' + app["title"] +
      '" onclick="_czc.push([\'_trackEvent\',\'' + text_czc + '\',\'click\',\'' +
      app["title"] + '\', \'\', \'\']);">' +
      '<img src="' + app["icon"] + '" alt="' + app["title"] + '"> </a></div>' +
      '<p>' + app["title"] + '</p>';

    if (size != null) {
      boxes += '<p>' + size + '</p>';
    } else {
      boxes += '<p>&nbsp;</p>';
    }
    boxes += '<a class="btn" href="' + downloadUrl + '" class="_trackEvent" data-action="download" data-label="' + id + '" data-name="' + app["title"] + '" onclick="_czc.push([\'_trackEvent\',\'' + id + '\',\'download\',\'' + app["title"] + '\', \'\', \'\']);">下载</a>';
    boxes += '</li>';
  });
  $("#" + id + " ul .swiper-wrapper").html(boxes);
  $("#" + id + " ul .swiper-wrapper").append(moreHtml);


  if (id == "recommend") {
    getRecommedApps(appURL, "chess", true);
  }

  if (id == "chess") {
    initSwiper(id);
    //getRecommedApps(allURL, "all", true);
  }
  // 初始化图片轮播
  /*if (id == "all") {
      initSwiper(id);
  }*/


  /*if(!isFour){
      var obj = {};
      obj.id = new Swiper("#" + id + " ul .swiper-container", {
          pagination: '.swiper-pagination-' + id,
          slidesPerView: 4.5,
          paginationClickable: true,
          spaceBetween: 25
      });
  }*/
}

function initSwiper(id) {
  var mySwiper_recommend = new Swiper("#recommend ul .swiper-container", {
    pagination: '.swiper-pagination-recommend',
    slidesPerView: 4.5,
    paginationClickable: true,
    spaceBetween: 0,
    slidesOffsetBefore: 0,
    slidesOffsetAfter: 5
  });
  var mySwiper_chess = new Swiper("#chess ul .swiper-container", {
    pagination: '.swiper-pagination-chess',
    slidesPerView: 4.5,
    paginationClickable: true,
    slidesPerColumn : 2,
    spaceBetween: 0,
    slidesOffsetAfter: 5
  });
}


// 4.请求 单机游戏/首发游戏
function getSingalApps(url, type) {
  $.ajax({
    type: 'GET',
    url: url,
    dataType: 'json', //服务器返回json格式数据
    timeout: 10000, //超时时间设置为10秒；
    headers: {
      'Content-Type': 'application/json'
    },
    success: function(data) {
      if (data["status"] != "OK") {
        console.log("热门游戏数据请求失败");
        return;
      }
      setSingalApps(data["apps"], type); //单机游戏
    },
    error: function(xhr, type, errorThrown) {
      //异常处理；
      console.log("请求热门游戏数据异常：" + type);
    }
  });
}

// 单机游戏/首发游戏 动态生成
function setSingalApps(apps, type) {
  var boxes = "",
    line = type == 0 ? " " : "|",
    text = type == 0 ? "<p>夏日版畅享百万豪礼</p>" : "",
    text_czc = type == 0 ? "独家首发" : "经典应用";
  $.each(apps, function(i, app) {
    if (type == 0 && i > 0) {
      return;
    }
    var size = app["size"];
    size = size == "" ? "**MB" : size;
    var downloadUrl = app["downloadUrl"];
    downloadUrl = downloadUrl == "" ? "#" : downloadUrl;
    var pText = "";
    if (size != null) {
      pText = '<p><span>网络游戏</span><span class="seporator">' + line + '</span><span>' + size + '</span></p>';
    } else {
      pText = '<p><span>&nbsp;<span></p>';
    }

    boxes += '<li><div class="img"><a href="' + app["detailUrl"] +
      '" class="_trackEvent" data-action="click" data-label="' + text_czc + '" data-name="' + app["title"] +
      '" onclick="_czc.push([\'_trackEvent\',\'' + text_czc + '\',\'click\',\'' + app["title"] + '\', \'\', \'\']);">' +
      '<img src="' + app["icon"] + '" alt="' + app["title"] + '"> </a></div><div class="txt"><p>' +
      app["title"] + '</p>' + pText + text + '</div>';

    boxes += '<a class="btn" href="' + downloadUrl + '" class="_trackEvent" data-action="download" data-label="' + text_czc + '" data-name="' +
      app["title"] + '" onclick="_czc.push([\'_trackEvent\',\'' + text_czc + '\',\'download\',\'' +
      app["title"] + '\', \'\', \'\']);">速装</a></li>';

  });
  if (type == 0) {
    $("#first ul").html(boxes);
    $("#first ul li .txt p").eq(0).append('<span class="firstIcon">今日独家首发</span>');
  }
  if (type == 1) {
    $("#singal ul").html(boxes);
  }
}
