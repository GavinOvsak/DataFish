
socket = require('socket.io')
express = require('express')
LocalStrategy = require('passport-local').Strategy
bcrypt = require('bcrypt')
secrets = require('./secrets.json')
http = require('http')
passport = require('passport')
mongoose = require('mongoose')
LocalStrategy = require('passport-local').Strategy

salt = bcrypt.genSaltSync(10)

mongoose.connect secrets.mongoURL

db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', ->
  console.log('Connected to the database!')
)

###
ToDo list:
- Get requests for public data
- Make Authentication for Apps
- Make Authentication for Websites
- Make API for new stream, new data, updates
###

string num array float

User_Schema = mongoose.Schema({
  name: String,
  password: String,
  levels: String,
  following: Array, #array of ids
  favorites: Array,
  owner: Array,
  editor: Array,
  picture: String,
  bio: String,
  isVerified: Boolean
});

User = mongoose.model('User', User_Schema)

Client_Schema = mongoose.Schema({
  user_id: String,
  socket: Object
});

Client = mongoose.model('Client', User_Schema)

Stream_Schema = mongoose.Schema({
  name: String,
  unit: String,
  genre: String,
  description: String,
  points: Number,
  website: String,
  picture: String,
  average: Number,
  subscriptions: Array #list of users to notify on update event
});

Stream = mongoose.model('Stream', Stream_Schema)

Point_Schema = mongoose.Schema({
  name: Number,
  source: String,
  time: String, #date
  created: String, #date
  creator: Number #creater id
});

Point = mongoose.model('Point', Point_Schema)


passport.serializeUser (user, done) ->
  done null, user._id

passport.deserializeUser (obj, done) ->
  User.findOne( _id: obj, (err, person) ->
    done err, person
  )

passport.use new LocalStrategy { usernameField: 'email', passwordField: 'password' }, 
  (email, password, done) ->

    ###
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
    ###

app = express()

app.set 'views', __dirname + '/views'
app.set 'view engine', 'ejs'
#app.use express.logger()
app.use express.cookieParser()
app.use express.bodyParser()
app.use express.errorHandler { dumpExceptions: true, showStack: true }
app.use express.session secret: 'data fish secret'
app.use passport.initialize()
app.use passport.session()
#app.use(flash())

app.use app.router
app.use '/js', express.static __dirname + '/js'
app.use '/css', express.static(__dirname + '/css')
app.use '/static', express.static(__dirname + '/public')

httpServer = http.createServer(app).listen(8081)
console.log('Server running at http://localhost:8081')

io = socket.listen(httpServer)
io.set('log level', 0)

app.get('/', (req, res) ->
  res.json('Hello, World!')
)

#/user?id=10987987&key=9769865

app.get('/user', (req, res) ->
#if req.query.id != null
#  req.query.id



)

app.post('/user', (req, res) ->
  
)

app.delete('/user', (req, res) ->
  
)

app.get('/stream', (req, res) ->

)

app.post('/stream', (req, res) ->
  
)

app.delete('/stream', (req, res) ->
  
)

app.get('/point', (req, res) ->

)

app.post('/point', (req, res) ->
  
)

app.delete('/point', (req, res) ->
  
)






