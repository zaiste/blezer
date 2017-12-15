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

const cluster = require('cluster');
const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;
const uuid = require('uuid');

const { revertCWD } = require('./util');

const redis = require('./redis').getClient();

class Job extends EventEmitter {
  constructor(queue, task, args, title = '', { scheduledAt } = {}) {
    super();

    this.queue = queue;
    this.task = task;
    this.title = title;
    this.args = args || {};

    this.createdAt = Date.now();

    this.jid = uuid.v4();

    redis.hmsetAsync(`blezer:jobs:${this.jid}`, {
      task,
      title,
      queue,
      args: JSON.stringify(args),
      createdAt: this.createdAt,
    });

    this.on('enqueued', () => {
      this.enqueuedAt = Date.now();
      redis.hmsetAsync(`blezer:jobs:${this.jid}`, { enqueuedAt: this.enqueuedAt });
    });
  }

  static async remove(jid) {
    const active = await redis.lremAsync('blezer:active', 0, jid);
    if (active) {
      const job = await this.find(jid);
      process.kill(job.pid);
      revertCWD(cluster.fork);
    }

    await redis
      .multi()
      .del(`blezer:jobs:${jid}`)
      .del(`blezer:logs:${jid}`)
      .lrem(`blezer:active`, 0, jid)
      .lrem(`blezer:processed`, 0, jid)
      .lrem(`blezer:failed`, 0, jid)
      .execAsync();
  }

  static async retry(queue, jid) {
    this.enqueuedAt = Date.now();

    await redis
      .multi()
      .lrem(`blezer:failed`, 0, jid)
      .lpush(`blezer:queues:${queue}`, jid)
      .hmset(`blezer:jobs:${jid}`, { enqueuedAt: this.enqueuedAt })
      .execAsync();
  }

  static async find(jid) {
    let job = await redis.hgetallAsync(`blezer:jobs:${jid}`);

    if (job && job.args && job.createdAt) {
      job.jid = jid;
      job.args = JSON.parse(job.args);
      return job;
    } else {
      return null;
    }
  }

  static async active() {
    const jids = await redis.lrangeAsync('blezer:active', 0, -1);
    const jobs = (await Promise.all(jids.map(this.find))).filter(job => job);
    return jobs;
  }

  static async empty(queue) {
    await redis.delAsync(`blezer:${queue}`);

    return true;
  }

  static async failed() {
    const jids = await redis.lrangeAsync('blezer:failed', 0, -1);

    const jobs = (await Promise.all(jids.map(this.find))).filter(job => job);
    return jobs;
  }

  static async processed() {
    const jids = await redis.lrangeAsync('blezer:processed', 0, -1);

    const jobs = (await Promise.all(jids.map(this.find))).filter(job => job);
    return jobs;
  }

  static logs(jid) {
    return redis.lrangeAsync(`blezer:logs:${jid}`, 0, -1);
  }

  static async forQueue(queue) {
    const jids = await redis.lrangeAsync(`blezer:queues:${queue}`, 0, -1);

    const jobs = (await Promise.all(jids.map(this.find))).filter(job => job);
    return jobs;
  }
}

module.exports = Job;
