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
const env = process.env.BLEZER_ENV;

const { render } = require('../util.js');

async function dashboard(ctx, next) {
  const stats = await Promise.all([
    Stats.processed,
    Stats.failed,
    Stats.active,
    Stats.enqueued]);

  return render('index.html', { stats, env });
}

module.exports = {
  dashboard,
};
