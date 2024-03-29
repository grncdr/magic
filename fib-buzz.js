/**
 * FibBuzz
 *
 * Example of using pattern matching & generators in the same file, runs on node>=0.8
 * 
 * - Pattern matching macros come from https://github.com/natefaubion/sparkler
 * - Generators are compiled by https://github.com/facebook/regenerator
 */

requireMacros('sparkler/macros');

var fibs = fibGenerator();

for (var n = 0; n < 10; n++) {
  var f = fibs.next().value;
  var c = chooseColor(f);
  console.log(f, c);
}

function chooseColor {
  n @ Number if multipleOf(n, 15) => 'red',
  n @ Number if multipleOf(n, 3) => 'yellow',
  n @ Number if multipleOf(n, 5) => 'blue',
  n @ Number => 'black'
}

function multipleOf (n, div) {
  return (n % div) == 0;
}

function* fibGenerator () {
  var x = 1, y = 1;
  while (true) {
    yield x;
    x = x + y;
    yield y
    y = x + y;
  }
}
