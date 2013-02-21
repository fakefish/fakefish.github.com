---
layout: post
title: windows下安装mongodb
---

#windows下安装mongodb

先从[MongoDB](http://www.mongodb.org)下载对应的版本，win的是一个zip（怎么不是exe？= =

其实mongodb是免安装的（坑爹呢），运行bin里的mongod.exe，然后运行mongo.exe就进入shell界面了，但是，文件去哪了？默认是C:\data\db,一般人肯定不会放这里，所以我们要去新建。可以用cmd或者bat运行的时候写上参数

<pre>
 F:\mongodb\mongodb-win32-x86_64-2.2.3\bin\mongod.exe --dbpath F:\mongodb\data
</pre>

但是每次都要去重新启动，这么懒的程序猿怎么可能这么做，所以我们要把它像mysql作为服务安装

所以在你要放的地方建个dir，我在F盘下建了一个mongodb的文件夹，下面是logs日志文件夹，data数据文件夹。

然后管理员身份运行cmd或者bat，写上类似这样的

<pre>
F:\mongodb\mongodb-win32-x86_64-2.2.3\bin\mongod.exe --logpath F:\mongodb\logs\mongodb.log --logappend --dbpath F:\mongodb\data --directoryperdb --serviceName MongoDB --install
</pre>

我们就可以在日志文件中看到

>***** SERVER RESTARTED *****
>
>Thu Feb 21 14:55:33 Trying to install Windows service 'MongoDB'
>Thu Feb 21 14:55:33 Service 'MongoDB' (Mongo DB) installed with command line '"F:\mongodb\mongodb-win32-x86_64-2.2.3\bin\mongod.exe" --logpath "F:\mongodb\logs\mongodb.log" --logappend --dbpath "F:\mongodb\data" --directoryperdb --service '
>Thu Feb 21 14:55:33 Service can be started from the command line with 'net start MongoDB'

ok了，就可以用管理员的cmd输入net start MongoDB开启，输入stop start MongoDB关闭

记得，全程管理员，不然

>***** SERVER RESTARTED *****
>
>Thu Feb 21 14:55:11 Trying to install Windows service >'MongoDB'
>Thu Feb 21 14:55:11 Error connecting to the Service Control Manager: 拒绝访问。 (5)
