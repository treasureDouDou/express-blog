# express-blog


> 有问题的童鞋联系我qq:564526299

> 前端项目地址: [https://github.com/treasureDouDou/vue-blog](https://github.com/treasureDouDou/vue-blog)

## 项目结构

```
|-module
|----api.js  			//api接口
|----db.js  			//数据库设计，数据库连接
|-app.js  		//一些配置
|-public  			//静态资源目录
|----images  			//上传图片保存目录
|-index.js  		        //启动配制
```

## 配置
1. mongodb，nodejs安装方法请自行翻墙
2. 如不想安装mongodb，请翻墙进入mlab.com，新建账号，里面有免费500M的数据库，自己测试够用啦
3. 进入目录执行npm i，安装模块 ——推荐使用淘宝cnpm
4. module/db.js 自行设置数据库连接，默认localhost:3000/blog（需下载安装mongodb）
5. 进程守护用的nodemon,请自行全局安装后执行npm start, 启动项目
6. 账号密码默认为空，如需要新建后台账号密码，请在api.js，加入
``` javascript
      var user = { name: 账号, password: md5(名称) }
      userAdmin(user).save()
```
## 启动

``` bash
# install dependencies
npm i

# serve with hot reload at localhost:3000
npm start
```

