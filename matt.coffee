express = require('express')
http = require('http')

app = express()

app.set 'views', __dirname + '/public'
app.set 'view engine', 'ejs'
#app.use express.logger()
app.use express.cookieParser()
app.use express.bodyParser()
app.use express.errorHandler { dumpExceptions: true, showStack: true }
app.use express.session secret: 'data fish secret'
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

app.get('/', (req, res) ->
#  console.log(req.user)
  #res.sendfile(__dirname + '/public/home.ejs')
  if req.user?
    res.redirect('/dashboard')
  else
    res.render('home.html')
)

app.get('/dashboard', (req, res) ->
  #Verify logged in, or redirect to home
  if req.user?
    res.render('dash.html')
  else
    console.log('not logged in')
    res.redirect('/')
)

app.get('/account', (req, res) ->
  #Verify logged in, or redirect to home
  if req.user?
    res.render('account.html')
  else
    console.log('not logged in')
    res.redirect('/')
)

app.get('/streamPage', (req, res) ->
  res.render('stream.html')
)

app.get('/searchPage', (req, res) ->
  res.render('search.html')
)

app.get('/userPage', (req, res) ->
  res.render('user.html')
)
