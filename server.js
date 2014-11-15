// Generated by CoffeeScript 1.7.1
var LocalStrategy, app, bcrypt, express, http, httpServer, io, mongoose, passport, salt, socket;

socket = require('socket.io');

express = require('express');

LocalStrategy = require('passport-local').Strategy;

bcrypt = require('bcrypt');

http = require('http');

passport = require('passport');

mongoose = require('mongoose');

LocalStrategy = require('passport-local').Strategy;

salt = bcrypt.genSaltSync(10);


/*
mongoose.connect secrets.mongoURL


db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', ->
  vOS_App.find({}, ->
 *    console.log(arguments);    
  )
)

passport.serializeUser (user, done) ->
  done null, user._id

passport.deserializeUser (obj, done) ->
  User.findOne( _id: obj, (err, person) ->
    done err, person
  )

passport.use new LocalStrategy { usernameField: 'email', passwordField: 'password' }, 
  (email, password, done) ->

     *
    User.find { email: email}, 
      (err, people) ->
        console.log(people)
        done err if err?
        once = true
        for person in people
          console.log([arguments, person])
          if bcrypt.compareSync(password, person.password) and once
            done(null, people[0])
            once = false
        if once
          done(null)
     *
 */

app = express();

app.set('views', __dirname + '/views');

app.set('view engine', 'ejs');

app.use(express.cookieParser());

app.use(express.bodyParser());

app.use(express.errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.use(express.session({
  secret: 'data fish secret'
}));

app.use(passport.initialize());

app.use(passport.session());

app.use(app.router);

app.use('/js', express["static"](__dirname + '/js'));

app.use('/css', express["static"](__dirname + '/css'));

app.use('/static', express["static"](__dirname + '/public'));

app.get('/', function(req, res) {
  return res.json('Hello, World!');
});

httpServer = http.createServer(app).listen(8081);

io = socket.listen(httpServer);

io.set('log level', 0);
