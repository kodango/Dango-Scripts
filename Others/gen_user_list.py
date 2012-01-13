#/bin/env python
# coding=utf-8

__VERSION__ = 0.1
__AUTHOR__ = "tuantuan <dangoakachan@foxmail.com>"

"""将从CC98.org导出所有用户列表, 最终生成user_list.user.js

    var user_list = {
        "name": id,
        ...
    };
"""

import re
import sys
import time
import urllib
import urllib2
import cookielib
import hashlib

opener = None

def encode(msg):
    return msg.decode('utf-8').encode(sys.stdout.encoding, 'ignore')

def log(msg):
    print encode(msg)

def save_userlist(user_list, filename = "user_list.user.js"):
    fp = open(filename, "w")

    code_str = [
        "/*",
        " * CC98 user list from name to id",
        " * Generated automatically on " + time.ctime(),
        " */\n",
    ]

    code_str.append("var user_list = {")
    user_line = '    "%(username)s": "%(userid)s",'

    user_list.sort(key = lambda t: int(t[0]))
    for userid, username in user_list:
        code_str.append(user_line % locals());

    code_str.append("};\n")
    code_str.append('function find(name) { (name in user_list)?user_list[name]:"0"; }')

    fp.write("\n".join(code_str))
    fp.close()

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

def gen_user_list(start = 1, end = -1):
    user_list_url = "http://www.cc98.org/toplist.asp?page=1&orders=1"
    user_list = []
    page_num = start

    if end == -1:
        log("检测用户列表总页数")
        page_content = opener.open(user_list_url).read()
        end = re.search(r"(\d+)<\/b>页", page_content).group(1)
        log("总共有" + end + "页")

    while page_num <= end:
        url = re.sub(r"(page=)\d+", "\g<1>" + str(page_num), user_list_url)
        log("正在处理第" + str(page_num) + "页: " + url)

        page_content = opener.open(url).read()
        user_list.extend(re.findall(r'dispuser\.asp\?id=(\d+).*?>(.*?)<\/a>', page_content))

        page_num += 1

    return user_list

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print "Usage: python gen_user_list.py username password"
        sys.exit(1)

    login(sys.argv[1], sys.argv[2])
    save_userlist(gen_user_list())
