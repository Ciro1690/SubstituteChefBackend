require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = +process.env.PORT || 3001;
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
    ? "subchef_test"
    : process.env.DATABASE_URL || "subchef";
}

module.exports = {
    PORT,
    getDatabaseUri,
    SECRET_KEY,
    BCRYPT_WORK_FACTOR
};