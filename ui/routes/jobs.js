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
const { redirect } = require('huncwot/response');
const { page } = require('huncwot/view');

const Job = require('../../lib/job');

async function show(request) {
  const { jid } = request.params;

  let logs = await Job.logs(jid);
  let job = await Job.find(jid);
  let progress = job.progress || 100;
  let args = JSON.stringify(job.args, null, 4);

  return page('jobs/show', { jid, job, args, logs, progress });
}

async function index(request) {
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

  return page('jobs/index', { jobs, status });
}

async function remove(request) {
  const { status } = request.params;

  const job = await Job.empty(status);

  return redirect('/jobs?status=active', `Emptying ${status} for ${job.jid}...`);
}

async function stop(request) {
  const { jid, status } = request.params;

  const job = await Job.find(jid);
  try {
    await Job.remove(jid);
    process.kill(job.pid);
  } catch (error) {
    console.log(error);
  }

  let cwd = process.cwd();
  process.chdir(process.env.PWD);
  cluster.fork();
  process.chdir(cwd);

  return redirect(`/jobs?status=${status}`);
}

async function retry(request) {
  const { status, jid } = request.params;

  const job = await Job.find(jid);
  await Job.retry(job.queue, jid);

  return redirect(`/jobs?status=${status}`);
}

module.exports = {
  index,
  show,
  remove,
  stop,
  retry,
};
