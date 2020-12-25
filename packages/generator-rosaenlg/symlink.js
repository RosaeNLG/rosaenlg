const path = require('path');
const fs = require('fs');

fs.unlink('node_modules/rosaenlg-boilerplate', () => {
  // we don't care
});

fs.symlink(path.join(__dirname, '../rosaenlg-boilerplate/'), 'node_modules/rosaenlg-boilerplate', 'junction', (err) => {
  if (err) {
    console.log('could not create symlink:', err);
  }
});
