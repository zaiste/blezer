const nunjucks = require('nunjucks');
const { html } = require('huncwot/response');
const { resolve, dirname } = require('path');
const Sugar = require('sugar-date');
Sugar.Date.extend();

const env = nunjucks.configure(resolve(dirname(module.filename), 'views'), { autoescape: true });
env.addFilter('date', (date, format) => {
  return Date.create(parseInt(date)).relative()
});

function render(view, bindings) {
  return html(nunjucks.render(view, bindings));
}

module.exports = { render };
