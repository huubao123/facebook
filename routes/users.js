// var express = require('express');
// var router = express.Router();
// const Queue = require('bull');
// const QueueMQ = require('bullmq');
// /* GET users listing. */
// router.get('/', function (req, res, next) {
//   const { createBullBoard } = require('@bull-board/api');
//   const { BullAdapter } = require('@bull-board/api/bullAdapter');
//   const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
//   const { ExpressAdapter } = require('@bull-board/express');

//   const someQueue = new Queue('someQueueName', {
//     redis: { port: 6379, host: 'localhost', password: 'foobared' },
//   }); // if you have a special connection to redis.
//   const someOtherQueue = new Queue('someOtherQueueName');
//   const queueMQ = new QueueMQ('queueMQName');

//   const serverAdapter = new ExpressAdapter();
//   serverAdapter.setBasePath('/admin/queues');

//   const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
//     queues: [
//       new BullAdapter(someQueue),
//       new BullAdapter(someOtherQueue),
//       new BullMQAdapter(queueMQ),
//     ],
//     serverAdapter: serverAdapter,
//   });

//   const app = express();

//   // other configurations of your server
// });

// module.exports = router;
