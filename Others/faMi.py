# coding=utf-8
# version: 0.3
from __future__ import division
import sys
import urllib2, urllib, cookielib
import hashlib,re,pickle
import random, math

# 黑名单
blocklist = []

def encode(msg):
    return msg.decode('utf-8').encode(sys.stdout.encoding, 'ignore')

def log(msg, fd=0):
    if fd == 0:
        print encode(msg)
    else:
        fd.write(encode(msg)+'\n')

class CC98(object):
    def __init__(self, name, pwd):
        self.name = name
        self.pwd = hashlib.md5(pwd).hexdigest()
        self.cj = cookielib.CookieJar()

        self.opener = urllib2.build_opener(
            urllib2.HTTPCookieProcessor(self.cj))

    def login(self):
        params = {
            'a':'i',
            'u': self.name,
            'p': self.pwd,
            'userhidden': 1
        }

        data = urllib.urlencode(params)
        signurl = 'http://www.cc98.org/sign.asp'

        log('正在登录....')
        req = urllib2.Request(signurl, data)
        res = self.opener.open(req)

        if res.read().find('9898') != -1:
            log('登陆成功')
            return True
        else:
            log('登陆失败，用户名或者密码错误')
            return False

class faMi(object):
    def __init__(self, name, pwd, topicURL):
        self.cc = CC98(name, pwd)
        self.topicURL = topicURL
        self.info = {}

    def parseURL(self, url):
        if url.find('dispbbs') == -1:
            log('地址错误')
            return False

        m = re.search(r'boardid=(\d+)&id=(\d+)', url, re.I)
        if m is None:
            log('无效的地址')
            return False

        self.boardid, self.topicid = m.group(1, 2)
        return True

    def getPage(self, url):
        response = self.cc.opener.open(url)
        return response.read()

    def award(self, id_nr, mi = 1000):
        formData = {
            'boardid': self.boardid,
            'topicid': self.topicid,
            'title': urllib.quote('奖励'),
            'content': urllib.quote('->随机'+ str(mi) + '米'),
            'awardtype': 0,
            'announceid': id_nr,
            'doWealth': mi,
            'ismsg': 'on',
            'submit': urllib.quote('确认操作')
        }

        awardURL = 'http://www.cc98.org/master_users.asp?action=award'
        response = self.cc.opener.open(awardURL, re.sub('%25', '%', urllib.urlencode(formData)))

    def start(self, fr = 1, to = 10000):
        if not self.parseURL(self.topicURL):
            log('发生错误，程序中止')
            return

        # login cc98
        if not self.cc.login():
            return

        self.load()

        fd = open('log.txt', 'w')
        log('生成日志文件log.txt')

        regex1 = re.compile(r'<a name=(\d+)><font color=#.*?><B>(.*?)</B></font></a>', re.I)
        #regex2 = re.compile(r'<span id="topicPagesNavigation">.*\[(\d+)\]</(?:a|font)></span>', re.I)
        regex2 = re.compile(r'<span id="topicPagesNavigation">.*?<b>(\d+)</b>', re.I)

        if fr > to:
            log('起始楼数必须小于等于终止楼数')
            return
        elif fr < 1:
            log('起始楼数必须大于等于1')
            return

        i = fr
        log('开始奖励\n' + self.rule.__doc__)
        while (i <= to):
            page = int(math.ceil(i/10))
            url = self.topicURL + '&star=' + str(page)

            content = self.getPage(url)
            posts = int(regex2.search(content).group(1))

            if i > posts:
                log('此主题只有%(posts)d个帖子' % {'posts': posts})
                break

            log('第%(page)d页 => 地址: %(url)s' % {'page': page, 'url':url})
            for id_nr, name in regex1.findall(content):
                if name in blocklist:
                    log('第%(i)d楼: 帖子编号%(id_nr)s, %(name)s已被屏蔽' % {'i':i,
                        'id_nr': id_nr, 'name':name}, fd)
                    i = i + 1
                    continue

                if not name in self.info:
                    mi = self.rule(id_nr)
                    log('第%(i)d楼: 帖子编号%(id_nr)s, %(name)s被奖励%(mi)d米' % {'i':i,
                        'id_nr': id_nr, 'name':name, 'mi':mi}, fd)
                    self.info[name] = id_nr
                    self.award(id_nr, mi)
                else:
                    log('第%(i)d楼: 帖子编号%(id_nr)s, %(name)s已被奖励过' % {'i':i,
                        'id_nr': id_nr, 'name':name}, fd)

                i = i + 1

        log('结束奖励')
        self.save()

    def rule(self, id_nr):
        """默认发米规则，帖子编号整百奖励1000，其余在1-1000范围内随机奖励"""
        # 如果要发1000米，则直接 return 1000
        return (int(id_nr) % 100 == 0) and 1000 or (random.randint(1, int(id_nr)%1000))

    def save(self):
        filename = self.topicid
        log('保存奖励记录,请勿删除')

        f = open(filename, 'wb')
        pickle.dump(self.info, f)
        f.close()

    def load(self):
        filename = self.topicid
        log('加载奖励记录...')

        try:
            f = open(filename, 'rb')
            self.info = pickle.load(f)
            f.close()
        except IOError:
            log('第一次奖励此主题: %s' % self.topicid)

if __name__ == '__main__':
    # 输入用户名、密码、地址等
    your_name = raw_input(encode('输入CC98用户名: '))
    your_password = raw_input(encode('输入CC98密码: '))
    topicURL = raw_input(encode('输入主题地址: '))
    blocklist = raw_input(encode('是否屏蔽某些用户(以空格分开): ')).split(' ')

    f = faMi(your_name, your_password, topicURL)
    #f.start() # 默认，从第一楼到一万楼，一般楼没这么高，所以可以当成是到最后一楼
    # f.start(21, 60) # 从第三页到第五页, 21是第三页的第一楼，60楼是第六页的最后一楼
    f.start(691, 710)
