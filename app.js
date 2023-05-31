const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const ejs = require("ejs");
const _ = require("lodash");
let alert = require('alert');
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/blogging_platform");

const blogSchema = new mongoose.Schema({
    heading: String,
    body: String,
    name: String
  });
  
const blogs = mongoose.model("blog", blogSchema);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blogging_platform"
});

con.connect(function(err){
    if(err) throw err;
});
//To create a table SQL Command: CREATE TABLE users (Id varchar(255), Name varchar(255), EmailId varchar(255), MobileNumber varchar(255), Password varchar(255));

let email, name, mobile_num, id, Blogs = [];


app.post("/", function(req, res){
    email = req.body.emailId;
    let password = req.body.password;
  
    var sql = 'SELECT Password, Name, MobileNumber, Id FROM users WHERE EmailId = ?';
    con.query(sql, [email], function (err, result) {
        if (err) throw err;
        if(result.length==0){
          alert("Email is not registered");
          res.render("welcome", {route: "/register"});
        }
        else{
          name=result[0].Name;
          mobile_num=result[0].MobileNumber;
          id = result[0].Id;
          if(result[0].Password === password){
            blogs.find().then((result)=>{
                result.reverse();
                res.render("dashboard", {title: name, blogs:result});
            });
          }
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
    let newID = Date.now().toString();
    
    var sql = "INSERT INTO `users` VALUES(?, ?, ?, ?, ?)";
    con.query(sql, [newID, newName, newEmail, newMobile_Num, newPassword], function(err, result){
       if(err) throw err;
    })
    res.render("welcome", {route: "/register"});
})

app.post("/profile", function(req, res){
    let oldName = name;
    name = req.body.name;
    email= req.body.email;
    mobile_num=req.body.number;
    var sql = 'UPDATE users SET Name = ?, EmailId = ?, MobileNumber = ?  WHERE Id = ?';
    con.query(sql, [name, email, mobile_num, id], function (err, result) {
      if (err) throw err;
    });

    blogs.updateMany(
        {name: oldName},
        {$set: {name: name}}
    ).then((result)=>{

    })
  res.render("profile", {title: name, name:name, email:email, num: mobile_num});
})

app.post("/updatePassword", function(req, res){
    let oldPswd = req.body.oldPswd;
    let newPswd = req.body.newPswd;

    var sql1 = `SELECT Name from users WHERE Password = ?`;
    con.query(sql1, [oldPswd], function (err, result1) {
        if (err) throw err;
        if(result1.length === 0){
            alert("Old Password is incorrect, check once.");
            res.render("updatePassword", {title: name, name: name});
        }
        else{
            var sql2 = 'UPDATE users SET Password = ? WHERE Id = ?';
            con.query(sql2, [newPswd, id], function (err, result) {
                if (err) throw err;
            });
            res.redirect("/profile");
        }
    });
})

app.post("/writeBlog", function(req, res){
    let heading = req.body.heading;
    let body = req.body.body;

    const blog = new blogs({
        heading: heading,
        body: body,
        name: name
    });
    blog.save();

    blogs.find().then((result)=>{
        result.reverse();
        res.render("dashboard", {title: name, blogs:result});
    });

})



app.get("/", function(req, res){
    res.render("welcome", {route: "/register"});
})

app.get("/dashboard", function(req, res){
    blogs.find().then((result)=>{
        result.reverse();
        res.render("dashboard", {title: name, blogs:result});
    });
})

app.get("/profile", function(req, res){
    res.render("profile", {title: name, name:name, email:email, num: mobile_num});
})

app.get("/updatePassword", function(req, res){
    res.render("updatePassword", {title: name, name: name});
})

app.get("/writeBlog", function(req, res){
    res.render("writeBlog", {title: name});
})

app.get("/viewBlogs", function(req, res){
    blogs.find({name:name}).then((result)=>{
        result.reverse();
        res.render("viewBlogs", {title: name, blogs:result});
    });
})

app.get("/editBlogs", function(req, res){
    blogs.find({name:name}).then((result)=>{
        result.reverse();
        res.render("editBlogs", {title: name, blogs:result});
    });
})


app.listen(process.env.PORT || 3000, function(req, res){
	console.log("Server is running on port 3000");

})