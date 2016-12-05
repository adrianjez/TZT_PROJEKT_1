/**
 * Created by adrianjez on 26.11.2016.
 */
/** Module dependencies **/
var express = require('express');
var redis = require('../modules/redis.js');
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({extended: true});
var router = express.Router();

/** GET /groups/ **/
router.get('/', function (req, res, next) {

    var groups = [];
    var promise = redis.pipeline();

    redis.smembers('groups', function (err, result) {
        var mres = result;
        for (var i = 0; i < mres.length; i++) {
            var group_key = 'group:' + mres[i];
            promise.hgetall(group_key);
        }
        promise.exec(function (err, result) {
            for(var i = 0; i< result.length; i++){
                var group = {};
                group.group_name = result[i][1].group_name;
                group.id = result[i][1].id;
                groups.push(group);
            }
            res.render('groups', {groupsArray: groups});
        });
    });
});

/** GET /groups/:id/edit **/
router.get('/:id/edit', function (req, res) {
    var id = req.params.id;
    var group = {};
    redis.hgetall("group:" + id, function (err, result) {
        group.group_name = result.group_name;
        group.id = result.id;
        res.render("group_add", group);
    });
});

/** GET /groups/add **/
router.get('/add', function (req, res, next) {
    res.render('group_add', {});
});

/** POST /groups/add **/
router.post('/add', urlencodedParser, function (req, res) {

    /** update case **/
    if(req.body.group_id){
        /** save only properties **/
        redis.hmset("group:" + req.body.group_id, "group_name", req.body.group_name, "id", req.body.group_id);
    }
    /** edit case **/
    else if (req.body.group_name) {
        redis.incr("group_key")
            .then(function (result) {
                console.log("added group name: " + req.body.group_name + " with id: " + result);
                redis.sadd("groups", result);
                redis.hmset("group:" + result, "group_name", req.body.group_name, "id", result);
            });
    }
    res.redirect('/groups/');

});

/** GET /groups/remove **/
router.get('/:id/remove', function (req, res, next) {
    var id = req.params.id;
    redis.srem('groups', id);
    redis.del('group:' + id);
    res.redirect('/groups');

});
module.exports = router;