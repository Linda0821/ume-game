var apiCommon = "http://game.umeweb.cn/"; //"http://test.umeweb.com:8080/"; //

var bannerURL = apiCommon + "cn_ume_api/game/api/top_games", //顶部banner API
    recommendURL = apiCommon + "cn_ume_api/game/api/20/games?offset=0", //热门推荐 API
    chessURL = apiCommon + "cn_ume_api/game/api/21/games?offset=0&limit=8", //棋牌游戏 API
    allURL = apiCommon + "cn_ume_api/game/api/22/games?offset=0&limit=8", // 捕鱼天地 API
    //firstURL = "json/game.json", //首发游戏 API
    firstURL = apiCommon + "cn_ume_api/game/api/24/games?offset=0&limit=1 ", //首发游戏 API
    singalURL = apiCommon + "cn_ume_api/game/api/23/games?offset=0", //单机游戏 API
    singleGameURL = apiCommon + "cn_ume_api/game/api/23/games?offset=",
    //categoryURL = "json/category_n.json", //游戏分类 API
    categoryURL = apiCommon + "cn_ume_api/game/api/categories", //游戏分类 API
    offset = 0;

window.onload = function() {

    //顶部banner轮播图
    getBannerImg();

    //IconList 四个ICON的显示
    getIconList();

    //热门推荐-可左右滑动
    getRecommedGames(recommendURL, "recommend", false);
    /* //棋牌游戏
     getRecommedGames(chessURL, "chess", false);
     // 捕鱼天地
     getRecommedGames(allURL, "all", false);*/

    //首发游戏
    getSingalGames(firstURL, 0);
    //单机游戏
    getSingalGames(singalURL, 1);

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
                url: singleGameURL + offset,
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
                        boxes = refreshHtml(games);
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
};

function refreshHtml(games) {
    var boxes = "";
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
        boxes += '</div><a class="btn" href="' + downloadUrl + '" class="_trackEvent" data-action="download" data-label="单机游戏" data-name="' + game["title"] + '" onclick="_czc.push([\'_trackEvent\',\'单机游戏\',\'download\',\'' + game["title"] + '\', \'\', \'\']);">速装</a>';
        boxes += '</li>';
    });
    return boxes;
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
    $.each(games, function(i, game) {
        imgs += '<div class="swiper-slide"><a href="' + games[i]["downloadUrl"] + '" class="_trackEvent" data-label="banner" data-name="' +
            games[i]["title"] + '" onclick="_czc.push([\'_trackEvent\',\'banner\',\'click\',\'' + games[i]["title"] +
            '\', \'\', \'\']);"><img src="' + games[i]["bannerUrl"] + '" alt="' + games[i]["title"] + '"></a></div>';

    });
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
}

/*请求游戏分类*/
function getIconList() {
    $.ajax({
        type: 'GET',
        url: categoryURL,
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
            console.log(data);
            setIconList(data["tabs"]);
        },
        error: function(xhr, type, errorThrown) {
            //异常处理；
            console.log("请求banner数据异常：" + type);
        }
    });

}
//设置banner
function setIconList(tabs) {
    // 拼接dom
    var ts = '';
    //var imgUrlArr = ["img/icon_r.png", "img/icon_q.png", "img/icon_s.png", "img/icon_z.png"];
    var imgUrlArr = ["../img/icon_r.png", "../img/icon_q.png", "../img/icon_s.png", "../img/icon_z.png"];
    //var imgLinkArr = ["detail.html#gameid=", "detail.html#gameid=", "detail.html#gameid=", "detail.html#gameid="];
    var imgLinkArr = ["detail#gameid=", "detail#gameid=", "detail#gameid=", "detail#gameid="];
    $.each(tabs, function(i, tab) {
        if (i > 3) {
            return;
        }
        ts += '<li><a href="' + imgLinkArr[i] + tabs[i]["id"] + '" class="_trackEvent" data-label="icon" data-name="' + tabs[i]["category"] +
            '" onclick="_czc.push([\'_trackEvent\',\'icon\',\'click\',\'' + tabs[i]["category"] + '\', \'\', \'\']);"><img src="' +
            imgUrlArr[i] + '" alt="' + tabs[i]["category"] + '"></a><p>' + tabs[i]["category"] + '</p></li>';
    });
    $("#icon-list ul").html(ts);
}

/**
 * [getRecommedGames 3.请求 人气推荐游戏 棋牌游戏 捕鱼游戏]
 * @Author   Linada
 * @DateTime 2018-04-10T13:44:15+0800
 * @param    {[type]}                 url    [分类请求路径]
 * @param    {[type]}                 id     [分类标签id]
 * @param    {Boolean}                isFour [是否只显示四个icon（即不可左右滑动）]
 * @return   {[type]}                        [description]
 */
function getRecommedGames(url, id, isFour) {
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
            setRecommedGames(data["games"], id, isFour);
        },
        error: function(xhr, type, errorThrown) {
            //异常处理；
            console.log("请求热门游戏数据异常：" + type);
        }
    });
}
// 人气推荐游戏 动态生成
function setRecommedGames(games, id, isFour) {
    var boxes = '';
    /*var moreHref = "detail.html#gameid=11";
    if (id == "recommend") {
        moreHref = "detail.html#gameid=1";
    }*/
    var moreHref = "detail#gameid=12";
    if (id == "recommend") {
        moreHref = "detail#gameid=1";
    } else if (id == "chess") {
        moreHref = "detail#gameid=11";
    }
    var moreHtml = '<li id="more" class="swiper-slide" ><div class="img"><a href="' + moreHref +
        '"> <img src="img/moreimg.png" alt="more"> </a></div><p id="moreBtn">更多</p></li>';

    $.each(games, function(i, game) {
        // 只显示 4 条数据
        /*if (i > 7 && isFour) {
            return;
        }*/
        var size = game["size"];
        size = size == "" ? "**MB" : size,
            downloadUrl = game["downloadUrl"];
        downloadUrl = downloadUrl == "" ? "#" : downloadUrl;
        boxes += '<li class="swiper-slide" ><div class="img"><a href="' + game["detailUrl"] +
            '" class="_trackEvent" data-action="click" data-label="' + id + '" data-name="' + game["title"] +
            '" onclick="_czc.push([\'_trackEvent\',\'' + id + '\',\'click\',\'' +
            game["title"] + '\', \'\', \'\']);">' +
            '<img src="' + game["icon"] + '" alt="' + game["title"] + '"> </a></div>' +
            '<p>' + game["title"] + '</p>';

        if (size != null) {
            boxes += '<p>' + size + '</p>';
        } else {
            boxes += '<p>&nbsp;</p>';
        }
        boxes += '<a class="btn" href="' + downloadUrl + '" class="_trackEvent" data-action="download" data-label="' + id + '" data-name="' + game["title"] + '" onclick="_czc.push([\'_trackEvent\',\'' + id + '\',\'download\',\'' + game["title"] + '\', \'\', \'\']);">下载</a>';
        boxes += '</li>';
    });
    $("#" + id + " ul .swiper-wrapper").html(boxes);
    $("#" + id + " ul .swiper-wrapper").append(moreHtml);


    if (id == "recommend") {
        getRecommedGames(chessURL, "chess", true);
    }

    if (id == "chess") {
        getRecommedGames(allURL, "all", true);
    }
    // 初始化图片轮播
    if (id == "all") {
        initSwiper(id);
    }
    // 初始化图片轮播
    /*if (!isFour) {
        var mySwiper = new Swiper("#" + id + " ul .swiper-container", {
            pagination: '.swiper-pagination',
            slidesPerView: 4.5,
            paginationClickable: true,
            spaceBetween: 25
        });
    }*/

}
// 4.请求 单机游戏/首发游戏
function getSingalGames(url, type) {
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
            setSingalGames(data["games"], type); //单机游戏
        },
        error: function(xhr, type, errorThrown) {
            //异常处理；
            console.log("请求热门游戏数据异常：" + type);
        }
    });
}

// 单机游戏/首发游戏 动态生成
function setSingalGames(games, type) {
    var boxes = "",
        line = type == 0 ? " " : "|",
        text = type == 0 ? "<p>夏日版畅享百万豪礼</p>" : "",
        text_czc = type == 0 ? "首发游戏" : "单机游戏";
    $.each(games, function(i, game) {
        if (type == 0 && i > 0) {
            return;
        }
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
            game["title"] + '\', \'\', \'\']);">速装</a></li>';

    });
    if (type == 0) {
        $("#first ul").html(boxes);
        //$("#first ul").append('<div class="firstIcon">今日独家首发</div>');
        $("#first ul li .txt p").eq(0).append('<span class="firstIcon">今日独家首发</span>');
    }
    if (type == 1) {
        $("#singal ul").html(boxes);
    }


}

function initSwiper(id) {
    var mySwiper_recommend = new Swiper("#recommend ul .swiper-container", {
        pagination: '.swiper-pagination-recommend',
        slidesPerView: 4.5,
        paginationClickable: true,
        spaceBetween: 2,
        slidesOffsetAfter: 10
    });
    var mySwiper_chess = new Swiper("#chess ul .swiper-container", {
        pagination: '.swiper-pagination-chess',
        slidesPerView: 4.5,
        paginationClickable: true,
        spaceBetween: 2,
        slidesOffsetAfter: 10
    });
    var mySwiper_all = new Swiper("#all ul .swiper-container", {
        pagination: '.swiper-pagination-all',
        slidesPerView: 4.5,
        paginationClickable: true,
        spaceBetween: 2,
        slidesOffsetAfter: 10
    });

    mySwiper_chess.params.control = mySwiper_all;
    mySwiper_all.params.control = mySwiper_chess;

}