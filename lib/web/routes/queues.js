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

const Stats = require('../../stats');
const Queue = require('../../queue');
const Job = require('../../job');

async function index(ctx, next) {
  let queues = await Stats.queues;

  await ctx.render('queues/index', { queues });
}

async function show(ctx, next) {
  const { id } = ctx.params;

  let jobs = await Job.forQueue(id);
  await ctx.render('queues/show', { jobs });
}

async function remove(ctx, next) {
  const { id } = ctx.params;

  const queue = await Queue.remove(id);

  ctx.redirect('back', '/queues');
  ctx.body = `Removing ${id}...`
}

module.exports = {
  index,
  show,
  remove,
};
