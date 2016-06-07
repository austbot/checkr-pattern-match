# My solution to a coding interview problem
Run it by installing deps with `npm install` and then `node index.js` use node version `6.2.0`.
# Solution
Jump to https://github.com/austbot/checkr-pattern-match/blob/master/index.js#L120 to see my solution.

## Possible improvements / TODO
* Refactor to make code less complex
* Hoist difference, intersection and prop lookups into curried function vars above.
* Find common denominators in tests cases and move them into their own functions for individual metrics/comparisons.
* With the above then you can make sepearate processes out of each test metric or comparison and create a concurrent matching function that could recive a callback or return a promise to be resolved when all metrics are complete. 