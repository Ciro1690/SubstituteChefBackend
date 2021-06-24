const bcrypt = require("bcrypt");
const { createToken } = require("../helpers/tokens");

const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testCompanyIds = [];
const testJobIds = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM users");

    await db.query(`
    INSERT INTO users (username, password, first_name, last_name, email)
    VALUES ('testuser',
            $1,
            'Test',
            'User',
            'test@user.com'
            ),
            ('test2user2',
            $2,
            'Test2',
            'User2',
            'test2@user2.com'
            )`,
            [
                await bcrypt.hash("password", BCRYPT_WORK_FACTOR),
                await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
            ]
    );

  const companyIds = await db.query(`
    INSERT INTO companies (name, url, address, lat, lng, username)
    VALUES ('Saiko Sushi Coronado',
            'http://saikosushisd.com/',
            '116 Orange Ave, Coronado CA, 92118',
            32.6987, 
            -117.173,
            'testuser'
            ),
        ('The Fishery',
            'https://www.thefishery.com/',
            '5040 Cass St, San Diego CA, 92118',
            32.80069,
            -117.2547,
            'test2user2'
            )
        RETURNING id`);

        testCompanyIds.splice(0, 0, ...companyIds.rows.map(r => r.id));

  const resultsJobs = await db.query(`
    INSERT INTO jobs (position, hourly_pay, date, company_id)
    VALUES ('Prep Cook',
            14,
            '2021-06-22',
            $1),
            ('Line Cook',
            14,
            '2021-06-22',
            $1)
    RETURNING id`,
    [testCompanyIds[0]]);

    testJobIds.splice(0, 0, ...resultsJobs.rows.map(r => r.id));
    await db.query(`
            INSERT INTO applications(status, username, job_id)
            VALUES ('PENDING', 'testuser', $1)`,
        [testJobIds[0]]);
}



async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const testuserToken = createToken({ username: "testuser" });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  testCompanyIds,
  testuserToken
};