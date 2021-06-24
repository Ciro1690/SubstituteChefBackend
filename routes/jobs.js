const express = require("express");
const Job = require("../models/job");

const router = express.Router();

/**
 * 
 * POST /jobs/new => { job }
 * 
 * Data can include { position, hourlyPay, date }
 * 
 * Returns { job }
 * 
 */

router.post("/new", async (req, res, next) => {
    try {
        const job = await Job.create(req.body);
        return res.status(201).json({job});
    }
    catch (e) {
        return next(e);
    }
});

/**
 * 
 * GET /jobs
 * 
 * Returns list of all jobs
 */

router.get("/", async function (req, res, next) {
    try {
        const jobs = await Job.findAll();
        return res.json({jobs});
    } catch (err) {
        return next(err);
    }
});

/**
 * 
 * GET /jobs/id => { job }
 * 
 * Returns { id, position, hourlyPay, date, companyId }
 * 
 */

router.get('/:id', async (req, res, next) => {
    try {
        let job = await Job.get(req.params.id)
        return res.json({ job })
    }
    catch (err) {
        return next(err);
    }
});

/**
 * 
 * GET /jobs/companyId => { jobs }
 * 
 * Returns { jobs: {id, position, hourlyPay, date, companyId} }
 * 
 */

router.get('/company/:id', async (req, res, next) => {
    try {
        let jobs = await Job.getFromCompany(req.params.id)
        return res.json({ jobs })
    }
    catch (err) {
        return next(err);
    }
});

/**
 * 
 * PATCH /jobs/id => { job }
 * 
 * Data can include { position, hourlyPay, date }
 * 
 * Returns { id, position, hourlyPay, date, companyId }
 * 
 */

router.patch('/:id', async (req, res, next) => {
    try {
        let job = await Job.update(req.params.id, req.body)
        return res.json({ job })
    }
    catch (err) {
        return next(err);
    }
});

/**
 * 
 * DELETE /jobs/id => { deleted: job }
 * 
 */

router.delete('/:id', async (req, res, next) => {
    try {
        await Job.remove(req.params.id)
        return res.json({ deleted: req.params.id })
    }
    catch (err) {
        return next(err);
    }
});

module.exports = router;