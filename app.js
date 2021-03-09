const express = require('express');
const poetry = require('./routes/poetry');
const app = express();

app.use('/api/poetry', poetry);

module.exports = app;
