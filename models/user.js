const db = require("../db");
const bcrypt = require("bcrypt");
const { NotFoundError, UnauthorizedError, BadRequestError } = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { sendEmail } = require('../helpers/email.js');

class User {
    static async get(username) {
        const result = await db.query(
            `SELECT username,
            first_name AS "firstName",
            last_name AS "lastName",
            email
            FROM users
            WHERE username = $1`,
            [username]
        );

        const user = result.rows[0];

        if (!user) {
            throw new NotFoundError(`Username ${username} is invalid`, 400)
        }

        const userApplications = await db.query(
            `SELECT applications.job_id, applications.status
             FROM applications
             WHERE applications.username = $1`, [username]);
        
        user.applications = userApplications.rows.map(applications => [applications.job_id, applications.status]);
        return user;
    }

    static async findAll() {
    const result = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM users
           ORDER BY username`,
    );

    return result.rows;
    }

    static async authenticate(username, password) {
        const result = await db.query(
            `SELECT username,
                password,
                first_name AS firstName,
                last_name AS lastName,
                email
            FROM users
            WHERE username = $1`,
            [username],
        );

        const user = result.rows[0];

        if (!user) throw new UnauthorizedError("Invalid username/password", 401);
        
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid === true) {
            delete user.password;
            return user;
        }
    }

    static async register(
        {username, password, firstName, lastName, email}) {
            const duplicateCheck = await db.query(
                `SELECT username
                FROM users
                WHERE username = $1`,
                [username],
            );

            if (duplicateCheck.rows[0]) {
                throw new BadRequestError(`Duplicate username: ${username}`);
            }

            const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

            const result = await db.query(
                `INSERT INTO users
                (username,
                    password,
                    first_name,
                    last_name,
                    email)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING username, first_name AS "firstName", last_name AS "lastName", email`,
                [
                username,
                hashedPassword,
                firstName,
                lastName,
                email
                ]                
            )
            return result.rows[0];
        }

    static async update(username, data) {
        if (Object.keys(data).length === 0) throw new BadRequestError("No Data", 400)
        const result = await db.query(
            `UPDATE users
                SET first_name=$1,
                last_name=$2,
                email=$3
                WHERE username = $4
                RETURNING first_name AS "firstName", last_name AS "lastName", email`,
            [
            data.firstName,
            data.lastName,
            data.email,
            username
            ]                
        )
            if (!result.rows[0]) throw new NotFoundError("User not found", 400)
            return result.rows[0];
        }

    static async remove(username) {
            const result = await db.query(
                `DELETE
                 FROM users
                 WHERE username = $1
                 RETURNING username`,
                [username]                
            );
            const user = result.rows[0];

            if (!user) throw new NotFoundError(`No user ${username}`);
            return user;
        }

    static async applyToJob(username, jobId) {
        const jobCheck = await db.query(
            `SELECT id, position, company_id
            FROM jobs
            WHERE id = $1`, [jobId]);
        const job = jobCheck.rows[0];
        
        if (!job) throw new NotFoundError(`No job: ${jobId}`);
        
        const companyEmail = await db.query(
            `SELECT name, email
            FROM users
            JOIN companies
            ON companies.username = users.username
            WHERE companies.id = $1`, [job.company_id]);
            
            const company = companyEmail.rows[0];
            
            const usernameCheck = await db.query(
                `SELECT username, email
                FROM users
                WHERE username = $1`, [username]);
                const user = usernameCheck.rows[0];
                
                if (!user) throw new NotFoundError(`No username: ${username}`);
                
                await db.query(
                    `INSERT INTO applications (status, username, job_id)
                    VALUES ($1, $2, $3)`,
                    ['PENDING', username, jobId]);

                sendEmail(company.email, user.email, `${username} has applied to ${job.position} at ${company.name}.`)
    }
                
    static async updateApplicationStatus(username, jobId, status) {
        const jobCheck = await db.query(
            `SELECT id, position, company_id
            FROM jobs
            WHERE id = $1`, [jobId]);
        const job = jobCheck.rows[0];

        if (!job) throw new NotFoundError(`No job: ${jobId}`);

        const companyEmail = await db.query(
            `SELECT name, email
            FROM users
            JOIN companies
            ON companies.username = users.username
            WHERE companies.id = $1`, [job.company_id]);
            
        const company = companyEmail.rows[0];

        const usernameCheck = await db.query(
            `SELECT username, email
            FROM users
            WHERE username = $1`, [username]);
            const user = usernameCheck.rows[0];
            
        if (!user) throw new NotFoundError(`No username: ${username}`);
          
        await db.query(
            `UPDATE applications
             SET status = $1
             WHERE username = $2 AND job_id = $3
             RETURNING status`,
            [status, username, jobId]);

        sendEmail(user.email, company.email, `${company.name} has updated your application to ${job.position} to a ${status} status. ${status === "APPROVED" ? "Congratulations!" : "I'm sorry!"} `)

    }
}

module.exports = User;