'use strict';
const R = require('ramda');
function arrayMatch({names, name}) {
  const split = R.split(' ');
  const nameParts = split(name);
  return names.map((n) => {
    let nParts = split(n);
    let intersection = R.intersection(nameParts, nParts);
    if (intersection.length < 2) return false;
    if (nParts.length === intersection.length
      || nameParts.length === intersection.length) return true;
    //If we know we have three parts and the intersection is missing one part
    if (nParts.length == 3 && nameParts.length === 3 && intersection.length === 2) {
      //Compare the first letter of the middle part
      if (R.head(nParts[1]) === R.head(nameParts[1])) return true;
    }
    //Find the difference between the two word arrays so we can look in more detail at why we aren't finding a middle name match
    let difference = R.difference(nameParts, nParts);
    //We know two words match but we have a difference
    if (intersection.length == 2 && difference.length > 0) {
      let matcher = false;
      //For all the known name parts
      nParts.forEach((value) => {
        //Check to see if another part of the name matches the first char of the difference.
        if (R.head(value) === R.head(difference[0])) matcher = true;
      });
      //Return if the matcher is true, other wise we need to consider this Not a match.
      return matcher;
    }
    
  });
}
/**
 * When we get the input, run the function then die.
 */
process.on('message', function (data) {
  process.send(arrayMatch(data));
  process.exit();
});