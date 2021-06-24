"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testuserToken,
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /users */

describe("GET /users", function () {
  test("works", async function () {
    const resp = await request(app)
        .get("/users")
    expect(resp.body).toEqual({
      users: [
          {
              username: "test2user2",
              firstName: "Test2",
              lastName: "User2",
              email: "test2@user2.com",
            },
            {
              username: "testuser",
              firstName: "Test",
              lastName: "User",
              email: "test@user.com",
            },
      ],
    });
  });
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  test("works", async function () {
    const resp = await request(app)
        .get(`/users/testuser`)
    expect(resp.body).toEqual({
      user:  {
              username: "testuser",
              firstName: "Test",
              lastName: "User",
              email: "test@user.com",
              applications: [
                  [expect.any(Number), "PENDING"]
              ]
            },
    });
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
        .get(`/users/nope`)
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
  test("works", async function () {
    const resp = await request(app)
        .patch(`/users/testuser`)
        .send({
          firstName: "New",
          lastName: "Last",
          email: "New@Email.com"
        })
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.body).toEqual({
      user: {
              firstName: "New",
              lastName: "Last",
              email: "New@Email.com",
            }
    });
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
        .patch(`/users/nope`)
        .send({
          firstName: "Nope",
          lastName: "Nope",
          email: "testemail@email.com"
        })
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .patch(`/users/testuser`)
        .send({
          firstName: 42,
        })
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/users/testuser`)
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.body).toEqual({ deleted: "testuser" });
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
        .delete(`/users/nope`)
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** POST /users/:username/jobs/:id */

describe("POST /users/:username/jobs/:id", function () {
  test("works", async function () {
    const prep = await db.query(
        `SELECT id
        FROM jobs
        WHERE position = 'Prep Cook'`);
    const resp = await request(app)
        .post(`/users/test2user2/jobs/${prep.rows[0].id}`)
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.body).toEqual({ applied: prep.rows[0].id });
  });

  test("not found for no such username", async function () {
    const prep = await db.query(
        `SELECT id
        FROM jobs
        WHERE position = 'Prep Cook'`);
    const resp = await request(app)
        .post(`/users/nope/jobs/${prep.rows[0].id}`)
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .post(`/users/u1/jobs/0`)
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});