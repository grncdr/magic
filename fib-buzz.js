/**
 * FibBuzz
 *
 * Uses pattern matching from sparker & generators in the same file
 */

requireMacros('sparkler/macros');

var fibs = fibGenerator();

for (var n = 0; n < 10; n++) {
  var f = fibs.next().value;
  var c = chooseColor(f);
  console.log(f, c);
}

/**
 * Using sparkler pattern matching
 */
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
