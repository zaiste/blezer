let tasks = null;

class TaskFactory {
  static loadDir(dir) {
    tasks = require('require-all')({
      dirname: dir,
      filter: /(.+Task)\.js$/,
      excludeDirs: /^\.(git|svn)$/,
      // resolve: Task => new Task()
    });
  }

  static getInstance(task, jid) {
    if (tasks.hasOwnProperty(task)) {
      return new tasks[task](jid);
    } else {
      throw new Error(`Could not instantiate ${task}`);
    }
  }
}
module.exports = TaskFactory
