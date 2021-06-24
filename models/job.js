const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

class Job {

    static async create({position, hourlyPay, date, companyId}) {
    const companyCheck = await db.query(
            `SELECT name
            FROM companies
            WHERE id = $1`,
            [companyId]);

        if (!companyCheck.rows[0]) throw new BadRequestError(`No company: ${companyId}`);

            const result = await db.query(
                `INSERT INTO jobs
                    (position,
                    hourly_pay,
                    date,
                    company_id)
                VALUES ($1, $2, $3, $4)
                RETURNING id, position, hourly_pay AS "hourlyPay", date, company_id AS "companyId"`,
                [
                position,
                hourlyPay,
                date,
                companyId
                ]                
            )
            
            if (!result.rows[0]) throw new NotFoundError(`No job found`, 400)
            return result.rows[0];
        }

    static async get(id) {
        const result = await db.query(
            `SELECT 
            id,
            position,
            hourly_pay,
            date,
            company_id
            FROM jobs
            WHERE id = $1`,
            [id]
        );
        if (!result.rows[0]) {
            throw new NotFoundError(`No id ${id}`, 400)
        }
        return result.rows[0]
    }

    static async getFromUsername(username) {
        const result = await db.query(
            `SELECT 
            id,
            position,
            hourly_pay,
            date,
            company_id
            FROM jobs
            INNER JOIN users
            ON application.
            WHERE applications.username = $1`,
            [username]
        );
        if (!result.rows[0]) {
            throw new NotFoundError(`No applications for ${username}`, 400)
        }
        return result.rows[0]
    }

    static async getFromCompany(companyId) {
        const result = await db.query(
            `SELECT 
            id,
            position,
            hourly_pay,
            date,
            company_id
            FROM jobs
            WHERE company_id = $1`,
            [companyId]
        );
        let jobs = result.rows;
        if (!jobs) {
            throw new NotFoundError(`No company id ${companyId}`, 400)
        }

        for (let i=0; i<jobs.length; i++) {
            const jobApplications = await db.query(
                `SELECT applications.job_id, applications.username, applications.status
                 FROM applications
                 WHERE applications.job_id = $1`, [jobs[i].id]);
                 jobs[i].applications = jobApplications.rows.map(applications => [applications.job_id, applications.username, applications.status]);
        }
        return jobs;
    }

    static async findAll() {
    const result = await db.query(
            `SELECT 
            id,
            position,
            hourly_pay,
            date,
            company_id
            FROM jobs
           ORDER BY id`,
    );

    return result.rows
    }

    static async update(id, data) {
        if (Object.keys(data).length === 0) throw new BadRequestError("No Data");
            const result = await db.query(
                `UPDATE jobs
                 SET position = $1,
                    hourly_pay = $2,
                    date = $3
                 WHERE id = $4
                 RETURNING id, position, hourly_pay AS "hourlyPay", date`,
                [
                data.position,
                data.hourlyPay,
                data.date,
                id
                ]                
            )
            const job = result.rows[0];
            if (!job) throw new NotFoundError('Job not found', 400)
            return job;
        }

        static async remove(id) {
            const result = await db.query(
                `DELETE
                 FROM jobs
                 WHERE id = $1
                 RETURNING id`,
                [id]                
            );
            const job = result.rows[0];

            if (!job) throw new NotFoundError(`No id ${id}`);
            return job;
        }
}

module.exports = Job;