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

const { redirect } = require('huncwot/response');
const { page } = require('huncwot/view');

const Stats = require('../../lib/stats');
const Queue = require('../../lib/queue');
const Job = require('../../lib/job');

async function index(request) {
  let queues = await Stats.queues();

  return page('queues/index', { queues });
}

async function show(request) {
  const { id } = request.params;
  let jobs = await Job.forQueue(id);

  return page('queues/show', { jobs, id });
}

async function remove(request) {
  const { id } = request.params;

  const queue = await Queue.remove(id);

  return redirect('/queues', `Removing ${id} from ${queue.name} ...`);
}

module.exports = {
  index,
  show,
  remove,
};
