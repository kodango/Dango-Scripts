// ==UserScript==
// @id             fuckLuckweb_ads
// @name           Fuck Luckweb's ads
// @namespace      dangoakachan@foxmail.com
// @include        http://luckweb.057101.com/bt2/list.asp*
// @include        http://10.10.6.104/bt2/list.asp*
// @match          http://luckweb.057101.com/bt2/list.asp*
// @match          http://10.10.6.104/bt2/list.asp*
// @version        0.3.2
// ==/UserScript==

function xpath(query)
{
    return document.evaluate(
            query, 
            document, 
            null, 
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
    );
}

function x1(query)
{
    return document.evaluate(
            query, 
            document, 
            null, 
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
    )["singleNodeValue"];
}

//function showTime()
//{
    //var curTime = new Date();
    //document.getElementById("gm_time").innerHTML = "<b>当前时间:</b>" + curTime.toLocaleString();

    //setTimeout(showTime,1000);
//}

function fix()
{
    document.title = "缘网BT";
}

function addContents()
{
    // Torrents list
    var torrents = x1("//tr[@class='even']");
    
    // Page navigator
    var pg_navi = x1("//a[contains(@href, '?offset=')]");
        
    var container = document.createElement("div"); // Create container
    container.id = "gm_container";

    // Top navigator items
    var temp = [
        // Luckweb contents
        "<div class='gm_navi_item'><span class='gm_title'><a target='_blank' href='http://luckweb.057101.com'>[缘网首页]</a></span>",
        "<select onchange='window.open(this.options[this.selectedIndex].value)' name='select'>",
        "<option value='/'>缘 网 栏 目</option>",
        "<option value='/trade/Index.asp'>二手交易</option>",
        "<option value='http://t.057101.com'>缘网微博</option>",
        "<option value='/tradeinfo/Index.html'>大喇叭</option>",
        "<option value='/GuestBook/Index.asp'>留言本</option>",
        "<option value='http://10.22.23.67/Shop/Index.asp'>缘网商城</option>",
        "<option value='http://maipiao.taobao.com'>折扣票券店</option>",
		"<option value='/Soft/Index.html'>win软件</option>",
        "<option value='/User/Index.asp'>会员中心</option></select></div>",

        // Luckweb bt category
        "<div class='gm_navi_item'><span class='gm_title'><a href='http://luckweb.057101.com/bt2/list.asp'>[缘网BT]</a></span>",
        "<select onchange='document.location.href=this.options[this.selectedIndex].value' name='select'>",
        "<option value='/'>BT 分 类</option>",
        "<option value='?category=电影&amp;tracker=local'>『电影』</option>",
        "<option value='?category=纪录片&amp;tracker=local'>『纪录片』</option>",
        "<option value='?category=连续剧&amp;tracker=local'>『连续剧』</option>",
		"<option value='?category=游戏&amp;tracker=local'>『游戏』</option>",
        "<option value='?category=综艺&amp;tracker=local'>『综艺』</option>",
        "<option value='?category=体育&amp;tracker=local'>『体育』</option>",
        "<option value='?category=动漫&amp;tracker=local'>『动漫』</option>",
        "<option value='?category=音乐&amp;tracker=local'>『音乐』</option>",
        "<option value='?category=软件&amp;tracker=local'>『软件、学习』</option>",
        "<option value='?category=其它&amp;tracker=local'>『其他』</option></select></div>",

        //Luckweb help
        "<div class='gm_navi_item'><span class='gm_title'>使用帮助</span>",
        "<select onchange='window.open(this.options[this.selectedIndex].value)' name='select'>",
        "<option value='/'>bt 帮 助</option>",
        "<option value='/bt2/list_weigui.asp'>违规种子列表</option>",
        "<option value='/tradeinfo/HTML/11216.html'>bt使用说明</option>",
        "<option value='/Soft/netsoft/downsoft/bt/Index.html'>《BT软件下载》</option>",
        "<option value='/tradeinfo/HTML/3367.html'>如何做种子</option>",
        "<option value='/bt2/upload.asp'>=&gt;点击这里发布&lt;=</option>",
        "<option>感谢CC98BT组支持</option></select></div>",

        // Searchbox
        "<div class='gm_navi_item'>",
        "<form method='post' action='' id='Form1' name='Form1'>",
        "<span class='gm_title'>关键字</span><input name='searchstr' id='Text1'>",
        "<select name='searchtype' id='Select1'>",
        "<option selected='' value='subject'>名称</option>",
        "<option value='description'>简介</option>",
        "<option value='category'>类型</option>",
        "<option value='offer'>发布者</option>",
        "<option value='tracker'>Tracker</option></select>",
        "<span class='gm_title'>Tracker</span><select name='tracker' id='Select2'>",
        "<option value='local'>本地Tracker</option>",
        "<option value='notlocal'>非本地Tracker</option>",
        "<option value='all'>全部</option></select>",
        "<input type='submit' value='搜索' id='Submit1' name='Submit1'></form></div>",

        // Publish torrents
        "<div class='gm_navi_item gm_title'><a target='_blank' href='upload.asp'>=[点击这里发布]=</a></div>",
    ];

    // Add top navigator
    var top_navi_div = container.appendChild(container.cloneNode(false));
    top_navi_div.id = "gm_top_navi";

    top_navi_div.innerHTML = temp.join("");

    // Add info
    var info = container.appendChild(container.cloneNode(false));
    info.id = "gm_info";

    var temp = [
        // Add your favourite sites here like below
        "<span id='gm_bookmarks'><b>快捷书签:</b>",
        "<a title='高清BT' target='_blank' href='http://www.nexushd.org/torrents.php'>NexusHD</a>",
        "<a target='_blank' href='http://www.cc98.org'>CC98</a></span>",
    ];

    info.innerHTML = temp.join("");
    container.appendChild(info);

    // Add torrents list
    if (torrents) {
        torrents = torrents.parentNode.parentNode;
        container.appendChild(torrents);
    }

    // Add bottom page navigator
    if (pg_navi) {
        pg_navi = pg_navi.parentNode;

        if (pg_navi.tagName == "B")
            pg_navi = pg_navi.parentNode;

        var bottom_navi_div = container.appendChild(container.cloneNode(false)); 
        bottom_navi_div.id = "gm_pg_navi";

        bottom_navi_div.appendChild(pg_navi);
        container.appendChild(bottom_navi_div);
    }

    // Finally, add the container to body
    document.body.appendChild(container);
}

fix();
addContents();
