const nunjucks = require('nunjucks');
const { reply } = require('huncwot/helpers');
const { resolve, dirname } = require('path');

nunjucks.configure(resolve(dirname(module.filename), 'views'), { autoescape: true });

function render(view, bindings) {
  return reply(nunjucks.render(view, bindings));
}

module.exports = { render };
