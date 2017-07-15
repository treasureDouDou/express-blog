require('babel-core/register');
require('./app.js');
require("babel-core").transform("code", {
     plugins: ["transform-runtime"]
});