/**
 * Created by adrianjez on 26.11.2016.
 */
/** Module dependencies **/
var express = require('express');
var redis = require('../modules/redis.js');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: true});


var router = express.Router();

/* GET /about/ */
router.get('/', function(req, res, next) {

    var data = {};
    var promise = redis.pipeline()
        .get('app_name', function (err, result) {
            data.app_name = result;
            console.log("App name received" + result);
        })
        .get('app_description', function (err, result) {
            data.app_description = result;
            console.log("App description received" + result);
        })
        .get("app_author", function (err, result) {
            data.app_author = result;
            console.log("App author received" + result);
        })
        .exec();
    promise.then(function (result) {
        console.log("Site render" + result);
        res.render('about', data);
    });
});

/** GET about/change/  **/
router.get('/change', function (req, res, next) {

    var data = {};
    redis.pipeline()
        .get('app_name', function (err, result) {
            data.app_name = result;
        })
        .get('app_description', function (err, result) {
            data.app_description = result;
        })
        .get("app_author", function (err, result) {
            data.app_author = result;
        })
        .exec(function (err, result) {
            res.render('about_change', data);
        });
});

/** POST about/change/ **/
router.post('/change', urlencodedParser, function (req, res) {
    if (req.body.app_name && req.body.app_description && req.body.app_author) {
        redis.set('app_name', req.body.app_name);
        redis.set('app_description', req.body.app_description);
        redis.set('app_author', req.body.app_author);
        res.redirect('/');
    }
    else {
        res.redirect('/change');
    }
});

module.exports = router;
