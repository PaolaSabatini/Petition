// take the id from the users table and store in the cookie
// in the presence of the id cookie, it means that he´s login and is able to see the logged in area
//

var bcrypt = require("bcryptjs");

exports.hashPassword = function hashPassword(password) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
};

var bcrypt = require("bcryptjs");

exports.checkPassword = function checkPassword(newpassword, password) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(newpassword, password, function(err, doesMatch) {
            if (err) {
                reject(err);
            } else {
                resolve(doesMatch);
            }
        });
    });
};
