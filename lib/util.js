
function print(text) {
  process.stdout.write(text);
}

function println(text) {
  process.stdout.write(text + '\n');
}

module.exports = { print, println };
