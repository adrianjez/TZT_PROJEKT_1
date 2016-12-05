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

    var students = [];
    var promise = redis.pipeline();

    redis.smembers('students', function (err, result) {
        var mres = result;
        for (var i = 0; i < mres.length; i++) {
            var student_key = 'student:' + mres[i];
            promise.hgetall(student_key);
        }
        promise.exec(function (err, result) {
            for(var i = 0; i< result.length; i++){
                var student = {};
                student.id = result[i][1].id;
                student.student_name = result[i][1].student_name;
                student.student_surname = result[i][1].student_surname;
                student.group_id = result[i][1].group_id;
                students.push(student);
            }
            res.render('students', {studentsArray: students});
        });
    });


});

/** GET /students/:id/edit **/
router.get('/:id/edit', function (req, res) {
    var id = req.params.id;
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
            redis.hgetall("student:" + id, function (err, result) {
                var student = {};
                student.id = result.id;
                student.student_name = result.student_name;
                student.student_surname = result.student_surname;
                student.group_id = result.group_id;

                console.log("student details: " + JSON.stringify(student));

                res.render("student_add", {groupsArray: groups, student: student});
            });
        });
    });
});

/**
 *
 * GET /students/add
 * - receive all groups to allow user select it
 *
 * **/
router.get('/add', function (req, res, next) {
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
            res.render('student_add', {groupsArray: groups, student: {}});
        });
    });
});

/** POST /groups/add **/
router.post('/add', urlencodedParser, function (req, res) {

    /** update case **/
    if(req.body.student_id){
        /** save only properties **/
        redis.hmset("student:" + req.body.student_id,
            "id", req.body.student_id,
            "student_name", req.body.student_name,
            "student_surname", req.body.student_surname,
            "group_id", req.body.group_id);
    }
    /** edit case **/
    else {
        redis.incr("student_key")
            .then(function (result) {
                redis.sadd("students", result);
                redis.hmset("student:" + result,
                    "id", result,
                    "student_name", req.body.student_name,
                    "student_surname", req.body.student_surname,
                    "group_id", req.body.group_id);
            });
    }
    res.redirect('/students/');

});

/** DELETE /groups/remove **/
router.get('/:id/remove', function (req, res, next) {
    var id = req.params.id;
    redis.srem('students', id);
    redis.del('student:' + id);
    res.redirect('/students');

});


module.exports = router;
