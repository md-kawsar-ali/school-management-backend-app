/*
* Title: School Management App
* Description: School Management Backend Application
* Author: Md Kawsar Ali
* Date: 12/08/23
*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser')
require('dotenv').config();
const port = 3000 || process.env.PORT;

// Import Routers
const indexRoute = require('./app/routers/indexRouter');
const authRoutes = require('./app/routers/authRoutes');

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: "*",
    credentials: true
}));

// Database Info
const DB_NAME = process.env.DB_NAME;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.4wqk4qz.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

// Connect to the Database using Mongoose
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Use Routers
app.use('/', indexRoute);
app.use('/auth', authRoutes);

app.listen(port, () => {
    console.log(`School Management app running on port ${port}`);
});