'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function HomePage() {
  const { language } = useLanguage();
  const zh = language === 'zh';

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-logo-row">
            <Image src="/se-logo.png" alt="SE language logo" width={72} height={72} priority />
            <span>SE PROGRAMMING LANGUAGE · 0.7.0</span>
          </div>
          <h1>{zh ? '簡單，從第一行到更大的程式。' : 'Simple from the first line to larger programs.'}</h1>
          <p>
            {zh
              ? 'SE 是一門低標點、重視安全性的程式語言。使用同一套清楚的語法進行直譯執行、Native build、Web 開發與多種生態系整合。'
              : 'SE is a low-punctuation, safety-first programming language with one readable model across interpreted code, native builds, Web development, and ecosystem bridges.'}
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/learn">{zh ? '開始學 SE' : 'Start learning'}</Link>
            <Link className="button-secondary" href="/playground">{zh ? '開啟線上模擬器' : 'Open playground'}</Link>
            <Link className="button-quiet" href="/modules">59 {zh ? '個 Module →' : 'modules →'}</Link>
          </div>
        </div>
        <div className="hero-panel" aria-label="SE code example">
          <div className="window-dots"><i /><i /><i /></div>
          <div className="hero-code">
            <span className="kw">use</span> statistics{`\n\n`}
            nums = [<span className="num">10</span>, <span className="num">20</span>, <span className="num">30</span>]{`\n\n`}
            <span className="kw">make</span> report values{`\n`}
            {'    '}average = statistics.mean values{`\n`}
            {'    '}<span className="kw">give</span> <span className="str">"Average: "</span> + average{`\n\n`}
            <span className="kw">say</span> report nums
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container stat-strip">
          <div className="stat"><strong>59</strong><span>{zh ? '可直接 use 的 built-in module' : 'directly importable built-in modules'}</span></div>
          <div className="stat"><strong>.se</strong><span>{zh ? '清楚、低標點的原始碼' : 'clean, low-punctuation source'}</span></div>
          <div className="stat"><strong>3</strong><span>{zh ? '主要工作流：check / run / build' : 'core workflows: check / run / build'}</span></div>
          <div className="stat"><strong>Web</strong><span>{zh ? '輸出 HTML / CSS / JS / TS' : 'HTML / CSS / JS / TS output'}</span></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>{zh ? '一套語言模型，跨多種用途' : 'One language model, many workflows'}</h2>
              <p>{zh ? '功能可以增加，核心語法仍維持熟悉。' : 'Capability grows without forcing the core language to become noisy.'}</p>
            </div>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon">{'<>'}</div>
              <h3>{zh ? '低標點語法' : 'Low-punctuation syntax'}</h3>
              <p>{zh ? '使用 make、give、say、ask、use，減少不必要的括號、分號與樣板程式。' : 'Use make, give, say, ask and use with fewer parentheses, semicolons and boilerplate.'}</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>{zh ? '靜態檢查' : 'Static checking'}</h3>
              <p>{zh ? 'se check 在執行前檢查程式，VS Code 診斷也沿用同一套 checker。' : 'se check catches issues before execution, and the VS Code diagnostics use the same checker.'}</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">→</div>
              <h3>{zh ? '直譯 + Native' : 'Interpreted + native'}</h3>
              <p>{zh ? '使用 se run 快速執行，或以 se build 經 C++20 backend 產生 Native executable。' : 'Run quickly with se run or build a native executable through the C++20 backend.'}</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">W</div>
              <h3>{zh ? 'SE Web' : 'SE Web'}</h3>
              <p>{zh ? '以 SE component 語法描述 HTML、CSS 與 browser behavior，輸出標準 Web 檔案。' : 'Describe components, HTML, CSS and browser behavior in SE and emit standard Web files.'}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container install-band">
          <div>
            <h2>{zh ? '幾秒鐘開始' : 'Start in a few seconds'}</h2>
            <p>{zh ? 'macOS / Linux 可用安裝腳本取得正式版 SE。' : 'Install the released SE CLI on macOS or Linux, then verify with se doctor.'}</p>
          </div>
          <div className="install-command">curl -fsSL https://raw.githubusercontent.com/funlearnstudio/SE/main/install.sh | sh{`\n`}se --version{`\n`}se doctor</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>{zh ? '從語法一路學到完整應用' : 'Learn from syntax to complete workflows'}</h2>
              <p>{zh ? '文件依主題拆頁，59 個 module 也各自有 API 與使用範例。' : 'The documentation is split into focused lessons, with a dedicated API guide and example for every built-in module.'}</p>
            </div>
            <Link href="/learn">{zh ? '查看完整教學 →' : 'Read the full guide →'}</Link>
          </div>
          <div className="feature-grid">
            <article className="feature-card"><div className="feature-icon">01</div><h3>{zh ? '語法基礎' : 'Language basics'}</h3><p>{zh ? '值、變數、if、loop、function、collection。' : 'Values, variables, conditions, loops, functions and collections.'}</p></article>
            <article className="feature-card"><div className="feature-icon">02</div><h3>{zh ? '安全模型' : 'Safety model'}</h3><p>{zh ? 'try、fallible operation、Option、Result 與型別檢查。' : 'try, fallible operations, Option, Result and type checking.'}</p></article>
            <article className="feature-card"><div className="feature-icon">03</div><h3>{zh ? '標準函式庫' : 'Built-in modules'}</h3><p>{zh ? '從 statistics、regex 到 sqlite、threading、Node.js。' : 'From statistics and regex to SQLite, threading and Node.js.'}</p></article>
            <article className="feature-card"><div className="feature-icon">04</div><h3>{zh ? 'Web 與 Bridge' : 'Web & bridges'}</h3><p>{zh ? 'SE Web、Browser API、JavaScript、TypeScript、Node 與 Next。' : 'SE Web, Browser API, JavaScript, TypeScript, Node and Next bridges.'}</p></article>
          </div>
        </div>
      </section>
    </>
  );
}
