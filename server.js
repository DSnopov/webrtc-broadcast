require('dotenv').config();

const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
const nunjucks = require('nunjucks');
const url = require('url');

const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});
const server = http.createServer(app);
const io = socketIO(server);

app.set('view engine', 'nunj');
nunjucks.configure('views', {
  autoescape: true,
  express: app,
  noCache: process.env.NODE_ENV === 'development'
});

app.use(express.static('public'));
app.use(cookieSession({
  secret: process.env.SECRET,
  maxAge: 3 * 365 * 24 * 60 * 60 * 1000 // 3 years
}));

function restrict(req, res, next) {
  if (req.session.name) {
    next();
  } else {
    req.session.redirectURL = url.format({
      protocol: req.protocol,
      host: req.get('Host'),
      pathname: req.originalUrl
    });
    res.redirect('/registration');
  }
}

app.get('/', restrict, (req, res) => {
  console.log(req.session);
  res.render('index', {
    name: 'Broadcast'
  });
});

app.get('/r/:roomId', restrict, (req, res) => {
  res.render('room', {
    roomId: req.params.roomId
  });
});

app.get('/registration', (req, res) => {
  res.render('registration', {
    redirectURL: req.session.redirectURL
  });
});

app.post('/registration', urlencodedParser, (req, res) => {
  const redirectURL = req.session.redirectURL || '/';
  delete req.session.redirectURL;
  req.session.name = req.body.name;
  res.redirect(redirectURL);
});

// io.on('connection', (socket) => {
//   console.log('a user connected');
//
//   socket.on('disconnect', () => console.log('user disconnected'));
// });

server.listen(3000, () => {
  console.log('Server is running...')
});