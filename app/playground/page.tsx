'use client';

import { useMemo, useRef, useState } from 'react';
import { PageIntro } from '@/components/PageIntro';
import { useLanguage } from '@/components/LanguageProvider';
import { runSeSimulation } from '@/lib/simulator';
import { modules } from '@/lib/modules';

const SE_KEYWORDS = new Set('if else match case try for in while repeat give fail wait await and or not use make type html css js style when page native read'.split(' '));
const SE_TYPES = new Set('Int Num Text Bool Bytes List Map Set Function Unknown Option Result Task'.split(' '));
const SE_BUILTINS = new Set('say ask set bytes int integer num double float text string bool boolean char'.split(' '));
const SE_CONSTANTS = new Set(['true', 'false', 'none']);
const SE_MODULES = new Set(modules.map((item) => item.name));

function escapeHtml(value: string) {
  return value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char] || char));
}

function highlightSe(source: string) {
  let html = '';
  let index = 0;
  let declaration: 'function' | 'type' | null = null;
  const push = (kind: string, value: string) => { html += `<span class="se-token se-${kind}">${escapeHtml(value)}</span>`; };

  while (index < source.length) {
    const rest = source.slice(index);
    const comment = rest.match(/^#[^\n]*/);
    if (comment) { push('comment', comment[0]); index += comment[0].length; continue; }
    const string = rest.match(/^"(?:\\.|[^"\\])*"?/);
    if (string) { push('string', string[0]); index += string[0].length; continue; }
    const number = rest.match(/^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(?:ms|s|min)?\b/);
    if (number) { push('number', number[0]); index += number[0].length; continue; }
    const word = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (word) {
      const value = word[0];
      if (declaration) { push(declaration === 'function' ? 'function' : 'type-name', value); declaration = null; }
      else if (SE_CONSTANTS.has(value)) push('constant', value);
      else if (SE_TYPES.has(value)) push('type', value);
      else if (SE_BUILTINS.has(value)) push('builtin', value);
      else if (SE_MODULES.has(value)) push('module', value);
      else if (SE_KEYWORDS.has(value)) { push('keyword', value); if (value === 'make') declaration = 'function'; if (value === 'type') declaration = 'type'; }
      else {
        const previous = source[index - 1];
        push(previous === '.' ? 'member' : 'plain', value);
      }
      index += value.length;
      continue;
    }
    const operator = rest.match(/^(?:\+=|-=|\*=|\/=|%=|==|!=|<=|>=|\.\.|->|[=+\-*\/%<>:])/);
    if (operator) { push('operator', operator[0]); index += operator[0].length; continue; }
    html += escapeHtml(source[index]);
    index += 1;
  }
  return html + (source.endsWith('\n') ? ' ' : '');
}

const examples = [
  {
    name: 'Hello',
    code: 'name = "SE"\nsay "Hello " + name'
  },
  {
    name: 'Multi-input ask',
    code: 'ask a:Int b:Int\nsay a + b\n\nask name:Text age:Int height:Num\nsay name\nsay age\nsay height'
  },
  {
    name: 'Contest read · SE 0.8.0',
    code: 'read n:Int\nread a[n]:Int\ntotal = 0\nfor x in a\n    total += x\nsay total',
    stdin: '5\n10 20 30 40 50'
  },
  {
    name: 'Multidimensional Lists',
    code: 'grid[2][3] = []\ngrid[1][2] = 42\nsay grid[1][2]\nsay grid[0].len'
  },
  {
    name: 'Conditions',
    code: 'score = 85\n\nif score >= 90\n    say "A"\nelse if score >= 80\n    say "B"\nelse\n    say "C"'
  },
  {
    name: 'Loops',
    code: 'nums = [1, 2, 3, 4]\n\nfor n in nums\n    say n * n\n\nrepeat 2\n    say "done"'
  },
  {
    name: 'Functions',
    code: 'make add a b\n    give a + b\n\nanswer = add 20 22\nsay answer'
  },
  {
    name: 'Statistics',
    code: 'use statistics\n\nnums = [10, 20, 30, 40]\nsay statistics.mean nums\nsay statistics.median nums'
  },
  {
    name: 'Range',
    code: 'for n in 1..5\n    say n'
  },
  {
    name: 'Match + try',
    code: 'value = 2\n\nmatch value\n    case 1\n        say "one"\n    case 2\n        say "two"\n    else\n        say "other"\n\ntry\n    fail "sample error"\nelse err\n    say err.message'
  },
  {
    name: 'Types + methods',
    code: 'type User\n    name = ""\n\n    make greet other\n        say "Hello " + other + ", I am " + name\n\nuser = User\n    name = "SE"\n\nuser.greet "friend"'
  },
  {
    name: 'Expansion modules',
    code: 'use url\nuse matrix\nuse units\n\nencoded = url.encode "SE language"\nsay encoded\nsay matrix.transpose [[1, 2], [3, 4]]\nsay units.convert 1 "km" "m"'
  },
  {
    name: 'Virtual files',
    code: 'use file\nuse path\n\nfile.write "notes.txt" "Hello from the simulator"\nsay file.read "notes.txt"\nsay path.ext "notes.txt"'
  }
];

export default function PlaygroundPage() {
  const { language } = useLanguage();
  const zh = language === 'zh';
  const [active, setActive] = useState(0);
  const [code, setCode] = useState(examples[0].code);
  const [stdin, setStdin] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');
  const [output, setOutput] = useState('Click Run to execute the browser simulation.');
  const highlightRef = useRef<HTMLPreElement>(null);
  const highlightedCode = useMemo(() => highlightSe(code), [code]);
  const filteredModules = useMemo(() => modules.filter((item) => item.name.includes(moduleSearch.toLowerCase()) || item.description.en.toLowerCase().includes(moduleSearch.toLowerCase())), [moduleSearch]);

  const run = () => {
    const result = runSeSimulation(code, stdin);
    if (result.error) setOutput(`Error: ${result.error}`);
    else setOutput(result.output.length ? result.output.join('\n') : '(program finished with no output)');
  };

  const load = (index: number) => {
    setActive(index);
    setCode(examples[index].code);
    setStdin('stdin' in examples[index] ? String(examples[index].stdin) : '');
    setOutput(zh ? '按 Run 執行。' : 'Click Run to execute.');
  };

  const insertModule = (name: string) => {
    if (new RegExp(`^use\\s+${name}\\s*$`, 'm').test(code)) return;
    setCode((current) => `use ${name}\n${current}`);
    setOutput(zh ? `已加入 use ${name}。` : `Added use ${name}.`);
  };

  return (
    <div className="container">
      <PageIntro
        eyebrow="SE PLAYGROUND"
        title={zh ? '在瀏覽器試寫 SE' : 'Try SE in your browser'}
        description={zh ? `在瀏覽器撰寫並執行 SE，包含核心控制語法與 ${modules.length} 個模組的快速匯入。可直接執行的 API 會在瀏覽器沙箱中運作。` : `Write and run SE in your browser with core control syntax and quick imports for all ${modules.length} modules. Browser-supported APIs run in the simulator sandbox.`}
      />
      <div className="example-tabs">
        {examples.map((example, index) => (
          <button key={example.name} className={index === active ? 'example-tab active' : 'example-tab'} onClick={() => load(index)}>{example.name}</button>
        ))}
      </div>
      <div className="playground-shell">
        <section className="editor-pane">
          <div className="playground-toolbar">
            <strong>main.se</strong>
            <div className="editor-actions">
              <button className="reset-button" onClick={() => load(active)}>{zh ? '重設' : 'Reset'}</button>
              <button className="run-button" onClick={run}>▶ {zh ? '執行' : 'Run'}</button>
            </div>
          </div>
          <div className="code-editor-wrap">
            <pre ref={highlightRef} className="code-highlight" aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            <textarea
              className="code-editor"
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onScroll={(event) => {
                if (!highlightRef.current) return;
                highlightRef.current.scrollTop = event.currentTarget.scrollTop;
                highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
              }}
              aria-label="SE code editor"
            />
          </div>
        </section>
        <section className="output-pane">
          <div className="playground-toolbar"><strong>{zh ? '標準輸入（stdin）' : 'Standard input (stdin)'}</strong><span className="badge">SE 0.8.0</span></div>
          <textarea className="search-input" style={{ display: 'block', minHeight: 106, width: '100%', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }} aria-label="Standard input for SE read statements" value={stdin} onChange={(event) => setStdin(event.target.value)} placeholder={zh ? '給 read 使用的輸入，例如：\n5\n10 20 30 40 50' : 'Input for read, e.g.\n5\n10 20 30 40 50'} />
          <div className="playground-toolbar"><strong>{zh ? '輸出' : 'Output'}</strong><span className="badge">browser simulator</span></div>
          <pre className="output-console">{output}</pre>
          <div className="playground-note">
            {zh
              ? '模擬器現在支援 SE 0.8.0 的 read、指定長度與多維陣列。read 從上方 stdin 文字框跨空白與換行讀取，沒有互動提示；ask 仍使用瀏覽器提示框。此處是教學用瀏覽器模擬器，不是完整 C++ 編譯器；不支援原生程序、真實檔案系統或未接入的原生 API。請用正式 SE CLI 驗證競賽程式與 Native build。'
              : 'The learning simulator now supports SE 0.8.0 read and typed or multidimensional Lists. read consumes whitespace-separated tokens from the stdin field without prompting, while ask still uses browser prompts. This is not the full C++ compiler or native runtime. Use the official SE CLI to validate contest submissions, real filesystem access, and native builds.'}
          </div>
        </section>
      </div>
      <section className="module-picker">
        <div className="section-heading">
          <div><span className="eyebrow">MODULE LIBRARY</span><h2>{zh ? `模組快速匯入（${modules.length}）` : `Import a module (${modules.length})`}</h2></div>
          <input className="search-input" value={moduleSearch} onChange={(event) => setModuleSearch(event.target.value)} placeholder={zh ? '搜尋模組' : 'Search modules'} aria-label={zh ? '搜尋模組' : 'Search modules'} />
        </div>
        <div className="module-grid">
          {filteredModules.map((item) => (
            <button type="button" key={item.name} className="module-card" onClick={() => insertModule(item.name)} title={zh ? '加入 use 匯入' : 'Insert use import'}>
              <span className="module-card-top"><code>{item.name}</code><span className="badge">{zh ? '加入' : 'Add'}</span></span>
              <p>{zh ? item.description.zh : item.description.en}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
