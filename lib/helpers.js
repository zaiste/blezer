const Queue = require('./queue');

async function enqueue(task, args, name = 'default') {
  const queue = new Queue(name);
  const job = await queue.enqueue(task, args);

  return job;
}

module.exports = { enqueue };
