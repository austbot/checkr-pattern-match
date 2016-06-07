'use strict';

/******************
 * Description:
 *   At Checkr, one of the most important aspects of accurately matching
 *   records to candidates is ensuring that the name in the record matches
 *   the name or a known alias of the candidate. In this exercise, you’ll
 *   build a method name_match? that receives an array of known names and a
 *   name from a record to match.
 *
 *   This method should pass the following tests:
 *
 *   Cases (we should provide positive and negative examples for each):
 *
 *   1. Exact match
 *
 *     Known aliases
 *       Alphonse Gabriel Capone
 *       Al Capone
 *
 *     Name returned on record
 *       Alphonse Gabriel Capone (positive)
 *       Al Capone (positive)
 *       Alphonse Francis Capone (negative)
 *
 *   2. Middle name unknown match (alias list)
 *
 *     Known aliases
 *       Alphonse Capone
 *
 *     Name returned on record
 *       Alphonse Gabriel Capone (positive)
 *       Alexander Capone (negative)
 *
 *   3. Middle name unknown match (criminal record)
 *
 *     Known aliases
 *       Alphonse Gabriel Capone
 *
 *     Name returned on record
 *       Alphonse Capone (positive)
 *
 *   4. Multiple middle name aliases
 *
 *     Known aliases
 *       Alphonse Gabriel Capone
 *       Alphonse Francis Capone
 *
 *     Name returned on record
 *       Alphonse Gabriel Capone (positive)
 *       Alphonse Francis Capone (positive)
 *       Alphonse Edward Capone (negative)
 *
 *   5. Middle name and middle initials match
 *
 *     Known aliases
 *       Alphonse Gabriel Capone
 *       Alphonse F Capone
 *
 *     Name returned on record
 *       Alphonse G Capone (positive)
 *       Alphonse Francis Capone (positive)
 *       Alphonse E Capone (negative)
 *
 *   6. Name transposition
 *
 *     Known aliases
 *       Alphonse Gabriel Capone
 *
 *     Name returned on record
 *       Gabriel Alphonse Capone (positive)
 *       Gabriel Capone (positive)
 *       Capone Francis Alphonse (negative)
 *
 *   7. Misspellings (threshold: Damerau–Levenshtein distance 1)
 *
 *     Known aliases
 *       Alphonse Capone
 *
 *     Name returned on record
 *       Alphonce Capone (positive)
 *       Alphosne Capone (positive)
 *       Alfonse Capone (negative)
 *
 *   8. Nickname match (Optional)
 *
 *     Known aliases
 *       Alphonse Capone
 *
 *     Name returned on record
 *       Al Capone (positive)
 *       Albert Capone (negative)
 *
 *     Known aliases
 *       Theodore Kaczynski
 *
 *     Name returned on record
 *       Ted Kaczynski (positive)
 *       Teddy Kaczynski (positive)
 *       Tommy Kaczynski (negative)
 *
 *   Checkr Glossary :
 *
 *     Candidate:
 *       An applicant for a position that consented for Checkr to run a
 *       Background Check on our client’s behalf.
 *
 *     Client:
 *       An entity contracting with Checkr to do background checks on
 *       their behalf.
 *
 *     Record:
 *       A document containing information that may be relevant to hiring
 *       decisions made by Checkr’s client.
 *
 */
const R = require('ramda');
const LD = require('damerau-levenshtein');
//O(n) where n = length of knownNames
function name_match(knownNames, name) {
  let incomingNameParts = name.split(' ');
  //Reduce the matches to a true or false
  return R.reduce((match, value) => {
      return value === true ? true : match;
    }, false,
    //Map over known names and run comparisons return match status back into a new arr
    R.map((knownName, index) => {
      //console.log("KNOWN", knownName, "INCOMING", name);
      //Exact match
      if (knownName === name) return true;
      //Split strings into word parts
      let knownNameParts = knownName.split(' ');
      //Find common words
      let intersection = R.intersection(incomingNameParts, knownNameParts);
      //If we have a common length between the intersection and the incoming words
      if (knownNameParts.length === intersection.length
        || incomingNameParts.length === intersection.length) return true;
      //If we know we have three parts and the intersection is missing one part
      if (knownNameParts.length == 3 && incomingNameParts.length === 3 && intersection.length === 2) {
        //Compare the first letter of the middle part
        if (R.head(knownNameParts[1]) === R.head(incomingNameParts[1])) return true;
      }
      //Find the difference between the two word arrays so we can look in more detail at why we aren't finding a middle name match
      let difference = R.difference(incomingNameParts, knownNameParts);
      //We know two words match but we have a difference
      if (intersection.length == 2 && difference.length > 0) {
        let matcher = false;
        //For all the known name parts
        knownNameParts.forEach((value) => {
          //Check to see if another part of the name matches the first char of the difference.
          if (R.head(value) === R.head(difference[0])) matcher = true;
        });
        //Return if the matcher is true, other wise we need to consider this Not a match.
        if (matcher) return true;
        else return false;
      }

      if (incomingNameParts.length === knownNameParts.length) {
        let distanceArr = incomingNameParts.map((word, index) => {
          let {steps} = LD(word, knownNameParts[index]);
          return steps;
        });
        let distanceTotal = R.reduce(R.add, 0, distanceArr);
        if (distanceTotal <= incomingNameParts.length &&
          distanceArr.indexOf(2) === -1) return true;
      }

      if (intersection.length < 2) return false;
    }, knownNames)
  );
  // console.log(matcheResults);
}


function test() {
  var known_names = ["Alphonse Gabriel Capone", "Al Capone"];
  if (name_match(known_names, "Alphonse Gabriel Capone") !== true) {
    console.log('error1');
  }
  if (name_match(known_names, "Al Capone") !== true) {
    console.log('error2');
  }
  if (name_match(known_names, "Alphonse Francis Capone") !== false) {
    console.log('error3');
  }

  var known_names = ["Alphonse Capone"];
  if (name_match(known_names, "Alphonse Gabriel Capone") !== true) {
    console.log('error4');
  }
  if (name_match(known_names, "Alexander Capone") !== false) {
    console.log('error5');
  }

  var known_names = ["Alphonse Gabriel Capone"];
  if (name_match(known_names, "Alphonse Capone") !== true) {
    console.log('error6');
  }

  var known_names = ["Alphonse Gabriel Capone", "Alphonse Francis Capone"];
  if (name_match(known_names, "Alphonse Gabriel Capone") !== true) {
    console.log('error7');
  }
  if (name_match(known_names, "Alphonse Francis Capone") !== true) {
    console.log('error8');
  }
  if (name_match(known_names, "Alphonse Edward Capone") !== false) {
    console.log('error9');
  }

  var known_names = ["Alphonse Gabriel Capone", "Alphonse F Capone"];
  if (name_match(known_names, "Alphonse G Capone") !== true) {
    console.log('error10');
  }
  if (name_match(known_names, "Alphonse Francis Capone") !== true) {
    console.log('error11');
  }
  if (name_match(known_names, "Alphonse E Capone") !== false) {
    console.log('error12');
  }

  var known_names = ["Alphonse Gabriel Capone"];
  if (name_match(known_names, "Gabriel Alphonse Capone") !== true) {
    console.log('error13');
  }
  if (name_match(known_names, "Gabriel Capone") !== true) {
    console.log('error14');
  }
  if (name_match(known_names, "Gabriel A Capone") !== true) {
    console.log('error15');
  }
  if (name_match(known_names, "Capone Francis Alphonse") !== false) {
    console.log('error16');
  }

  var known_names = ["Alphonse Capone"];
  if (name_match(known_names, "Alphonce Capone") !== true) {
    console.log('error17');
  }
  if (name_match(known_names, "Alphonce Capome") !== true) {
    console.log('error18');
  }
  if (name_match(known_names, "Alphons Capon") !== true) {
    console.log('error19');
  }
  if (name_match(known_names, "Alphosne Capone") !== false) {
    console.log('error20');
  }
  if (name_match(known_names, "Alfonse Capone") !== false) {
    console.log('error21');
  }
}
test();