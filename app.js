
//Imports & Required-----------------------------------------------------
const express = require('express');
var https = require('https');
const fs = require('fs');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
require("dotenv/config");
const api = process.env.API_URL;
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler')
const cors = require('cors'); //enables cross origin resources
app.use(cors());
app.options('*', cors());

const options = {
    key: fs.readFileSync('dm-gen_com.key'),
    cert: fs.readFileSync('www_dm-gen_com.crt')
  };

//RouterImports
const usersRouter = require('./routers/users');
//----------------------------------------------------------------


//Middleware-----------------------------------------------------
app.use(express.json());  //instead of app.use(bodyParser.json())
app.use(morgan('tiny')); // automatic logger
app.use(authJwt());
//app.use(errorHandler);
//----------------------------------------------------------------

//Routers-----------------------------------------------------
app.use(`/api/v1/users`, usersRouter); //visits the defined routes for /users
//----------------------------------------------------------------

// CONNECTION TO DB before starting express server
mongoose.connect(process.env.CONNECTION_STRING).then(() => {
    console.log('Database Connection is ready...')
}).catch((err) => {
    console.log(err);})
//----------------------------------------------------------------

//LISTEN START-----------------------------------------------------
var httpsServer = https.createServer(options, app);

httpsServer.listen(3000, () => {
    console.log("Server runnign on Port 3000");
});//----------------------------------------------------------------

