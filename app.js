
//Imports & Required-----------------------------------------------------
const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
require("dotenv/config");
const api = process.env.API_URL;
const authJwt = require('./helpers/jwt');

const cors = require('cors'); //enables cross origin resources
app.use(cors());
app.options('*', cors());

//RouterImports
const usersRouter = require('./routers/users');
//----------------------------------------------------------------


//Middleware-----------------------------------------------------
app.use(express.json());  //instead of app.use(bodyParser.json())
app.use(morgan('tiny')); // automatic logger
app.use(authJwt());
//----------------------------------------------------------------

//Routers-----------------------------------------------------
app.use(`${api}/users`, usersRouter); //visits the defined routes for /users
//----------------------------------------------------------------

// CONNECTION TO DB before starting express server
mongoose.connect(process.env.CONNECTION_STRING).then(() => {
    console.log('Database Connection is ready...')
}).catch((err) => {
    console.log(err);})
//----------------------------------------------------------------

//LISTEN START-----------------------------------------------------
app.listen(3000, () => {
    console.log("Server runnign on Port 3000");
});//----------------------------------------------------------------

