const jsonschema = require("jsonschema");
const User = require("../models/user");
const express = require("express");
const router = express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");


/**
 * 
 * POST /auth/signup => { user, token }
 * 
 * Data can include { username, password, firstName, lastName, email }
 * 
 * Returns { user: username, firstName, lastName, email, token }
 * 
 */

router.post("/signup", async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, userRegisterSchema);
        if (!validator.valid) {
            validator.errors.map(e => e.stack);
            throw new BadRequestError("Invalid credentials");
        }
        const user = await User.register(req.body);
        const token = createToken(user);
        return res.status(201).json({user, token});
    }
    catch (e) {
        return next(e);
    }
});

/**
 * 
 * POST /auth/login => { token }
 * 
 * Data includes { username, password }
 * 
 * Returns { token }
 * 
 */

router.post("/login", async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const { username, password } = req.body;
        const user = await User.authenticate(username, password);
        const token = createToken(user);
        return res.json({token});
    }
    catch (err) {
        return next(err);
    }
})

module.exports = router;