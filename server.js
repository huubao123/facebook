const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const timeout = require('connect-timeout'); //express v4
const monitoro = require('monitoro');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(timeout(300000));
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');

const { ExpressAdapter } = require('@bull-board/express');
const group = new Queue('group', {
  redis: { port: 6379, host: '127.0.0.1' },
}); // if you have a special connection to redis.
const page = new Queue('page', {
  redis: { port: 6379, host: '127.0.0.1' },
}); // if you have a special connection to redis.
const page1 = new Queue('page1', { redis: { port: 6379, host: '127.0.0.1' } });
const group1 = new Queue('group1', { redis: { port: 6379, host: '127.0.0.1' } });

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(group), new BullAdapter(group1), new BullMQAdapter(page), new BullMQAdapter(page1)],
  serverAdapter: serverAdapter,
});
const redis = require('redis');
let redisClient = redis.createClient({
  legacyMode: true,
  socket: {
    port: 6379,
    host: '127.0.0.1',
  },
});

redisClient.connect(console.log('redis ok')).catch(console.error);

queueConfigArray = [
  {
    name: 'group',
    url: '127.0.0.1://127.0.0.1:6379',
  },
  {
    name: 'group1',
    url: '127.0.0.1://127.0.0.1:6379',
  },
  {
    name: 'page',
    url: '127.0.0.1://127.0.0.1:6379',
  },
  {
    name: 'page1',
    url: '127.0.0.1://127.0.0.1:6379',
  },
];
app.locals.MonitoroQueues = queueConfigArray;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Methods', 'Content-Type', 'Authorization');
  next();
});

app.use('/', indexRouter);
app.use('/admin/queues', serverAdapter.getRouter());
app.use('/foo/bar', monitoro);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;