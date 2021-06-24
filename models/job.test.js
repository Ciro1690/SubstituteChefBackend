const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  
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
    let job = await Job.create(newJob);
    expect(job).toEqual({
      position: "Sous Chef",
      companyId: saiko.rows[0].id,
      hourlyPay: 22,
      date: expect.anything(),
      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
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
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    const prep = await db.query(
        `SELECT id
          FROM jobs
          WHERE position = 'Prep Cook'`);

    let job = await Job.get(prep.rows[0].id);
    expect(job).toEqual({
        id: prep.rows[0].id,
        position: "Prep Cook",
        hourly_pay: 14,
        date: expect.anything(),
        company_id: expect.any(Number),
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  let updateData = {
    position: "New",
    date: '2021-06-29',
    hourlyPay: 30,
  };

  test("works", async function () {
    const prep = await db.query(
      `SELECT id
        FROM jobs
        WHERE position = 'Prep Cook'`);
        
    let job = await Job.update(prep.rows[0].id, updateData);
    expect(job).toEqual({
      id: prep.rows[0].id,
      position: "New",
      date: expect.anything(),
      hourlyPay: 30,      
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, {
        title: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      const updateData = {};
      const prep = await db.query(
          `SELECT id
            FROM jobs
            WHERE position = 'Prep Cook'`);
            
      await Job.update(prep.rows[0].id, updateData);      
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
      const prep = await db.query(
          `SELECT id
            FROM jobs
            WHERE position = 'Prep Cook'`);
            
      await Job.remove(prep.rows[0].id);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=$1", [prep.rows[0].id]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
