const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { getCoords } = require('../helpers/maps');

class Company {

    static async register({name, url, address, username}) {
    const duplicateCheck = await db.query(
            `SELECT name
            FROM companies
            WHERE name = $1`,
            [name]);

        if (duplicateCheck.rows[0])
            throw new BadRequestError(`Duplicate company: ${name}`);

        let coordinates = await getCoords(address);
        const result = await db.query(
        `INSERT INTO companies
            (name,
            url,
            address,
            lat,
            lng,
            username)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, url, address, lat, lng, username`,
        [
        name,
        url,
        address,
        coordinates[0],
        coordinates[1],
        username
        ]                
        )

        let company = result.rows
        if (!company) {
            throw new NotFoundError(`No username ${username}`, 400)
        }
        return company;
        
    }

    static async get(username) {
        const usernameCheck = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`, [username]);
        const user = usernameCheck.rows[0];

        if (!user) throw new NotFoundError(`No username: ${username}`);

        const result = await db.query(
            `SELECT 
            id,
            name,
            url,
            address,
            lat,
            lng,
            username
            FROM companies
            WHERE username = $1`,
            [username]
        );
        let companies = result.rows
        if (!companies) {
            throw new NotFoundError(`No username ${username}`, 400)
        }
        return companies;
    }

    static async getById(id) {
        const result = await db.query(
            `SELECT 
            id,
            name,
            url,
            address,
            lat,
            lng,
            username
            FROM companies
            WHERE id = $1`,
            [id]
        );

        let company = result.rows[0]
        if (!company) {
            throw new NotFoundError(`No id ${id}`, 400)
        }
        return company;
    }

    static async findAll() {
    const result = await db.query(
            `SELECT 
            id,
            name,
            url,
            address,
            lat,
            lng,
            username
            FROM companies
           ORDER BY id`,
    );

    return result.rows
    }

    static async update(id, data) {
        if (Object.keys(data).length === 0) throw new BadRequestError("No Data");

        let coordinates = await getCoords(data.address);
        const result = await db.query(
            `UPDATE companies
                SET name=$1,
                url=$2,
                address=$3,
                lat=$4,
                lng=$5
                WHERE id = $6
                RETURNING id, name, url, address, username`,
            [
            data.name,
            data.url,
            data.address,
            coordinates[0],
            coordinates[1],
            id
            ]                
        );
        const company = result.rows[0];
        
        if (!company) throw new NotFoundError(`No id ${id}`);
        return company;
    }

        static async remove(id) {
            const result = await db.query(
                `DELETE
                 FROM companies
                 WHERE id = $1
                 RETURNING id`,
                [id]                
            );
            const company = result.rows[0];

            if (!company) throw new NotFoundError(`No id ${id}`);
            return company;
        }
}

module.exports = Company;