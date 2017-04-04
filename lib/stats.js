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

const redis = require('./redis');

class Stats {
  static get processed() {
    return redis.llenAsync("blezer:processed");
  }

  static get failed() {
    return redis.llenAsync("blezer:failed");
  }

  static get queues() {
    return redis.keysAsync("blezer:queues:*")
      .then(_ => _.length);
  }

  static get enqueued() {
    const size = _ => redis.llenAsync(_);
    const sum = (acc, _) => acc + _;

    return redisClient
      .keysAsync("blezer:queues:*")
      .map(size)
      .reduce(sum, 0)
  }
}

module.exports = Stats;
