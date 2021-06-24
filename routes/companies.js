const express = require("express");
const Company = require("../models/company");
const { ensureCorrectCompany } = require('../middleware/auth');

const router = express.Router();

/**
 * 
 * POST /companies/signup => { company }
 * 
 * Data can include { name, url, address }
 * 
 * Returns { company }
 * 
 */

router.post("/signup", async (req, res, next) => {
    try {
        const company = await Company.register(req.body);
        return res.status(201).json({company});
    }
    catch (e) {
        return next(e);
    }
});

/**
 * 
 * GET /companies
 * 
 * Returns list of all companies
 */

router.get("/", async function (req, res, next) {
    try {
        const companies = await Company.findAll();
        return res.json({companies});
    } catch (err) {
        return next(err);
    }
});

/**
 * 
 * GET /companies/username => { company }
 * 
 * Returns { id, name, url, address, username }
 * 
 */

router.get('/username/:username', async (req, res, next) => {
    try {
        let companies = await Company.get(req.params.username)
        return res.json({ companies })
    }
    catch (err) {
        return next(err);
    }
});

/**
 * 
 * GET /companies/id => { company }
 * 
 * Returns { id, name, url, address, username }
 * 
 */

router.get('/:id', async (req, res, next) => {
    try {
        let company = await Company.getById(req.params.id)
        return res.json({ company })
    }
    catch (err) {
        return next(err);
    }
});

/**
 * 
 * PATCH /companies/id => { company }
 * 
 * Data can include { name, url, address }
 * 
 * Returns { id, name, url, address, username }
 * 
 */

router.patch('/:id', ensureCorrectCompany, async (req, res, next) => {
    try {
        let company = await Company.update(req.params.id, req.body)
        return res.json({ company })
    }
    catch (err) {
        return next(err);
    }
});

/**
 * 
 * DELETE /users/username => { deleted: username }
 * 
 * Authorization required: same user
 */

router.delete('/:id', ensureCorrectCompany, async (req, res, next) => {
    try {
        await Company.remove(req.params.id)
        return res.json({ deleted: req.params.id })
    }
    catch (err) {
        console.log(err)
        return next(err);
    }
});

module.exports = router;