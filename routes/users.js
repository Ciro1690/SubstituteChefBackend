const express = require("express");
const User = require("../models/user");
const { ensureCorrectUser } = require('../middleware/auth');
const router = express.Router();

/**
 * 
 * GET /users
 * 
 * Returns list of all users
 */

router.get("/", async function (req, res, next) {
    try {
        const users = await User.findAll();
        return res.json({users});
    } catch (err) {
        return next(err);
    }
});

/**
 * 
 * GET /users/username => { user }
 * 
 * Returns { username, firstName, lastName, email }
 * 
 * Authorization required: same user
 */

router.get('/:username', async (req, res, next) => {
    try {
        let user = await User.get(req.params.username)
        return res.json({ user })
    }
    catch (err) {
        return next(err);
    }
});

/**
 * 
 * PATCH /users/username => { user }
 * 
 * Data can include { username, firstName, lastName, email}
 * 
 * Returns { username, firstName, lastName, email }
 * 
 */

router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
    try {
        let user = await User.update(req.params.username, req.body)
        return res.json({ user })
    }
    catch (err) {
        console.log(err)
        return next(err);
    }
});

/**
 * 
 * DELETE /users/username => { deleted: username }
 * 
 * Authorization required: same user
 */

router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
    try {
        await User.remove(req.params.username)
        return res.json({ deleted: req.params.username })
    }
    catch (err) {
        return next(err);
    }
});

/**
 * 
 * POST /[username]/jobs/[id] => { application }
 * 
 * Returns {"applied": jobId}
 */

router.post('/:username/jobs/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const jobId = +req.params.id;
        await User.applyToJob(req.params.username, jobId)
        return res.json({ applied: jobId })
    }
    catch (err) {
        return next(err);
    }
});

router.patch('/:username/jobs/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const jobId = +req.params.id;
        const status = req.body.status;
        await User.updateApplicationStatus(req.params.username, jobId, status)
        return res.json({ status: req.body.status })
    }
    catch (err) {
        return next(err);
    }
});

module.exports = router;