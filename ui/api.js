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
const { ok, created } = require('huncwot/response');
const cluster = require('cluster');

const Queue = require('../lib/queue');
const Job = require('../lib/job');
const Stats = require('../lib/stats');
const { revertCWD } = require('./util');

async function all(request) {
  const queues = await Queue.all;
  return ok(queues);
}

async function job(request) {
  const { jid } = request.params;

  let logs = await Job.logs(jid);
  let job = await Job.find(jid);
  let progress = job.progress || 100;
  let args = JSON.stringify(job.args, null, 4);

  return ok({ jid, job, args, logs, progress });
}

async function remove(request) {
  const { jid } = request.params;

  try {
    await Job.remove(jid);
  } catch (error) {
    console.error(error);
  }

  revertCWD(cluster.fork);

  return ok(job);
}

async function removeJobs(request) {
  const { status } = request.params;

  if (!/(^active$)|(^processed$)|(^failed$)/.test(status)) {
    return ok(false);
  }

  const job = await Job.empty(status);

  return ok();
}


async function retry(request) {
  const { jid } = request.params;

  const job = await Job.find(jid);

  try {
    await Job.retry(job.queue, jid);
  } catch (error) {
    console.log(error);
  }

  return ok(job);
}

async function jobs(request) {
  const { status } = request.params;
  let jobs = [];

  switch (status) {
  case 'active':
    jobs = await Job.active();
    break;
  case 'failed':
    jobs = await Job.failed();
    break;
  case 'processed':
    jobs = await Job.processed();
    break;
  default:
  }

  return ok(jobs);
}

async function size(request) {
  const { name } = request.params;
  const queue = new Queue(name);
  const size = await queue.size;

  return ok(size);
}

async function enqueue(request) {
  let { name, task, args, title } = request.params;
  args = JSON.parse(args);

  const queue = new Queue(name);
  const job = await queue.enqueue(task, args, title);

  return created(job, { 'location': `/jobs/${job.jid}` });
}

async function stats(request) {
  const stats = await Promise.all([
    Stats.active,
    Stats.processed,
    Stats.failed,
    Stats.enqueued,
  ]).spread((active, processed, failed, enqueued) => ({
    processed,
    failed,
    active,
    enqueued,
  }));

  return ok(stats);
}

async function search(request) {
  return '';
}

module.exports = { all, size, enqueue, stats, search, jobs, job, remove, retry, removeJobs};
