socket = require('socket.io')
express = require('express')
LocalStrategy = require('passport-local').Strategy
bcrypt = require('bcrypt')
secrets = require('./secrets.json')
http = require('http')
