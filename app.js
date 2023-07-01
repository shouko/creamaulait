const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
  socket.on('message', (msg) => {
    console.log('message', msg);
    io.emit('message', msg);
  });
});

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', express.static(`${__dirname}/public`));

app.get('/', (req, res) => res.send('Hello World!'));

const listener = server.listen(config.port, () => {
  console.info(`Listening on port ${listener.address().port}!`);
});

process.on('exit', (code) => {
  console.log(`Exiting with ${code}`);
});
