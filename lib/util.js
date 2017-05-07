
function print(text) {
  process.stdout.write(text);
}

function println(text) {
  process.stdout.write(text + '\n');
}

const tasks = require('require-all')({
  dirname: process.cwd() + '/tasks',
  filter: /(.+Task)\.js$/,
  excludeDirs: /^\.(git|svn)$/,
  // resolve: Task => new Task()
});

module.exports = { print, println, tasks };
