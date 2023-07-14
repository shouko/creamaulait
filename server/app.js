const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const { probeStream } = require('./utils');
const { secretKey, publicUrl, mongoDbUrl } = require('../config');
const authRoutes = require('./auth');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
  socket.on('message', (msg) => {
    console.log('message', msg);
    io.emit('message', msg);
  });
});
mongoose.set('strictQuery', false);
mongoose.connect(mongoDbUrl);

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('trust proxy', 1);
app.use(cookieSession({
  name: 'session',
  secret: secretKey,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: 'strict',
  secure: publicUrl.startsWith('https://'),
}));

app.get('/api', (req, res) => res.send('Hello World!'));
app.get('/api/data/nogizaka46/members', async (req, res) => {
  try {
    const resp = await fetch('https://www.nogizaka46.com/s/n46/api/list/member').then((r) => r.text());
    const parsed = JSON.parse(resp.replace(/^res\((.+)\);?$/, '$1'));
    res.json(parsed);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
app.use('/api/mail', require('./mail'));

app.use('/auth', authRoutes);

app.post('/api/stream/probe', async (req, res) => {
  const { url } = req.body;

  const { error, data, stderr } = await probeStream(url);
  if (error) {
    return res.status(500).json(error);
  }
  return res.json({
    data,
    stderr,
  });
});

module.exports = {
  app,
  server,
};
