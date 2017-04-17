# blezer 

[![npm](https://img.shields.io/npm/v/blezer.svg)](https://www.npmjs.com/package/blezer)
[![npm](https://img.shields.io/npm/dm/blezer.svg)](https://www.npmjs.com/package/blezer)

Blezer is a simple background job/task processing queue for Node.js (>= 7.6) using `cluster` & separate Node processes.

## Install

    npm install -g blezer

Each job triggers an execution of a *Task* i.e. a recipe what to do for that job. It is defined as a `class` with `perform` method. `Task` corresponds to `Worker` from similar projects such as [resque][1] or [sidekiq][2]. It is named this way to avoid the clash with `cluster` workers.

```js
const { Task } = require('blezer');  

class LoopTask extends Task {
  perform(args) {
    this.log(`Running inside: ${process.pid}`);
    this.log(`Args: ${args}`);

    let progress = 0;
    for (var i = 0; i < 1e10; i++) {
      if (i % 1e8 == 0) {
        this.log(i)
        this.progress(progress, 100);
        progress++;
      }
    }
  }
}

module.exports = LoopTask
```

[1]: https://github.com/resque/resque
[2]: https://github.com/mperham/sidekiq


## Usage

Put your tasks in `tasks/` directory and run

    blezer start

Enqueue a job through the API

    http POST :3000/api/queues/default task=LoopTask args='[1,2,3]'

## Roadmap

Blezer keeps track of the upcoming fixes and features on GitHub Projects: [Blezer Roadmap](https://github.com/zaiste/blezer/projects/1)

## Bug reports

We use *Github Issues* for managing bug reports and feature requests. If you run
into problems, please search the *issues* or submit a new one here:
https://github.com/zaiste/blezer/issues

Detailed bug reports are always great; it's event better if you are able to
include test cases.

## Roadmap

- [ ] visualisation with Clui https://github.com/nathanpeck/clui

## Contributing

- run the code through `prettier`
