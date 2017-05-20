const tasks = require('require-all')({
  dirname: process.cwd() + '/tasks',
  filter: /(.+Task)\.js$/,
  excludeDirs: /^\.(git|svn)$/,
  // resolve: Task => new Task()
});

module.exports = { tasks };
