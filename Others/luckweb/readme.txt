
！！！勿外传！！！

更新地址：
http://share.cc98.org/Shared/fuckLuckweb_ads/1

搜索 fuckLuckweb_ads
形式为 fuckLuckweb_ads_v0.x.rar  ltt_Real

1.GM脚本版
Mozilla Firefox
使用Greasemonkey或者scriptish安装fuckLuckweb_ads.user.js
使用Stylish安装GM_fuckLuckweb_ads.css

Google Chrome
直接把fuckLuckweb_ads.user.js拖到Chrome浏览器里安装
使用Stylish安装GM_fuckLuckweb_ads_chrome.css，同时：

Applies to 

选择 URLs starting with 地址为：http://luckweb.057101.com/bt2/list.asp
同样方法 添加http://10.10.6.104/bt2/list.asp

主题：

1. Bamboo Green: 
页面背景：#55AA55 
导航栏背景：#C6E3C6 
导航栏边框：#00AA00
种子列表标题背景：#006600
种子列表边框：#00AA00
种子列表偶数层背景：#C6E3C6
种子列表悬浮背景：#D1D8CD 
链接正常、悬浮颜色：#000000和#008C00
翻页导航背景：#006600


2. Blue Gene
页面背景：#7C98AE
导航栏背景：#BCCAD6 
导航栏边框：#000000
种子列表标题背景：#2F4879 
种子列表边框：#000000
种子列表偶数层背景：#BCCAD6
种子列表悬浮背景：#72B5EC 或者 #587993
链接正常、悬浮颜色：#000000和#00008C
翻页导航背景：#2F4879

3. CHD Sapphire
页面背景：#6795C7
导航栏背景：#D0D7E3 
导航栏边框：#6795C7
种子列表标题背景：#70ABCF
种子列表边框：#6795C7
种子列表偶数层背景：#D0D7E3
种子列表悬浮背景：#BCCAD6
链接正常、悬浮颜色：#182635和#587993
翻页导航背景：#70ABCF

主题更换方法：
1. 用任意编辑器打开*.css文件
2. 替换相应的颜色代码。
除了#000000的颜色代码，其他都可以全部替换。例如：
bamboo主题换成blue gene主题，对于页面背景直接全部替换#55AA55为#7C98AE。
但是对于链接颜色，则在代码中找到：#gm_container a ，然后替换后面的颜色。

下面分别是几处在代码中替换的位置：
页面背景：
/* Layout */
body { 
  padding: 0 !important;
  margin: 0 auto !important;
  background-color: 这里 !important;
}

导航栏背景：

/* Top navigator */
#gm_top_navi {
  padding: 6px 10px 7px 10px !important;
  background-color: 这里  !important;
  border: 1px solid #000000 !important;
}


导航栏边框：

/* Top navigator */
#gm_top_navi {
  padding: 6px 10px 7px 10px !important;
  background-color: 这里  !important;
  border: 1px solid 这里  !important;
}

种子列表标题背景：
#gm_container .tablebg1 { 
  background-color: 这里 !important;
}

种子列表边框：
#gm_container .tablebg1,
#gm_container tr.even,
#gm_container tr.odd,
#gm_container tr.even > td,
#gm_container tr.odd > td { 
  border: 1px solid 这里 !important;
}

种子列表偶数层背景：
#gm_container tr.even {
  background-color: 这里 !important;
}


种子列表悬浮背景：
#gm_container tr.even:hover,
#gm_container tr.odd:hover {
  background-color: 这里 !important;
}

链接正常、悬浮颜色：
#gm_container a { color: 这里 !important;}
#gm_container a:hover { color: 这里 !important;}


翻页导航背景:
#gm_pg_navi font > a:hover,
#gm_pg_navi font b {
  background: 这里 !important;
  color: #FFFFFF !important;
  padding: 3px !important;
  margin-left: 4px !important;
}

种子列表标题字体：

#gm_container .tablebg1 div {
    color: 这里!important;
}

3. 安装样式。
_________________________________________________


1. 纯CSS版
fuckLuckweb_ads.css  （firefox）
随着缘网的变动，最有可能倒下。

fuckLuckweb_ads_chrome.css (chrome)
安装方法同上。