const next = require('next');
const config = require('./config');
const {
  app: expressApp,
  server,
} = require('./server/app');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  expressApp.all('*', (req, res) => handle(req, res));

  const listener = server.listen(config.port, () => {
    console.info(`Listening on port ${listener.address().port}!`);
  });
});

process.on('exit', (code) => {
  console.log(`Exiting with ${code}`);
});
