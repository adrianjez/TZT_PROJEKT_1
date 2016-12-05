/**
 * Created by adrianjez on 05.12.2016.
 */
/** Module dependencies **/
var express = require('express');
var redis = require('../modules/redis.js');
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({extended: true});
var router = express.Router();

/**
 * Helper methods
 **/
/** Returns element details by given id **/
function getElementById(elements, id) {
    for(var i = 0; i < elements.length; i++) {
        if (elements[i].id == id) return elements[i];
    }
    return {};
}

/** GET /behaviours_register/ **/
router.get('/', function (req, res, next) {

    var behaviours = [];
    var students = [];
    var subjects = [];

    var promise = redis.pipeline();
    var keysPromise = redis.pipeline();

    keysPromise.smembers('students', function (err, result) {
        var mres = result;
        for (var i = 0; i < mres.length; i++) {
            var student_key = 'student:' + mres[i];
            promise.hgetall(student_key, function (err, result) {
                var student = {};
                student.id = result.id;
                student.student_name = result.student_name;
                student.student_surname = result.student_surname;
                student.group_id = result.group_id;
                students.push(student);
            });
        }
    });
    keysPromise.smembers('subjects', function (err, result) {
        var mres = result;
        for (var i = 0; i < mres.length; i++) {
            var subject_key = 'subject:' + mres[i];
            promise.hgetall(subject_key, function (err, result) {
                var subject = {};
                subject.id = result.id;
                subject.subject_name = result.subject_name;
                subjects.push(subject);
            });
        }
    });
    keysPromise.smembers('behaviours', function (err, result) {
        var mres = result;
        for (var i = 0; i < mres.length; i++) {
            var behaviour_key = 'behaviour:' + mres[i];
            promise.hgetall(behaviour_key, function (err, result) {
                var behaviour = {};
                behaviour.id = result.id;
                behaviour.student_id = result.student_id;
                behaviour.subject_id = result.subject_id;
                behaviour.student_details = getElementById(students, result.student_id);
                behaviour.subject_details = getElementById(subjects, result.subject_id);
                behaviours.push(behaviour);
            });
        }
    });

    keysPromise.exec(function (err, result) {
        promise.exec(function (err, result) {
            res.render('behaviours', {behavioursArray: behaviours});
        });
    });

});

/** GET /behaviours_register/:id/edit **/
router.get('/:id/edit', function (req, res) {
    var id = req.params.id;
    var students = [];
    var subjects = [];

    var keysPromise = redis.pipeline();
    var promise = redis.pipeline();
    var behaviour = {};

    keysPromise.hgetall("behaviour:" + id, function (err, result) {
        behaviour.id = result.id;
        behaviour.student_id = result.student_id;
        behaviour.subject_id = result.subject_id;
    });
    keysPromise.smembers('students', function (err, result) {
        var mres = result;
        for (var i = 0; i < mres.length; i++) {
            var student_key = 'student:' + mres[i];
            promise.hgetall(student_key, function (err, result) {
                var student = {};
                student.id = result.id;
                student.student_name = result.student_name;
                student.student_surname = result.student_surname;
                student.group_id = result.group_id;
                students.push(student);
            });
        }
    });
    keysPromise.smembers('subjects', function (err, result) {
        var mres = result;
        for (var i = 0; i < mres.length; i++) {
            var subject_key = 'subject:' + mres[i];
            promise.hgetall(subject_key, function (err, result) {
                var subject = {};
                subject.id = result.id;
                subject.subject_name = result.subject_name;
                subjects.push(subject);
            });
        }
    });
    keysPromise.exec(function (err, result) {
        promise.exec(function (err, result) {
            res.render("behaviour_register_add", {behavioursArray: subjects, studentsArray: students, behaviour: behaviour});
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
    var id = req.params.id;
    var students = [];
    var subjects = [];

    var keysPromise = redis.pipeline();
    var promise = redis.pipeline();


    keysPromise.smembers('students', function (err, result) {
        var mres = result;
        for (var i = 0; i < mres.length; i++) {
            var student_key = 'student:' + mres[i];
            promise.hgetall(student_key, function (err, result) {
                var student = {};
                student.id = result.id;
                student.student_name = result.student_name;
                student.student_surname = result.student_surname;
                student.group_id = result.group_id;
                students.push(student);
            });
        }
    });
    keysPromise.smembers('subjects', function (err, result) {
        var mres = result;
        for (var i = 0; i < mres.length; i++) {
            var subject_key = 'subject:' + mres[i];
            promise.hgetall(subject_key, function (err, result) {
                var subject = {};
                subject.id = result.id;
                subject.subject_name = result.subject_name;
                subjects.push(subject);
            });
        }
    });
    keysPromise.exec(function (err, result) {
        promise.exec(function (err, result) {
            res.render("behaviour_register_add", {behavioursArray: subjects, studentsArray: students, behaviour: {}});
        });
    });
});

/** POST /behaviours_register/add **/
router.post('/add', urlencodedParser, function (req, res) {

    /** update case **/
    if (req.body.behaviour_id) {
        /** save only properties **/
        redis.hmset("behaviour:" + req.body.behaviour_id,
            "id", req.body.behaviour_id,
            "subject_id", req.body.subject_id,
            "student_id", req.body.student_id);
    }
    /** edit case **/
    else {
        redis.incr("behaviour_key")
            .then(function (result) {
                redis.sadd("behaviours", result);
                redis.hmset("behaviour:" + result,
                    "id", result,
                    "subject_id", req.body.subject_id,
                    "student_id", req.body.student_id);
            });
    }
    res.redirect('/behaviours_register/');

});

/** GET /behaviours_register/remove **/
router.get('/:id/remove', function (req, res, next) {
    var id = req.params.id;
    redis.srem('behaviours', id);
    redis.del('behaviour:' + id);
    res.redirect('/behaviours_register/');
});


module.exports = router;
