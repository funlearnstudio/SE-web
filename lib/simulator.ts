import { moduleByName } from './modules';

export type SimulationResult = {
  output: string[];
  error?: string;
};

type Env = Record<string, unknown>;
type FunctionDef = { args: string[]; body: Node[]; closure: Env };

type Node =
  | { type: 'stmt'; text: string; line: number }
  | { type: 'if'; branches: { condition: string | null; body: Node[] }[]; line: number }
  | { type: 'match'; expr: string; cases: { pattern: string | null; body: Node[] }[]; line: number }
  | { type: 'try'; body: Node[]; errorName: string; fallback: Node[]; line: number }
  | { type: 'type'; name: string; body: Node[]; line: number }
  | { type: 'objectInit'; name: string; expr: string; body: Node[]; line: number }
  | { type: 'repeat'; expr: string; body: Node[]; line: number }
  | { type: 'for'; vars: string[]; expr: string; body: Node[]; line: number }
  | { type: 'while'; expr: string; body: Node[]; line: number }
  | { type: 'make'; name: string; args: string[]; body: Node[]; line: number };

type SourceLine = { text: string; indent: number; line: number };

type ExecContext = {
  output: string[];
  functions: Map<string, FunctionDef>;
  steps: number;
  virtualFiles: Map<string, string>;
  virtualDirectories: Set<string>;
  virtualDatabases: Map<string, Map<string, unknown>>;
  virtualRoutes: { method: string; path: string; handler: unknown }[];
};

const MAX_STEPS = 12000;

function stripComment(line: string): string {
  let quote = '';
  let escaped = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\' && quote) {
      escaped = true;
      continue;
    }
    if ((char === '"' || char === "'") && (!quote || quote === char)) {
      quote = quote ? '' : char;
      continue;
    }
    if (char === '#' && !quote) return line.slice(0, i);
  }

  return line;
}

function cleanSource(source: string): SourceLine[] {
  return source.split(/\r?\n/).map((raw, index) => {
    const expanded = stripComment(raw.replace(/\t/g, '    '));
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
        if (branch.startsWith('else if ') || branch.startsWith('elif ')) {
          const k = nextContent(lines, j + 1);
          if (k >= lines.length || lines[k].indent <= indent) throw new Error(`Line ${lines[j].line}: expected an indented block.`);
          parsed = parseBlock(lines, k, lines[k].indent);
          branches.push({ condition: branch.startsWith('elif ') ? branch.slice(5).trim() : branch.slice(8).trim(), body: parsed.nodes });
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

    const matchStatement = current.text.match(/^match\s+([\s\S]+)$/);
    if (matchStatement) {
      const cases: { pattern: string | null; body: Node[] }[] = [];
      let j = childStart;
      if (j >= lines.length || childIndent <= indent) throw new Error(`Line ${current.line}: expected case branches.`);
      const caseIndent = lines[j].indent;
      while (j < lines.length) {
        j = nextContent(lines, j);
        if (j >= lines.length || lines[j].indent < caseIndent) break;
        if (lines[j].indent !== caseIndent) throw new Error(`Line ${lines[j].line}: invalid match branch indentation.`);
        const caseLine = lines[j];
        const caseMatch = caseLine.text.match(/^case\s+([\s\S]+)$/);
        if (!caseMatch && caseLine.text !== 'else') throw new Error(`Line ${caseLine.line}: expected case or else in match.`);
        const bodyStart = nextContent(lines, j + 1);
        let body: Node[] = [];
        if (bodyStart < lines.length && lines[bodyStart].indent > caseIndent) {
          const parsedBody = parseBlock(lines, bodyStart, lines[bodyStart].indent);
          body = parsedBody.nodes;
          j = parsedBody.end;
        } else {
          j += 1;
        }
        cases.push({ pattern: caseMatch?.[1] ?? null, body });
      }
      nodes.push({ type: 'match', expr: matchStatement[1].trim(), cases, line: current.line });
      i = j;
      continue;
    }

    if (current.text === 'try') {
      const parsed = parseChild();
      let end = parsed.end;
      let errorName = 'err';
      let fallback: Node[] = [];
      const elseLine = nextContent(lines, end);
      if (elseLine < lines.length && lines[elseLine].indent === indent && lines[elseLine].text.startsWith('else')) {
        const branch = lines[elseLine].text.match(/^else(?:\s+(\w+))?$/);
        if (!branch) throw new Error(`Line ${lines[elseLine].line}: invalid try fallback syntax.`);
        errorName = branch[1] ?? 'err';
        const fallbackStart = nextContent(lines, elseLine + 1);
        if (fallbackStart < lines.length && lines[fallbackStart].indent > indent) {
          const caught = parseBlock(lines, fallbackStart, lines[fallbackStart].indent);
          fallback = caught.nodes;
          end = caught.end;
        } else end = elseLine + 1;
      }
      nodes.push({ type: 'try', body: parsed.nodes, errorName, fallback, line: current.line });
      i = end;
      continue;
    }

    const typeStatement = current.text.match(/^type\s+([A-Za-z_]\w*)(?:\[[^\]]*\])?$/);
    if (typeStatement) {
      const parsed = parseChild();
      nodes.push({ type: 'type', name: typeStatement[1], body: parsed.nodes, line: current.line });
      i = parsed.end;
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
    const assignmentWithBody = current.text.match(/^([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/);
    if (assignmentWithBody && childStart < lines.length && childIndent > indent) {
      const parsed = parseChild();
      nodes.push({ type: 'objectInit', name: assignmentWithBody[1], expr: assignmentWithBody[2], body: parsed.nodes, line: current.line });
      i = parsed.end;
      continue;
    }
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
  if (value instanceof Set) return JSON.stringify([...value]);
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

// Remove quoted literals before checking expression syntax. Literal contents may
// legitimately contain words such as "process" or JSON braces, and must not be
// mistaken for executable JavaScript by the browser safety guard.
function withoutStringLiterals(source: string) {
  let result = '';
  let quote = '';
  let escaped = false;
  for (const ch of source) {
    if (quote) {
      result += ' ';
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      result += ' ';
    } else result += ch;
  }
  return result;
}

function browserExtensionCall(moduleName: string, member: string, args: unknown[], context?: ExecContext): unknown {
  const a = args;
  const str = (v: unknown) => String(v ?? '');
  const list = (v: unknown) => Array.isArray(v) ? v : [];
  const n = (v: unknown) => Number(v);
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : Math.abs(x);
  const matrix = (v: unknown): number[][] => list(v).map((row) => list(row).map(Number));
  const product = (left: number[][], right: number[][]) => {
    if (!left.length || !right.length || left[0].length !== right.length) throw new Error('Matrix dimensions do not match.');
    return left.map((row) => right[0].map((_, j) => row.reduce((sum, value, k) => sum + value * right[k][j], 0)));
  };
  const stats = (xs: number[]) => ({ count: xs.length, sum: xs.reduce((s, x) => s + x, 0), mean: xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0 });

  switch (moduleName) {
    case 'file': case 'shutil': case 'path': case 'static': case 'upload': case 'glob': {
      const files = context?.virtualFiles ?? new Map<string, string>();
      const dirs = context?.virtualDirectories ?? new Set<string>();
      const normalize = (value: unknown) => str(value).replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/^\.\//, '').replace(/\/$/, '');
      const path = normalize(a[0]);
      if (moduleName === 'path') {
        if (member === 'join') return a.map(normalize).filter(Boolean).join('/');
        if (member === 'name') return path.split('/').pop() ?? '';
        if (member === 'ext') { const name = path.split('/').pop() ?? ''; return name.includes('.') ? `.${name.split('.').pop()}` : ''; }
        if (member === 'parent') return path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
        if (member === 'exists') return files.has(path) || dirs.has(path);
        if (member === 'is_file') return files.has(path);
        if (member === 'is_dir') return dirs.has(path);
      }
      if (moduleName === 'glob' && member === 'match') { const pattern = str(a[0]).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.'); return new RegExp(`^${pattern}$`).test(str(a[1])); }
      if (moduleName === 'glob' && member === 'find') { const pattern = str(a[0]).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.'); return [...files.keys()].filter((name) => new RegExp(`^${pattern}$`).test(name)); }
      if (moduleName === 'static' && member === 'mime') { const ext = str(a[0]).split('.').pop()?.toLowerCase(); return ({ html:'text/html', css:'text/css', js:'text/javascript', json:'application/json', png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', svg:'image/svg+xml', txt:'text/plain' } as Record<string, string>)[ext ?? ''] ?? 'application/octet-stream'; }
      if (moduleName === 'static' && member === 'read') { const root = normalize(a[0]), target = normalize(a[1]); if (target.startsWith('..') || target.startsWith('/')) throw new Error('Static path escapes its configured root.'); const key = [root, target].filter(Boolean).join('/'); if (!files.has(key)) throw new Error(`Virtual file not found: ${key}`); return files.get(key); }
      if (moduleName === 'upload' && member === 'save') { const root = normalize(a[0]), target = normalize(a[1]); if (target.startsWith('..') || target.startsWith('/')) throw new Error('Upload path escapes its configured root.'); const key = [root, target].filter(Boolean).join('/'); files.set(key, str(a[2])); return key; }
      if ((moduleName === 'file' || moduleName === 'shutil') && ['read','write','append','open','copy','move','copytree','remove','mkdir'].includes(member)) {
        if (member === 'read') { if (!files.has(path)) throw new Error(`Virtual file not found: ${path}`); return files.get(path); }
        if (member === 'write') { files.set(path, str(a[1])); return null; }
        if (member === 'append') { files.set(path, (files.get(path) ?? '') + str(a[1])); return null; }
        if (member === 'open') { if (!files.has(path)) files.set(path, ''); return path; }
        if (member === 'copy' || member === 'move') { const target = normalize(a[1]); if (!files.has(path)) throw new Error(`Virtual file not found: ${path}`); files.set(target, files.get(path) ?? ''); if (member === 'move') files.delete(path); return null; }
        if (member === 'copytree') { const source = `${path}/`; const target = `${normalize(a[1])}/`; for (const [name, value] of files) if (name.startsWith(source)) files.set(`${target}${name.slice(source.length)}`, value); return null; }
        if (member === 'remove') { files.delete(path); dirs.delete(path); for (const key of [...files.keys()]) if (key.startsWith(`${path}/`)) files.delete(key); return null; }
        if (member === 'mkdir') { dirs.add(path); return null; }
      }
      break;
    }
    case 'operator': {
      const left = a[0] as number | string, right = a[1] as number | string;
      const operations: Record<string, () => unknown> = { add: () => (left as never) + (right as never), sub: () => n(left) - n(right), mul: () => n(left) * n(right), div: () => n(left) / n(right), mod: () => n(left) % n(right), eq: () => left === right, ne: () => left !== right, lt: () => left < right, le: () => left <= right, gt: () => left > right, ge: () => left >= right };
      if (operations[member]) return operations[member]();
      break;
    }
    case 'math': {
      const x = n(a[0]), y = n(a[1]);
      const factorial = (value: number) => {
        if (!Number.isInteger(value) || value < 0 || value > 170) throw new Error('Expected an integer from 0 to 170.');
        let out = 1;
        for (let i = 2; i <= value; i += 1) out *= i;
        return out;
      };
      const choose = (count: number, selected: number) => selected < 0 || selected > count ? 0 : factorial(count) / (factorial(selected) * factorial(count - selected));
      const gamma = (z: number): number => {
        // Lanczos approximation, accurate enough for browser-side numeric work.
        const p = [676.5203681218851, -1259.1392167224028, 771.3234287776531, -176.6150291621406, 12.507343278686905, -0.13857109526572012, 9.984369578019572e-6, 1.5056327351493116e-7];
        if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
        const w = z - 1;
        let sum = 0.9999999999998099;
        p.forEach((coefficient, i) => { sum += coefficient / (w + i + 1); });
        const t = w + p.length - 0.5;
        return Math.sqrt(2 * Math.PI) * t ** (w + 0.5) * Math.exp(-t) * sum;
      };
      const erf = (value: number) => {
        const sign = value < 0 ? -1 : 1;
        const t = 1 / (1 + 0.3275911 * Math.abs(value));
        const polynomial = (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t);
        return sign * (1 - polynomial * Math.exp(-value * value));
      };
      const values = a.map(n);
      const gcd = (left: number, right: number): number => right ? gcd(right, left % right) : Math.abs(left);
      const operations: Record<string, () => unknown> = {
        sqrt: () => Math.sqrt(x), cbrt: () => Math.cbrt(x), abs: () => Math.abs(x), floor: () => Math.floor(x), ceil: () => Math.ceil(x), round: () => Math.round(x), trunc: () => Math.trunc(x),
        sin: () => Math.sin(x), cos: () => Math.cos(x), tan: () => Math.tan(x), asin: () => Math.asin(x), acos: () => Math.acos(x), atan: () => Math.atan(x),
        sinh: () => Math.sinh(x), cosh: () => Math.cosh(x), tanh: () => Math.tanh(x), asinh: () => Math.asinh(x), acosh: () => Math.acosh(x), atanh: () => Math.atanh(x),
        exp: () => Math.exp(x), exp2: () => 2 ** x, expm1: () => Math.expm1(x), log: () => Math.log(x), log10: () => Math.log10(x), log2: () => Math.log2(x), log1p: () => Math.log1p(x),
        degrees: () => x * 180 / Math.PI, radians: () => x * Math.PI / 180, gamma: () => gamma(x), lgamma: () => Math.log(Math.abs(gamma(x))), erf: () => erf(x), erfc: () => 1 - erf(x),
        atan2: () => Math.atan2(x, y), pow: () => x ** y, fmod: () => x % y, remainder: () => x - Math.round(x / y) * y, copysign: () => Math.abs(x) * Math.sign(y || 1),
        nextafter: () => x === y ? y : x < y ? x + Number.EPSILON * Math.max(1, Math.abs(x)) : x - Number.EPSILON * Math.max(1, Math.abs(x)),
        hypot: () => Math.hypot(...values), min: () => Math.min(...values), max: () => Math.max(...values), clamp: () => Math.max(y, Math.min(n(a[2]), x)),
        lerp: () => x + (y - x) * n(a[2]), map_range: () => n(a[3]) + (x - y) * (n(a[4]) - n(a[3])) / (n(a[2]) - y),
        sign: () => Math.sign(x), isfinite: () => Number.isFinite(x), isinf: () => !Number.isFinite(x) && !Number.isNaN(x), isnan: () => Number.isNaN(x),
        gcd: () => values.reduce((acc, value) => gcd(acc, value)), lcm: () => values.reduce((acc, value) => acc && value ? Math.abs(acc * value) / gcd(acc, value) : 0, 1),
        factorial: () => factorial(x), comb: () => choose(x, y), perm: () => choose(x, y) * factorial(y), sum: () => values.reduce((sum, value) => sum + value, 0),
        mean: () => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length), median: () => median(values), variance: () => variance(values, false), stddev: () => Math.sqrt(variance(values, false))
      };
      if (operations[member]) return operations[member]();
      break;
    }
    case 'decimal': {
      const precision = Math.min(100, Math.max(0, Math.floor(n(a[1] ?? 12))));
      if (member === 'parse') { const value = str(a[0]); if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) throw new Error('Invalid decimal text.'); return String(Number(value)); }
      if (member === 'add') return String(n(a[0]) + n(a[1]));
      if (member === 'sub') return String(n(a[0]) - n(a[1]));
      if (member === 'mul') return String(n(a[0]) * n(a[1]));
      if (member === 'div') { if (!n(a[1])) throw new Error('Division by zero.'); return String(Number((n(a[0]) / n(a[1])).toFixed(precision))); }
      if (member === 'quantize') return n(a[0]).toFixed(precision);
      break;
    }
    case 'csv': {
      const parseCsv = (source: string) => {
        const rows: string[][] = []; let row: string[] = [], cell = '', quoted = false;
        for (let i = 0; i < source.length; i++) { const ch = source[i];
          if (ch === '"' && quoted && source[i + 1] === '"') { cell += '"'; i++; }
          else if (ch === '"') quoted = !quoted;
          else if (ch === ',' && !quoted) { row.push(cell); cell = ''; }
          else if ((ch === '\n' || ch === '\r') && !quoted) { if (ch === '\r' && source[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
          else cell += ch;
        }
        if (cell || row.length) { row.push(cell); rows.push(row); } return rows;
      };
      if (member === 'parse') return parseCsv(str(a[0]));
      if (member === 'read') { const content = context?.virtualFiles.get(str(a[0])); if (content === undefined) throw new Error(`Virtual file not found: ${str(a[0])}`); return parseCsv(content); }
      if (member === 'stringify' || member === 'write') return list(a[0]).map((row) => list(row).map((cell) => { const value = str(cell); return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value; }).join(',')).join('\n');
      break;
    }
    case 'datetime': {
      const now = Date.now();
      if (member === 'now') return new Date(now).toISOString();
      if (member === 'timestamp') return Math.floor(now / 1000);
      if (member === 'from_timestamp') return new Date(n(a[0]) * 1000).toISOString();
      if (member === 'add_seconds') return new Date(Date.parse(str(a[0])) + n(a[1]) * 1000).toISOString();
      if (member === 'format') { const date = new Date(n(a[0]) * 1000); return str(a[1]).replace(/%Y|%m|%d|%H|%M|%S/g, (token) => ({ '%Y':String(date.getUTCFullYear()), '%m':String(date.getUTCMonth()+1).padStart(2,'0'), '%d':String(date.getUTCDate()).padStart(2,'0'), '%H':String(date.getUTCHours()).padStart(2,'0'), '%M':String(date.getUTCMinutes()).padStart(2,'0'), '%S':String(date.getUTCSeconds()).padStart(2,'0') }[token] ?? token)); }
      break;
    }
    case 'pickle':
      if (member === 'dumps') return JSON.stringify(a[0]);
      if (member === 'loads') return JSON.parse(str(a[0]));
      break;
    case 'time': {
      const now = Date.now();
      if (member === 'now' || member === 'iso') return new Date(now).toISOString();
      if (member === 'unix') return Math.floor(now / 1000);
      if (member === 'from_unix') return new Date(n(a[0]) * 1000).toISOString();
      break;
    }
    case 'os':
      if (member === 'platform') return 'browser';
      if (member === 'cwd') return '/';
      if (member === 'getenv') return '';
      if (member === 'has_env') return false;
      break;
    case 'test':
      if (member === 'ok' && !a[0]) throw new Error(`Test failed${a[1] ? `: ${str(a[1])}` : '.'}`);
      if (member === 'equal' && !Object.is(a[0], a[1])) throw new Error(`Expected ${format(a[0])} to equal ${format(a[1])}.`);
      if (member === 'not_equal' && Object.is(a[0], a[1])) throw new Error(`Expected values not to equal ${format(a[0])}.`);
      if (member === 'fail') throw new Error(str(a[0] ?? 'Test failed.'));
      return null;
    case 'queue':
      if (member === 'new') return { __seQueue: [] as unknown[] };
      if (member === 'put') { const q = a[0] as { __seQueue?: unknown[] }; if (!Array.isArray(q?.__seQueue)) throw new Error('queue.put expects a Queue.'); q.__seQueue.push(a[1]); return null; }
      if (member === 'get') { const q = a[0] as { __seQueue?: unknown[] }; if (!Array.isArray(q?.__seQueue)) throw new Error('queue.get expects a Queue.'); if (!q.__seQueue.length) throw new Error('Queue is empty.'); return q.__seQueue.shift(); }
      if (member === 'empty') return !(a[0] as { __seQueue?: unknown[] })?.__seQueue?.length;
      if (member === 'size') return (a[0] as { __seQueue?: unknown[] })?.__seQueue?.length ?? 0;
      break;
    case 'db': {
      if (member === 'open') {
        const name = str(a[0] ?? 'memory');
        if (!context) return { __seDatabase: name };
        if (!context.virtualDatabases.has(name)) context.virtualDatabases.set(name, new Map());
        return { __seDatabase: name };
      }
      const db = a[0] as { __seDatabase?: string };
      const store = db?.__seDatabase ? context?.virtualDatabases.get(db.__seDatabase) : undefined;
      if (!store) throw new Error('db operation expects a database opened in this run.');
      const key = str(a[1]);
      if (member === 'set') { store.set(key, a[2]); return null; }
      if (member === 'get') return store.get(key) ?? null;
      if (member === 'has') return store.has(key);
      if (member === 'remove') return store.delete(key);
      if (member === 'keys') return [...store.keys()];
      if (member === 'save') return null;
      break;
    }
    case 'router': case 'web': case 'http_server': {
      const routes = context?.virtualRoutes;
      const methodName = ['get', 'post', 'put', 'patch', 'delete'].includes(member) ? member.toUpperCase() : '';
      if (methodName) {
        if (!routes) throw new Error(`${moduleName}.${member} needs a simulator context.`);
        routes.push({ method: methodName, path: str(a[0]), handler: a[1] });
        return null;
      }
      if (member === 'route_count') return routes?.length ?? 0;
      if (member === 'text') return { status: 200, type: 'text/plain', body: str(a[0]) };
      if (member === 'json') return { status: 200, type: 'application/json', body: a[0] };
      if (member === 'response') return { status: n(a[0]), type: str(a[2] ?? 'text/plain'), body: a[1] };
      if (member === 'handle' || member === 'handle_status') {
        const method = str(a[0]).toUpperCase(), path = str(a[1]).split('?')[0];
        const route = routes?.find((item) => item.method === method && item.path === path);
        if (!route) return member === 'handle_status' ? 404 : { status: 404, type: 'text/plain', body: 'Not Found' };
        const result = invokeHandler(route.handler, [], context);
        const response = result && typeof result === 'object' && 'status' in result ? result : { status: 200, type: 'text/plain', body: result };
        return member === 'handle_status' ? response.status : response;
      }
      if (member === 'listen') return 'Server listeners are not available in a browser simulator; use handle to test routes.';
      if (['method', 'path', 'query', 'body', 'header', 'param'].includes(member)) return '';
      break;
    }
    case 'copy':
      if (member === 'shallow') return Array.isArray(a[0]) ? [...a[0]] : a[0] && typeof a[0] === 'object' ? { ...(a[0] as object) } : a[0];
      if (member === 'deep') return structuredClone(a[0]);
      break;
    case 'game': case 'scene': case 'canvas': case 'gui': case 'window': case 'video': case 'camera': case 'sprite': case 'input': case 'sound': case 'keyboard': case 'mouse': case 'animation': case 'image': case 'audio': {
      const scene = (value: unknown) => Boolean(value && typeof value === 'object' && '__seScene' in value);
      if (member === 'new') return { __seScene: true, width: n(a[0]), height: n(a[1]), title: str(a[2] ?? 'SE scene'), commands: [] as unknown[] };
      const target = a[0];
      if (member === 'distance') return Math.hypot(n(a[2]) - n(a[0]), n(a[3]) - n(a[1]));
      if (member === 'vector') return [n(a[0]), n(a[1])];
      if (member === 'rect_hit') return n(a[0]) < n(a[4]) + n(a[6]) && n(a[0]) + n(a[2]) > n(a[4]) && n(a[1]) < n(a[5]) + n(a[7]) && n(a[1]) + n(a[3]) > n(a[5]);
      if (scene(target)) {
        const value = target as { commands: unknown[] };
        if (member === 'clear') value.commands.length = 0;
        else if (member === 'background') value.commands.push({ op: member, args: a.slice(1) });
        else if (member === 'show') return { ...(target as object), preview: 'Scene recorded by browser simulator.' };
        else if (member === 'save') return JSON.stringify(target);
        else if (member === 'html') return `<pre>${JSON.stringify(target)}</pre>`;
        else value.commands.push({ op: `${moduleName}.${member}`, args: a.slice(1) });
        return target;
      }
      if (member === 'stop') return null;
      break;
    }
    case 'async': case 'threading': {
      const task = a[0] as { __seTask?: boolean; value?: unknown };
      if (member === 'run') return { __seTask: true, value: invokeHandler(a[0], a.slice(1), context) };
      if (member === 'await' || member === 'join') {
        if (!task?.__seTask) throw new Error(`${moduleName}.${member} expects a task created by ${moduleName}.run.`);
        return task.value;
      }
      if (member === 'ready') return Boolean(task?.__seTask);
      break;
    }
    case 'match': {
      const run = (handler: unknown, value: unknown) => invokeHandler(handler, [value], context);
      if (member === 'option') {
        const option = a[0] as { some?: boolean; value?: unknown };
        return option?.some ? run(a[1], option.value) : run(a[2], null);
      }
      if (member === 'result') {
        const result = a[0] as { ok?: boolean; value?: unknown; error?: unknown };
        return result?.ok ? run(a[1], result.value) : run(a[2], result?.error);
      }
      if (member === 'value') {
        for (let i = 0; i + 1 < a.length; i += 2) if (Object.is(a[0], a[i])) return run(a[i + 1], a[0]);
        const fallback = a.at(-1);
        return fallback === undefined ? null : run(fallback, a[0]);
      }
      break;
    }
    case 'iter': {
      const values = list(a[0]);
      const choose = (source: unknown[], count: number, start = 0): unknown[][] => {
        if (count === 0) return [[]];
        const result: unknown[][] = [];
        for (let i = start; i <= source.length - count; i += 1) for (const tail of choose(source, count - 1, i + 1)) result.push([source[i], ...tail]);
        return result;
      };
      const permute = (source: unknown[], count: number): unknown[][] => {
        if (count === 0) return [[]];
        return source.flatMap((value, index) => permute([...source.slice(0, index), ...source.slice(index + 1)], count - 1).map((tail) => [value, ...tail]));
      };
      if (member === 'product') return list(a[0]).flatMap((left) => list(a[1]).map((right) => [left, right]));
      if (member === 'permutations') return permute(values, Math.max(0, Math.min(values.length, Math.floor(n(a[1] ?? values.length)))));
      if (member === 'combinations') return choose(values, Math.max(0, Math.min(values.length, Math.floor(n(a[1])))));
      break;
    }
    case 'data': {
      const value = a[0];
      if (member === 'append' && Array.isArray(value)) { value.push(a[1]); return null; }
      if (member === 'extend' && Array.isArray(value)) { value.push(...list(a[1])); return null; }
      if (member === 'insert' && Array.isArray(value)) { value.splice(n(a[1]), 0, a[2]); return null; }
      if (member === 'pop' && Array.isArray(value)) { const index = a[1] === undefined ? value.length - 1 : n(a[1]); if (index < 0 || index >= value.length) throw new Error('List index out of range.'); return value.splice(index, 1)[0]; }
      if (member === 'clear' && Array.isArray(value)) { value.length = 0; return null; }
      if (member === 'copy') return Array.isArray(value) ? [...value] : value && typeof value === 'object' ? { ...value } : value;
      if (member === 'get') { const key = str(a[1]); return (value as Record<string, unknown>)?.[key] ?? a[2] ?? null; }
      if (member === 'set' && value && typeof value === 'object') { (value as Record<string, unknown>)[str(a[1])] = a[2]; return null; }
      if (member === 'update' && value && typeof value === 'object') { Object.assign(value, a[1]); return null; }
      if (member === 'delete' && value && typeof value === 'object') return delete (value as Record<string, unknown>)[str(a[1])];
      if (member === 'has') return Array.isArray(value) ? value.includes(a[1]) : Boolean(value && typeof value === 'object' && Object.hasOwn(value, str(a[1])));
      if (member === 'keys' && value && typeof value === 'object') return Object.keys(value);
      if (member === 'values' && value && typeof value === 'object') return Object.values(value);
      if (member === 'items' && value && typeof value === 'object') return Object.entries(value);
      break;
    }
    case 'log': case 'logging':
      if (member === 'level') return 'INFO';
      if (member === 'set_level') return null;
      if (member === 'records') return [];
      if (['debug', 'info', 'warn', 'warning', 'error', 'critical'].includes(member)) { context?.output.push(`[${member.toUpperCase()}] ${str(a[0])}`); return null; }
      break;
    case 'args': case 'argparse':
      { const argv = list(a[0]).map(str), parsed: Record<string, unknown> = { positionals: [] as string[] };
        for (let i = 0; i < argv.length; i++) { const token = argv[i]; if (!token.startsWith('-')) { (parsed.positionals as string[]).push(token); continue; } const key = token.replace(/^-+/, '').replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase()); if (argv[i + 1] && !argv[i + 1].startsWith('-')) parsed[key] = argv[++i]; else parsed[key] = true; }
        if (member === 'parse' || member === 'parse_args') return parsed;
        if (member === 'get') return (a[0] as Record<string, unknown>)?.[str(a[1])] ?? a[2] ?? '';
        if (member === 'flag' || member === 'has') return Boolean((a[0] as Record<string, unknown>)?.[str(a[1])]);
        if (member === 'positionals') return (a[0] as Record<string, unknown>)?.positionals ?? [];
        if (member === 'get_int') return parseInt(str((a[0] as Record<string, unknown>)?.[str(a[1])] ?? a[2] ?? 0), 10);
        if (member === 'require') { const value = (a[0] as Record<string, unknown>)?.[str(a[1])]; if (value === undefined) throw new Error(`Missing required argument: ${str(a[1])}`); return value; }
      }
      break;
    case 'enum':
      if (member === 'make') return Object.fromEntries(list(a[0]).map((name, index) => [str(name), index]));
      if (member === 'name') { const entry = Object.entries((a[0] ?? {}) as Record<string, unknown>).find(([, value]) => value === a[1]); if (!entry) throw new Error('Enum value was not found.'); return entry[0]; }
      if (member === 'value') { const value = (a[0] as Record<string, unknown>)?.[str(a[1])]; if (value === undefined) throw new Error('Enum name was not found.'); return value; }
      if (member === 'has') return Object.hasOwn((a[0] ?? {}) as object, str(a[1]));
      break;
    case 'regex': case 're':
      if (member === 'find_all') return Array.from(str(a[1]).matchAll(new RegExp(str(a[0]), 'g')), (m) => m[0]);
      if (member === 'count') return Array.from(str(a[1]).matchAll(new RegExp(str(a[0]), 'g'))).length;
      if (member === 'escape') return str(a[0]).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (member === 'groups') return str(a[1]).match(new RegExp(str(a[0])))?.slice(1) ?? [];
      if (member === 'match') return new RegExp(`^(?:${str(a[0])})$`).test(str(a[1]));
      if (member === 'search') return new RegExp(str(a[0])).test(str(a[1]));
      if (member === 'replace') return str(a[0]).replace(new RegExp(str(a[1]), 'g'), str(a[2]));
      if (member === 'split') return str(a[1]).split(new RegExp(str(a[0])));
      break;
    case 'hash': case 'hashlib': case 'crypto':
      if (member === 'constant_time_equal' || member === 'compare') { const x = str(a[0]), y = str(a[1]); let diff = x.length ^ y.length; for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0); return diff === 0; }
      break;
    case 'url':
      if (member === 'encode') return encodeURIComponent(str(a[0]));
      if (member === 'decode') return decodeURIComponent(str(a[0]));
      if (member === 'parse_query') return Object.fromEntries(new URLSearchParams(str(a[0])));
      if (member === 'query') return new URLSearchParams(Object.entries((a[0] ?? {}) as Record<string, string>).map(([k, v]) => [k, String(v)])).toString();
      break;
    case 'encoding':
      if (member === 'hex') return Array.from(new TextEncoder().encode(str(a[0])), (x) => x.toString(16).padStart(2, '0')).join('');
      if (member === 'unhex') { const value = str(a[0]); if (value.length % 2 || /[^\da-f]/i.test(value)) throw new Error('Invalid hex text.'); return new TextDecoder().decode(Uint8Array.from(value.match(/.{2}/g) ?? [], (x) => parseInt(x, 16))); }
      if (member === 'utf8_valid') { try { new TextDecoder('utf-8', { fatal: true }).decode(new TextEncoder().encode(str(a[0]))); return true; } catch { return false; } }
      break;
    case 'config': case 'dotenv': {
      if (member === 'parse') {
        const result: Record<string, unknown> = {};
        let section = '';
        for (const raw of str(a[0]).split(/\r?\n/)) {
          const line = raw.trim();
          if (!line || line.startsWith('#') || (moduleName === 'config' && line.startsWith(';'))) continue;
          if (moduleName === 'config' && line.startsWith('[') && line.endsWith(']')) {
            section = line.slice(1, -1).trim();
            if (!section) throw new Error('Config section name cannot be empty.');
            continue;
          }
          const valueLine = moduleName === 'dotenv' && line.startsWith('export ') ? line.slice(7).trim() : line;
          const eq = valueLine.indexOf('=');
          if (eq < 1) throw new Error(moduleName === 'dotenv' ? 'Expected KEY=VALUE.' : 'Expected key = value in config.');
          const key = valueLine.slice(0, eq).trim();
          if (moduleName === 'dotenv' && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) throw new Error('Invalid configuration key.');
          let value = valueLine.slice(eq + 1).trim();
          if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) value = value.slice(1, -1);
          result[moduleName === 'config' && section ? `${section}.${key}` : key] = value;
        }
        return result;
      }
      const config = (a[0] ?? {}) as Record<string, unknown>;
      if (member === 'get' || member === 'get_int' || member === 'get_bool') {
        const key = str(a[1]);
        if (!Object.hasOwn(config, key)) throw new Error(`Missing ${moduleName === 'dotenv' ? 'configuration' : 'config'} key: ${key}`);
        const value = str(config[key]);
        if (member === 'get') return value;
        if (member === 'get_int') { if (!/^[+-]?\d+$/.test(value)) throw new Error(`Config value is not an Int: ${key}`); return Number(value); }
        if (/^(true|yes|1)$/i.test(value)) return true;
        if (/^(false|no|0)$/i.test(value)) return false;
        throw new Error(`Config value is not a Bool: ${key}`);
      }
      if (member === 'section') {
        const prefix = `${str(a[1])}.`;
        return Object.fromEntries(Object.entries(config).filter(([key]) => key.startsWith(prefix)).map(([key, value]) => [key.slice(prefix.length), value]));
      }
      if (member === 'merge') return { ...((a[0] ?? {}) as object), ...((a[1] ?? {}) as object) };
      break;
    }
    case 'array': case 'series':
      { const xs = list(a[0]).map(Number); const s = stats(xs);
        if (member === 'sum' || member === 'cumulative_sum') return member === 'sum' ? s.sum : xs.reduce<number[]>((out, x) => [...out, x + (out.at(-1) ?? 0)], []);
        if (member === 'mean') return s.mean;
        if (member === 'min') return Math.min(...xs);
        if (member === 'max') return Math.max(...xs);
        if (member === 'slice') return list(a[0]).slice(n(a[1]), n(a[2]));
        if (member === 'diff') return xs.slice(1).map((x, i) => x - xs[i]);
        if (member === 'lag') { const lag = Math.floor(n(a[1])); if (lag < 0) throw new Error('series.lag needs a non-negative lag.'); return xs.slice(lag).map((_, i) => xs[i]); }
        if (member === 'moving_average') { const size = Math.floor(n(a[1])); if (size < 1 || size > xs.length) throw new Error('Window must be between 1 and series length.'); return xs.slice(size - 1).map((_, i) => xs.slice(i, i + size).reduce((sum, x) => sum + x, 0) / size); }
        if (member === 'returns') return xs.slice(1).map((x, i) => { if (xs[i] === 0) throw new Error('Cannot calculate return from a zero value.'); return x / xs[i] - 1; });
        if (member === 'normalize') { if (!xs.length) return []; const lo = Math.min(...xs), hi = Math.max(...xs); if (hi === lo) throw new Error('Cannot normalize a constant series.'); return xs.map((x) => (x - lo) / (hi - lo)); }
      }
      break;
    case 'matrix': case 'linear':
      { const left = matrix(a[0]); const right = matrix(a[1]);
        if (member === 'transpose') return left[0]?.map((_, i) => left.map((row) => row[i])) ?? [];
        if (member === 'multiply' || member === 'matmul') return product(left, right);
        if (member === 'dot') { const x = list(a[0]).map(Number), y = list(a[1]).map(Number); if (x.length !== y.length) throw new Error('Vector dimensions do not match.'); return x.reduce((sum, value, i) => sum + value * y[i], 0); }
        if (member === 'add' || member === 'subtract') { if (left.length !== right.length || left.some((row, i) => row.length !== right[i]?.length)) throw new Error('Matrix dimensions do not match.'); return left.map((row, i) => row.map((value, j) => member === 'add' ? value + right[i][j] : value - right[i][j])); }
        if (member === 'scale') return left.map((row) => row.map((value) => value * n(a[1])));
        if (member === 'identity') { const size = Math.floor(n(a[0])); if (size < 1 || size > 128) throw new Error('linear.identity size must be 1..128.'); return Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => i === j ? 1 : 0)); }
        if (member === 'norm') return Math.hypot(...list(a[0]).map(Number));
        if (member === 'normalize') { const xs = list(a[0]).map(Number), norm = Math.hypot(...xs); if (!norm) throw new Error('Cannot normalize the zero vector.'); return xs.map((value) => value / norm); }
        if (member === 'determinant' || member === 'inverse') {
          if (!left.length || left.some((row) => row.length !== left.length)) throw new Error(`${member === 'determinant' ? 'Determinant' : 'Inverse'} needs a square matrix.`);
          const size = left.length, work = left.map((row) => [...row]), inverse = left.map((_, i) => left.map((__, j) => i === j ? 1 : 0));
          let determinant = 1;
          for (let col = 0; col < size; col++) {
            let pivot = col;
            for (let row = col + 1; row < size; row++) if (Math.abs(work[row][col]) > Math.abs(work[pivot][col])) pivot = row;
            if (Math.abs(work[pivot][col]) < 1e-12) { if (member === 'determinant') return 0; throw new Error('Matrix is singular.'); }
            if (pivot !== col) { [work[pivot], work[col]] = [work[col], work[pivot]]; [inverse[pivot], inverse[col]] = [inverse[col], inverse[pivot]]; determinant *= -1; }
            const divisor = work[col][col]; determinant *= divisor;
            for (let j = 0; j < size; j++) { work[col][j] /= divisor; inverse[col][j] /= divisor; }
            for (let row = 0; row < size; row++) if (row !== col) { const factor = work[row][col]; for (let j = 0; j < size; j++) { work[row][j] -= factor * work[col][j]; inverse[row][j] -= factor * inverse[col][j]; } }
          }
          return member === 'determinant' ? determinant : inverse;
        }
      }
      break;
    case 'probability':
      if (member === 'factorial' || member === 'choose') { const f = (x: number) => { if (x < 0 || x > 170 || !Number.isInteger(x)) throw new Error('Expected an integer from 0 to 170.'); let out = 1; for (let i = 2; i <= x; i++) out *= i; return out; }; return member === 'factorial' ? f(n(a[0])) : f(n(a[0])) / (f(n(a[1])) * f(n(a[0]) - n(a[1]))); }
      break;
    case 'fraction':
      if (member === 'make') { let x = Math.trunc(n(a[0])), y = Math.trunc(n(a[1])); if (!y) throw new Error('A fraction denominator cannot be zero.'); const d = gcd(x, y); if (y < 0) return [-x / d, -y / d]; return [x / d, y / d]; }
      if (member === 'decimal') { const value = list(a[0]); if (value.length !== 2 || !n(value[1])) throw new Error('Expected [numerator, nonzero denominator].'); return n(value[0]) / n(value[1]); }
      break;
    case 'complex':
      if (member === 'make') return [n(a[0]), n(a[1])];
      if (member === 'add') return [n(list(a[0])[0]) + n(list(a[1])[0]), n(list(a[0])[1]) + n(list(a[1])[1])];
      if (member === 'multiply') { const [x, y] = list(a[0]).map(Number), [u, v] = list(a[1]).map(Number); return [x * u - y * v, x * v + y * u]; }
      if (member === 'magnitude') return Math.hypot(...list(a[0]).map(Number));
      break;
    case 'calculus':
      if (member === 'polynomial' || member === 'derivative') { const coeffs = list(a[0]).map(Number), x = n(a[1]); return coeffs.reduce((sum, c, i) => sum + (member === 'polynomial' ? c * x ** i : i ? c * i * x ** (i - 1) : 0), 0); }
      if (member === 'integral') { const coeffs = list(a[0]).map(Number); const primitive = (x: number) => coeffs.reduce((sum, c, i) => sum + c * x ** (i + 1) / (i + 1), 0); return primitive(n(a[2])) - primitive(n(a[1])); }
      break;
    case 'units':
      { const value = n(a[0]), from = str(a[1]).toLowerCase(), to = str(a[2]).toLowerCase();
        if (member === 'celsius_to_fahrenheit') return value * 9 / 5 + 32;
        if (member === 'fahrenheit_to_celsius') return (value - 32) * 5 / 9;
        const factors: Record<string, number> = { m: 1, km: 1000, cm: .01, mm: .001, s: 1, min: 60, h: 3600, kg: 1, g: .001, lb: .45359237 };
        if (from === 'c' && to === 'f') return value * 9 / 5 + 32;
        if (from === 'f' && to === 'c') return (value - 32) * 5 / 9;
        if (!(from in factors) || !(to in factors)) throw new Error(`Unsupported unit conversion: ${from} to ${to}.`);
        const family = (u: string) => ['m','km','cm','mm'].includes(u) ? 'length' : ['s','min','h'].includes(u) ? 'time' : 'mass';
        if (family(from) !== family(to)) throw new Error('Units must belong to the same dimension.'); return value * factors[from] / factors[to];
      }
    case 'table': case 'dataset':
      if (member === 'describe') { const rows = list(a[0]); return { row_count: rows.length, columns: rows.length && rows[0] && typeof rows[0] === 'object' ? Object.keys(rows[0] as object) : [] }; }
      if (member === 'columns') { const rows = list(a[0]); return rows.length && rows[0] && typeof rows[0] === 'object' ? Object.keys(rows[0] as object) : []; }
      if (member === 'train_test_split' || member === 'split') { const rows = list(a[0]), ratio = n(a[1]); if (!(ratio > 0 && ratio < 1)) throw new Error('Split ratio must be between 0 and 1.'); const cut = Math.floor(rows.length * ratio); return [rows.slice(0, cut), rows.slice(cut)]; }
      if (member === 'filter_eq') return list(a[0]).filter((row) => row && typeof row === 'object' && (row as Record<string, unknown>)[str(a[1])] === a[2]);
      if (member === 'unique') { const key = str(a[1]), seen = new Set<string>(); return list(a[0]).filter((row) => { if (!row || typeof row !== 'object' || !Object.hasOwn(row, key)) throw new Error(`Missing dataset column: ${key}`); const value = JSON.stringify((row as Record<string, unknown>)[key]); if (seen.has(value)) return false; seen.add(value); return true; }); }
      if (member === 'column') { const key = str(a[1]); return list(a[0]).map((row) => { if (!row || typeof row !== 'object' || !Object.hasOwn(row, key)) throw new Error(`Missing table column: ${key}`); return (row as Record<string, unknown>)[key]; }); }
      if (member === 'row') return list(a[0])[n(a[1])] ?? null;
      if (member === 'row_count') return list(a[0]).length;
      if (member === 'select') { const cols = list(a[1]).map(str); return list(a[0]).map((row) => { if (!row || typeof row !== 'object') throw new Error('Dataset rows must be Maps.'); const record = row as Record<string, unknown>; return Object.fromEntries(cols.map((key) => { if (!Object.hasOwn(record, key)) throw new Error(`Missing dataset column: ${key}`); return [key, record[key]]; })); }); }
      break;
    case 'cookie':
      if (member === 'parse') return Object.fromEntries(str(a[0]).split(';').map((part) => { const index = part.indexOf('='); return index < 0 ? [part.trim(), ''] : [part.slice(0, index).trim(), part.slice(index + 1).trim()]; }).filter(([k]) => k));
      if (member === 'set') return `${str(a[0])}=${str(a[1])}; Path=/; HttpOnly; SameSite=Lax`;
      break;
    case 'cors':
      if (member === 'allow_origin') { const origin = str(a[0]); if (/[\r\n]/.test(origin)) throw new Error('Invalid Origin header.'); return { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' }; }
      if (member === 'preflight') { const origin = str(a[0]), methods = str(a[1]); if (/[\r\n]/.test(origin + methods)) throw new Error('Invalid CORS header value.'); return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': methods, Vary: 'Origin' }; }
      break;
    case 'template':
      if (member === 'escape') return str(a[0]).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c] ?? c));
      if (member === 'render') { const escaped = (value: unknown) => str(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c] ?? c)); return str(a[0]).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_m, key: string) => { const v = (a[1] as Record<string, unknown>)?.[key]; if (v === undefined) throw new Error(`Missing template value: ${key}`); return escaped(v); }); }
      break;
    case 'tilemap':
      if (member === 'parse') { const rows = str(a[0]).split(/\r?\n/); if (rows.at(-1) === '') rows.pop(); if (!rows.length || !rows[0].length || rows.some((row) => row.length !== rows[0].length)) throw new Error('Tilemap rows must be non-empty and have equal width.'); return rows; }
      if (member === 'at') return str(list(a[0])[n(a[2])]).charAt(n(a[1])) || null;
      if (member === 'size') return [list(a[0])[0]?.length ?? 0, list(a[0]).length];
      break;
    case 'toml': case 'yaml': case 'xml': case 'markdown':
      if (member === 'stringify' && moduleName === 'yaml') return Object.entries((a[0] ?? {}) as Record<string, unknown>).map(([key, value]) => `${key}: ${typeof value === 'string' ? JSON.stringify(value) : String(value)}`).join('\n');
      if (member === 'parse' && moduleName === 'xml') {
        const source = str(a[0]).trim();
        const root = source.match(/^<([A-Za-z_][\w.-]*)>([\s\S]*)<\/\1>$/);
        if (!root) throw new Error('XML parser expects one well-formed root element.');
        const value = root[2].replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
        return { [root[1]]: value };
      }
      if (member === 'escape' && moduleName === 'xml') return str(a[0]).replace(/[<>&"']/g, (c) => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;' }[c] ?? c));
      if (member === 'render' && moduleName === 'markdown') return str(a[0]).split(/\r?\n/).map((line) => { const match = line.match(/^(#{1,6})\s+(.*)$/); return match ? `<h${match[1].length}>${match[2].replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c] ?? c))}</h${match[1].length}>` : line ? `<p>${line.replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c] ?? c))}</p>` : ''; }).join('\n');
      if (member === 'parse' && moduleName === 'yaml') return str(a[0]).split(/\r?\n/).filter(Boolean).reduce<Record<string, unknown>>((out, line) => { const m = line.match(/^\s*([^:#]+):\s*(.*)$/); if (m) out[m[1].trim()] = m[2] === 'true' ? true : m[2] === 'false' ? false : m[2] === 'null' ? null : /^-?\d+(?:\.\d+)?$/.test(m[2]) ? Number(m[2]) : m[2].replace(/^['"]|['"]$/g, ''); return out; }, {});
      if (member === 'parse' && moduleName === 'toml') return str(a[0]).split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith('#')).reduce<Record<string, unknown>>((out, line) => { const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/); if (m) { try { out[m[1]] = JSON.parse(m[2]); } catch { out[m[1]] = m[2].replace(/^['"]|['"]$/g, ''); } } return out; }, {});
      break;
    case 'ml':
      if (member === 'linear_regression') { const xs = list(a[0]).map(Number), ys = list(a[1]).map(Number); if (xs.length !== ys.length || xs.length < 2) throw new Error('Training data needs matching x/y lists with at least two values.'); const mx = stats(xs).mean, my = stats(ys).mean, slope = xs.reduce((sum, x, i) => sum + (x - mx) * (ys[i] - my), 0) / xs.reduce((sum, x) => sum + (x - mx) ** 2, 0); return { slope, intercept: my - slope * mx }; }
      if (member === 'predict') return n((a[0] as Record<string, unknown>)?.slope) * n(a[1]) + n((a[0] as Record<string, unknown>)?.intercept);
      break;
    case 'tensor':
      if (member === 'shape') { let current: unknown = a[0], shape: number[] = []; while (Array.isArray(current)) { shape.push(current.length); current = current[0]; } return shape; }
      if (member === 'add') { const add = (x: unknown, y: unknown): unknown => Array.isArray(x) && Array.isArray(y) ? x.map((v, i) => add(v, y[i])) : n(x) + n(y); return add(a[0], a[1]); }
      if (member === 'matmul') return product(matrix(a[0]), matrix(a[1]));
      break;
    case 'physics': case 'collision':
      if (member === 'distance') return Math.hypot(n(a[2]) - n(a[0]), n(a[3]) - n(a[1]));
      if (member === 'vector') return [n(a[0]), n(a[1])];
      if (member === 'rect_hit') return n(a[0]) < n(a[4]) + n(a[6]) && n(a[0]) + n(a[2]) > n(a[4]) && n(a[1]) < n(a[5]) + n(a[7]) && n(a[1]) + n(a[3]) > n(a[5]);
      break;
  }
  const meta = moduleByName[moduleName];
  if (!meta) throw new Error(`Unknown module '${moduleName}'.`);
  const available = meta.members.filter((item) => item.name !== 'help').map((item) => item.name).join(', ');
  throw new Error(`Playground: ${moduleName}.${member} is not available in the browser runtime yet. Available members: ${available || '(none)'}.`);
}

function invokeHandler(handler: unknown, args: unknown[], context?: ExecContext): unknown {
  if (!context || !handler || typeof handler !== 'object' || !('__seFunction' in handler)) {
    throw new Error('Route handler must be a function declared with make.');
  }
  return callFunction(String((handler as { __seFunction: string }).__seFunction), args, context);
}

function moduleCall(moduleName: string, member: string, args: unknown[], context?: ExecContext): unknown {
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
      escape: (value) => [...text(value)].map((ch) => '.^$*+?()[]{}|\\'.includes(ch) ? '\\' + ch : ch).join(''),
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
  if (member === 'help') return (moduleByName[moduleName]?.members ?? []).filter((item) => item.name !== 'help').map((item) => item.name);
  if (moduleName === 'math' && member === 'pi') return Math.PI;
  if (moduleName === 'math' && member === 'e') return Math.E;
  if (moduleName === 'math' && member === 'tau') return Math.PI * 2;
  if (moduleName === 'math' && member === 'inf') return Infinity;
  if (moduleName === 'collections' && ['map', 'filter', 'reduce', 'sort_by', 'sort_by_desc', 'sort_with'].includes(member)) {
    const input = Array.isArray(args[0]) ? args[0] : [];
    const invoke = (value: unknown, values: unknown[]) => {
      if (!context || !value || typeof value !== 'object' || !('__seFunction' in value)) throw new Error(`collections.${member} expects an SE function name.`);
      return callFunction(String((value as { __seFunction: string }).__seFunction), values, context);
    };
    if (member === 'map') return input.map((value) => invoke(args[1], [value]));
    if (member === 'filter') return input.filter((value) => Boolean(invoke(args[1], [value])));
    if (member === 'reduce') return input.reduce((acc, value) => invoke(args[2], [acc, value]), args[1]);
    if (member === 'sort_with') return [...input].sort((left, right) => invoke(args[1], [left, right]) ? -1 : 1);
    const key = (value: unknown) => typeof args[1] === 'string' ? (value as Record<string, unknown>)?.[String(args[1])] : value;
    return [...input].sort((left, right) => {
      const a = key(left) as string | number, b = key(right) as string | number;
      const cmp = typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));
      return member === 'sort_by_desc' ? -cmp : cmp;
    });
  }
  if ((moduleName === 'function' || moduleName === 'functools') && ['map', 'filter', 'reduce', 'call'].includes(member)) {
    const fn = args[0];
    if (!context || !fn || typeof fn !== 'object' || !('__seFunction' in fn)) throw new Error(`${moduleName}.${member} expects an SE function name.`);
    if (member === 'call') return callFunction(String((fn as { __seFunction: string }).__seFunction), args.slice(1), context);
    const list = Array.isArray(args[1]) ? args[1] : [];
    if (member === 'map') return list.map((value) => callFunction(String((fn as { __seFunction: string }).__seFunction), [value], context));
    if (member === 'filter') return list.filter((value) => Boolean(callFunction(String((fn as { __seFunction: string }).__seFunction), [value], context)));
    return list.reduce((acc, value) => callFunction(String((fn as { __seFunction: string }).__seFunction), [acc, value], context), args[2]);
  }
  if (moduleName === 'function' && ['bind', 'partial', 'pipe'].includes(member)) {
    if (member === 'pipe') {
      let value = args[0];
      for (const fn of args.slice(1)) value = invokeHandler(fn, [value], context);
      return value;
    }
    const fn = args[0], bound = args.slice(1);
    if (!fn || typeof fn !== 'object' || !('__seFunction' in fn)) throw new Error(`function.${member} expects an SE function name.`);
    return { __seBoundFunction: String((fn as { __seFunction: string }).__seFunction), args: bound };
  }
  const fn = modules[moduleName]?.[member];
  if (!fn) return browserExtensionCall(moduleName, member, args, context);
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

function isWrappedInParens(expr: string) {
  if (!expr.startsWith('(') || !expr.endsWith(')')) return false;
  let depth = 0;
  let quote = '';
  for (let i = 0; i < expr.length; i += 1) {
    const ch = expr[i];
    if (quote) { if (ch === quote && expr[i - 1] !== '\\') quote = ''; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '(') depth += 1;
    else if (ch === ')') {
      depth -= 1;
      if (depth === 0 && i < expr.length - 1) return false;
      if (depth < 0) return false;
    }
  }
  return depth === 0;
}

function evaluateExpression(expr: string, env: Env, context: ExecContext): unknown {
  expr = expr.trim();
  if (!expr) return null;
  if (isWrappedInParens(expr)) return evaluateExpression(expr.slice(1, -1), env, context);
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
    return Array.isArray(collection) ? collection.includes(value) : collection instanceof Set ? collection.has(value) : collection && typeof collection === 'object' ? String(value) in (collection as object) : false;
  }

  if (/^\[[\s\S]*\]$/.test(expr)) {
    const inner = expr.slice(1, -1);
    const parts = splitComma(inner);
    let quote = ''; let depth = 0; let hasMapEntry = false;
    for (let i = 0; i < inner.length; i += 1) {
      const ch = inner[i];
      if (quote) { if (ch === quote && inner[i - 1] !== '\\') quote = ''; continue; }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === '[' || ch === '(') depth += 1;
      else if (ch === ']' || ch === ')') depth -= 1;
      else if (ch === ':' && depth === 0) { hasMapEntry = true; break; }
    }
    if (!hasMapEntry) return parts.filter(Boolean).map((part) => evaluateExpression(part, env, context));
    const out: Record<string, unknown> = {};
    for (const pair of parts) {
      const colon = pair.indexOf(':');
      if (colon < 0) throw new Error(`Invalid Map entry: ${pair}`);
      const key = evaluateExpression(pair.slice(0, colon), env, context);
      out[String(key)] = evaluateExpression(pair.slice(colon + 1), env, context);
    }
    return out;
  }

  const memberMutation = expr.match(/^([A-Za-z_]\w*)\.(add|append)\s+([\s\S]+)$/);
  if (memberMutation && Object.prototype.hasOwnProperty.call(env, memberMutation[1])) {
    const target = env[memberMutation[1]];
    const value = evaluateExpression(memberMutation[3], env, context);
    if (Array.isArray(target)) { target.push(value); return target; }
    if (target instanceof Set) { target.add(value); return target; }
    throw new Error(`${memberMutation[1]}.${memberMutation[2]} requires a List or Set in this simulator.`);
  }

  const moduleMatch = expr.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)(?:\s+([\s\S]*))?$/);
  const methodMatch = moduleMatch;
  if (moduleMatch) {
    const [, moduleName, member, rest = ''] = moduleMatch;
    const knownModuleNames = Object.keys(moduleByName);
    if (knownModuleNames.includes(moduleName)) {
      if (member === 'help') return (moduleByName[moduleName]?.members ?? []).filter((item) => item.name !== 'help').map((item) => item.name);
      if (context.functions.has(member) && !rest) return { __seFunction: member };
      const args = rest ? splitArgs(rest).map((arg) => evaluateExpression(arg, env, context)) : [];
      return moduleCall(moduleName, member, args, context);
    }
  }

  if (methodMatch) {
    const [, objectName, methodName, rest = ''] = methodMatch;
    const instance = env[objectName];
    if (instance && typeof instance === 'object' && '__seInstance' in instance) {
      const args = rest ? splitArgs(rest).map((arg) => evaluateExpression(arg, env, context)) : [];
      return callMethod(instance as unknown as SeInstance, methodName, args, context);
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
  if (context.functions.has(expr)) return { __seFunction: expr };
  if (Object.prototype.hasOwnProperty.call(env, expr) && isSeType(env[expr])) return instantiateType(env[expr]);

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

  const executableSyntax = withoutStringLiterals(js);
  const unsafePropertyAccess = /(?:\.\s*(?:constructor|prototype|__proto__|__defineGetter__|__defineSetter__|__lookupGetter__|__lookupSetter__)\b|\[\s*["'](?:constructor|prototype|__proto__|__defineGetter__|__defineSetter__|__lookupGetter__|__lookupSetter__)["']\s*\])/i;
  if (unsafePropertyAccess.test(expr) || /(?:\bwindow\b|\bdocument\b|\bglobalThis\b|\bFunction\b|\beval\b|\bconstructor\b|\bprototype\b|__proto__|\bfetch\b|XMLHttpRequest|localStorage|sessionStorage|\blocation\b|\bnavigator\b|\bimport\b|\brequire\b|\bprocess\b|;|`|\{|\})/.test(executableSyntax)) {
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

type SeTypeDef = { fields: Record<string, unknown>; methods: Map<string, FunctionDef>; closure: Env };
type SeTypeValue = { __seTypeDef: SeTypeDef };
type SeInstance = Record<string, unknown> & { __seTypeDef: SeTypeDef };

function isSeType(value: unknown): value is SeTypeValue {
  return Boolean(value && typeof value === 'object' && '__seTypeDef' in value && !('__seInstance' in value));
}

function instantiateType(value: unknown): SeInstance | unknown {
  if (!isSeType(value)) return value;
  const instance = { ...value.__seTypeDef.fields } as SeInstance;
  Object.defineProperty(instance, '__seTypeDef', { value: value.__seTypeDef, enumerable: false });
  Object.defineProperty(instance, '__seInstance', { value: true, enumerable: false });
  return instance;
}

function typeName(type: SeTypeDef): string {
  return Object.entries(type.closure).find(([, value]) => isSeType(value) && value.__seTypeDef === type)?.[0] ?? 'Type';
}

function callMethod(instance: SeInstance, name: string, args: unknown[], context: ExecContext): unknown {
  const type = instance.__seTypeDef;
  const method = type.methods.get(name);
  if (!method) throw new Error(`Unknown method '${name}' on ${typeName(type)}.`);
  const local = Object.create(type.closure) as Env;
  for (const field of Object.keys(type.fields)) local[field] = instance[field];
  method.args.forEach((arg, index) => { local[arg] = args[index]; });
  const result = executeNodes(method.body, local, context);
  for (const field of Object.keys(type.fields)) instance[field] = local[field];
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
    if (node.type === 'type') {
      const fields: Record<string, unknown> = {};
      const methods = new Map<string, FunctionDef>();
      for (const member of node.body) {
        if (member.type === 'make') methods.set(member.name, { args: member.args, body: member.body, closure: env });
        else if (member.type === 'stmt') {
          const field = member.text.match(/^([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/);
          if (field) fields[field[1]] = evaluateExpression(field[2], env, context);
        }
      }
      env[node.name] = { __seTypeDef: { fields, methods, closure: env } } satisfies SeTypeValue;
      continue;
    }
    if (node.type === 'objectInit') {
      const instance = instantiateType(evaluateExpression(node.expr, env, context));
      if (!instance || typeof instance !== 'object' || !('__seInstance' in instance)) throw new Error(`Line ${node.line}: indented initialization requires a declared SE type.`);
      const typed = instance as unknown as SeInstance;
      const local = Object.create(env) as Env;
      for (const field of Object.keys(typed.__seTypeDef.fields)) local[field] = typed[field];
      const result = executeNodes(node.body, local, context);
      for (const field of Object.keys(typed.__seTypeDef.fields)) typed[field] = local[field];
      env[node.name] = typed;
      if (result.returned) return result;
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
    if (node.type === 'match') {
      const value = evaluateExpression(node.expr, env, context);
      for (const branch of node.cases) {
        if (branch.pattern === null || Object.is(value, evaluateExpression(branch.pattern, env, context))) {
          const result = executeNodes(branch.body, env, context);
          if (result.returned) return result;
          break;
        }
      }
      continue;
    }
    if (node.type === 'try') {
      try {
        const result = executeNodes(node.body, env, context);
        if (result.returned) return result;
      } catch (error) {
        const child = Object.create(env) as Env;
        child[node.errorName] = { message: error instanceof Error ? error.message : String(error) };
        const result = executeNodes(node.fallback, child, context);
        if (result.returned) return result;
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
    const context: ExecContext = { output: [], functions: new Map(), steps: 0, virtualFiles: new Map(), virtualDirectories: new Set(), virtualDatabases: new Map(), virtualRoutes: [] };
    const env: Env = {};
    executeNodes(parsed.nodes, env, context);
    return { output: context.output };
  } catch (error) {
    return { output: [], error: error instanceof Error ? error.message : String(error) };
  }
}
