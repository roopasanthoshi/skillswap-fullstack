const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Test'));
const server = app.listen(5000, () => {
  console.log('Test server running on port 5000');
});
process.on('exit', (code) => console.log('Exiting with code', code));
setTimeout(() => console.log('Timeout fired'), 5000);
