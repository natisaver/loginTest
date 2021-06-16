# loginTest
## Installation
cd to project directory
Use the package manager [npm](https://nodejs.org/en/download/) to install modules.

>There are 2 app.js files:
1) appbcrypt.js -> Use this as the app.js if you want to use bcrypt encryption
2) app.js -> Use this as the app.js file if you want to use google authentication

>To Use Google Auth,
http://www.passportjs.org/packages/passport-google-oauth20/
In google create a new project -> credentials -> create ClientOAuth ID -> For Testing: JS Origin == localhost:3000 && URI == localhost:3000/auth/google/secrets
Also update the env file with the "Client ID" and "Client Secret"

This project includes google authentication to login and and allows you to submit secrets that can be seen by everyone anonymously.

you can use Robo 3T for GUI Interface to manage MongoDB

```bash
npm init
npm i express ejs mongoose mongoose-encryption dotenv md5 bcrypt
npm i passport passport-local passport-local-mongoose express-session passport-google-oauth20 mongoose-findorcreate
npm i -g nodemon
```

.gitignore
```bash
.env
/node_modules
```
