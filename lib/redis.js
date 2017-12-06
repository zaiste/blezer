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
const redis = require('redis');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

let client = null;
let options = {};

/** Return a new connection that won't be reused by another call
 * this should only be used so that blocking requests don't block the other connections
 * @returns RedisClient
 */
function getClientIgnoreCache() {
  return redis.createClient(options);
}

function getClient() {
  if (!client) {
    client = getClientIgnoreCache();
  }
  return client;
}

module.exports = {
  getClient,
  getClientIgnoreCache,
  setRedisOptions: (opts) => { options = opts; client = null; },
};
