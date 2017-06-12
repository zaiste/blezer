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
const Huncwot = require('huncwot');

const api = require('./api');
const { home, queues, jobs, tasks } = require('./routes');

function server(port) {
  const app = new Huncwot();

  // API

  app.get('/api/jobs/:status', api.jobs);
  app.get('/api/queues', api.all);
  app.post('/api/queues/:name', api.enqueue);
  app.get('/api/stats', api.stats);
  app.post('/api/enqueue', api.enqueue);

  // Views

  app.get('/', home.dashboard);
  app.get('/queues', queues.index);
  app.get('/queues/:id', queues.show);
  app.post('/queues/:id', queues.remove);
  app.get('/jobs', jobs.index);
  app.get('/jobs/:jid', jobs.show);
  app.post('/jobs/:jid/delete', jobs.stop);
  app.post('/jobs/:jid/retry', jobs.retry);
  app.post('/jobs', jobs.remove);
  // app.get('/tasks', tasks.index);

  return app.listen(port);
}

module.exports = server;
