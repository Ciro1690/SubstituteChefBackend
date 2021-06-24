const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require('./middleware/auth');
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const companyRoutes = require("./routes/companies");
const jobRoutes = require("./routes/jobs");
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);


app.use(express.static(path.join(__dirname, 'build')));


app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

/** Handle 404 errors -- this matches everything */
app.use(function(req, res, next) {
    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (error, req, res, next) {
    let status = error.status || 500;
    let message = error.message
    return res.status(status).json({
        error: {message, status},
    });
});

module.exports = app;