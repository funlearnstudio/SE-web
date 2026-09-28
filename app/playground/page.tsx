'use client';

import { useMemo, useState } from 'react';
import { PageIntro } from '@/components/PageIntro';
import { useLanguage } from '@/components/LanguageProvider';
import { runSeSimulation } from '@/lib/simulator';
import { modules } from '@/lib/modules';

const examples = [
  {
    name: 'Hello',
    code: 'name = "SE"\nsay "Hello " + name'
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
  const [moduleSearch, setModuleSearch] = useState('');
  const [output, setOutput] = useState('Click Run to execute the browser simulation.');
  const filteredModules = useMemo(() => modules.filter((item) => item.name.includes(moduleSearch.toLowerCase()) || item.description.en.toLowerCase().includes(moduleSearch.toLowerCase())), [moduleSearch]);

  const run = () => {
    const result = runSeSimulation(code);
    if (result.error) setOutput(`Error: ${result.error}`);
    else setOutput(result.output.length ? result.output.join('\n') : '(program finished with no output)');
  };

  const load = (index: number) => {
    setActive(index);
    setCode(examples[index].code);
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
      <div className="playground-shell">
        <section className="editor-pane">
          <div className="playground-toolbar">
            <strong>main.se</strong>
            <div className="editor-actions">
              <button className="reset-button" onClick={() => load(active)}>{zh ? '重設' : 'Reset'}</button>
              <button className="run-button" onClick={run}>▶ {zh ? '執行' : 'Run'}</button>
            </div>
          </div>
          <textarea className="code-editor" spellCheck={false} value={code} onChange={(event) => setCode(event.target.value)} aria-label="SE code editor" />
        </section>
        <section className="output-pane">
          <div className="playground-toolbar"><strong>{zh ? '輸出' : 'Output'}</strong><span className="badge">browser simulator</span></div>
          <pre className="output-console">{output}</pre>
          <div className="playground-note">
            {zh
              ? '模擬器支援主要核心語法（包含函式、型別、match、try）並提供完整模組目錄；檔案 API 使用每次執行都會清空的虛擬檔案系統。需要外部程序、原生 socket、資料庫驅動或伺服器憑證的 API 受瀏覽器安全規則限制，尚未接入的呼叫會列出原因。相機、音訊與網路功能仍需瀏覽器權限、HTTPS 與服務端 CORS 配合。'
              : 'The simulator supports core syntax, including functions, types, match, and try, with the full module catalog. File APIs use an in-memory filesystem that resets for each run. APIs requiring child processes, native sockets, database drivers, or server credentials are restricted by browser security; unsupported calls explain why. Camera, audio, and network features still require browser permission, HTTPS, and server CORS support.'}
          </div>
        </section>
      </div>
    </div>
  );
}
