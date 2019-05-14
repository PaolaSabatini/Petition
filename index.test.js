const { app } = require("./index");
const supertest = require("supertest");
const cookieSession = require("./cookieSession");

const bodyParser = require("body-parser");

jest.mock(bodyParser);

// Users who are logged out are redirected to the registration page when they attempt to go to the petition page
// Users who are logged in are redirected to the petition page when they attempt to go to either the registration page or the login page
// Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to the petition page or submit a signature
// Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to either the thank you page or the signers page

test("User logged out, in registration page, cannot access the petition page", () => {
    return supertest(app)
        .get("/petition")
        .then(res => {
            expect(res.statusCode).toBe(200);
            expect(res.headers["content-type"]).toContain("text/html");
            expect(res.text).toContain(`<h1>Welcome!</h1>`);
        });
});

// another way to test the status code

test("GET /welcome works correctly", () => {
    return supertest(app)
        .get("/welcome")
        .expect(200)
        .then(res => {
            expect(res.headers["content-type"]).toContain("text/html");
            expect(res.text).toContain(`<h1>Welcome!</h1>`);
        });
});

test("GET /home redirects when you have no req.session.submitted is falsy"),
    () => {
        return supertest(app)
            .get("/home")
            .then(res => {
                expect(res.statusCode).toBe(302);
                expect(res.headers.location).toContain("/welcome");
                console.log(res.statusCode, res.headers);
            });
    };

// we have to mock cookie session and csurf

test("GET /home returns 200 when req.session.submitted is truthy"),
    () => {
        cookieSession.mockSessionOnce({
            submitted: true
        });
        return supertest(app)
            .get("/home")
            .then(res => {
                expect(res.statusCode).toBe(302);
            });
    };

// test.only only runs this test ans skip the other tests

test.only("POST /welcome sets req.session.submitted to true", () => {
    const obj = {};
    cookieSession.mockSessionOnce(obj);
    return supertest(app)
        .post("/welcome")
        .then(res => {
            expect(obj).toEqual({
                submitted: true
            });
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});
