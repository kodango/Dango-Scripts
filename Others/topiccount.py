# coding=utf-8
# version: 0.1
# 问题：
# 1. 未能统计精华帖、保存帖等特殊帖子
import re
import sys
import urllib
import urllib2
import cookielib
import hashlib

topic_regex = re.compile(r'<img.*?src="(.*?)".*?<a id="topic_(\d+)".*?title="(.*?)"', re.I)
title_regex = re.compile(r'《(.*?)》<br>作者：(.*?)<br>发表于(\d{4}-\d{2}-\d{2})', re.I)

# 'name': count
count_dict = {}

def encode(msg):
    return msg.decode('utf-8').encode(sys.stdout.encoding, 'ignore')

def log(msg):
    print encode(msg)

def log(msg, fd=0):
    if fd == 0:
        print encode(msg)
    else:
        fd.write(encode(msg)+'\n')

def build_opener():
    cj = cookielib.CookieJar()

    return urllib2.build_opener(
        urllib2.HTTPCookieProcessor(cj))

opener = build_opener()

def login(name, passwd):
    signurl = 'http://www.cc98.org/sign.asp'

    md5_passwd = hashlib.md5(passwd).hexdigest()

    login_params = {
        'a':'i',
        'u': name,
        'p': md5_passwd,
        'userhidden': 1
    }

    data = urllib.urlencode(login_params)

    log('正在登录....')
    req = urllib2.Request(signurl, data)
    res = opener.open(req)

    if res.read().find('9898') != -1:
        log('登陆成功')#
        return True
    else:
        log('登陆失败，用户名或者密码错误')
        return False

def count(url, from_date, end_pagenum = -1, delta = 4):
    pagenum = 1
    outdate = delta

    if end_pagenum > 0:
        cond = "pagenum <= end_pagenum"
    else:
        cond = "True"

    while eval(cond):
        log("正在处理第" + str(pagenum) + "页")

        pageContent = opener.open(url+str(pagenum)).read()
        pagenum += 1

        tlist = topic_regex.findall(pageContent)

        for topic_type, topic_id, topic_title in tlist:
            if topic_type.find("top.gif") != -1:
                continue
            elif topic_type.find("isbest.gif") != -1:
                topic_type = "best"
            elif topic_type.find("save.gif") != -1:
                topic_type = "save"
            else:
                topic_type = "normal"

            title, uname, time = title_regex.search(topic_title).group(1, 2, 3)

            if time >= from_date:
                if uname not in count_dict:
                    count_dict[uname] = {
                        "normal": set(),
                        "best": set(),
                        "save": set()
                    }

                count_dict[uname][topic_type].add(topic_id)

                outdate = delta
            elif outdate > 0 and time < from_date:
                outdate -= 1
            else:
                return

def print_out(fd=sys.stdout):
    if isinstance(fd, str):
        fd = open(fd, 'w')

    print >> fd
    print >> fd, "username".ljust(10), "count"

    for uname, count in count_dict.items():
        print >> fd, encode(uname).ljust(10),

        for t, c in count.items():
            if len(c):
                print >> fd, str(len(c)) + "(" + t + ")",

        print >> fd

if __name__ == '__main__':
    # 输入用户名、密码
    your_name = 'cc98_id'
    your_passwd = 'cc98_pwd'
    #board_url = 'http://www.cc98.org/list.asp?boardid=357&page='
    board_url = 'http://www.cc98.org/list.asp?boardid=39&page='
    from_date = raw_input(encode('输入起始日期(xxxx-xx-xx): '))
    #from_date = "2001-06-01"

    if not login(your_name, your_passwd):
        sys.exit(-1)

    count(board_url, from_date)
    #count(board_url, from_date, 117, 10000)
    #count(board_url, from_date, 91)
    print_out("count.txt")
