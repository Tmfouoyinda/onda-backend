const express = require('express');
const app = express();
const {port, apiPrefix} = require('./config/env');
const authRoutes = require('./routes/authRoutes');

// Middleware

app.use(express.json());



app.use(`${apiPrefix}/auth`, authRoutes);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});