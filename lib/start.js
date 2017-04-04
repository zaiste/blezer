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
const fs = Promise.promisifyAll(require("fs-extra"));
const os = require('os');
const path = require('path');
const cluster = require('cluster');
const figlet = require('figlet');
const chalk = require('chalk');

const { listen } = require('./')

function start({ queues, concurrency }) {
  queues = queues.split(',').map(_ => `blezer:queues:${_}`)

  if (cluster.isMaster) {
    if (concurrency == 0) concurrency = os.cpus().length;

    console.log(chalk.magenta(figlet.textSync('BLEZER', { font: 'slant' })));
    console.log(`concurrency: ${concurrency}`)

    const api = require('./web/app');

    for (let i = 0; i < concurrency; i++) cluster.fork();
  } else {
    console.log(`${process.pid}: ${chalk.green('started')}`);
    listen(process.pid, queues)
  }
}

module.exports = {
  handler: start,
  builder: _ => _
    .default('dir', '.')
    .option('concurrency', { alias: 'c', describe: 'Number of threads to use', default: 0 })
    .option('daemon', { alias: 'd', describe: 'Daemonize process' })
    .option('queues', { alias: 'q', default: 'default', describe: 'Comma separated list of queues to process' })
    .option('config', { alias: 'C', describe: 'path to YAML config file' })
    .option('logfile', { alias: 'L', describe: 'path to logfile' })
};
