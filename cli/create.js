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

const fs = require('fs-extra');
const { join } = require('path');

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function generate(name) {
  return `const { Task } = require('blezer');

class ${name}Task extends Task {
  async perform(args) {

  }
}

module.exports = ${name}Task
  `;
}

async function create({ name }) {
  let _ = capitalize(name);
  await fs.outputFile(join('tasks', `${_}Task.js`), generate(_));
}

module.exports = {
  handler: create,
  builder: _ => _
    .option('name')
};
