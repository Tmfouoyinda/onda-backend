const express = require('express');
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');

const {port, apiPrefix} = require('./config/env');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs/access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }))

app.use(`${apiPrefix}/auth`, authRoutes);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});