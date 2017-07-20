const express = require('express')
const router = express.Router()
import { article, labels, articleLabels, aboutUser, userAdmin, comment } from './db.js'
const moment = require('moment')
const jwt = require('jsonwebtoken'); //jwt-token
const secret = 'doudou-js-li'
const multer = require('multer') //图片文件上传\
const md5 = require('md5');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function(req, file, cb) {
        let suffix = file.originalname.split('.')
        suffix = suffix[suffix.length - 1]
        cb(null, Date.now() + '.' + suffix)
    }
})
const upload = multer({ storage: storage })
const decodeToken = (token, cb) => {
        try {
            jwt.verify(token, secret)
            cb(true)
        } catch (err) {
            cb(false)
        }
    } //需要token的中间件
const tokenFn = (req, res, next) => {
        let token = req.headers['access-token']
        console.log(token)
        decodeToken(token, type => {
            if (!type) {
                //token过期
                res.json({ code: 300, msg: 'token过期' })
            } else {
                next()
            }
        })
    }
    //文章管理——修改，增加
router.post('/saveArticle', tokenFn, async(req, res) => {
    try {
        let body = req.body
        let id = body.id //获取当前文章id,若无则是添加操作
        let labels = body.labels
        let data = {
            date: body.date, //日期
            title: body.title, //标题
            content: body.content, //内容
            initContent: body.initContent, //草稿
            abstract: body.abstract //简介
        }
        if (id) { //修改操作
            await article.findByIdAndUpdate(id, data)
            await articleLabels.find().remove({ article_id: id })
            if (typeof labels == 'string') {
                await new articleLabels({ article_id: id, label_id: labels }).save()
            } else {
                for (let i = 0; i < labels.length; i++) {
                    await new articleLabels({ article_id: id, label_id: labels[i] }).save()
                }
            }

            res.json({ data: '', code: 200, msg: '成功' })
        } else { //添加操作
            await new article(data).save()
            let findData = await article.find()
            let article_id = findData[findData.length - 1]._id
            if (typeof labels == 'string') {
                await new articleLabels({ article_id: article_id, label_id: labels }).save()
            } else {
                labels.forEach(async(item, index) => {
                    await new articleLabels({ article_id: article_id, label_id: item }).save()
                })
            }
            res.json({ data: '', code: 200, msg: '成功' })
        }
    } catch (err) {
        console.log(err)
        res.json({ data: '', code: 500, msg: '服务器错误' })
    }
});
// 获得文章列表
router.get('/getArticleList', async(req, res) => {
        try {
            let pageSize = parseInt(req.query.pageSize)
            let skip = parseInt((req.query.current - 1) * pageSize)
            let total = await article.count()
            let data = await article.find().sort({ date: -1 }).limit(pageSize).skip(skip).lean()
            for (let index = 0; index < data.length; index++) {
                let date = moment(data[index].date).format('YYYY-MM-DD HH:mm')
                data[index].showDate = date
                let labels = await articleLabels.find({ article_id: data[index]._id })
                data[index].labels = []
                labels.forEach(el => {
                    data[index].labels.push(el.label_id)
                })
            }
            data = data.sort(function(a, b) {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            })
            res.json({ data: { total: total, list: data }, code: 200, msg: '' })
        } catch (err) {
            console.log(err)
            res.json({ data: '', code: 500, msg: '服务器错误' })
        }
    })
    //查询文章
router.get('/queryArticle', async(req, res) => {
        try {
            let data = await article.findOne({ _id: req.query.id }).lean()
            let labels = await articleLabels.find({ article_id: data._id })
            data.labels = []
            labels.forEach(el => {
                data.labels.push(el.label_id)
            })
            let date = moment(data.date).format('YYYY-MM-DD HH:mm')
            data.showDate = date
            res.json({ data: data, code: 200, msg: '' })
        } catch (err) {
            console.log(err)
            res.json({ data: '', code: 500, msg: '服务器错误' })
        }
    })
    //删除文章
router.post('/delArticle', tokenFn, async(req, res) => {
        try {
            await article.findByIdAndRemove(req.body.id)
            await articleLabels.find(req.body.id).remove()
            res.json({ code: 200, msg: '删除成功', data: '' })
        } catch (err) {
            console.log(err)
            res.json({ data: '', code: 500, msg: '服务器错误' })
        }
    })
    //标签管理——修改，增加
router.post('/savelabels', tokenFn, async(req, res) => {
        try {
            await new labels({ content: req.body.content, }).save()
            res.json({ code: 200, msg: '添加成功', data: '' })
        } catch (err) {
            console.log(err)
            res.json({ data: '', code: 500, msg: '服务器错误' })
        }
    })
    //标签管理——删除
router.post('/delLabels', tokenFn, async(req, res) => {
        try {
            await labels.findByIdAndRemove(req.body.id)
            await articleLabels.find({ article_id: req.body.id }).remove()
            res.json({ code: 200, msg: '删除成功', data: '' })
        } catch (err) {
            console.log(err)
            res.json({ data: '', code: 500, msg: '服务器错误' })
        }
    })
    //标签管理——获取标签
router.get('/getLabels', async(req, res) => {
        try {
            let data = await labels.find()
            res.json({ data: data, code: 200, msg: '' })
        } catch (err) {
            console.log(err)
            res.json({ data: '', code: 500, msg: '服务器错误' })
        }
    })
    //通过标签查询相应文章
router.get('/getLabelsSearchArticle', async(req, res) => {
        try {
            let queryArticle = await articleLabels.find({ label_id: req.query.id })
            let articleData = []
            for (let i = 0; i < queryArticle.length; i++) {
                let item = queryArticle[i]
                let query = await article.findOne({ _id: item.article_id }).lean()
                let date = moment(query.date).format('YYYY-MM-DD HH:mm')
                query.showDate = date
                articleData.push(query)
            }
            articleData = articleData.sort(function(a, b) {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            })
            res.json({ data: articleData, code: 200, msg: '' })
        } catch (err) {
            console.log(err)
            res.json({ data: '', code: 500, msg: '服务器错误' })
        }
    })
    //获取关于我
router.get('/getAboutUser', async(req, res) => {
        try {
            let data = await aboutUser.find()
            res.json({ data: data[0] || [], code: 200, msg: '' })
        } catch (err) {
            console.log(err)
            res.json({ data: '', code: 500, msg: '服务器错误' })
        }
    })
    //修改关于我
router.post('/setAboutUser', tokenFn, async(req, res) => {
        try {
            let content = req.body.content
            let initContent = req.body.initContent
            let id = req.body.id
            if (id) {
                await aboutUser.findByIdAndUpdate(id, { content: content, initContent: initContent })
            } else {
                await new aboutUser({ content: content, initContent: initContent }).save()
            }
            res.json({ data: '', code: 200, msg: '设置成功' })
        } catch (err) {
            console.log(err)
            res.json({ data: '', code: 500, msg: '服务器错误' })
        }
    })
    //上传图片
router.post('/uploadImg', upload.single('img'), function(req, res) {
    //返回文件名称
    res.json({ code: 200, url: 'http://localhost:3000/images/' + req.file.filename });
});


// 登录接口
router.post('/login', async(req, res) => {
    try {
        let name = req.body.name
        let password = req.body.password
        let data = await userAdmin.find({ name: name, password: md5(password) })
        if (data.length > 0) {
            //生成token 时间一周
            let token = jwt.sign({ exp: Math.floor(Date.now() / 1000) + (7 * 60 * 60), name: name, password: password }, secret);
            res.json({ code: 200, msg: '登录成功', token: token });
            console.log(decodeToken(token))
        } else {
            res.json({ code: 400, msg: '账号密码错误' });
        }
    } catch (err) {
        console.log(err)
        res.json({ data: '', code: 500, msg: '服务器错误' })
    }
});

//添加评论接口
router.post('/comment', async(req, res) => {
        try {
            let body = req.body
            let data = {
                articleId: body.articleId,
                replyId: body.replyId,
                toUserName: body.toUserName,
                email: body.email,
                replyTime: '',
                isAdmin: body.isAdmin,
                content: body.content,
                state: body.state
            }
            data.replyTime = () => {
                let date = new Date(),
                    year = date.getFullYear(),
                    month = date.getMonth(),
                    day = date.getDate(),
                    hours = date.getHours(),
                    min = date.getMinutes();
                month = (month + 1) < 10 ? '0' + (month + 1) : (month + 1);
                day = day < 10 ? '0' + day : day;
                hours = hours < 10 ? '0' + hours : hours;
                min = min < 10 ? '0' + min : min;
                date = year + '-' + month + '-' + day + ' ' + hours + ':' + min;
                return date
            }
            await new comment(data).save()
            res.json({ code: 200, msg: '等待评论审核', data: '' })
        } catch (err) {
            console.log(err)
            res.json({ data: '', code: 500, msg: '服务器错误' })
        }
    })
    //前后台获取评论
router.get('/getComment', async(req, res) => {
        try {
            let showView = req.query.showView
            let pageSize = parseInt(req.query.pageSize)
            let skip = parseInt((req.query.current - 1) * pageSize)
            let total = await comment.count()
            let data = await comment.find().sort({ _id: -1 }).limit(pageSize).skip(skip).lean()
            let showViewArr = []
            let resultShow = []
            for (let index = 0; index < data.length; index++) {
                let date = moment(data[index].replyTime).format('YYYY-MM-DD HH:mm')
                data[index].time = date
            }
            if (showView) {
                data.forEach(item => {
                    if (item.state) showViewArr.push(item)
                })
                let spliceArr = []
                for (let i = 0; i < showViewArr.length; i++) {
                    showViewArr[i].childReply = []
                    for (let j = 0; j < showViewArr.length; j++) {
                        if (showViewArr[i]._id == showViewArr[j].replyId && showViewArr[i]._id != showViewArr[j]._id) {
                            showViewArr[i].childReply.push(showViewArr[j])
                            spliceArr.push(j)
                        }
                    }
                }
                spliceArr = spliceArr.sort()
                for (let i = 0; i < showViewArr.length; i++) {
                    let flag = true
                    for (let j = 0; j < spliceArr.length; j++) {
                        if (i == spliceArr[j]) flag = false
                    }
                    if (flag) {
                        resultShow.push(showViewArr[i])
                    }
                }
            }
            res.json({ data: { total: total, list: showView ? resultShow : data }, code: 200, msg: '' })
        } catch (err) {
            console.log(err)
            res.json({ data: '', code: 500, msg: '服务器错误' })
        }
    })
    //留言是否允许通过审核
router.post('/isAllowComment', async(req, res) => {
    try {
        let queryData = await comment.findOne({ _id: req.body.id })
        queryData.state = req.body.state
        await queryData.save()
        res.json({ code: 200, msg: '操作成功', data: '' })
    } catch (err) {
        console.log(err)
        res.json({ data: '', code: 500, msg: '服务器错误' })
    }
})
router.post('/delComment', async(req, res) => {
    try {
        await comment.findOne({ _id: req.body.id }).remove()
        res.json({ code: 200, msg: '删除成功', data: '' })
    } catch (err) {
        console.log(err)
        res.json({ data: '', code: 500, msg: '服务器错误' })
    }
})
module.exports = router
