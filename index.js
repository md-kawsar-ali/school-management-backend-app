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
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: "*",
    credentials: true
}));

// Import Routers
const indexRoute = require('./routers/indexRouter');
const authRoutes = require('./routers/authRoutes');
const userRoutes = require('./routers/userRoutes');
const studentRoutes = require('./routers/studentRoutes')

// Database Info
const DB_NAME = process.env.DB_NAME;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

const DB_URL = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@ac-ylig8bd-shard-00-00.4wqk4qz.mongodb.net:27017,ac-ylig8bd-shard-00-01.4wqk4qz.mongodb.net:27017,ac-ylig8bd-shard-00-02.4wqk4qz.mongodb.net:27017/?ssl=true&replicaSet=atlas-1n1azs-shard-0&authSource=admin&retryWrites=true&w=majority`

// const DB_URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.4wqk4qz.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

// Connect to the Database using Mongoose
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: DB_NAME
})
    .then(() => {
        console.log('Connected to the database!');
    })
    .catch((error) => {
        console.error('Failed to connect database: ', error)
    })

// Use Routers
app.use('/', indexRoute);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/student', studentRoutes);

app.listen(port, () => {
    console.log(`School Management app running on port ${port}`);
});