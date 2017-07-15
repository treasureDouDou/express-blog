var express = require('express');
var router = express.Router();


router.all('/', function(req, res, next) {
    res.set('Cache-Control', 'no-cache');
    res.set('Content-Type', 'text/html');
    res.sendfile('public/index.html');
});
module.exports = router;
