
socket = require('socket.io')
express = require('express')
LocalStrategy = require('passport-local').Strategy
bcrypt = require('bcrypt')
#secrets = require('./secrets.json')
http = require('http')
passport = require('passport')
mongoose = require('mongoose')
LocalStrategy = require('passport-local').Strategy

salt = bcrypt.genSaltSync(10)

mongoose.connect "mongodb://nodejitsu:39095eb4b324f0ec29154cc380c012ea@troup.mongohq.com:10060/nodejitsudb4748235279"#secrets.mongoURL

db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', ->
  console.log('Connected to the database!')
  User.find({}, (err, users)->
    console.log('All users: ')
    console.log(users)
  )
  Stream.find({}, (err, streams)->
    console.log('All streams: ')
    console.log(streams)
  )
)

###
ToDo list:
x Get requests for public data
- Make Authentication for Websites
- Make Authentication for Apps
- Make API for new stream, new data, updates
###

User_Schema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  level: Number,
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

Client = mongoose.model('Client', Client_Schema)

Stream_Schema = mongoose.Schema({
  name: String,
  unit: String,
  genre: String,
  description: String,
  points: [],
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


if false
  User.remove({}, ->)
  newUser = new User({
    name: 'Bob1',
    email: 'test@test.com'
    password: bcrypt.hashSync('password', salt),
    level: 1,
    following: [],
    favorites: [],
    owner: [],
    editor: [],
    picture: '',
    bio: '',
    isVerified: false
  })
  newUser.save((err)->
    console.log(err) if err?
    console.log('Saved')
    )

###
name: String,
  unit: String,
  genre: String,
  description: String,
  points: Number,
  website: String,
  picture: String,
  average: Number,
  subscriptions: Array
###

#GET /user gives you the current user if you are signed in

if false
  #Stream.remove({}, ->)
  newStream = new Stream({
    name: 'Durham Temp',
    genre: 'Weather',
    description: '',
    points: [],
    website: '',
    picture: '',
    average: 0,
    subscriptions: []
  })
  newStream.save()
  console.log(newStream)

passport.serializeUser (user, done) ->
  done null, user._id

passport.deserializeUser (obj, done) ->
  User.findOne( _id: obj, (err, person) ->
    done err, person
  )

passport.use new LocalStrategy { usernameField: 'email', passwordField: 'password' }, 
  (email, password, done) ->
    console.log(arguments)
    User.findOne { email: email}, 
      (err, person) ->
        console.log(person)
        done err if err?
        if bcrypt.compareSync(password, person.password)
          done(null, person)
        else
          done(null)

app = express()

app.set 'views', __dirname + '/public'
app.set 'view engine', 'ejs'
#app.use express.logger()
app.use express.cookieParser()
app.use express.bodyParser()
app.use express.errorHandler { dumpExceptions: true, showStack: true }
app.use express.session secret: 'data fish secret'
app.use passport.initialize()
app.use passport.session()
app.engine('html', require('ejs').renderFile);
#app.use(flash())

app.use app.router
app.use '/img', express.static __dirname + '/img'
app.use '/font-awesome', express.static __dirname + '/font-awesome'
app.use '/js', express.static(__dirname + '/js')
app.use '/css', express.static(__dirname + '/css')
app.use '/static', express.static(__dirname + '/public')

httpServer = http.createServer(app).listen(8081)
console.log('Server running at http://localhost:8081')

io = socket.listen(httpServer)
io.set('log level', 1)

app.post('/login',
  passport.authenticate('local'), (req, res) ->
    # If this function gets called, authentication was successful.
    # `req.user` contains the authenticated user.
    res.json(req.user)
)

app.get('/logout', (req, res) ->
  req.logout()
  res.redirect('/')
)

app.post('/register', (req, res) ->
  if req.body.email? and req.body.name? and req.body.password?
    User.find({email: req.body.email}, (err, users) ->
      if users.length is 0
        newUser = new User({
          name: req.body.name,
          email: req.body.email
          password: bcrypt.hashSync(req.body.password, salt),
          level: 1,
          following: [],
          favorites: [],
          owner: [],
          editor: [],
          picture: '',
          bio: 'I am a new member!',
          isVerified: false
        })
        newUser.save()
        req.login(newUser, ->
          res.json(newUser)
          )
      else
        res.json('Already exists')
    )
    #Check if exists
  else
    res.json('Not enough info (name, email, password)')
)

app.get('/', (req, res) ->
#  console.log(req.user)
  res.render('home')
#  res.json('nope')
)

app.get('/getToken', (req, res) ->
  #Need to have the username and password
  #Make new client
  if req.query.email? and req.query.password?
    User.findOne({email: req.query.email}, (err, user) ->
      console.log(err) if err?
      if user?# and bcrypt.compareSync(req.query.password, user.password)
        newClient = new Client({
          user_id: user._id
        })
        newClient.save()
        res.json({key: newClient._id})
      else
        res.json('no user with that email')
    )
  else
    res.json('Need email and password')
)

#/user?id=10987987&key=9769865

publiclyViewableUser = (user) ->
  publicUser = {
    name: user.name,
    email: user.email,
    bio: user.bio,
    level: user.level,
    picture: user.picture,
    isVerified: user.isVerified,
    following: user.following,
    favorites: user.favorites,
    owner: user.owner,
    editor: user.editor
  }

io.sockets.on 'connection', (socket) ->
  socket.on 'listen', (data) ->
    console.log(['listen', data])

  socket.on 'update', (data) ->
    console.log(['update', data])

  socket.emit('newData', {'hey': 'world'})

app.get('/user', (req, res) ->
#if req.query.id != null
#  req.query.id
  if req.query.id?
    User.findOne({'_id': req.query.id}, (err, user) ->
      #This is going to need sanitising for publicly visible stuff
      if user?
        res.json(publiclyViewableUser(user))
      else
        res.json()
    )
  else if req.user?
    res.json(req.user)
  else
    res.json(null)
)

app.get('/hack/allUsers', (req, res) ->
  User.find({}, (err, users) ->
    res.json(users)
  )
)

app.get('/hack/allStreams', (req, res) ->
  Stream.find({}, (err, streams) ->
    res.json(streams)
  )
)

app.post('/user', (req, res) ->
  #check if authenticated
  console.log(req.body)
  if req.query.key? and req.query.id? or false #Need to allow website integration
    Client.findOne({_id: req.query.key}, (err, client) ->
      console.log(err) if err?
      if client? and client.user_id is req.query.id
        User.findOne({_id: client.user_id}, (err, user) ->
          console.log(err) if err?
          if user?
            user.name = req.body.name if req.body.name?
            user.email = req.body.email if req.body.email?
            user.level = req.body.level if req.body.level?
            user.picture = req.body.picture if req.body.picture?
            user.bio = req.body.bio if req.body.bio?
            user.isVerified = req.body.isVerified if req.body.isVerified?

            #if req.body.password?, encrypt

            user.following = req.body.following if req.body.following?
            user.favorites = req.body.favorites if req.body.favorites?
            user.editor = req.body.editor if req.body.editor?

            user.save()
            res.json(publiclyViewableUser(user))
          else
            res.json('No User')
        )
      else
        res.json([client, "id doesn't match key"])
    )
  else
    res.json('You are not authenticated')
)

app.delete('/user', (req, res) ->

)

app.get('/stream', (req, res) ->
  if req.query.id?
    Stream.findOne({'_id': req.query.id}, (err, stream) ->
      console.log(err) if err?
      if stream?
        res.json(stream)
      else
        res.json()
    )
  else
    res.json(null)
)

app.post('/stream', (req, res) ->
  
)

app.delete('/stream', (req, res) ->
  
)

app.get('/point', (req, res) ->
  if req.query.id? and req.query.stream? 
    Point.findOne({'_id': req.query.id, 'stream': req.query.stream}, (err, stream) ->
      console.log(err) if err?
      if stream?
        res.json(stream)
      else
        res.json()
    )
  else
    res.json(null)
)

app.post('/point', (req, res) ->
  
)

app.delete('/point', (req, res) ->
  
)






