const initializeApp = require('firebase/app');
const fs = require('fs');

const { getDatabase, ref, onValue, update, remove, get, setValue } = require('firebase/database');

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
const app = initializeApp.initializeApp(firebaseConfig);
const database = getDatabase(app);
const postListRefss = ref(database, 'post_type/');
let data = [];
async function dataerror() {
  await onValue(postListRefss, async (snapshot) => {
    for (let key of Object.keys(snapshot.val())) {
      let result = snapshot.val()[key];
      for (let keys of Object.keys(result)) {
        let results = result[keys];
        for (let keyss of Object.keys(results)) {
          if (results[keyss].error) {
            data.push({
              error: results[keyss].error,
              post_link: results[keyss].post_link,
              key: keyss,
            });
          }
        }

        //   fs.writeFile('item1.txt', JSON.stringify(result[keys], null, 2), (err) => {
        //     if (err) throw err;
        //     // console.log('The file has been saved!');
        //   });
      }
    }
  });
  setTimeout(() => {
    fs.writeFile('data_error.txt', JSON.stringify(data, null, 2), (err) => {
      if (err) throw err;
      // console.log('The file has been saved!');
    });
  }, 5000);
}
dataerror();
