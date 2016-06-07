'use strict';

function exactMatch({names, name}) {
  return names.map(n => name === n);
}
/**
 * When we get the input, run the function then die.
 */
process.on('message', function (data) {
  process.send(exactMatch(data));
  process.exit();
});