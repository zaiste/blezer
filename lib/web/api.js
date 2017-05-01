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
const { reply } = require('huncwot/helpers');

const Queue = require('../queue');
const Stats = require('../stats');

async function all(request) {
  const queues = await Queue.all;
  return reply(queues);
}

async function jobs(request) {
  const { name } = request.params;
  const queue = new Queue(name);

  let jobs = await queue.jobs;
  jobs = jobs.map(JSON.parse);

  return reply(jobs);
}

async function size(request) {
  const { name } = request.params;
  const queue = new Queue(name);
  const size = await queue.size;

  return reply(size);
}

async function enqueue(request) {
  const { name, task, args } = request.params;

  const queue = new Queue(name);
  const job = await queue.enqueue(task, args);

  return {
    statusCode: 201,
    headers: { 'Location': `/jobs/${job.jid}` }
  };
}

async function stats(request) {
  const stats = await Promise.all([
    Stats.queues,
    Stats.failed,
    Stats.processed,
    Stats.enqueued,
  ]).spread((queues, processed, failed, enqueued) => ({
    processed,
    failed,
    enqueued,
  }));

  return reply(stats);
}

async function search(request) {
  return '';
}

module.exports = { all, size, enqueue, stats, search, jobs };
