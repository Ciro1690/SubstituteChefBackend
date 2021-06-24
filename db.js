const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
    db = new Client({
        connectionString: getDatabaseUri(),
    });
} else {
    db = new Client({
        connectionString: getDatabaseUri()
    });
}

db.connect();

// let DB_URI;

// if (process.env.NODE_ENV === "test") {
//     DB_URI = "postgresql:///subchef_test";
// } else {
//     DB_URI = "postgresql:///subchef";


// let db = new Client({
//     connectionString: DB_URI
// });

// db.connect();

module.exports = db;