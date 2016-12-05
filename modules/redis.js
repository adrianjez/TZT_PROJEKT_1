/**
 * Created by adrianjez on 26.11.2016.
 *
 * -- Redis connection common module
 */
var Redis = require("ioredis");

var redis = new Redis({
    port: 19824,          // Redis port
    host: 'redis-19824.c8.us-east-1-4.ec2.cloud.redislabs.com',   // Redis host
    family: 4,           // 4(IPv4) or 6(IPv6)
    password: 'adrian',
    db: 0
});

module.exports = redis;