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

const util = require('util');
const Promise = require('bluebird');

const redis = require('./redis').getClient();

class Task {
  constructor(jid) {
    this.jid = jid;
  }

  async log(message) {
    await redis.rpushAsync(
      `blezer:logs:${this.jid}`,
      `[${new Date().toISOString()}] ${util.inspect(message, false, null)}`
    );
  }

  async progress(complete, total) {
    const progress = Math.min(100, complete * 100 / total | 0);
    await redis.hmsetAsync(`blezer:jobs:${this.jid}`, { progress });
  }

  async setOutcome(outcome) {
    if(!['success', 'warning', 'failure', 'stopped'].includes(outcome)) throw new Error(`Outcome "${outcome}" doesn't exist`);
    await redis.hsetAsync(`blezer:jobs:${this.jid}`, 'outcome', outcome);
  }
}

module.exports = Task;
