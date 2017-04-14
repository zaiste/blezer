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

const koa = require('koa');
const router = require('koa-router')();
const view = require('koa-nunjucks-next');
const body = require('koa-body');

const app = new koa();

const api = require('./api');
const { home, queues, jobs } = require('./routes');

app.use(view());

// API

router.get('/api/queues', api.all);
router.post('/api/queues/:name', body(), api.enqueue);
router.get('/api/stats', api.stats);

// Views

router.get('/', home.dashboard);
router.get('/queues', queues.index);
router.get('/queues/:id', queues.show);
router.get('/jobs', jobs.index);
router.get('/jobs/:jid', jobs.show);
router.post('/jobs/:jid/delete', jobs.stop);
router.post('/jobs', jobs.remove);

app.use(router.routes());
app.listen(3000);
