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

  const cont = true;
  while (cont) {
    let [, jid] = await redis.brpopAsync(...queues, 0);

    try {
      let job = await redis.hgetallAsync(`blezer:jobs:${jid}`);
      debug(`${pid}: ${job.task} as ${jid} with ${job.args}`);

      await redis.hmsetAsync(`blezer:jobs:${jid}`, {
        pid,
        startedAt: Date.now()
      });
      await redis.lpushAsync('blezer:active', jid);

      const jobArgs = JSON.parse(job.args);
      let task = TaskFactory.getInstance(job.task, jid);
      if (task.prePerform) {
        await task.prePerform(jobArgs);
      }
      await task.perform(jobArgs);

      await redis.hmsetAsync(`blezer:jobs:${jid}`, { outcome: 'success' })
    } catch (error) {
      await redis.hmsetAsync(`blezer:jobs:${jid}`, { outcome: 'failure' })

      await redis.rpushAsync(`blezer:logs:${jid}`, `[${new Date().toISOString()}] ${error.message} ${JSON.stringify(error.stack)}`);

      println(error.message);
    } finally {
      await redis
        .multi()
        .hmset(`blezer:jobs:${jid}`, { finishedAt: Date.now() })
        .lpush('blezer:processed', jid)
        .lrem('blezer:active', 0, jid)
        .execAsync();
    }
  }
}

module.exports = { listen };
