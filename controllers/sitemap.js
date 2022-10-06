const { exec } = require('child_process');
module.exports = function json(req, res) {
  console.log(req.body.url);
  if (!req.body.config) {
    req.body.config = '';
  }
  if (!req.body.url) {
    res.json({ data: 'error', statusbar: 'thiếu' });
    return;
  }
  config = 'site-audit-seo -u ' + req.body.url + ' --upload ' + req.body.config;
  res.json({ data: 'error', statusbar: 'ok' });
  exec(config, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
};
