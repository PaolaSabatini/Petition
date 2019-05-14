var spicedPg = require("spiced-pg");

var dbUrl =
    process.env.DATABASE_URL ||
    "postgres://spicedling:password@localhost:5432/petition";

var db = spicedPg(dbUrl);

//((((((((((((((((((((((((((((((((((((((       PETITION      ))))))))))))))))))))))))))))))))))))))))

exports.addSignature = function addSignature(signature, users_id) {
    let q =
        "INSERT INTO signatures (signature, users_id) VALUES ($1, $2) RETURNING *;";
    let params = [signature, users_id];
    return db.query(q, params);
};

//((((((((((((((((((((((((((((((((((((((((((     THANKS     ))))))))))))))))))))))))))))))))))))))))))

exports.getSignatureImg = function(id) {
    let q = "SELECT signature FROM signatures WHERE id = $1";
    let params = [id];
    return db.query(q, params);
};

//--------------------------------

exports.getName = function(id) {
    let q = "SELECT firstnameuser FROM users WHERE id = $1";
    let params = [id];
    return db.query(q, params);
};

//---------------------------------

exports.getNumSigners = function getNumSigners() {
    let q = "SELECT COUNT(*) FROM signatures;";
    let params = [];
    return db.query(q, params);
};

//(((((((((((((((((((((((((((((((((((((((((     SIGNERS     ))))))))))))))))))))))))))))))))))))))))

exports.getSigners = function getSigners() {
    let q = `SELECT users.firstnameuser AS "firstnameuser", users.lastnameuser AS "lastnameuser",
user_profiles.age AS "age", user_profiles.city AS "city", user_profiles.url AS "url"
FROM user_profiles
LEFT OUTER JOIN users
ON users.id = user_profiles.users_id;`;
    let params = [];
    return db.query(q, params);
};

exports.getSignersCities = function getSignersCities(city) {
    let q = `SELECT users.firstnameuser AS "firstnameuser", users.lastnameuser AS "lastnameuser",
user_profiles.age AS "age", user_profiles.city AS "city"
FROM user_profiles
LEFT OUTER JOIN users
ON users.id = user_profiles.users_id
WHERE user_profiles.city = $1;`;
    let params = [city];
    return db.query(q, params);
};

//((((((((((((((((((((((((((((((((((((((((      REGISTER     ))))))))))))))))))))))))))))))))))))))))

exports.addUsers = function addUsers(
    firstnameuser,
    lastnameuser,
    emailuser,
    password
) {
    let q =
        "INSERT INTO users (firstnameuser, lastnameuser, emailuser, password) VALUES ($1, $2, $3, $4) RETURNING *;";
    let params = [firstnameuser, lastnameuser, emailuser, password];
    return db.query(q, params);
};

//(((((((((((((((((((((((((((((((((((((((((((((     MORE     ))))))))))))))))))))))))))))))))))))))))

exports.addMore = function addMore(age, city, url, users_id) {
    let q =
        "INSERT INTO user_profiles (age, city, url, users_id) VALUES ($1, $2, $3, $4) RETURNING *;";
    let params = [age, city, url, users_id];
    return db.query(q, params);
};

//((((((((((((((((((((((((((((((((((((((((((     LOGIN     ))))))))))))))))))))))))))))))))))))))))))

exports.getPassword = function getPassword(emailuser) {
    let q = `SELECT password FROM users WHERE emailuser = $1;`;
    let params = [emailuser];
    return db.query(q, params);
};

exports.getSigUserId = function getSigUserId(emailuser) {
    let q = `SELECT signatures.id AS "sigId", users.id AS "userId"
FROM signatures
LEFT OUTER JOIN users
ON signatures.users_id = users.id
WHERE users.emailuser = $1;`;
    let params = [emailuser];
    return db.query(q, params);
};

//((((((((((((((((((((((((((((((((((((((((       UPDATE      ))))))))))))))))))))))))))))))))))))))))

exports.updateUsers = function updateUsers(
    firstnameuser,
    lastnameuser,
    emailuser,
    password
) {
    let q = `UPDATE users
    SET (firstnameuser, lastnameuser, emailuser, password) = ($1, $2, $3, $4)
    WHERE emailuser = $3;`;

    let params = [
        firstnameuser || null,
        lastnameuser || null,
        emailuser || null,
        password || null
    ];
    return db.query(q, params);
};

exports.updateUserProfiles = function updateUserProfiles(
    age,
    city,
    url,
    users_id
) {
    let q = `INSERT INTO user_profiles (age, city, url, users_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (users_id)
    DO UPDATE SET age = $1, city = $2, url = $3;`;
    let params = [age || null, city || null, url || null, users_id];
    return db.query(q, params);
};

exports.getInformation = function getInformation(users_id) {
    let q = `SELECT users.firstnameuser AS "firstnameuser", users.lastnameuser AS "lastnameuser", user_profiles.age AS "age", user_profiles.city AS "city", user_profiles.url AS "url", users.emailuser AS "emailuser", users.password AS "password"
FROM user_profiles
LEFT OUTER JOIN users
ON user_profiles.users_id = users.id
WHERE users.id = $1;`;
    let params = [users_id];
    return db.query(q, params);
};

//((((((((((((((((((((((((((((((((((((      DELETE SIGNATURE     ))))))))))))))))))))))))))))))))))))

exports.deleteSignature = function deleteSignature(id) {
    let q = `DELETE FROM signatures WHERE id = $1`;
    let params = [id];
    return db.query(q, params);
};
