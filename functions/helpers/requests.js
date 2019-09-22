'use strict';

const request = require('request');
var querystring = require('querystring');

const baseUrl = 'http://sharelock-env.febqyyh3ip.us-east-2.elasticbeanstalk.com/';

module.exports = {
    getUserLocks: function(userId) {
        let options = {
            url: baseUrl + 'users/' + userId + '/locks',
            json: true
        };
        return new Promise(function(resolve, reject) {
            request.get(options, function(error, response, body) {
                if (error || response.statusCode !== 200) {
                    console.error(response.statusCode);
                } else {
                    resolve(body);
                }
            });
        });
    },
    getLockKeys: function(lockId) {
        let options = {
            url: baseUrl + 'locks/' + lockId + '/keys',
            json: true
        };
        return new Promise(function(resolve, reject) {
            request.get(options, function(error, response, body) {
                if (error || response.statusCode !== 200) {
                    console.error(response.statusCode);
                } else {
                    resolve(body);
                }
            });
        });
    },
    getLock: function(lockId) {
        let options = {
            url: baseUrl + 'locks/' + lockId,
            json: true
        };
        return new Promise(function(resolve, reject) {
            request.get(options, function(error, response, body) {
                if (error || response.statusCode !== 200) {
                    console.error(response.statusCode);
                } else {
                    resolve(body);
                }
            });
        });
    }
}