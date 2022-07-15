require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const path = require('path')
const morgan = require('morgan')
const multer = require("multer");
const dotenv = require('dotenv');
const qrcode = require("qrcode");
const ejs = require("ejs");
var fs = require('fs');
require('colors');
const exp = require("constants");

// Express initiated
const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));


// Routes
app.use('/user', require('./routes/userRouter'))
app.use('/cred', require('./routes/credRouter'))
app.get("/", (req, res, next) => {
    res.send("MyKeys backend running in staging environment!");
  });


app.use(express.static("public"));


// Connect to mongodb
const URI = process.env.MONGODB_URL
mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(err) throw err;
    console.log(
        `myKeys database connected.`.green.bold
      );
})

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req, res)=>{
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}

// PORT connected
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(
        `myKeys Server connected at: ${PORT}`.blue.bold);
})