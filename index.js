const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const passport = require('passport');
const LocalStrategy  = require('passport-local').Strategy;
const fs = require('fs');
const app = express();
const port = 3000;

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(session({
    secret: "mysecret",
    cookie: {
        maxAge: 1000*60*5 
    }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => res.render('index'))
app.route('/login')
    .get((req, res) => res.render('login'))
    .post(
        passport.authenticate('local', 
        {
            failureRedirect : '/login',
            successRedirect : '/successLogin'
        }))

app.get('/successLogin', (req, res) => {
    console.log('aaa')
    res.send("Login success, welcome to my website")
})

app.get('/private', (req, res) => {
    if(req.isAuthenticated()){
        res.send("Welcome to private page")
    }else{
        res.send("You need login with continue")
    }
})

passport.use(new LocalStrategy(
    function(username, password, done) {
        try {
            fs.readFile('./data.js', (error,data) => {
                if(error) console.log("error read data")
                const db = JSON.parse(data);
                const userRecord = db.find(user => user.user === username);
                //check data
                if(userRecord && userRecord.pwd == password)
                {
                    return done(null, userRecord)
                }else{
                    return done(null, false)
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
));
passport.serializeUser((user,done) => {
    done(null, user.user)
})
passport.deserializeUser((name, done) => {
    fs.readFile('./data.js', (error, data) => {
        const db = JSON.parse(data);
        const userRecord = db.find(user => user.user === name);
        if(userRecord){
            return done(null, userRecord)
        }else{
            return done(null, false)
        }
    })
})
app.listen(port, () => 
    console.log("Server run with port", port)
)