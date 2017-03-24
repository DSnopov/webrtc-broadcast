require('dotenv').config();

const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const http = require('http');
const SocketServer = require('socket.io');
const nunjucks = require('nunjucks');
const url = require('url');
const crypto = require('crypto');

const app = express();
const cookieSessionMiddleware = cookieSession({
  secret: process.env.SECRET,
  maxAge: 3 * 365 * 24 * 60 * 60 * 1000 // 3 years
});
const urlencodedParser = bodyParser.urlencoded({extended: false});
const httpServer = http.createServer(app);
const io = new SocketServer(httpServer);

const db = {
  roomIds: []
};

app.set('view engine', 'nunj');
nunjucks.configure('views', {
  autoescape: true,
  express: app,
  noCache: process.env.NODE_ENV === 'development'
});

app.use(express.static('public'));
app.use(cookieSessionMiddleware);

function restrict(req, res, next) {
  if (req.session.name) {
    next();
  } else {
    req.session.redirectURL = req.method === 'GET' ? req.url : '/';
    res.redirect('/registration');
  }
}

function generateRoomId() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(3, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        //todo: ensure that nobody uses this id
        resolve(buf.toString('hex'));
      }
    });
  });
}

app.get('/', restrict, (req, res) => {
  res.render('index', {roomIds: db.roomIds});
});

app.get('/room/:roomId', restrict, (req, res) => {
  const roomId = req.params.roomId;
  const isOwner = req.session.ownedRoomId === roomId;
  if (db.roomIds.indexOf(roomId) > -1) {
    res.render('room', {
      roomId,
      isOwner
    });
  } else {
    res.redirect('/');
  }
});

app.post('/room', restrict, (req, res) => {
  generateRoomId()
    .then(id => {
      db.roomIds.push(id);
      req.session.ownedRoomId = id;
      res.redirect(`/room/${id}`);
    });
});

app.get('/registration', (req, res) => {
  res.render('registration', {
    redirectURL: req.session.redirectURL
  });
});

app.post('/registration', urlencodedParser, (req, res) => {
  const redirectURL = req.session.redirectURL;
  delete req.session.redirectURL;
  req.session.name = req.body.name;
  res.redirect(redirectURL);
});


io.use((socket, next) => {
  cookieSessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connection', (socket) => {

  socket.on('join room', (roomId) => {
    socket.join(roomId, () => {
      socket.broadcast.to(roomId).emit('joined room', socket.id);
    });
  });

  socket.on('signal', (data) => {
    data.from = socket.id;
    socket.broadcast.to(data.to).emit('signal', data);
  });

  socket.on('disconnect', () => console.log('user disconnected'));
});

httpServer.listen(3000, () => {
  console.log('Server is running...');
});