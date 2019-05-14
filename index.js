const express = require("express");
const app = express();
const db = require("./db");
const bodyParser = require("body-parser");
const chalkAnimation = require("chalk-animation");
var hash = require("./bcrypt");
const csurf = require("csurf");

app.engine("handlebars", require("express-handlebars")());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

const cookieSession = require("cookie-session");
app.use(
    cookieSession({
        maxAge: 1000 * 60 * 60 * 24 * 14,
        secret: `I'm always hungry.`
    })
);

app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.setHeader("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

//----------------- MAIN PAGE ------------------//

app.get("/", (req, res) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else if (!req.session.sigId) {
        return res.redirect("/petition");
    } else {
        return res.redirect("/register");
    }
});

//---------------- INTRODUCTION --------------------//

app.get("/introduction", (req, res) => {
    res.render("introduction", {
        layout: "main"
    });
});

//---------------- PETITION --------------------//

app.post("/petition", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/register");
    } else if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        let signature = req.body.signature;
        let users_id = req.session.userId;

        db.addSignature(signature, users_id)
            .then(results => {
                req.session.sigId = results.rows[0].id;
                res.redirect("/thanks");
            })

            .catch(err => {
                console.log("err in addSignature: ", err);
            });
    }
});

app.get("/petition", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/register");
    } else if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main"
        });
    }
});

//----------------- SIGNERS --------------------//

app.get("/signers", (req, res) => {
    if (!req.session.sigId) {
        res.redirect("/petition");
    } else if (!req.session.userId) {
        res.redirect("/register");
    } else {
        db.getSigners()
            .then(results => {
                res.render("signers", {
                    signers: results.rows,
                    layout: "main"
                });
            })
            .catch(err => {
                console.log("error in signers..", err);
            });
    }
});

app.get("/signers/:cities", (req, res) => {
    if (!req.session.sigId) {
        res.redirect("/petition");
    } else if (!req.session.userId) {
        res.redirect("/register");
    } else {
        let city = req.params.cities;

        db.getSignersCities(city)
            .then(results => {
                res.render("signers", {
                    signers: results.rows,
                    layout: "main"
                });
            })
            .catch(err => {
                console.log("error in signers cities..", err);
            });
    }
});

//----------------  REGISTER ------------------//

app.post("/register", (req, res) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        let firstnameuser = req.body.firstnameuser;
        let lastnameuser = req.body.lastnameuser;
        let emailuser = req.body.emailuser;
        let password = req.body.password;

        hash.hashPassword(password)
            .then(password => {
                db.addUsers(firstnameuser, lastnameuser, emailuser, password)
                    .then(password => {
                        req.session.userId = password.rows[0].id;
                        res.redirect("/more");
                    })
                    .catch(err => {
                        console.log("error in Post Register...", err);
                        res.render("register", {
                            message:
                                "Sorry, but this e-mail has already been registered. Please, try again.",
                            layout: "main"
                        });
                    });
            })
            .catch(err => {
                console.log("error in hash password", err);
            });
    }
});

app.get("/register", (req, res) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        res.render("register", {
            layout: "main"
        });
    }
});

//---------------- MORE ------------------------//

app.post("/more", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/register");
    } else {
        let age = req.body.age;
        let city = req.body.city;
        let url = req.body.url;
        let users_id = req.session.userId;

        db.addMore(age, city, url, users_id)
            .then(results => {})
            .catch(err => {
                console.log("error in Post MORE...", err);
            });

        res.redirect("/petition");
    }
});

app.get("/more", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/register");
    } else {
        res.render("more", {
            layout: "main"
        });
    }
});

//---------------- LOGIN -----------------------//

app.post("/login", async (req, res) => {
    let emailuser = req.body.emailuser;
    let newpassword = req.body.newpassword;

    let password = await db
        .getPassword(emailuser)
        .then(result => {
            return result.rows[0].password;
        })
        .catch(err => {
            console.log("error in password", err);
            res.render("login", {
                message: "E-mail or Password incorrect. Please, try again.",
                layout: "main"
            });
        });

    let checkPassword = await hash
        .checkPassword(newpassword, password)
        .then(result => {
            if (result == true) {
                let emailuser = req.body.emailuser;
                db.getSigUserId(emailuser).then(result => {
                    req.session.userId = result.rows[0].userId;
                    req.session.sigId = result.rows[0].sigId;
                    res.redirect("/thanks");
                });
            } else {
                res.render("login", {
                    message: "Password Incorrect. Please, try again.",
                    layout: "main"
                });
            }
        })
        .catch(err => {
            console.log("error on check password", err);
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

//---------------- UPDATE ---------------//

app.post("/update", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/register");
    } else {
        let firstnameuser = req.body.firstnameuser;
        let lastnameuser = req.body.lastnameuser;
        let age = req.body.age;
        let city = req.body.city;
        let url = req.body.url;
        let emailuser = req.body.emailuser;
        let password = req.body.password;
        let users_id = req.session.userId;

        if (req.body.password) {
            hash.hashPassword(password)
                .then(password => {
                    Promise.all([
                        db.updateUsers(
                            firstnameuser,
                            lastnameuser,
                            emailuser,
                            password
                        ),
                        db.updateUserProfiles(age, city, url, users_id)
                    ])
                        .then(res.redirect("/thanks"))
                        .catch(err => {
                            console.log("error in update", err);
                        });
                })

                .catch(err => {
                    console.log("error in hash password", err);
                });
        }

        if (!req.body.password) {
            Promise.all([
                db.updateUsers(
                    firstnameuser,
                    lastnameuser,
                    emailuser,
                    password
                ),
                db.updateUserProfiles(age, city, url, users_id)
            ])
                .then(res.redirect("/thanks"))
                .catch(err => {
                    console.log("error in update", err);
                });
        }
    }
});

app.get("/update", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/register");
    } else {
        db.getInformation(req.session.userId)
            .then(update => {
                res.render("update", {
                    layout: "main",
                    updateusers: update.rows[0]
                });
            })
            .catch(err => {
                console.log("ERROR IN UPDATE GET", err);
            });
    }
});

//-------------------- THANKS --------------------//

app.post("/thanks", (req, res) => {
    if (!req.session.sigId) {
        res.redirect("/petition");
    } else if (!req.session.userId) {
        res.redirect("/register");
    } else {
        db.deleteSignature(req.session.sigId)
            .then((req.session.sigId = null))
            .catch(err => {
                console.log("error in deleteSignature", err);
            });

        res.render("deleted", {
            layout: "main"
        });
    }
});

app.get("/thanks", async (req, res) => {
    if (!req.session.sigId) {
        res.redirect("/petition");
    } else if (!req.session.userId) {
        res.redirect("/register");
    } else {
        let sig = (await db.getSignatureImg(req.session.sigId)).rows[0]
            .signature;

        let numSig = (await db.getNumSigners()).rows[0].count;
        let getName = (await db.getName(req.session.userId)).rows[0]
            .firstnameuser;

        res.render("thanks", {
            name: getName,
            signature: sig,
            id: numSig,
            layout: "main"
        });
    }
});

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        chalkAnimation.rainbow("L I S T E N I N G . . .")
    );
}
