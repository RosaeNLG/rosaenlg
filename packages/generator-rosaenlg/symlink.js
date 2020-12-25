const path = require('path');
const fs = require('fs');

function createSymlink() {
  fs.mkdir('node_modules', { recursive: true }, () => {
    fs.unlink('node_modules/rosaenlg-boilerplate', () => {
      fs.symlink(
        path.join(__dirname, '../rosaenlg-boilerplate/'),
        'node_modules/rosaenlg-boilerplate',
        'junction',
        (err) => {
          if (err) {
            console.log('could not create symlink:', err);
          } else {
            console.log('symlink created');
          }
        },
      );
    });
  });
}

return createSymlink();
