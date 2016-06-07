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
const cp = require('child_process');
const Rx = require('@reactivex/rxjs');
const R = require('ramda');
const DEBUG = true;

function log() {
  if (DEBUG) {
    console.log(...arguments);
  }
  else return () => {
  };
}
/**
 * Helper method to create a Pure Process Fn
 * @param appPath: string
 * @param output: fn
 */
function runApp(appPath, output) {
  //Create the process
  let proc = cp.fork(appPath);
  //Log the process pid
  log(`New ${appPath} Process started: ${proc.pid}`);
  //Setup the callback (output function)
  proc.on('message', output);
  //Log the exit|death 
  proc.on('exit', function () {
    log(`Process with pid ${proc.pid} has ended`);
  });
  //Return the process object for more fun
  return proc;
}

//O(n) where n = length of knownNames
function name_match(knownNames, name, callback) {
  const comps = ['exact', 'arrayMatch', 'ldDistance'];
  //Reduce the matches to a true or false
  const matchReducer = R.reduce((match, value) => value === true ? true : match, false);
  const matchSubject = new Rx.Subject();
  //Map over known names and run comparisons return match status back into a new arr
  let sent = 0, returned = 0;
  comps.forEach((compApp, index) => {
    let proc = runApp(`./comparisons/${compApp}`, (msg) => {
      returned += 1;
      matchSubject.next(Rx.Observable.of(msg));
      log(compApp, knownNames, name, msg);
      if (sent === returned) {
        matchSubject.complete();
      }
    });
    proc.send({names: knownNames, name});
    sent += 1;
  });

  matchSubject
  //Merge all result arrs with other arrs
    .zipAll()
    //Take emissions
    .subscribe(
      (result) => {
        let onlyTrueReducer = (carry, value) => {
          return value === true || carry === true ? true : false;
        };
        let flattenReduce = R.compose(R.reduce(onlyTrueReducer, false), R.flatten);
        let matchResult = flattenReduce(result);
        callback(null, matchResult)
      },
      (error) => {
        callback(error, null);
      },
      ()=> log('done')
    );
}

var known_names = ["Alphonse Gabriel Capone", "Al Capone"];

name_match(known_names, "Alphonse Gabriel Capone", (error, result) => {
  if (result !== true) {
    console.log('error1');
  }
});

name_match(known_names, "Al Capone", (error, result) => {
  if (result !== true) {
    console.log('error2');
  }
});

name_match(known_names, "Alphonse Francis Capone", (error, result) => {
  if (result !== false) {
    console.log('error3');
  }
});

//CHANGE INPUTS
known_names = ["Alphonse Capone"];

name_match(known_names, "Alphonse Gabriel Capone", (error, result) => {
  if (result !== true) {
    console.log('error4');
  }
});

name_match(known_names, "Alexander Capone", (error, result) => {
  if (result !== false) {
    console.log('error5');
  }
});

known_names = ["Alphonse Gabriel Capone"];
name_match(known_names, "Alphonse Capone", (error, result) => {
  if (result !== true) {
    console.log('error6');
  }
});

var known_names = ["Alphonse Gabriel Capone", "Alphonse Francis Capone"];
name_match(known_names, "Alphonse Gabriel Capone", (error, result) => {
  if (result !== true) {
    console.log('error7');
  }
});

name_match(known_names, "Alphonse Francis Capone", (error, result) => {
  if (result !== true) {
    console.log('error8');
  }
});

name_match(known_names, "Alphonse Edward Capone", (error, result) => {
  if (result !== false) {
    console.log('error9');
  }
});

known_names = ["Alphonse Gabriel Capone", "Alphonse F Capone"];
name_match(known_names, "Alphonse G Capone", (error, result) => {
  if (result !== true) {
    console.log('error10');
  }
});

name_match(known_names, "Alphonse Francis Capone", (error, result) => {
  if (result !== true) {
    console.log('error11');
  }
});

name_match(known_names, "Alphonse E Capone", (error, result) => {
  if (result !== false) {
    console.log('error12');
  }
});

// var known_names = ["Alphonse Gabriel Capone"];
// if (name_match(known_names, "Gabriel Alphonse Capone") !== true) {
//   console.log('error13');
// }
// if (name_match(known_names, "Gabriel Capone") !== true) {
//   console.log('error14');
// }
// if (name_match(known_names, "Gabriel A Capone") !== true) {
//   console.log('error15');
// }
// if (name_match(known_names, "Capone Francis Alphonse") !== false) {
//   console.log('error16');
// }
//
// var known_names = ["Alphonse Capone"];
// if (name_match(known_names, "Alphonce Capone") !== true) {
//   console.log('error17');
// }
// if (name_match(known_names, "Alphonce Capome") !== true) {
//   console.log('error18');
// }
// if (name_match(known_names, "Alphons Capon") !== true) {
//   console.log('error19');
// }
// if (name_match(known_names, "Alphosne Capone") !== false) {
//   console.log('error20');
// }
// if (name_match(known_names, "Alfonse Capone") !== false) {
//   console.log('error21');
// }
