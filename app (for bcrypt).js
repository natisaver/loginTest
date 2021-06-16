require("dotenv").config(); //create the .env file, to see "ls -a", process.env.VARNAME to use

const express = require("express");

const https = require("https");
const {check, validationResult} = require("express-validator");
const mongoose = require("mongoose");
const { truncate } = require("fs");

const encrypt = require("mongoose-encryption"); //basic encryption
const md5 = require("md5"); //md5 encryption, not as safe as bcrypt

const bcrypt = require('bcrypt'); //a diff type of encryption with salt
const saltRounds = 10;

const app = express();

app.use(express.static("public")); //indicates the directory for static items e.g css
app.use(express.urlencoded()); //bodyparser
app.set("view engine", "ejs"); //integrating ejs into express

//mongoose

mongoose.connect("localhost:27017/userDB",{useNewUserParser: true}); //userDB is the DB i want to create
const userSchema = new mongoose.schema({
	email: String,
	password: String
});
var secret = process.env.SECRET;

userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema); //model accepts 2 params, singular name of ur collection and then the schema

app.get("/", function(req,res){
	res.render("home");
})

app.get("/login", function(req,res){
	res.render("login");
})

app.get("/register", function(req,res){
	res.render("register");
})

app.post("/register", function(req,res){
	bcrypt.hash(req.body.password, saltRounds, function(err, hase){
		const newUser = new User({ //calling User model
			email: req.body.username,
			password: hash //put the hashed password into db
			// password: md5(req.body.password)
		}); 
		newUser.save(function(err){
			if (err) {
				console.log(err);
			}
			
			else {
				res.render(secrets); //secrets.ejs
			}
			
		});
	});

});

app.post("/login", function(req,res){
    const username = req.body.username;
	const password = hash; //take the hashed password and assign to password variable
    // const password = md5(req.body.password);
    
    User.findOne({email: username}, function(err, foundUser){
        if (err){
            console.log(err);
        }
        else {
            if(foundUser){
                // if(foundUser.password === password) {
                //     res.render(secrets); 
                // }	

				bcrypt.compare(password, foundUser.password, function(err, result){
					if (result === true){
						res.render(secrets); //secrets.ejs
					}
				});
			}


        }
    })
})

app.listen(3000, function(){
	console.log("server started on port 3000")
});