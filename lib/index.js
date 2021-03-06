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

const debug = require('debug')('blezer');
const Promise = require('bluebird');

const redis = require('./redis').getClientIgnoreCache();
const { println } = require('./util');
const TaskFactory = require('./load');

async function listen(pid, queues, dir) {
  TaskFactory.loadDir(dir);

  while (true) {
    let [_, jid] = await redis.brpopAsync(...queues, 0);

    try {
      let job = await redis.hgetallAsync(`blezer:jobs:${jid}`);
      debug(`${pid}: ${job.task} as ${jid} with ${job.args}`);

      await redis.hmsetAsync(`blezer:jobs:${jid}`, {
        pid,
        startedAt: Date.now()
      });
      await redis.lpushAsync('blezer:active', jid);

      let task = TaskFactory.getInstance(job.task, jid);
      await task.perform(JSON.parse(job.args));

      await redis
        .multi()
        .lpush('blezer:processed', jid)
        .lrem('blezer:active', 0, jid)
        .hmset(`blezer:jobs:${jid}`, { finishedAt: Date.now() })
        .execAsync();
    } catch (error) {
      await redis
        .multi()
        .hmset(`blezer:jobs:${jid}`, { failedAt: Date.now() })
        .lpush('blezer:failed', jid)
        .lrem('blezer:active', 0, jid)
        .execAsync();

      await redis.rpushAsync(`blezer:logs:${jid}`, `[${new Date().toISOString()}] ${error.message} ${JSON.stringify(error.stack)}`);

      println(error.message);
    }
  }
}

module.exports = { listen };
