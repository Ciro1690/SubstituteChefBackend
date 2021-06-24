const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
/************************************** authenticate */

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("testuser", "password");
    expect(user).toEqual({
      username: "testuser",
      firstname: "Test",
      lastname: "User",
      email: "test@user.com",
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("c1", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

// /************************************** register */

describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "Test",
    lastName: "Tester",
    email: "test@test.com",
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual(newUser);
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
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
        }
    ]);
  });
});

// /************************************** get */

describe("get", function () {
  test("works", async function () {
    let user = await User.get("testuser");        

    expect(user).toEqual({
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "test@user.com",
      applications: user.applications,
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    firstName: "NewName",
    lastName: "NewLastName",
    email: "new@email.com",
  };

  test("works", async function () {
    let updated = await User.update("testuser", updateData);
    expect(updated).toEqual({
      ...updateData,
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.update("nope", {
        firstName: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    expect.assertions(1);
    try {
      await User.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await User.remove("testuser");
    const res = await db.query(
        "SELECT * FROM users WHERE username='testuser'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** applyToJob */

describe("applyToJob", function () {
  test("works", async function () {
    await User.applyToJob("testuser", testJobIds[1]);

    const res = await db.query(
        "SELECT * FROM applications WHERE job_id=$1", [testJobIds[1]]);
    expect(res.rows).toEqual([{
      job_id: testJobIds[1],
      status: "PENDING",
      username: "testuser",
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await User.applyToJob("testuser", 0, "applied");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such user", async function () {
    try {
      await User.applyToJob("nope", testJobIds[0], "applied");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
