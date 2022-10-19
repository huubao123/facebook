const initializeApp = require('firebase/app');
const getDatabase = require('firebase/database').getDatabase;
const set = require('firebase/database').set;
const push = require('firebase/database').push;
const fs = require('fs');

const firebaseConfig = {
  apiKey: 'AIzaSyA8SytL-Kim6L_CSNvYUmVTH2nf6d-cE6c',
  authDomain: 'facebookpup-4fde6.firebaseapp.com',
  databaseURL: 'https://facebookpup-4fde6-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'facebookpup-4fde6',
  storageBucket: 'facebookpup-4fde6.appspot.com',
  messagingSenderId: '207611940130',
  appId: '1:207611940130:web:3cebdcc6c0a6f19e58297b',
  measurementId: 'G-3LDE9KDMV2',
};
const { ref, onValue, update, remove, get, setValue } = require('firebase/database');

const app = initializeApp.initializeApp(firebaseConfig);
const database = getDatabase(app);
const postListRefs = ref(database, '/post_type/');
onValue(postListRefs, async (snapshot) => {
  for (let key of Object.keys(snapshot.val())) {
    fs.writeFile('item11.txt', JSON.stringify(snapshot.val()[key], null, 2), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
  }
});
