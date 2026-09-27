'use client';

import { useState } from 'react';
import { PageIntro } from '@/components/PageIntro';
import { useLanguage } from '@/components/LanguageProvider';
import { runSeSimulation } from '@/lib/simulator';

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
  }
];

export default function PlaygroundPage() {
  const { language } = useLanguage();
  const zh = language === 'zh';
  const [active, setActive] = useState(0);
  const [code, setCode] = useState(examples[0].code);
  const [output, setOutput] = useState('Click Run to execute the browser simulation.');

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

  return (
    <div className="container">
      <PageIntro
        eyebrow="SE PLAYGROUND"
        title={zh ? '在瀏覽器試寫 SE' : 'Try SE in your browser'}
        description={zh ? '這是一個純瀏覽器的 SE 核心語法模擬器，適合練習 say、變數、條件、迴圈、函式與部分常用 module。' : 'A browser-only simulator for practicing core SE syntax: say, variables, conditions, loops, functions, and selected common modules.'}
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
          <textarea className="code-editor" spellCheck={false} value={code} onChange={(event) => setCode(event.target.value)} aria-label="SE code editor" />
        </section>
        <section className="output-pane">
          <div className="playground-toolbar"><strong>{zh ? '輸出' : 'Output'}</strong><span className="badge">browser simulator</span></div>
          <pre className="output-console">{output}</pre>
          <div className="playground-note">
            {zh
              ? '此頁模擬核心語法，不會在 Vercel 瀏覽器中啟動真正的 C++ SE runtime。file、process、socket、sqlite、Node、Next 等平台功能請使用本機 `se run` / `se check`。'
              : 'This page simulates core syntax and does not start the native C++ SE runtime inside Vercel. Platform APIs such as file, process, socket, SQLite, Node, and Next should be tested with local `se run` / `se check`.'}
          </div>
        </section>
      </div>
    </div>
  );
}
