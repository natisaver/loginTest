require("dotenv").config(); //create the .env file, to see "ls -a", process.env.VARNAME to use

const express = require("express");

const https = require("https");
const {check, validationResult} = require("express-validator");
const mongoose = require("mongoose");
const { truncate } = require("fs");

//Passport.js
const session = require("express-session");
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose"); 
var GoogleStrategy = require('passport-google-oauth20').Strategy; //google oauth2.0
const findOrCreate = require("mongoose-findorcreate"); //findOrCreate is not a function but this helps
//
const app = express();

app.use(express.static("public")); //indicates the directory for static items e.g css
app.use(express.urlencoded()); //bodyparser
app.set("view engine", "ejs"); //integrating ejs into express

//1. passport js set up session and initialisation
app.use(session({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//mongoose
mongoose.connect("localhost:27017/userDB",{useNewUserParser: true}); //userDB is the DB i want to create
mongoose.set("useCreateIndex", true); //put this here to remove some deprecation warnings

const userSchema = new mongoose.schema({
	email: String,
	password: String,
	googleId: String,
	secret: String
});

userSchema.plugin(passportLocalMongoose); //plugin for passport js
userSchema.plugin(findOrCreate); //for the findorcreate google authentication

const User = new mongoose.model("User", userSchema); //model accepts 2 params, singular name of ur collection and then the schema

//this part here is for storing user data into the cookie during sessions
passport.use(User.createStrategy());

//serializing user sessions, found in "Sessions": http://www.passportjs.org/docs/authenticate/
passport.serializeUser(function(user, done) {
	done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
	  done(err, user);
	});
  });

//taken from passportjs googleauth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://www.example.com/auth/google/callback",
	userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo" //google+ deprecated
	},
  function(accessToken, refreshToken, profile, cb) {
	console.log(profile);
	//here if googleid doesnt exist in db, we create and store
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req,res){
	res.render("home");
})

app.get("/auth/google", function(req,res){
	passport.authenticate('google', { scope: ['profile'] }); //we using google strategy
	//Scopes can be found here:
	//https://www.googleapis.com/auth/userinfo.profile
	//https://developers.google.com/identity/protocols/oauth2/scopes#adexchangesellerv2.0
	//popup should with google login
});

//authorized redirect URIs
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect to secrets page.
    res.redirect('/secrets');
  });

app.get("/login", function(req,res){
	res.render("login");
})

app.get("/register", function(req,res){
	res.render("register");
})

app.get("/secrets", function(req,res){
	if(req.isAuthenticated()){
		//checks the user collection where all the secrets is not null is returned as foundUsers
		User.find({"secret": {$ne: null}}, function(err, foundUsers){
			if (err){
				console.log(err);
			}
			else{
				//render the secrets.ejs and add the foundUsers to a var
				res.render("secrets", {usersWithSecrets: foundUsers});
			}
		}); 
		
	}	
	else {
		res.redirect("/login") //if they nvr login then redirect
	}
});

app.get("/submit", function(req,res){
	if(req.isAuthenticated()){
		res.render("submit");
	}	
	else {
		res.redirect("/login") //if they nvr login then redirect
	}
});

app.post("/submit", function(req,res){
	const submitted = req.body.submit;
	User.findById(req.user.id, function(err, foundUser){
		if(err){
			console.log(err);
		}
		else{
			if(foundUser){
				foundUser.secret = submitted;
				foundUser.save(function(){
					res.redirect("/secrets")
				});
			}
		}
	});
})

app.post("/register", function(req,res){
	//this user.register is frm passportjs
	User.register({username: req.body.username}, req.body.password, function(err, user){
		if (err){
			console.log(err);
			res.redirect("/register");
		} else {
			passport.authenticate("local")(req, res, function(){
				res.redirect("/secrets"); //if autheticated then app.get/secrets, refer above for authentication checks line 49
			});
		}
	})

});

app.post("/login", function(req,res){
	const newUser = new User({ //using the User model to create obj
		username: req.body.username,
		password: req.body.password
	})

	//using passportjs login func to check user authenticated
	req.login(newUser, function(err){
		if (err) {
			console.log(err);
		} else {
			passport.authenticate("local")(req,res, function(){
				res.redirect("/secrets");
			})
		}
	})
});

//logout and deautheticate
app.get("/logout", function(req,res){
	req.logout();
	res.redirect("/");

});

app.listen(3000, function(){
	console.log("server started on port 3000");
});