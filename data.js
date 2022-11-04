const mongoose = require('mongoose');
// const connectionString = credentials.connectionString;
const connectionString =
  'mongodb://root:OWI3ODRhNzE2MzZkNjFlOWYxZTgwZmMz@206.189.81.38:28015/facebook?authSource=admin';
if (!connectionString) {
  console.error('MongoDB connection string missing!');
  process.exit(1);
}
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (err) => {
  console.error('MongoDB error: ' + err.message);
  process.exit(1);
});
db.once('open', () => console.log('MongoDB connection established'));
