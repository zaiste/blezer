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
// limitations under the License.const Promise = require('bluebird');

const cluster = require('cluster');

const Job = require('../../job');

async function show(ctx) {
  const { jid } = ctx.params;
  let logs = await Job.logs(jid);
  let job = await Job.find(jid);
  let progress = 47;
  let args = Object.keys(job.args);

  await ctx.render('jobs/show', { jid, job, args, logs, progress });
}

async function index(ctx, next) {
  const { status } = ctx.query;

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

  await ctx.render('jobs/index', { jobs, status });
}

async function remove(ctx, next) {
  const { status } = ctx.query;

  const job = await Job.empty(status);

  ctx.redirect('back', '/jobs?status=active');
  ctx.body = `Emptying ${status} for ${job.jid}...`;
}

async function stop(ctx, next) {
  const { jid } = ctx.params;

  console.log(jid);

  const job = await Job.find(jid);
  console.log(job.pid);
  try {
    process.kill(job.pid);
  } catch (error) {
    console.log(error);
  }

  cluster.fork();

  await ctx.redirect(`/jobs/${jid}`);
}

module.exports = {
  index,
  show,
  remove,
  stop,
};
