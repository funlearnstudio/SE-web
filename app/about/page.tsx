'use client';

import { PageIntro } from '@/components/PageIntro';
import { CodeBlock } from '@/components/CodeBlock';
import { useLanguage } from '@/components/LanguageProvider';

export default function AboutPage() {
  const { language } = useLanguage();
  const zh = language === 'zh';
  return (
    <div className="narrow" style={{ paddingBottom: 72 }}>
      <PageIntro
        eyebrow="ABOUT SE"
        title="Simple at every level."
        description={zh ? 'SE 是以 C++20 實作、低標點、重視安全性的程式語言，目標是讓程式從第一行一路成長到大型應用時仍保持一致、可讀與簡單。' : 'SE is a low-punctuation, safety-first programming language implemented in C++20. Its goal is to keep programs consistent, readable, and simple as they grow.'}
      />
      <div className="lesson-content">
        <h2>{zh ? '架構' : 'Architecture'}</h2>
        <CodeBlock title="SE compiler" code={'SE source\n    ↓\nLexer → Tokens + INDENT/DEDENT\n    ↓\nPratt Parser\n    ↓\nAST\n    ↓\nStatic Checker\n    ├── Interpreter\n    ├── C++20 Backend → native executable\n    └── SE Web Compiler → HTML + CSS + JavaScript/TypeScript'} />
        <h2 style={{ marginTop: 30 }}>{zh ? '設計方向' : 'Design direction'}</h2>
        <p>{zh ? 'SE 強調低標點函式呼叫、縮排式 block、型別推斷、checked runtime operation，以及在 Interpreter、Native 與 Web 工作流程之間維持熟悉的語言模型。' : 'SE emphasizes low-punctuation calls, indentation-based blocks, type inference, checked runtime operations, and a familiar language model across interpreter, native, and Web workflows.'}</p>
      </div>
    </div>
  );
}
