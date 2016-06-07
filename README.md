# My solution to a coding interview problem
Run it by installing deps with `npm install` and then `node index.js` use node version `6.2.0`.
# Solution
Jump to https://github.com/austbot/checkr-pattern-match/blob/master/index.js#L120 to see my solution.

This is the concurrent version. It needs logic to give weights to comparisons. Since they are all happening concurrently they arent going to communicate when one terminates. The host process could handle that but they will all get done very quickly so the chances of them talking are slim. So I think having a weight fixture or object that gives the comparison functions a precidence would fix it.

Then the final result reducer can give a solid true or false based on the boolean returned and the weight of the algorithms.
