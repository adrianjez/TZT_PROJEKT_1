/**
 * Created by adrianjez on 27.11.2016.
 */
/** Module dependencies **/
var express = require('express');
var redis = require('../modules/redis.js');
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({extended: true});
var router = express.Router();


/** GET /students/ **/
router.get('/', function (req, res, next) {

    var subjects = [];
    var promise = redis.pipeline();

    redis.smembers('subjects', function (err, result) {
        var mres = result;
        for (var i = 0; i < mres.length; i++) {
            var subject_key = 'subject:' + mres[i];
            promise.hgetall(subject_key);
        }
        promise.exec(function (err, result) {
            for(var i = 0; i< result.length; i++){
                var subject = {};
                subject.id = result[i][1].id;
                subject.subject_name = result[i][1].subject_name;
                subjects.push(subject);
            }
            res.render('subjects', {subjectsArray: subjects});
        });
    });


});

/** GET /subjects/:id/edit **/
router.get('/:id/edit', function (req, res) {
    var id = req.params.id;
    var subject = {};
    redis.hgetall("subject:" + id, function (err, result) {
        subject.subject_name = result.subject_name;
        subject.id = result.id;
        res.render("add_subject", subject);
    });
});

/**
 *
 * GET /subjects/add
 * **/
router.get('/add', function (req, res, next) {
    res.render('add_subject', {});
});

/** POST /groups/add **/
router.post('/add', urlencodedParser, function (req, res) {
    /** update case **/
    if(req.body.subject_id){
        /** save only properties **/
        redis.hmset("subject:" + req.body.subject_id, "subject_name", req.body.subject_name, "id", req.body.subject_id);
    }
    /** edit case **/
    else if (req.body.subject_name) {
        redis.incr("subject_key")
            .then(function (result) {
                redis.sadd("subjects", result);
                redis.hmset("subject:" + result, "subject_name", req.body.subject_name, "id", result);
            });
    }
    res.redirect('/subjects/');
});

/** GET /groups/remove **/
router.get('/:id/remove', function (req, res, next) {
    var id = req.params.id;
    redis.srem('subjects', id);
    redis.del('subject:' + id);
    res.redirect('/subjects');

});

module.exports = router;
