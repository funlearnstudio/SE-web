// Regression tests for the browser-only SE simulator (no actual browser required).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync('lib/simulator.ts', 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;

function simulate(sourceCode, inputs = [], stdin = '') {
  const output = { exports: {} };
  const queue = [...inputs];
  const context = {
    module: output,
    exports: output.exports,
    require: (name) => {
      if (name === './modules') return { moduleByName: () => undefined };
      throw new Error('Unexpected simulator dependency: ' + name);
    },
    window: { prompt: () => queue.shift() ?? null },
    console
  };
  vm.runInNewContext(code, context, { filename: 'simulator.cjs' });
  return output.exports.runSeSimulation(sourceCode, stdin);
}

function output(sourceCode, lines) {
  const result = simulate(sourceCode, lines);
  assert.equal(result.error, undefined, result.error);
  return Array.from(result.output);
}

assert.deepEqual(output('ask a:Int b:Int\nsay a + b', ['10 20']), ['30']);
assert.deepEqual(output('ask name:Text age:Int height:Num\nsay name\nsay age\nsay height', ['Steve 16 170.5']), ['Steve', '16', '170.5']);
assert.deepEqual(output('ask first second\nsay first\nsay second', ['Hello SE']), ['Hello', 'SE']);
assert.deepEqual(output('name = ask "Name?"\nsay name', ['old behavior']), ['old behavior']);

for (const [line, expected] of [
  ['10', 'expected 2 values'],
  ['10 20 30', 'expected 2 values'],
  ['abc 20', 'needs Int'],
  ['10 abc', 'needs Int'],
  ['10 2.5', 'needs Int'],
]) {
  const result = simulate('ask a:Int b:Int\nsay a + b', [line]);
  assert.match(result.error ?? '', new RegExp(expected));
}
const fractional = simulate('ask a:Num b:Int\nsay a', ['invalid 2']);
assert.match(fractional.error ?? '', /needs Num/);

// SE 0.8.0 stdin and sized List regression: same source syntax as the CLI.
assert.deepEqual(Array.from(simulate(
  'read n:Int\nread a[n]:Int\ntotal = 0\nfor x in a\n    total += x\nsay total',
  [], '5\n10 20\n30 40 50'
).output), ['150']);
assert.deepEqual(Array.from(simulate(
  'grid[2][3] = []\ngrid[1][2] = 42\nsay grid[1][2]\nsay grid[0].len'
).output), ['42', '3']);
assert.deepEqual(Array.from(simulate(
  'names[2]:Text = []\nnames[1] = "Steve"\nsay names[1]\nflags[2]:Bool = []\nflags[0] = true\nsay flags[0]'
).output), ['Steve', 'true']);
assert.deepEqual(Array.from(simulate(
  'read enabled:Bool\nread score:Num\nsay enabled\nsay score', [], 'true 3.5'
).output), ['true', '3.5']);
assert.deepEqual(Array.from(simulate('read nums[0]:Int\nsay nums.len').output), ['0']);
for (const [program, input, expected] of [
  ['read x:Int', 'bad', /needs Int/],
  ['read x:Num', 'nope', /needs Num/],
  ['read x:Bool', 'yes', /needs Bool/],
  ['read x:Int', '', /unexpected end/],
  ['read nums[3]:Int', '1 2', /unexpected end/],
  ['grid[-1][4] = []', '', /dimensions/],
  ['grid[1001][1001] = []', '', /exceeds/],
  ['a[2] = []\\na[2] = 3', '', /out of bounds/]
]) {
  const result = simulate(program.replace(/\\n/g, '\n'), [], input);
  assert.match(result.error ?? '', expected, program);
}
console.log('SE Web simulator: SE 0.8.0 input, sized arrays and legacy ask regressions passed.');
