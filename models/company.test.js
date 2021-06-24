const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
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

/************************************** register */

describe("register", function () {
  const newCompany =         {
        name: "Saiko Sushi North Park",
        url: "http://saikosushisd.com/",
        address: "North Park CA, 92118",
        username: "testuser"
        }

  test("works", async function () {
    await Company.register(newCompany);

    const result = await db.query(
          `SELECT id, name, url, address, lat, lng, username
           FROM companies
           WHERE name = 'Saiko Sushi North Park'`);
    expect(result.rows).toEqual(
    [{
        id: expect.any(Number),
        name: "Saiko Sushi North Park",
        url: "http://saikosushisd.com/",
        address: "North Park CA, 92118",
        lat: 32.7456484, 
        lng: -117.1294166,
        username: 'testuser'
      }]
    );
  });

  test("bad request with dupe", async function () {
    try {
      await Company.register(newCompany);
      await Company.register(newCompany);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: all", async function () {
    let companies = await Company.findAll();
    expect(companies).toEqual([
      {
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
      },
    ]);
  });
});

  
/************************************** get */

describe("get by username", function () {
  test("works", async function () {
    let company = await Company.get("testuser");
    expect(company).toEqual([{
        id: expect.any(Number),
        name: 'Saiko Sushi Coronado',
        url: 'http://saikosushisd.com/',
        address: '116 Orange Ave, Coronado CA, 92118',
        lat: 32.6987,
        lng: -117.173,
        username: 'testuser',
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Company.get("nope");
    } catch (err) {
        console.log(err)
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
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

    await Company.update(saiko.rows[0].id, updateData);
    const result = await db.query(
          `SELECT name, url, address
           FROM companies
           WHERE name = 'New Name'`);
    expect(result.rows).toEqual([{
        name: 'New Name',
        url: 'http://new.img',
        address: 'North Park, CA',
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Company.update(200, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Company.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const saiko = await db.query(
              `SELECT id
               FROM companies
               WHERE name = 'Saiko Sushi Coronado'`);
               
    await Company.remove(saiko.rows[0].id);
    const res = await db.query(
        "SELECT id FROM companies WHERE id=$1",[saiko.rows[0].id]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Company.remove(200);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
