// Copyright 2016 Zaiste & contributors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const Promise = require('bluebird');
const assert = require('assert');
const os = require('os');
const cluster = require('cluster');
const figlet = require('figlet');
const chalk = require('chalk');
const chokidar = require('chokidar');
const { join, resolve } = require('path');

const { println } = require('./util');
const Job = require('./job');

function start({ queues, concurrency, port, watch, redisPort, redisHost, tasksDir }) {

  queues = queues.split(',').map(_ => `blezer:queues:${_.trim()}`);
  tasksDir = resolve(process.cwd(), tasksDir || 'tasks');

  require('./redis').setRedisOptions({ host: redisHost, port: redisPort });

  if (cluster.isMaster) {
    if (concurrency == 0) concurrency = os.cpus().length;

    println(chalk.magenta(figlet.textSync('BLEZER', { font: 'Slant' })));
    println(`concurrency: ${concurrency}`);

    for(let i = 0; i < concurrency; i++)
      cluster.fork();

    if (watch) {
      println('tasks watching: enabled');
      chokidar.watch(tasksDir, { ignored: /[\/\\]\./ })
        .on('change', restartCluster);
    }

    process.chdir(resolve(__dirname, '../ui'));
    const server = require('../ui/server');
    server(port);

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } else {
    const { listen } = require('./');
    println(`${process.pid}: ${chalk.green('started')}`);
    listen(process.pid, queues, tasksDir);
  }
}

async function cleanup() {
  const redis = require('./redis').getClient();
  println('Closing...');

  let jids = await redis.lrangeAsync('blezer:active', 0, -1);
  await Promise.map(jids, Job.fail);

  process.exit(1);
}

function restartCluster() {
  println('Restarting workers stand-by ...');
  for (let wid in cluster.workers) {
    cluster.workers[wid].send({ text: 'shutdown', from: 'master' });
  }
}

module.exports = {
  handler: start,
  builder: _ =>
    _.default('dir', '.')
      .option('concurrency', {
        alias: 'c',
        describe: 'Number of threads to use',
        default: 0,
      })
      .option('daemon', { alias: 'd', describe: 'Daemonize process' })
      .option('port', { alias: 'p', describe: 'Port for the Web UI', default: 3000 })
      .option('redis-port', { alias: 'P', describe: 'Port for the redis server', default: 6379 })
      .option('redis-host', { alias: 'H', describe: 'Host for the redis server', default: 'localhost' })
      .option('tasks-dir', { alias: 't', describe: 'Directory of the tasks', default: '' })
      .option('watch', { alias: 'w', describe: 'Watch for changes in tasks', default: false })
      .option('queues', {
        alias: 'q',
        default: 'default',
        describe: 'Comma separated list of queues to process',
      })
      .option('config', { alias: 'C', describe: 'path to YAML config file' })
      .option('logfile', { alias: 'L', describe: 'path to logfile' }),
};
