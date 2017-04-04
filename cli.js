#! /usr/bin/env node

const argv = require('yargs')
  .env('BLEZER')
  .version()
  .usage('Usage: blezer <command> [options]')
  .command(['start', 's'], 'Start', require('./lib/start'))
  .help('h')
  .alias('h', 'help')
  .epilogue('for more information, find the documentation at https://blezer.io')
  .argv;
