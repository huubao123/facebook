const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const indexRouter = require('./routes/index');
const timeout = require('connect-timeout'); //express v4
const monitoro = require('monitoro');
const postRouter = require('./routes/post');
const app = express();
const requestIp = require('request-ip');
// view engine setup
require('./redis_queuess');
// require('./testdata');
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
const db = require('./data');
const { ExpressAdapter } = require('@bull-board/express');
const queue = new Queue('queue', {
  redis: { port: 6379, host: '127.0.0.1' },
}); // if you have a special connection to redis.
const page = new Queue('page', {
  redis: { port: 6379, host: '127.0.0.1' },
}); // if you have a special connection to redis.
const page1 = new Queue('page1', { redis: { port: 6379, host: '127.0.0.1' } });
const group1 = new Queue('group1', { redis: { port: 6379, host: '127.0.0.1' } });
const test = new Queue('test', { redis: { port: 6379, host: '127.0.0.1' } });
const day = new Queue('day', { redis: { port: 6379, host: '127.0.0.1' } });
const week = new Queue('week', { redis: { port: 6379, host: '127.0.0.1' } });
const mount = new Queue('mount', { redis: { port: 6379, host: '127.0.0.1' } });
const schedule = new Queue('schedule', { redis: { port: 6379, host: '127.0.0.1' } });
const update = new Queue('update', { redis: { port: 6379, host: '127.0.0.1' } });
const del = new Queue('del', { redis: { port: 6379, host: '127.0.0.1' } });

const private_day = new Queue('private_day', { redis: { port: 6379, host: '127.0.0.1' } });
const private_week = new Queue('private_week', { redis: { port: 6379, host: '127.0.0.1' } });
const private_mount = new Queue('private_mount', { redis: { port: 6379, host: '127.0.0.1' } });
const private_queue = new Queue('private_queue', { redis: { port: 6379, host: '127.0.0.1' } });

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// inside middleware handler

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullAdapter(queue),
    new BullMQAdapter(day),
    new BullMQAdapter(week),
    new BullMQAdapter(mount),
    new BullMQAdapter(private_queue),
    new BullMQAdapter(private_day),
    new BullMQAdapter(private_mount),
    new BullMQAdapter(private_week),
    new BullMQAdapter(schedule),
    new BullMQAdapter(update),
    new BullMQAdapter(del),
    new BullAdapter(group1),
    new BullMQAdapter(page),
    new BullMQAdapter(page1),
    new BullMQAdapter(test),
  ],
  serverAdapter: serverAdapter,
});

app.use(requestIp.mw());
const ipMiddleware = function (req, res, next) {
  const clientIp = requestIp.getClientIp(req);
  next();
};
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Methods', 'Content-Type', 'Authorization');
  next();
});
app.use('/', ipMiddleware, indexRouter);
app.use('/posts', postRouter);
app.use('/admin/queues', serverAdapter.getRouter());

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
