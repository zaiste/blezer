
function print(text) {
  process.stdout.write(text);
}

function println(text) {
  process.stdout.write(text + '\n');
}

function revertCWD(cb) {
  let cwd = process.cwd();
  process.chdir(process.env.PWD);
  let res = cb();
  process.chdir(cwd);
  return res;
}

module.exports = { print, println, revertCWD };
