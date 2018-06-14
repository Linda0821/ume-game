var apiCommon = "http://game.umeweb.cn/";//"http://test.umeweb.com:8080/"//

var bannerURL = apiCommon + "cn_ume_api/js/json/top.json",
    recommendURL = apiCommon + "cn_ume_api/js/json/hot.json",
    chessURL = apiCommon + "cn_ume_api/game/api/";
/*
var bannerURL = "json/top.json",
recommendURL = "json/hot.json",
chessURL = "http://test.umeweb.com:8080/cn_ume_api/game/api/";//11/games?offset=0*/
var offset = 0;
var objTitle = {"1":"游戏热榜","11":"欢乐棋牌","12":"热门手游","13":"在线玩"};
window.onload = function() {
    init();
};

function init() {
    var curURL = location.hash.substring(1);
    var curURLID = curURL.replace('gameid=', '');
    console.info(curURLID);
    document.title = objTitle[curURLID];
    renderGame();
    getSingalGames(curURLID, chessURL,0, 1);
    //下拉刷新
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
            offset += 10;
            console.info("offset: " + offset);
            var time = Date.parse(new Date());
            $.ajax({
                type: 'GET',
                url: apiCommon+ "cn_ume_api/game/api/"+curURLID+"/games?offset=" + offset,
                dataType: 'json', //服务器返回json格式数据
                timeout: 10000, //超时时间设置为10秒；
                headers: {
                    'Content-Type': 'application/json'
                },
                success: function(data) {
                    var games = data["games"];
                    if (games.length <= 0) {
                        $(".dropload-refresh").hide();
                        dropload.noData(true);
                        return;
                    }
                    var boxes = "";
                    if (data["status"] == "OK") {
                        boxes = refreshHtml(games,curURLID);
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
function refreshHtml(games,curURLID) {
    var boxes = "";
    var btnText = "速装";
    if(curURLID == "13") {
        btnText = "在线玩";
    }
    $.each(games, function(i, game) {
        var size = game["size"];
        // console.log(size);
        size = size == "" ? "**MB" : size;
        var downloadUrl = game["downloadUrl"];
        downloadUrl = downloadUrl == "" ? "#" : downloadUrl;
        boxes += '<li><div class="img"><a href="' + game["detailUrl"] +
            '" class="_trackEvent" data-action="click" data-label="单机游戏" data-name="' + game["title"] +
            '" onclick="_czc.push([\'_trackEvent\',\'单机游戏\',\'click\',\'' +
            game["title"] + '\', \'\', \'\']);">' +
            '<img src="' + game["icon"] + '" alt="' + game["title"] + '"> </a></div><div class="txt">' +
            '<p>' + game["title"] + '</p>';
        var line = "|";
        if (size != null) {
            boxes += '<p><span>网络游戏</span><span class="seporator">' + line + '</span><span>' + size + '</span></p>';
        } else {
            boxes += '<p><span>&nbsp;<span></p>';
        }
        boxes += '</div><a class="btn" href="' + downloadUrl + '" class="_trackEvent" data-action="download" data-label="单机游戏" data-name="' + game["title"] 
        + '" onclick="_czc.push([\'_trackEvent\',\'单机游戏\',\'download\',\'' + game["title"] + '\', \'\', \'\']);">'+btnText+'</a></li>';
    });
    return boxes;
}
function renderGame(id) {
    getBannerImg();
}

// 1.请求banner
function getBannerImg() {
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
            setBannerImg(data["games"]);
        },
        error: function(xhr, type, errorThrown) {
            //异常处理；
            console.log("请求banner数据异常：" + type);
        }
    });

}
//设置banner
function setBannerImg(games) {
    // 拼接dom
    var imgs = '';
    var points = '';
    //<div class="swiper-slide">slider1</div>
    imgs += '<div class="swiper-slide"><a href="' + games[1]["downloadUrl"] + '" class="_trackEvent" data-label="banner" data-name="' + games[1]["title"] + '" onclick="_czc.push([\'_trackEvent\',\'banner\',\'click\',\'' + games[1]["title"] 
        + '\', \'\', \'\']);"><img src="' + games[1]["bannerUrl"] + '" alt="' + games[1]["title"] + '"></a></div>';
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
function getSingalGames(curURLID, chessURL,offset) {
    $.ajax({
        type: 'GET',
        url: chessURL+curURLID+"/games?offset="+offset,
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
            setSingalGames(data["games"],curURLID); //单机游戏
        },
        error: function(xhr, type, errorThrown) {
            //异常处理；
            console.log("请求热门游戏数据异常：" + type);
        }
    });
}

// 单机游戏/首发游戏 动态生成
function setSingalGames(games,curURLID) {
    var boxes = "",
        line = "|",
        text = "",
        text_czc =  "单机游戏";
        var btnText = "速装";
        if(curURLID == "13") {
            btnText = "在线玩";
        }
    $.each(games, function(i, game) {
        var size = game["size"];
        size = size == "" ? "**MB" : size;
        var downloadUrl = game["downloadUrl"];
        downloadUrl = downloadUrl == "" ? "#" : downloadUrl;
        var pText = "";
        if (size != null) {
            pText = '<p><span>网络游戏</span><span class="seporator">' + line + '</span><span>' + size + '</span></p>';
        } else {
            pText = '<p><span>&nbsp;<span></p>';
        }

        boxes += '<li><div class="img"><a href="' + game["detailUrl"] +
            '" class="_trackEvent" data-action="click" data-label="' + text_czc + '" data-name="' + game["title"] +
            '" onclick="_czc.push([\'_trackEvent\',\'' + text_czc + '\',\'click\',\'' + game["title"] + '\', \'\', \'\']);">' +
            '<img src="' + game["icon"] + '" alt="' + game["title"] + '"> </a></div><div class="txt"><p>' +
            game["title"] + '</p>' + pText + text + '</div>';

        boxes += '<a class="btn" href="' + downloadUrl + '" class="_trackEvent" data-action="download" data-label="' + text_czc + '" data-name="' +
            game["title"] + '" onclick="_czc.push([\'_trackEvent\',\'' + text_czc + '\',\'download\',\'' +
            game["title"] + '\', \'\', \'\']);">'+btnText+'</a></li>';

    });
    $("#singal ul").html(boxes);


}