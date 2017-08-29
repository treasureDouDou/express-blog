const mongoose = require('mongoose')
const Schema = mongoose.Schema

//文章
const article = new Schema({
        date: Date,
        title: String,
        draft: { type: Boolean, default: false },//是否是草稿
        abstract: String, //首页文章列表显示的简介
        content: String, //转换后文章的详情
        initContent: String, //未转换文章的详情——草稿

    })
    //标签
const labels = new Schema({
        content: String
    })
    //文章标签关联表
const articleLabels = new Schema({
    article_id: String,
    label_id: String,
})
const aboutUser = new Schema({
    content: String, //转换后显示的内容
    initContent: String //未转换的内容
})
const userAdmin = new Schema({
    name: String,
    password: String
})
const comment = new Schema({
    articleId: String, //文章id
    replyId: String, //这篇回复的id
    toUserName:  String, //评论人姓名、昵称
    email: String, //评论人邮箱
    replyTime: Date, //评论时间,时间戳
    isAdmin: { type: Boolean, default: false }, //是否是admin回复
    content: String, //评论内容
    state: { type: Boolean, default: false }, //是否审核通过 0, 未审核通过 1 审核通过
})
var models = {
        article: mongoose.model('article', article),
        labels: mongoose.model('labels', labels),
        articleLabels: mongoose.model('articleLabels', articleLabels),
        aboutUser: mongoose.model('aboutUser', aboutUser),
        userAdmin: mongoose.model('userAdmin', userAdmin),
        comment: mongoose.model('comment', comment)
    }
    //数据库
mongoose.connect('mongodb://localhost:27017/blog', function(err) {
    if (err) {
        console.log('数据库连接失败')
    } else {
        console.log('数据库连接成功')
    }
});

module.exports = models
