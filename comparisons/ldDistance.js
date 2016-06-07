'use strict';
const R = require('ramda');
const LD = require('damerau-levenshtein');
function ldDistance({names, name}) {
  const split = R.split(' ');
  const nameParts = split(name);
  return names.map((n) => {
    let nParts = split(n);
    if (nameParts.length === nParts.length) {
      let distanceArr = nameParts.map((word, index) => {
        let {steps} = LD(word, nParts[index]);
        return steps;
      });
      let distanceTotal = R.reduce(R.add, 0, distanceArr);
      if (distanceTotal <= nameParts.length &&
        distanceArr.indexOf(2) === -1) return true;
      else return false;
    }
    else return false;
  });
}
/**
 * When we get the input, run the function then die.
 */
process.on('message', function (data) {
  process.send(ldDistance(data));
  process.exit();
});