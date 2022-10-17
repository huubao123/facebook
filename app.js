var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var timeout = require('connect-timeout'); //express v4
const monitoro = require('monitoro');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
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
const QueueMQ = require('bullmq').Queue;
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');

const { ExpressAdapter } = require('@bull-board/express');
const someQueue = new Queue('facebook', {
  redis: { port: 6379, host: '127.0.0.1' },
}); // if you have a special connection to redis.
const someOtherQueue = new Queue('facebook1', { redis: { port: 6379, host: '127.0.0.1' } });
const queueMQ = new QueueMQ('queueMQName');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(someQueue), new BullAdapter(someOtherQueue), new BullMQAdapter(queueMQ)],
  serverAdapter: serverAdapter,
});
queueConfigArray = [
  {
    name: 'facebook',
    url: 'localhost://127.0.0.1:6379',
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
