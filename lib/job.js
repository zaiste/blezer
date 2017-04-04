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
const EventEmitter = require('events').EventEmitter;
const uuid = require('uuid');

const redis = require('./redis');

class Job extends EventEmitter {
  constructor(queue, task, args, options) {
    super();

    this.queue = queue;
    this.task = task
    this.args = args || {};
    this.options = options || {};

    this.createdAt = Date.now();

    this.jid = uuid.v4();

    console.log(this.jid);

    redis.hmsetAsync(`blezer:jobs:${this.jid}`, {
      task,
      queue,
      args,
      // args: JSON.stringify(args),
      createdAt: this.createdAt,
     });
  }

  set enqueuedAt(val) {
  }

  remove() {
  }

  retry() {
  }

  static async find(jid) {
    let job = await redis.hgetallAsync(`blezer:jobs:${jid}`);

    if (job) {
      job.jid = jid;
      job.args = JSON.parse(job.args);
      return job;
    } else {
      return null;
    }
  }

  static async active() {
    const jids = await redis.lrangeAsync("blezer:active", 0, -1);
    const jobs = await Promise.all(jids.map(this.find));
    return jobs;
  }

  static async empty(queue) {
    await redis.delAsync(`blezer:${queue}`);

    return true;
  }

  static async failed() {
    const jids = await redis.lrangeAsync("blezer:failed", 0, -1);

    const jobs = await Promise.all(jids.map(this.find));
    return jobs;
  }

  static async processed() {
    const jids = await redis.lrangeAsync("blezer:processed", 0, -1);

    const jobs = await Promise.all(jids.map(this.find));
    return jobs;
  }

  static logs(jid) {
    return redis.lrangeAsync(`blezer:logs:${jid}`, 0, -1);
  }
}

module.exports = Job;
