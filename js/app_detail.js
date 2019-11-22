var isNormalDomain = window.location.href.indexOf('app.umeweb.com')>-1?true:false;
var apiCommon = isNormalDomain?"http://app.umeweb.com/":"http://180.76.156.125:8080/";

var bannerURL = apiCommon + "cn_ume_api/app/api/banners", //banner轮播
  appURL = apiCommon+"cn_ume_api/app/api/apps?cid=2",
  recommendURL = apiCommon+"cn_ume_api/app/api/apps?cid=1";// 人气推荐栏目

var offset = 0;
var objTitle = {"1":"装机必备","2":"精品应用"};
window.onload = function() {
  init();
};

function init() {
  var curURL = location.hash.substring(1);
  var curURLID = curURL.replace('appid=', '');
  console.info(curURLID);
  document.title = objTitle[curURLID];
  /*获取banner*/
  renderapp(curURLID);

  var url = " ";
  if(curURLID == "1"){
    url = recommendURL;
  }else if(curURLID == "2"){
    url = appURL;
  }
  getSingalapps(curURLID, url,0, 1);
  //下拉刷新
  refreshLoad();

}
function refreshLoad(){
  var dropload = $('body').dropload({
    scrollArea: window,
    // 下拉刷新模块显示内容
    domDown: {
      domClass: 'dropload-down',
      // 滑动到底部显示内容
      domRefresh: '<div class="dropload-refresh"><div class="img"></div></div>',
      // 内容加载过程中显示内容
      domLoad: '<div class="dropload-refresh"><div class="img"></div></div>',
      // 没有更多内容-显示提示
      domNoData: '<div class="dropload-noData"></div>'
    },
    // 2 . 上拉加载更多 回调函数
    loadDownFn: function(me) {
      var html = "";
      if(offset<10) {
        $(".dropload-refresh").hide();
        return;
      }
      var time = Date.parse(new Date());
      $.ajax({
        type: 'GET',
        url: url+"&offset=" + offset,
        dataType: 'json', //服务器返回json格式数据
        timeout: 10000, //超时时间设置为10秒；
        headers: {
          'Content-Type': 'application/json'
        },
        success: function(data) {
          var apps = data["apps"];
          if (apps.length <= 0) {
            $(".dropload-refresh").hide();
            dropload.noData(true);
            return;
          }
          var boxes = "";
          if (data["status"] == "OK") {
            boxes = refreshHtml(apps,curURLID);
            offset = offset+10
          } else {
            console.info("请求其他精品失败");
          }
          var t = Date.parse(new Date());
          if (t - time < 500) {
            setTimeout(function() {
              $("#singal ul").append(boxes);
              dropload.resetload();
            }, 500);
          } else {
            $("#singal ul").append(boxes);
            dropload.resetload();
          }
        },
        error: function(status) {
          console.info("请求其他精品错误");
          dropload.resetload();
        }
      });
    },
    distance: 100,
    autoLoad: true
  });
}
function refreshHtml(apps,curURLID) {
  var boxes = "";
  var btnText = "速装";
  /*if(curURLID == "13") {
      btnText = "开始玩";
  }*/
  $.each(apps, function(i, app) {
    var size = app["size"];
    // console.log(size);
    size = size == "" ? "**MB" : size;
    var downloadUrl = app["downloadUrl"];
    downloadUrl = downloadUrl == "" ? "#" : downloadUrl;
    boxes += '<li><div class="img"><a href="' + app["detailUrl"] +
      '" class="_trackEvent" data-action="click" data-label="'+objTitle[curURLID]+'" data-name="' + app["title"] +
      '" onclick="_czc.push([\'_trackEvent\',\''+objTitle[curURLID]+'\',\'click\',\'' +
      app["title"] + '\', \'\', \'\']);">' +
      '<img src="' + app["icon"] + '" alt="' + app["title"] + '"> </a></div><div class="txt">' +
      '<p>' + app["title"] + '</p>';
    var line = "|";
    if (size != null) {
      boxes += '<p><span>'+objTitle[curURLID]+'</span><span class="seporator">' + line + '</span><span>' + size + '</span></p>';
    } else {
      boxes += '<p><span>&nbsp;<span></p>';
    }
    boxes += '</div><a class="btn" href="' + downloadUrl + '" class="_trackEvent" data-action="download" data-label="'+objTitle[curURLID]+'" data-name="' + app["title"]
      + '" onclick="_czc.push([\'_trackEvent\',\''+objTitle[curURLID]+'\',\'download\',\'' + app["title"] + '\', \'\', \'\']);">'+btnText+'</a></li>';
  });
  return boxes;
}
function renderapp(id) {
  try{
    getBannerImg(id);
  }catch(e){
    console.info(e)
  }

}

// 1.请求banner
function getBannerImg(curURLID) {
  $.ajax({
    type: 'GET',
    url: bannerURL+"?cid="+curURLID,
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
      setBannerImg(data["apps"]);
    },
    error: function(xhr, type, errorThrown) {
      //异常处理；
      console.log("请求banner数据异常：" + type);
    }
  });

}
//设置banner
function setBannerImg(apps) {
  // 拼接dom
  if(apps.length<=0)return;
  var imgs = '';
  var points = '';
  //<div class="swiper-slide">slider1</div>
  imgs += '<div class="swiper-slide"><a href="' + apps[0]["downloadUrl"] + '" class="_trackEvent" data-label="banner" data-name="' + apps[0]["title"] + '" onclick="_czc.push([\'_trackEvent\',\'banner\',\'click\',\'' + apps[0]["title"]
    + '\', \'\', \'\']);"><img src="' + apps[0]["bannerUrl"] + '" alt="' + apps[0]["title"] + '"></a></div>';
  $("#banner-swipe .swiper-wrapper").html(imgs);
  // 初始化图片轮播
  /*var mySwiper = new Swiper('#banner-swipe .swiper-container', {
      autoplay: 2000, //可选选项，自动滑动
      loop: true, //可选选项，开启循环
      autoplayDisableOnInteraction: false,
      pagination: '.pagination',
      paginationType: 'bullets'
  });*/
}

// 4.请求 单机游戏/首发游戏
// curURLID, chessURL,offset, 1
function getSingalapps(curURLID, chessURL,offset) {
  $.ajax({
    type: 'GET',
    //url: chessURL+curURLID+"/apps?offset="+offset,
    url: chessURL+"&offset="+offset,
    dataType: 'json', //服务器返回json格式数据
    timeout: 10000, //超时时间设置为10秒；
    headers: {
      'Content-Type': 'application/json'
    },
    success: function(data) {
      if (data["status"] != "OK") {
        console.log("热门游戏数据请求失败");
        $(".dropload-refresh").hide();
        return;
      }
      setSingalapps(data["apps"],curURLID); //单机游戏
    },
    error: function(xhr, type, errorThrown) {
      //异常处理；
      console.log("请求热门游戏数据异常：" + type);
      $(".dropload-refresh").hide();
    }
  });
}

// 单机游戏/首发游戏 动态生成
function setSingalapps(apps,curURLID) {
  var boxes = "",
    line = "|",
    text = "";
  var btnText = "速装";
  /*if(curURLID == "13") {
      btnText = "开始玩";
  }*/
  $.each(apps, function(i, app) {
    var size = app["size"];
    size = size == "" ? "**MB" : size;
    var downloadUrl = app["downloadUrl"];
    downloadUrl = downloadUrl == "" ? "#" : downloadUrl;
    var pText = "";
    if (size != null) {
      pText = '<p><span>'+objTitle[curURLID]+'</span><span class="seporator">' + line + '</span><span>' + size + '</span></p>';
    } else {
      pText = '<p><span>&nbsp;<span></p>';
    }

    boxes += '<li><div class="img"><a href="' + app["detailUrl"] +
      '" class="_trackEvent" data-action="click" data-label="' + objTitle[curURLID] + '" data-name="' + app["title"] +
      '" onclick="_czc.push([\'_trackEvent\',\'' + objTitle[curURLID] + '\',\'click\',\'' + app["title"] + '\', \'\', \'\']);">' +
      '<img src="' + app["icon"] + '" alt="' + app["title"] + '"> </a></div><div class="txt"><p>' +
      app["title"] + '</p>' + pText + text + '</div>';

    boxes += '<a class="btn" href="' + downloadUrl + '" class="_trackEvent" data-action="download" data-label="' + objTitle[curURLID] + '" data-name="' +
      app["title"] + '" onclick="_czc.push([\'_trackEvent\',\'' + objTitle[curURLID] + '\',\'download\',\'' +
      app["title"] + '\', \'\', \'\']);">'+btnText+'</a></li>';

  });
  $("#singal ul").html(boxes);
  offset += apps.length;
  console.info("0-offset:"+offset)
}