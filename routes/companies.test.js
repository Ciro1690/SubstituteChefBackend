const request = require("supertest");
const db = require("../db.js");

const app = require("../app");

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

/************************************** POST /companies */

describe("POST /companies", function () {
  const newCompany = {
    name: "Saiko Sushi North Park",
    url: "http://saikosushisd.com/",
    address: "North Park CA, 92118",
    username: "testuser",
  };

  test("works", async function () {
    const resp = await request(app)
        .post("/companies/signup")
        .send(newCompany)
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: [
           { name: "Saiko Sushi North Park",
            url: "http://saikosushisd.com/",
            address: "North Park CA, 92118",
            username: "testuser",
            id: expect.any(Number),
            lat: expect.any(Number),
            lng: expect.any(Number),
        }]
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
            name: "Saiko Sushi North Park",
            url: "http://saikosushisd.com/",
        })
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
            name: "Saiko Sushi North Park",
            url: "http://saikosushisd.com/",
            address: "North Park CA, 92118",
            username: "notuser",
        })
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /companies */

describe("GET /companies", function () {
  test("works", async function () {
    const resp = await request(app).get("/companies");
        expect(resp.body).toEqual({
        companies:
        [{
            id: expect.any(Number),
            name: 'Saiko Sushi Coronado',
            url: 'http://saikosushisd.com/',
            address: '116 Orange Ave, Coronado CA, 92118',
            lat: 32.6987,
            lng: -117.173,
            username: 'testuser',
        },
        {
            id: expect.any(Number),
            name: 'The Fishery',
            url: 'https://www.thefishery.com/',
            address: '5040 Cass St, San Diego CA, 92118',
            lat: 32.80069,
            lng: -117.2547,
            username: 'test2user2',
        },]});
    });
  });

/************************************** GET /companies/username/:username */

describe("GET /companies/username/:username", function () {
  test("works", async function () {
    const resp = await request(app).get(`/companies/username/testuser`);
    expect(resp.body).toEqual({
      companies: [{
            id: expect.any(Number),
            name: 'Saiko Sushi Coronado',
            url: 'http://saikosushisd.com/',
            address: '116 Orange Ave, Coronado CA, 92118',
            lat: 32.6987,
            lng: -117.173,
            username: 'testuser',
      }],
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/username/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:id */

describe("PATCH /companies/:id", function () {
  const updateData = {
    name: "New Name",
    address: "North Park, CA",
    url: "http://new.img",
  };
    test("works", async function () {
    const saiko = await db.query(
              `SELECT id
               FROM companies
               WHERE name = 'Saiko Sushi Coronado'`);

    const resp = await request(app)
        .patch(`/companies/${saiko.rows[0].id}`)
        .send(updateData)
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.body).toEqual({
        company: {
            name: 'New Name',
            url: 'http://new.img',
            address: 'North Park, CA',
            id: expect.any(Number),
            username: "testuser",
        }
    });
  });

  test("not found on no such company", async function () {
  const updateData = {
    name: "New Name",
    address: "North Park, CA",
    url: "http://new.img",
  };
    const resp = await request(app)
        .patch(`/companies/100`)
        .send(updateData)
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.statusCode).toEqual(401);
  });


  test("bad request on invalid data", async function () {
    const saiko = await db.query(
              `SELECT id
               FROM companies
               WHERE name = 'Saiko Sushi Coronado'`);
    const resp = await request(app)
        .patch(`/companies/${saiko.rows[0].id}`)
        .send({
            name: "New Name",
        })
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:id", function () {
  test("works", async function () {
    const saiko = await db.query(
              `SELECT id
               FROM companies
               WHERE name = 'Saiko Sushi Coronado'`);
    const resp = await request(app)
        .delete(`/companies/${saiko.rows[0].id}`)
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.body).toEqual({ deleted: `${saiko.rows[0].id }`});
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
        .delete(`/companies/400`)
        .set("authorization", `Bearer ${testuserToken}`);
    expect(resp.statusCode).toEqual(401);
  });
});
