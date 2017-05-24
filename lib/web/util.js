const nunjucks = require('nunjucks');
const { html } = require('huncwot/response');
const { resolve, dirname } = require('path');

nunjucks.configure(resolve(dirname(module.filename), 'views'), { autoescape: true });

function render(view, bindings) {
  return html(nunjucks.render(view, bindings));
}

module.exports = { render };
