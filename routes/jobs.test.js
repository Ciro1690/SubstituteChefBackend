const request = require("supertest");

const app = require("../app");
const db = require("../db.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  test("works", async function () {
    const saiko = await db.query(
            `SELECT id
              FROM companies
              WHERE name = 'Saiko Sushi Coronado'`);

      let newJob = {
        position: "Sous Chef",
        hourlyPay: 22,
        date: "2021-06-29",
        companyId: saiko.rows[0].id,
    };
    const resp = await request(app)
        .post(`/jobs/new`)
        .send(newJob)
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
        job: {
            position: "Sous Chef",
            companyId: saiko.rows[0].id,
            hourlyPay: 22,
            date: expect.anything(),
            id: expect.any(Number),
        }
    },
    );
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post(`/jobs/new`)
        .send({
            position: "Sous Chef",
        })
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post(`/jobs/new`)
        .send({
            position: "Sous Chef",
            hourlyPay: 22,
            date: "2021-06-29",
            companyId: 300,
        })
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("works", async function () {
    const resp = await request(app).get(`/jobs`);
    expect(resp.body).toEqual({
          jobs: [
             {
        id: expect.any(Number),
        position: "Prep Cook",
        hourly_pay: 14,
        date: expect.anything(),
        company_id: expect.any(Number),
      },
      {
        id: expect.any(Number),
        position: "Line Cook",
        hourly_pay: 14,
        date: expect.anything(),
        company_id: expect.any(Number),
      },
    ]},
    );
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works", async function () {
   const prep = await db.query(
            `SELECT id
              FROM jobs
              WHERE position = 'Prep Cook'`);

    const resp = await request(app).get(`/jobs/${prep.rows[0].id}`);
    expect(resp.body).toEqual({
      job: {
        id: prep.rows[0].id,
        position: "Prep Cook",
        hourly_pay: 14,
        date: expect.anything(),
        company_id: expect.any(Number),      
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works", async function () {
  let updateData = {
    position: "New",
    date: '2021-06-29',
    hourlyPay: 30,
  };   
    const prep = await db.query(
            `SELECT id
              FROM jobs
              WHERE position = 'Prep Cook'`);

    const resp = await request(app)
        .patch(`/jobs/${prep.rows[0].id}`)
        .send(updateData)
    expect(resp.body).toEqual({
      job: {
        id: prep.rows[0].id,
        position: "New",
        date: expect.anything(),
        hourlyPay: 30,   
      },
    });
  });

  test("not found on no such job", async function () {
    let updateData = {
        position: "New",
        date: '2021-06-29',
        hourlyPay: 30,
    };   
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send(updateData)
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request with invalid data", async function () {
    let updateData = {
        position: "New",
        hourlyPay: "test",
        date: '2021-06-29',
    };   
    const prep = await db.query(
            `SELECT id
              FROM jobs
              WHERE position = 'Prep Cook'`);
    const resp = await request(app)
        .patch(`/jobs/${prep.rows[0].id}`)
        .send(updateData)
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works", async function () {
    const prep = await db.query(
            `SELECT id
              FROM jobs
              WHERE position = 'Prep Cook'`);

    const resp = await request(app)
        .delete(`/jobs/${prep.rows[0].id}`)
    expect(resp.body).toEqual({ deleted: `${prep.rows[0].id }`});
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
    expect(resp.statusCode).toEqual(404);
  });
});
