export type SimulationResult = {
  output: string[];
  error?: string;
};

type Env = Record<string, unknown>;
type FunctionDef = { args: string[]; body: Node[]; closure: Env };

type Node =
  | { type: 'stmt'; text: string; line: number }
  | { type: 'if'; branches: { condition: string | null; body: Node[] }[]; line: number }
  | { type: 'repeat'; expr: string; body: Node[]; line: number }
  | { type: 'for'; vars: string[]; expr: string; body: Node[]; line: number }
  | { type: 'while'; expr: string; body: Node[]; line: number }
  | { type: 'make'; name: string; args: string[]; body: Node[]; line: number };

type SourceLine = { text: string; indent: number; line: number };

type ExecContext = {
  output: string[];
  functions: Map<string, FunctionDef>;
  steps: number;
};

const MAX_STEPS = 12000;

function cleanSource(source: string): SourceLine[] {
  return source.split(/\r?\n/).map((raw, index) => {
    const expanded = raw.replace(/\t/g, '    ');
    const match = expanded.match(/^(\s*)/);
    return { text: expanded.trim(), indent: match ? match[1].length : 0, line: index + 1 };
  });
}

function nextContent(lines: SourceLine[], from: number) {
  let i = from;
  while (i < lines.length && (!lines[i].text || lines[i].text.startsWith('#'))) i += 1;
  return i;
}

function parseBlock(lines: SourceLine[], start: number, indent: number): { nodes: Node[]; end: number } {
  const nodes: Node[] = [];
  let i = start;

  while (i < lines.length) {
    i = nextContent(lines, i);
    if (i >= lines.length) break;
    const current = lines[i];
    if (current.indent < indent) break;
    if (current.indent > indent) throw new Error(`Line ${current.line}: unexpected indentation.`);

    const childStart = nextContent(lines, i + 1);
    const childIndent = childStart < lines.length ? lines[childStart].indent : indent;
    const parseChild = () => {
      if (childStart >= lines.length || childIndent <= indent) throw new Error(`Line ${current.line}: expected an indented block.`);
      return parseBlock(lines, childStart, childIndent);
    };

    if (current.text.startsWith('if ')) {
      const branches: { condition: string | null; body: Node[] }[] = [];
      let condition = current.text.slice(3).trim();
      let parsed = parseChild();
      branches.push({ condition, body: parsed.nodes });
      i = parsed.end;

      while (true) {
        const j = nextContent(lines, i);
        if (j >= lines.length || lines[j].indent !== indent) break;
        const branch = lines[j].text;
        if (branch.startsWith('else if ')) {
          const k = nextContent(lines, j + 1);
          if (k >= lines.length || lines[k].indent <= indent) throw new Error(`Line ${lines[j].line}: expected an indented block.`);
          parsed = parseBlock(lines, k, lines[k].indent);
          branches.push({ condition: branch.slice(8).trim(), body: parsed.nodes });
          i = parsed.end;
          continue;
        }
        if (branch === 'else') {
          const k = nextContent(lines, j + 1);
          if (k >= lines.length || lines[k].indent <= indent) throw new Error(`Line ${lines[j].line}: expected an indented block.`);
          parsed = parseBlock(lines, k, lines[k].indent);
          branches.push({ condition: null, body: parsed.nodes });
          i = parsed.end;
        }
        break;
      }
      nodes.push({ type: 'if', branches, line: current.line });
      continue;
    }

    if (current.text.startsWith('repeat ')) {
      const parsed = parseChild();
      nodes.push({ type: 'repeat', expr: current.text.slice(7).trim(), body: parsed.nodes, line: current.line });
      i = parsed.end;
      continue;
    }

    if (current.text.startsWith('for ')) {
      const match = current.text.match(/^for\s+(.+?)\s+in\s+(.+)$/);
      if (!match) throw new Error(`Line ${current.line}: invalid for syntax.`);
      const parsed = parseChild();
      nodes.push({ type: 'for', vars: match[1].trim().split(/\s+/), expr: match[2].trim(), body: parsed.nodes, line: current.line });
      i = parsed.end;
      continue;
    }

    if (current.text.startsWith('while ')) {
      const parsed = parseChild();
      nodes.push({ type: 'while', expr: current.text.slice(6).trim(), body: parsed.nodes, line: current.line });
      i = parsed.end;
      continue;
    }

    if (current.text.startsWith('make ')) {
      let parts = current.text.slice(5).trim().split(/\s+/);
      const name = parts.shift();
      if (!name) throw new Error(`Line ${current.line}: missing function name.`);
      const arrow = parts.indexOf('->');
      if (arrow >= 0) parts = parts.slice(0, arrow);
      const args = parts.map((part) => part.split(':')[0]);
      const parsed = parseChild();
      nodes.push({ type: 'make', name: name.replace(/\[.*\]$/, ''), args, body: parsed.nodes, line: current.line });
      i = parsed.end;
      continue;
    }

    if (current.text.startsWith('else') || current.text.startsWith('case ')) break;
    nodes.push({ type: 'stmt', text: current.text, line: current.line });
    i += 1;
  }

  return { nodes, end: i };
}

function splitArgs(input: string): string[] {
  const args: string[] = [];
  let current = '';
  let quote = '';
  let depth = 0;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      current += ch;
      if (ch === quote && input[i - 1] !== '\\') quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; current += ch; continue; }
    if (ch === '[' || ch === '(') { depth += 1; current += ch; continue; }
    if (ch === ']' || ch === ')') { depth -= 1; current += ch; continue; }
    if (/\s/.test(ch) && depth === 0) {
      if (current) { args.push(current); current = ''; }
      continue;
    }
    current += ch;
  }
  if (current) args.push(current);
  return args;
}


function splitComma(input: string): string[] {
  const out: string[] = [];
  let current = '';
  let quote = '';
  let depth = 0;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      current += ch;
      if (ch === quote && input[i - 1] !== '\\') quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; current += ch; continue; }
    if (ch === '[' || ch === '(') { depth += 1; current += ch; continue; }
    if (ch === ']' || ch === ')') { depth -= 1; current += ch; continue; }
    if (ch === ',' && depth === 0) {
      if (current.trim()) out.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function format(value: unknown): string {
  if (value === null || value === undefined) return 'none';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value) || typeof value === 'object') {
    try { return JSON.stringify(value); } catch { return String(value); }
  }
  return String(value);
}

function range(start: number, end: number, step = 1) {
  const out: number[] = [];
  if (step === 0) throw new Error('range step cannot be 0');
  if (step > 0) for (let n = start; n <= end; n += step) out.push(n);
  else for (let n = start; n >= end; n += step) out.push(n);
  return out;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function variance(values: number[], sample: boolean) {
  if (!values.length || (sample && values.length < 2)) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const divisor = sample ? values.length - 1 : values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / divisor;
}

function moduleCall(moduleName: string, member: string, args: unknown[]): unknown {
  const nums = (value: unknown) => (Array.isArray(value) ? value.map(Number) : []);
  const text = (value: unknown) => String(value ?? '');
  const modules: Record<string, Record<string, (...a: unknown[]) => unknown>> = {
    math: {
      sqrt: (x) => Math.sqrt(Number(x)), cbrt: (x) => Math.cbrt(Number(x)), abs: (x) => Math.abs(Number(x)),
      floor: (x) => Math.floor(Number(x)), ceil: (x) => Math.ceil(Number(x)), round: (x) => Math.round(Number(x)),
      sin: (x) => Math.sin(Number(x)), cos: (x) => Math.cos(Number(x)), tan: (x) => Math.tan(Number(x)),
      pow: (a, b) => Number(a) ** Number(b), min: (...v) => Math.min(...v.map(Number)), max: (...v) => Math.max(...v.map(Number)),
      clamp: (v, lo, hi) => Math.min(Number(hi), Math.max(Number(lo), Number(v))),
      factorial: (n) => { let r = 1; for (let i = 2; i <= Number(n); i += 1) r *= i; return r; },
      sum: (v) => nums(v).reduce((a, b) => a + b, 0), mean: (v) => nums(v).reduce((a, b) => a + b, 0) / Math.max(1, nums(v).length), median: (v) => median(nums(v))
    },
    statistics: {
      mean: (v) => nums(v).reduce((a, b) => a + b, 0) / Math.max(1, nums(v).length), median: (v) => median(nums(v)),
      variance: (v) => variance(nums(v), true), pvariance: (v) => variance(nums(v), false),
      stdev: (v) => Math.sqrt(variance(nums(v), true)), pstdev: (v) => Math.sqrt(variance(nums(v), false))
    },
    text: {
      trim: (v) => text(v).trim(), contains: (v, q) => text(v).includes(text(q)), starts: (v, q) => text(v).startsWith(text(q)),
      ends: (v, q) => text(v).endsWith(text(q)), replace: (v, a, b) => text(v).split(text(a)).join(text(b)),
      split: (v, sep) => text(v).split(text(sep)), join: (v, sep) => Array.isArray(v) ? v.join(text(sep)) : '', repeat: (v, n) => text(v).repeat(Number(n))
    },
    collections: {
      reverse: (v) => Array.isArray(v) ? [...v].reverse() : v, contains: (v, q) => Array.isArray(v) ? v.includes(q) : false,
      first: (v) => Array.isArray(v) ? v[0] : undefined, last: (v) => Array.isArray(v) ? v[v.length - 1] : undefined,
      unique: (v) => Array.isArray(v) ? [...new Set(v)] : v, sort: (v) => Array.isArray(v) ? [...v].sort((a,b)=>Number(a)-Number(b)) : v,
      keys: (v) => v && typeof v === 'object' ? Object.keys(v as Record<string, unknown>) : [],
      values: (v) => v && typeof v === 'object' ? Object.values(v as Record<string, unknown>) : [],
      slice: (v,a,b) => Array.isArray(v) ? v.slice(Number(a), Number(b)) : [], take: (v,n) => Array.isArray(v) ? v.slice(0, Number(n)) : [], drop: (v,n) => Array.isArray(v) ? v.slice(Number(n)) : []
    },
    json: { parse: (v) => JSON.parse(text(v)), stringify: (v) => JSON.stringify(v), pretty: (v) => JSON.stringify(v, null, 2) },
    random: { int: (a,b) => Math.floor(Math.random() * (Number(b)-Number(a)+1)) + Number(a), num: () => Math.random() },
    base64: { encode: (v) => btoa(unescape(encodeURIComponent(text(v)))), decode: (v) => decodeURIComponent(escape(atob(text(v)))) },
    uuid: { v4: () => crypto.randomUUID(), valid: (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text(v)) },
    re: {
      find_all: (pattern, value) => Array.from(text(value).matchAll(new RegExp(text(pattern), 'g')), (m) => m[0]),
      count: (pattern, value) => Array.from(text(value).matchAll(new RegExp(text(pattern), 'g'))).length,
      escape: (value) => text(value).replace(/[.*+?^${}()|[\]\\]/g, '\\    iter: {
'),
      groups: (pattern, value) => { const m = text(value).match(new RegExp(text(pattern))); return m ? m.slice(1) : []; },
      match: (pattern, value) => new RegExp('^(?:' + text(pattern) + ')').test(text(value)),
      search: (pattern, value) => new RegExp(text(pattern)).test(text(value)),
      replace: (value, pattern, replacement) => text(value).replace(new RegExp(text(pattern), 'g'), text(replacement)),
      split: (pattern, value) => text(value).split(new RegExp(text(pattern)))
    },
    itertools: {
      chain: (...lists) => lists.flatMap((v) => Array.isArray(v) ? v : []),
      flatten: (v) => Array.isArray(v) ? v.flat(1) : [],
      chunked: (v, n) => { const xs = Array.isArray(v) ? v : []; const size = Math.floor(Number(n)); if (size < 1) throw new Error('Chunk size must be positive.'); return Array.from({length: Math.ceil(xs.length / size)}, (_, i) => xs.slice(i * size, (i + 1) * size)); },
      take: (v, n) => Array.isArray(v) ? v.slice(0, Number(n)) : [],
      drop: (v, n) => Array.isArray(v) ? v.slice(Number(n)) : [],
      windows: (v, n) => { const xs = Array.isArray(v) ? v : []; const size = Math.floor(Number(n)); if (size < 1) throw new Error('Window size must be positive.'); return Array.from({length: Math.max(0, xs.length - size + 1)}, (_, i) => xs.slice(i, i + size)); },
      cycle: (v, n) => Array.isArray(v) ? Array.from({length: Math.max(0, Math.floor(Number(n)))}, () => v).flat() : [],
      pairs: (v) => Array.isArray(v) ? v.slice(1).map((x, i) => [v[i], x]) : [],
      unique: (v) => Array.isArray(v) ? [...new Set(v)] : []
    },
    iter: {
      range: (...v) => v.length === 1 ? range(0, Number(v[0]) - 1) : range(Number(v[0]), Number(v[1]), v[2] === undefined ? 1 : Number(v[2])),
      enumerate: (v) => Array.isArray(v) ? v.map((x,i)=>[i,x]) : [],
      zip: (a,b) => Array.isArray(a) && Array.isArray(b) ? a.slice(0, Math.min(a.length,b.length)).map((x,i)=>[x,b[i]]) : []
    },
    option: { some: (v) => ({ some: true, value: v }), none: () => ({ some: false }), is_some: (v) => Boolean((v as {some?: boolean})?.some), is_none: (v) => !Boolean((v as {some?: boolean})?.some), value: (v) => (v as {value?: unknown})?.value, or: (v,f) => (v as {some?: boolean;value?:unknown})?.some ? (v as {value?:unknown}).value : f },
    result: { ok: (v) => ({ ok: true, value: v }), err: (v) => ({ ok: false, error: text(v) }), is_ok: (v) => Boolean((v as {ok?:boolean})?.ok), is_err: (v) => !Boolean((v as {ok?:boolean})?.ok), value: (v) => (v as {value?:unknown})?.value, error: (v) => (v as {error?:unknown})?.error, or: (v,f) => (v as {ok?:boolean;value?:unknown})?.ok ? (v as {value?:unknown}).value : f },
    typing: { type_of: (v) => Array.isArray(v) ? 'List' : v === null ? 'None' : typeof v === 'number' ? (Number.isInteger(v) ? 'Int' : 'Num') : typeof v === 'string' ? 'Text' : typeof v === 'boolean' ? 'Bool' : 'Map', is: (v,t) => moduleCall('typing','type_of',[v]) === t, cast: (v) => v }
  };
  if (moduleName === 'math' && member === 'pi') return Math.PI;
  if (moduleName === 'math' && member === 'e') return Math.E;
  if (moduleName === 'math' && member === 'tau') return Math.PI * 2;
  if (moduleName === 'math' && member === 'inf') return Infinity;
  if (moduleName === 'random' && member === 'num') return Math.random();
  if (moduleName === 'uuid' && member === 'v4') return crypto.randomUUID();
  const fn = modules[moduleName]?.[member];
  if (!fn) throw new Error(`Playground: ${moduleName}.${member} is documented but not simulated in-browser.`);
  return fn(...args);
}

function getTopLevelRange(expr: string) {
  let quote = ''; let depth = 0;
  for (let i = 0; i < expr.length - 1; i += 1) {
    const ch = expr[i];
    if (quote) { if (ch === quote && expr[i - 1] !== '\\') quote = ''; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '[' || ch === '(') depth += 1;
    else if (ch === ']' || ch === ')') depth -= 1;
    else if (depth === 0 && ch === '.' && expr[i + 1] === '.') return i;
  }
  return -1;
}

function evaluateExpression(expr: string, env: Env, context: ExecContext): unknown {
  expr = expr.trim();
  if (!expr) return null;
  if (expr.startsWith('try ')) return evaluateExpression(expr.slice(4), env, context);
  if (expr.startsWith('ask ')) {
    const promptText = format(evaluateExpression(expr.slice(4), env, context));
    return typeof window !== 'undefined' ? (window.prompt(promptText) ?? '') : '';
  }
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  if (expr === 'none' || expr === 'None') return null;

  const rangeAt = getTopLevelRange(expr);
  if (rangeAt >= 0) return range(Number(evaluateExpression(expr.slice(0, rangeAt), env, context)), Number(evaluateExpression(expr.slice(rangeAt + 2), env, context)));

  const membership = expr.match(/^(.+?)\s+in\s+(.+)$/);
  if (membership) {
    const value = evaluateExpression(membership[1], env, context);
    const collection = evaluateExpression(membership[2], env, context);
    return Array.isArray(collection) ? collection.includes(value) : collection && typeof collection === 'object' ? String(value) in (collection as object) : false;
  }

  if (/^\[[\s\S]*\]$/.test(expr) && expr.includes(':')) {
    const inner = expr.slice(1, -1);
    const pairs = splitComma(inner);
    const out: Record<string, unknown> = {};
    for (const pair of pairs) {
      const colon = pair.indexOf(':');
      if (colon < 0) continue;
      const key = evaluateExpression(pair.slice(0, colon), env, context);
      out[String(key)] = evaluateExpression(pair.slice(colon + 1), env, context);
    }
    return out;
  }

  const memberMutation = expr.match(/^([A-Za-z_]\w*)\.(add|append)\s+([\s\S]+)$/);
  if (memberMutation) {
    const target = env[memberMutation[1]];
    const value = evaluateExpression(memberMutation[3], env, context);
    if (Array.isArray(target)) { target.push(value); return target; }
    if (target instanceof Set) { target.add(value); return target; }
    throw new Error(`${memberMutation[1]}.${memberMutation[2]} requires a List or Set in this simulator.`);
  }

  const moduleMatch = expr.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)(?:\s+([\s\S]*))?$/);
  if (moduleMatch) {
    const [, moduleName, member, rest = ''] = moduleMatch;
    const knownModuleNames = ['math','statistics','text','collections','json','random','base64','uuid','iter','itertools','re','option','result','typing'];
    if (knownModuleNames.includes(moduleName)) {
      const args = rest ? splitArgs(rest).map((arg) => evaluateExpression(arg, env, context)) : [];
      return moduleCall(moduleName, member, args);
    }
  }

  const firstSpace = expr.indexOf(' ');
  if (firstSpace > 0) {
    const name = expr.slice(0, firstSpace);
    if (context.functions.has(name)) {
      const args = splitArgs(expr.slice(firstSpace + 1)).map((arg) => evaluateExpression(arg, env, context));
      return callFunction(name, args, context);
    }
  }
  if (context.functions.has(expr)) return callFunction(expr, [], context);

  if (/^set\s+\[/.test(expr)) {
    const values = evaluateExpression(expr.slice(4), env, context);
    return Array.isArray(values) ? [...new Set(values)] : [];
  }
  if (/^bytes\s+/.test(expr)) return String(evaluateExpression(expr.slice(6), env, context));

  let js = expr
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/\bnot\b/g, '!')
    .replace(/\.len\b/g, '.length')
    .replace(/\.upper\b/g, '.toUpperCase()')
    .replace(/\.lower\b/g, '.toLowerCase()');

  if (/(?:\bwindow\b|\bdocument\b|\bglobalThis\b|\bFunction\b|\beval\b|\bconstructor\b|__proto__|\bfetch\b|XMLHttpRequest|localStorage|sessionStorage|\blocation\b|\bnavigator\b|\bimport\b|\brequire\b|\bprocess\b|;|`|\{|\})/.test(js)) {
    throw new Error('Playground blocked an expression that is outside the safe simulator subset.');
  }

  const names = Object.keys(env).filter((key) => /^[A-Za-z_]\w*$/.test(key));
  const values = names.map((name) => env[name]);
  try {
    // The expression is filtered and receives only the current simulator environment.
    return Function(...names, `"use strict"; return (${js});`)(...values);
  } catch {
    if (expr in env) return env[expr];
    throw new Error(`Cannot evaluate: ${expr}`);
  }
}

function callFunction(name: string, args: unknown[], context: ExecContext): unknown {
  const fn = context.functions.get(name);
  if (!fn) throw new Error(`Unknown function '${name}'.`);
  const local = Object.create(fn.closure) as Env;
  fn.args.forEach((arg, index) => { local[arg] = args[index]; });
  const result = executeNodes(fn.body, local, context);
  return result.returned ? result.value : null;
}

function executeStatement(text: string, line: number, env: Env, context: ExecContext): { returned: boolean; value?: unknown } {
  context.steps += 1;
  if (context.steps > MAX_STEPS) throw new Error('Execution stopped: simulator step limit reached.');
  if (!text || text.startsWith('#') || text.startsWith('use ')) return { returned: false };
  if (text.startsWith('say ')) {
    context.output.push(format(evaluateExpression(text.slice(4), env, context)));
    return { returned: false };
  }
  if (text === 'say') { context.output.push(''); return { returned: false }; }
  if (text.startsWith('give ')) return { returned: true, value: evaluateExpression(text.slice(5), env, context) };
  if (text.startsWith('fail ')) throw new Error(format(evaluateExpression(text.slice(5), env, context)));
  if (text.startsWith('wait ')) return { returned: false };

  const compound = text.match(/^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|%=)\s*(.+)$/);
  if (compound) {
    const [, name, op, rhs] = compound;
    const value = evaluateExpression(rhs, env, context);
    const current = Number(env[name]); const right = Number(value);
    env[name] = op === '+=' ? (typeof env[name] === 'string' ? String(env[name]) + String(value) : current + right) : op === '-=' ? current - right : op === '*=' ? current * right : op === '/=' ? current / right : current % right;
    return { returned: false };
  }

  const assign = text.match(/^([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/);
  if (assign) {
    env[assign[1]] = evaluateExpression(assign[2], env, context);
    return { returned: false };
  }

  evaluateExpression(text, env, context);
  return { returned: false };
}

function executeNodes(nodes: Node[], env: Env, context: ExecContext): { returned: boolean; value?: unknown } {
  for (const node of nodes) {
    context.steps += 1;
    if (context.steps > MAX_STEPS) throw new Error('Execution stopped: simulator step limit reached.');

    if (node.type === 'stmt') {
      const result = executeStatement(node.text, node.line, env, context);
      if (result.returned) return result;
      continue;
    }
    if (node.type === 'make') {
      context.functions.set(node.name, { args: node.args, body: node.body, closure: env });
      continue;
    }
    if (node.type === 'if') {
      for (const branch of node.branches) {
        if (branch.condition === null || Boolean(evaluateExpression(branch.condition, env, context))) {
          const result = executeNodes(branch.body, env, context);
          if (result.returned) return result;
          break;
        }
      }
      continue;
    }
    if (node.type === 'repeat') {
      const count = Math.max(0, Math.floor(Number(evaluateExpression(node.expr, env, context))));
      for (let i = 0; i < count; i += 1) {
        const result = executeNodes(node.body, env, context);
        if (result.returned) return result;
      }
      continue;
    }
    if (node.type === 'for') {
      const iterable = evaluateExpression(node.expr, env, context);
      if (Array.isArray(iterable)) {
        for (const value of iterable) {
          if (node.vars.length >= 2 && Array.isArray(value)) { env[node.vars[0]] = value[0]; env[node.vars[1]] = value[1]; }
          else { env[node.vars[0]] = value; }
          const result = executeNodes(node.body, env, context);
          if (result.returned) return result;
        }
      } else if (iterable && typeof iterable === 'object') {
        for (const [key, value] of Object.entries(iterable as Record<string, unknown>)) {
          env[node.vars[0]] = node.vars.length >= 2 ? key : value;
          if (node.vars.length >= 2) env[node.vars[1]] = value;
          const result = executeNodes(node.body, env, context);
          if (result.returned) return result;
        }
      }
      continue;
    }
    if (node.type === 'while') {
      let guard = 0;
      while (Boolean(evaluateExpression(node.expr, env, context))) {
        guard += 1;
        if (guard > 1000) throw new Error(`Line ${node.line}: while loop stopped after 1000 iterations.`);
        const result = executeNodes(node.body, env, context);
        if (result.returned) return result;
      }
    }
  }
  return { returned: false };
}

export function runSeSimulation(source: string): SimulationResult {
  try {
    const lines = cleanSource(source);
    const first = nextContent(lines, 0);
    if (first >= lines.length) return { output: [] };
    const parsed = parseBlock(lines, first, lines[first].indent);
    const context: ExecContext = { output: [], functions: new Map(), steps: 0 };
    const env: Env = {};
    executeNodes(parsed.nodes, env, context);
    return { output: context.output };
  } catch (error) {
    return { output: [], error: error instanceof Error ? error.message : String(error) };
  }
}
