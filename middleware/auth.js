const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const Company = require("../models/company");

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

function ensureCorrectUser(req, res, next) {
    try {
        const user = res.locals.user;
        if (!user.username === req.params.username) {
            throw new UnauthorizedError();
        }
        return next();
    }
    catch (err) {
        return next(err);
    }
}

async function ensureCorrectCompany(req, res, next) {
    try {
        const user = res.locals.user;
        let companies = await Company.get(user.username)

        const idCheck = (company) => company.id === parseInt(req.params.id);
        if (companies.some(idCheck)) {
            return next();
        } else {
            return next({status: 401, message: "Unauthorized"});   
        }
    }
    catch (err) {
        return next({status: 401, message: "Unauthorized"});
    }
}

module.exports = {
    authenticateJWT,
    ensureCorrectUser,
    ensureCorrectCompany
};