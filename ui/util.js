const nunjucks = require('nunjucks');
const { html } = require('huncwot/response');
const { resolve, dirname } = require('path');
const Sugar = require('sugar-date');
Sugar.Date.extend();
Sugar.Number.extend();

const env = nunjucks.configure(resolve(dirname(module.filename), 'views'), { autoescape: true });
env.addFilter('date', (date, format) => {
  return Date.create(parseInt(date)).relative()
});

env.addFilter('duration', (dates, format) => {
  const finished = Date.create(parseInt(dates[0]));
  const started = Date.create(parseInt(dates[1]));
  return (finished - started).duration()
});

env.addFilter('name', (queue, format) => {
  return queue.replace(/blezer:queues:/, '');
});

function render(view, bindings) {
  return html(nunjucks.render(view, bindings));
}

function revertCWDtoPWD(cb) {
  let cwd = process.cwd();
  process.chdir(process.env.PWD);
  cb();
  process.chdir(cwd);
}

module.exports = { render, revertCWDtoPWD };
