// Regression tests for the browser-only SE simulator (no actual browser required).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync('lib/simulator.ts', 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;

function simulate(sourceCode, inputs) {
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
  return output.exports.runSeSimulation(sourceCode);
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
console.log('SE Web multi-variable ask: all regression tests passed.');
