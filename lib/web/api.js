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

const Queue = require('../queue');
const Stats = require('../stats');

async function all(ctx, next) {
  ctx.body = await Queue.all;
}

async function jobs(ctx, next) {
  const { name, status } = ctx.params;
  const queue = new Queue(name);

  let jobs = await queue.jobs;
  jobs = jobs.map(JSON.parse);
  ctx.body = jobs;
}

async function size(ctx, next) {
  const { name } = ctx.params;
  const queue = new Queue(name);

  ctx.body = await queue.size;
}

async function enqueue(ctx, next) {
  const { name } = ctx.params;
  const { task, args } = ctx.request.body;

  const queue = new Queue(name);
  const job = await queue.enqueue(task, args);

  ctx.status = 201;
}

async function stats(ctx, next) {
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

  ctx.body = stats;
}

async function search(ctx, next) {
  return '';
}

module.exports = { all, size, enqueue, stats, search, jobs };
