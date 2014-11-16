// Generated by CoffeeScript 1.7.1
var Client, Client_Schema, LocalStrategy, Point, Point_Schema, Stream, Stream_Schema, User, User_Schema, app, bcrypt, db, express, http, httpServer, io, listeners, mongoose, newStream, newUser, passport, publiclyViewableUser, salt, socket;

socket = require('socket.io');

express = require('express');

LocalStrategy = require('passport-local').Strategy;

bcrypt = require('bcrypt');

http = require('http');

passport = require('passport');

mongoose = require('mongoose');

LocalStrategy = require('passport-local').Strategy;

salt = bcrypt.genSaltSync(10);

mongoose.connect("mongodb://nodejitsu:39095eb4b324f0ec29154cc380c012ea@troup.mongohq.com:10060/nodejitsudb4748235279");

db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log('Connected to the database!');

  /*
  User.find({}, (err, users)->
    console.log('All users: ')
    console.log(users)
  )
   */
  return Stream.find({}, function(err, streams) {
    console.log('All streams: ');
    return console.log(streams);
  });
});


/*
ToDo list:
x Get requests for public data
- Make Authentication for Websites
- Make Authentication for Apps
- Make API for new stream, new data, updates
 */

User_Schema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  level: Number,
  following: Array,
  favorites: Array,
  owner: Array,
  editor: Array,
  picture: String,
  bio: String,
  isVerified: Boolean
});

User = mongoose.model('User', User_Schema);

Client_Schema = mongoose.Schema({
  user_id: String,
  socket: Object
});

Client = mongoose.model('Client', Client_Schema);

Stream_Schema = mongoose.Schema({
  name: String,
  unit: String,
  genre: String,
  tags: Array,
  description: String,
  website: String,
  picture: String,
  average: Number,
  latestValue: Number,
  latestTime: String,
  subscriptions: Array
});

Stream = mongoose.model('Stream', Stream_Schema);

Point_Schema = mongoose.Schema({
  value: Number,
  source: String,
  stream_id: String,
  time: String,
  created: String,
  creator: String
});

Point = mongoose.model('Point', Point_Schema);

if (false) {
  User.remove({}, function() {});
  newUser = new User({
    name: 'Bob1',
    email: 'test@test.com',
    password: bcrypt.hashSync('password', salt),
    level: 1,
    following: [],
    favorites: [],
    owner: [],
    editor: [],
    picture: '',
    bio: '',
    isVerified: false
  });
  newUser.save(function(err) {
    if (err != null) {
      console.log(err);
    }
    return console.log('Saved');
  });
}


/*
name: String,
  unit: String,
  genre: String,
  description: String,
  points: Number,
  website: String,
  picture: String,
  average: Number,
  subscriptions: Array
 */

if (false) {
  newStream = new Stream({
    name: 'Durham Temp',
    genre: 'Weather',
    description: '',
    website: '',
    picture: '',
    average: 0,
    subscriptions: []
  });
  newStream.save();
  console.log(newStream);
}

passport.serializeUser(function(user, done) {
  return done(null, user._id);
});

passport.deserializeUser(function(obj, done) {
  return User.findOne({
    _id: obj
  }, function(err, person) {
    return done(err, person);
  });
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, done) {
  console.log(arguments);
  return User.findOne({
    email: email
  }, function(err, person) {
    console.log(person);
    if (err != null) {
      done(err);
    }
    if ((person != null) && bcrypt.compareSync(password, person.password)) {
      return done(null, person);
    } else {
      return done(null);
    }
  });
}));

app = express();

app.set('views', __dirname + '/public');

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

app.engine('html', require('ejs').renderFile);

app.use(app.router);

app.use('/img', express["static"](__dirname + '/img'));

app.use('/font-awesome', express["static"](__dirname + '/font-awesome'));

app.use('/js', express["static"](__dirname + '/js'));

app.use('/fonts', express["static"](__dirname + '/fonts'));

app.use('/css', express["static"](__dirname + '/css'));

app.use('/static', express["static"](__dirname + '/public'));

httpServer = http.createServer(app).listen(8081);

console.log('Server running at http://localhost:8081');

io = socket.listen(httpServer);

io.set('log level', 1);

app.post('/login', passport.authenticate('local'), function(req, res) {
  return res.json(req.user);
});

app.get('/logout', function(req, res) {
  req.logout();
  return res.redirect('/');
});

app.post('/register', function(req, res) {
  if ((req.body.email != null) && (req.body.name != null) && (req.body.password != null)) {
    return User.find({
      email: req.body.email
    }, function(err, users) {
      if (users.length === 0) {
        newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, salt),
          level: 1,
          following: [],
          favorites: [],
          owner: [],
          editor: [],
          picture: '',
          bio: 'I am a new member!',
          isVerified: false
        });
        newUser.save();
        req.login(newUser, function() {
          return res.json(newUser);
        });
        console.log('New member, redirecting');
        return res.redirect('/dashboard');
      } else {
        return res.json('Already exists');
      }
    });
  } else {
    return res.json('Not enough info (name, email, password)');
  }
});

app.get('/bypassdash', function(req, res) {
  return res.render('dash.html');
});

app.get('/bypasshome', function(req, res) {
  return res.render('home.html');
});

app.get('/', function(req, res) {
  if (req.user != null) {
    return res.redirect('/dashboard');
  } else {
    return res.render('home.html');
  }
});

app.get('/dashboard', function(req, res) {
  if (req.user != null) {
    return res.render('dash.html');
  } else {
    console.log('not logged in');
    return res.redirect('/');
  }
});

app.get('/mystreams', function(req, res) {
  if (req.user != null) {
    return res.render('mystreams.html');
  } else {
    console.log('not logged in');
    return res.redirect('/');
  }
});

app.get('/explore', function(req, res) {
  if (req.user != null) {
    return res.render('explore.html');
  } else {
    console.log('not logged in');
    return res.redirect('/');
  }
});

app.get('/account', function(req, res) {
  if (req.user != null) {
    return res.render('account.html');
  } else {
    console.log('not logged in');
    return res.redirect('/');
  }
});

app.get('/streamPage', function(req, res) {
  return res.render('stream.html');
});

app.get('/searchPage', function(req, res) {
  return res.render('search.html');
});

app.get('/userPage', function(req, res) {
  return res.render('user.html');
});

publiclyViewableUser = function(user) {
  var publicUser;
  return publicUser = {
    _id: user._id,
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
  };
};

app.get('/getToken', function(req, res) {
  if ((req.query.email != null) && (req.query.password != null)) {
    return User.findOne({
      email: req.query.email
    }, function(err, user) {
      var newClient;
      if (err != null) {
        console.log(err);
      }
      if (user != null) {
        newClient = new Client({
          user_id: user._id
        });
        newClient.save();
        return res.json({
          key: newClient._id,
          user: publiclyViewableUser(user)
        });
      } else {
        return res.json('no user with that email');
      }
    });
  } else {
    return res.json('Need email and password');
  }
});

listeners = {};

io.sockets.on('connection', function(socket) {
  socket.on('listen', function(data) {
    var stream, _i, _len, _ref;
    if (data.streams != null) {
      _ref = data.streams;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        stream = _ref[_i];
        if (listeners[stream] == null) {
          listeners[stream] = [];
        }
        listeners[stream].push(socket);
      }
    }
    console.log(listeners);
    return socket.on('disconnect', function() {
      var _j, _len1, _ref1;
      if (data.streams != null) {
        _ref1 = data.streams;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          stream = _ref1[_j];
          listeners[stream].splice(listeners[stream].indexOf(socket), 1);
        }
      }
      return console.log(listeners);
    });
  });
  return socket.on('update', function(data) {
    console.log('updated');
    if ((data.stream != null) && (data.value != null) && (data.time != null) && (data.source != null)) {
      return Stream.findOne({
        _id: data.stream
      }, function(err, stream) {
        var listener, newPoint, _i, _len, _ref, _ref1, _results;
        if (stream != null) {
          console.log(data);
          newPoint = new Point({
            value: data.value,
            time: data.time,
            stream_id: stream._id,
            source: data.source
          });
          newPoint.save();
          if (((_ref = listeners[stream._id]) != null ? _ref.length : void 0) != null) {
            _ref1 = listeners[stream._id];
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              listener = _ref1[_i];
              _results.push(listener.emit('newData', newPoint));
            }
            return _results;
          }
        }
      });
    }
  });
});

app.get('/user', function(req, res) {
  if (req.query.id != null) {
    return User.findOne({
      '_id': req.query.id
    }, function(err, user) {
      if (user != null) {
        return res.json(publiclyViewableUser(user));
      } else {
        return res.json();
      }
    });
  } else if (req.user != null) {
    return res.json(req.user);
  } else {
    return res.json(null);
  }
});

app.get('/hack/allUsers', function(req, res) {
  return User.find({}, function(err, users) {
    return res.json(users);
  });
});

app.get('/hack/allStreams', function(req, res) {
  return Stream.find({}, function(err, streams) {
    return res.json(streams);
  });
});

app.get('/hack/allPoints', function(req, res) {
  return Point.find({}, function(err, points) {
    return res.json(points);
  });
});

app.post('/user', function(req, res) {
  if ((req.query.key != null) && (req.query.id != null)) {
    return Client.findOne({
      _id: req.query.key
    }, function(err, client) {
      if (err != null) {
        console.log(err);
      }
      if ((client != null) && client.user_id === req.query.id) {
        return User.findOne({
          _id: client.user_id
        }, function(err, user) {
          if (err != null) {
            console.log(err);
          }
          if (user != null) {
            if (req.body.name != null) {
              user.name = req.body.name;
            }
            if (req.body.email != null) {
              user.email = req.body.email;
            }
            if (req.body.level != null) {
              user.level = req.body.level;
            }
            if (req.body.picture != null) {
              user.picture = req.body.picture;
            }
            if (req.body.bio != null) {
              user.bio = req.body.bio;
            }
            if (req.body.isVerified != null) {
              user.isVerified = req.body.isVerified;
            }
            if (req.body.following != null) {
              user.following = req.body.following;
            }
            if (req.body.favorites != null) {
              user.favorites = req.body.favorites;
            }
            if (req.body.editor != null) {
              user.editor = req.body.editor;
            }
            user.save();
            return res.json(publiclyViewableUser(user));
          } else {
            return res.json('No User');
          }
        });
      } else {
        return res.json([client, "id doesn't match key"]);
      }
    });
  } else if (req.user != null) {
    if (req.body.name != null) {
      req.user.name = req.body.name;
    }
    if (req.body.email != null) {
      req.user.email = req.body.email;
    }
    if (req.body.level != null) {
      req.user.level = req.body.level;
    }
    if (req.body.picture != null) {
      req.user.picture = req.body.picture;
    }
    if (req.body.bio != null) {
      req.user.bio = req.body.bio;
    }
    if (req.body.isVerified != null) {
      req.user.isVerified = req.body.isVerified;
    }
    console.log(req.body);
    if (req.body.follow != null) {
      req.user.following.push(req.body.follow);
    }
    if ((req.body.unfollow != null) && req.user.following.indexOf(req.body.unfollow) >= 0) {
      req.user.following.splice(req.user.following.indexOf(req.body.unfollow), 1);
    }
    if (req.body.favorite != null) {
      req.user.favorites.push(req.body.favorite);
    }
    if ((req.body.unfavorite != null) && req.user.favorites.indexOf(req.body.unfavorite) >= 0) {
      req.user.favorites.splice(req.user.favorites.indexOf(req.body.unfavorite), 1);
    }
    if (req.body.edit != null) {
      req.user.editor.push(req.body.edit);
    }
    if ((req.body.unedit != null) && req.user.editor.indexOf(req.body.unedit) >= 0) {
      req.user.editor.splice(req.user.editor.indexOf(req.body.unedit), 1);
    }
    req.user.save();
    return res.json(publiclyViewableUser(req.user));
  } else {
    return res.json('You are not authenticated');
  }
});

app["delete"]('/user', function(req, res) {
  return req.user.remove();
});

app.get('/stream', function(req, res) {
  if (req.query.id != null) {
    return Stream.findOne({
      '_id': req.query.id
    }, function(err, stream) {
      if (err != null) {
        console.log(err);
      }
      if (stream != null) {
        return Point.find({
          stream_id: stream._id
        }, function(err, points) {
          var result;
          result = {
            name: stream.name,
            genre: stream.genre,
            tags: stream.tags,
            _id: stream._id,
            latestValue: stream.latestValue,
            latestTime: stream.latestTime,
            points: points
          };
          return res.json(result);
        });
      } else {
        return res.json();
      }
    });
  } else {
    return res.json(null);
  }
});

app.post('/stream', function(req, res) {
  if (req.user != null) {
    if ((req.query.id != null) && (req.body != null)) {
      return Stream.findOne({
        _id: req.query.id
      }, function(err, stream) {
        if (err != null) {
          console.log(err);
        }
        if (stream != null) {
          if (req.body.name != null) {
            stream.name = req.body.name;
          }
          if (req.body.unit != null) {
            stream.unit = req.body.unit;
          }
          if (req.body.genre != null) {
            stream.genre = req.body.genre;
          }
          if (req.body.description != null) {
            stream.description = req.body.description;
          }
          if (req.body.website != null) {
            stream.website = req.body.website;
          }
          if (req.body.tags != null) {
            stream.tags = req.body.tags;
          }
          if (req.body.picture != null) {
            stream.picture = req.body.picture;
          }
          if (req.body.subscriptions != null) {
            return stream.subscriptions = req.body.subscriptions;
          }
        } else {
          return res.json();
        }
      });
    } else if (req.body.name != null) {
      newStream = new Stream({
        name: req.body.name,
        unit: req.body.unit,
        genre: req.body.genre,
        description: req.body.description,
        tags: req.body.tags,
        website: req.body.website,
        picture: req.body.picture,
        latestValue: 0,
        latestTime: Date.now()
      });
      newStream.save();
      req.user.owner.push(newStream._id);
      req.user.save();
      return res.json(newStream);
    } else {
      return res.json();
    }
  } else {
    return res.json('You are not authenticated');
  }
});

app["delete"]('/stream', function(req, res) {
  if ((req.user != null) && (req.query.id != null)) {
    return Stream.remove({
      _id: req.query.id
    }, function(err, stream) {
      return res.json(stream);
    });
  } else {
    return res.json();
  }
});

app.get('/point', function(req, res) {
  if ((req.query.id != null) && (req.query.stream != null)) {
    return Point.findOne({
      '_id': req.query.id,
      'stream': req.query.stream
    }, function(err, point) {
      if (err != null) {
        console.log(err);
      }
      if (point != null) {
        return res.json(point);
      } else {
        return res.json();
      }
    });
  } else {
    return res.json(null);
  }
});

app.post('/point', function(req, res) {
  if ((req.user != null) && (req.body.stream_id != null) && (req.body.value != null) && (req.body.time != null) && (req.body.source != null)) {
    return Stream.findOne({
      _id: req.body.stream_id
    }, function(err, stream) {
      var listener, newPoint, _i, _len, _ref, _ref1;
      if (stream != null) {
        newPoint = new Point({
          value: req.body.value,
          time: req.body.time,
          stream_id: stream._id,
          source: req.body.source,
          creator: req.user._id
        });
        stream.latestValue = req.body.value;
        stream.latestTime = req.body.time;
        stream.save();
        newPoint.save();
        if (((_ref = listeners[stream._id]) != null ? _ref.length : void 0) != null) {
          _ref1 = listeners[stream._id];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            listener = _ref1[_i];
            listener.emit('newData', newPoint);
          }
        }
        return res.json(newPoint);
      } else {
        return res.json();
      }
    });
  } else {
    return res.json();
  }
});

app["delete"]('/point', function(req, res) {
  if ((req.user != null) && (req.query.id != null)) {
    return Point.remove({
      _id: req.query.id
    }, function(err, points) {
      return res.json(points);
    });
  } else {
    return res.json();
  }
});
