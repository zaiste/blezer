# blezer 

[![npm](https://img.shields.io/npm/v/blezer.svg)](https://www.npmjs.com/package/blezer)
[![npm](https://img.shields.io/npm/dm/blezer.svg)](https://www.npmjs.com/package/blezer)

Blezer is a simple background job/task processing queue for Node.js (>= 7.6) using `cluster` & separate Node processes, powered by Redis.

## Features 

- [x] each worker runs its tasks in a separate Node.js process
- [x] RESTful JSON API
- [x] integrated UI
- [x] logging per job/task
- [ ] delay job/task execution
- [ ] job/task expiry value for being in active state

## Install

    npm install -g blezer

## Getting started 

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

Put your tasks in `tasks/` directory and run

    blezer start

[1]: https://github.com/resque/resque
[2]: https://github.com/mperham/sidekiq


## Usage

Jobs should be enqueued using `enqueue` helper. 

```js
const { enqueue } = require('blezer/lib/helpers');

enqueue('LoopTask', '[1, 2, 3]');
```

By default, the `enqueue` function puts the new job on `default` queue; this can be changed with the `name` parameter from `options`.

```js
enqueue('LoopTask', '[1, 2, 3]', { name: 'high' });
```

A job can be scheduled to run at a specific time using `scheduledAt` parameter.

```js
enqueue('LoopTask', '[1, 2, 3]', { name: 'high', scheduledAt: Date.now() + Sugar.Number.days(4) });
```

It is also possible to enqueue a job through Blezer REST API

    http POST :3000/api/enqueue task=LoopTask args='[1,2,3]'


### Queues

*Queue* is a list of *Job* items, stored so as to be retrievable and handled in the order of insertion. You can create a *Queue* by giving it a name. This is a lower level API which usually shouldn't be used directly - it's advised to use `enqueue` helper. 

```js
const { Queue } = require('blezer');
const highQueue = new Queue('high');
```

## Logging

You can log on per job/task basis by using `this.log(message)` method, where `message` is an object or a string.

```
this.log("This is my log message");
this.log({ a: 1, b: 2});
```

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
