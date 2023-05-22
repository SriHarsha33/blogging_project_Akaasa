const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const ejs = require("ejs");
const _ = require("lodash");
let alert = require('alert');
// var MongoClient = require('mongodb').MongoClient;
// const mongoose = require('mongoose');
// mongoose.connect("mongodb://localhost:27017/scheduler");
// var conn = mongoose.connection;


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var con = mysql.createConnection({
    host: "host",
    user: "username",
    password: "password",
    database: "blogging_platform"
});

con.connect(function(err){
    if(err) throw err;
});
//To create a table SQL Command: CREATE TABLE users (Name varchar(255), EmailId varchar(255), MobileNumber varchar(255), Password varchar(255));

let email, name, mobile_num;

app.post("/", function(req, res){
    email = req.body.emailId;
    let password = req.body.password;
  
    var sql = 'SELECT Password, Name, MobileNumber FROM users WHERE EmailId = ?';
    con.query(sql, [email], function (err, result) {
        if (err) throw err;
        if(result.length==0){
          alert("Email is not registered");
          res.render("welcome", {route: "/register"});
        }
        else{
          name=result[0].Name;
          mobile_num=result[0].MobileNumber;
          if(result[0].Password === password)
            res.render("dashboard", {title: name});
          else {
            alert("Wrong Password!");
            res.render("welcome", {route: "/register"});
          }
        }
        
      });
  
})

app.post("/register", function(req, res){
    let newName = req.body.name;
    let newMobile_Num = req.body.number;
    let newEmail = req.body.emailId;
    let newPassword = req.body.password;
    
    var sql = "INSERT INTO `users` VALUES(?, ?, ?, ?)";
    con.query(sql, [newName, newEmail, newMobile_Num, newPassword], function(err, result){
       if(err) throw err;
    })
    res.render("welcome", {route: "/register"});
})

app.get("/", function(req, res){
    res.render("welcome", {route: "/register"});
})

app.listen(process.env.PORT || 3000, function(req, res){
	console.log("Server is running on port 3000");

})