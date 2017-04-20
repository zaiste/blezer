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
const os = require('os');
const cluster = require('cluster');
const figlet = require('figlet');
const chalk = require('chalk');

const { listen } = require('./');
const server = require('./web/server');
const redis = require('./redis');

function start({ queues, concurrency, port }) {
  queues = queues.split(',').map(_ => `blezer:queues:${_}`);

  if (cluster.isMaster) {
    if (concurrency == 0) concurrency = os.cpus().length;

    console.log(chalk.magenta(figlet.textSync('BLEZER', { font: 'Slant' })));
    console.log(`concurrency: ${concurrency}`);

    server(port);

    for (let i = 0; i < concurrency; i++)
      cluster.fork();

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } else {
    console.log(`${process.pid}: ${chalk.green('started')}`);
    listen(process.pid, queues);
  }
}

async function cleanup() {
  console.log('Closing...');

  let jids = await redis.lrangeAsync('blezer:active', 0, -1);
  if (jids.length) {
    await redis.multi()
      .lpush('blezer:queues:default', jids)
      .del('blezer:active')
      .execAsync();
  }

  process.exit(1);
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
      .option('queues', {
        alias: 'q',
        default: 'default',
        describe: 'Comma separated list of queues to process',
      })
      .option('config', { alias: 'C', describe: 'path to YAML config file' })
      .option('logfile', { alias: 'L', describe: 'path to logfile' }),
};
