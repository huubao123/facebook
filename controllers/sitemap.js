const { exec } = require('child_process');
const crypto = require('crypto');
const initializeApp = require('firebase/app');
const getDatabase = require('firebase/database').getDatabase;
const set = require('firebase/database').set;
const ref = require('firebase/database').ref;
const push = require('firebase/database').push;
const axios = require('axios');
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
module.exports = function json(req, res) {
  const craw_id = crypto.randomBytes(16).toString('hex');
  if (!req.body.config) {
    req.body.config = '';
  }
  if (!req.body.url) {
    res.json({ data: 'error', statusbar: 'thiếu' });
    return;
  }
  config = 'site-audit-seo -u ' + req.body.url + ' --upload ' + req.body.config;
  res.json({ data: 'success', statusbar: craw_id });
  
  exec(config, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }

    const apps = initializeApp.initializeApp(firebaseConfig);
    const databases = getDatabase(apps);
    const postListRefss = ref(databases, 'Sitemap/' + craw_id);
     set(postListRefss, {
      url: req.body.url,
      config: req.body.config,
      create_at: Date.now(),
      result: stdout,
    });
  });
};
