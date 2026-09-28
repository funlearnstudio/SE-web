'use client';

import Link from 'next/link';
import { CodeBlock } from './CodeBlock';
import { PageIntro } from './PageIntro';
import { useLanguage } from './LanguageProvider';
import { groupInfo, SeModule } from '@/lib/modules';

export function ModulePageClient({ module }: { module: SeModule }) {
  const { language } = useLanguage();
  const zh = language === 'zh';
  return (
    <div className="container">
      <PageIntro
        eyebrow={`${groupInfo[module.group][language]} · BUILT-IN MODULE`}
        title={module.name}
        description={module.description[language]}
      />
      <div className="module-doc">
        <section className="module-api">
          <h2>{zh ? '快速開始' : 'Quick start'}</h2>
          <CodeBlock code={module.example} title={`use ${module.name}`} />
          <h2 style={{ marginTop: 34 }}>{zh ? 'API 參考' : 'API reference'}</h2>
          <div className="api-list">
            {module.members.map((member, index) => (
              <div className="api-row" key={`${member.name}-${index}`}>
                <div className="api-signature"><code>{module.name}.{member.usage}</code></div>
                <div className="api-desc">
                  <p>{member.description.en}</p>
                  <div className="zh-line">{member.description.zh}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="module-aside">
          <div className="info-card">
            <strong>{zh ? '匯入' : 'Import'}</strong>
            <code className="inline-code">use {module.name}</code>
          </div>
          <div className="info-card">
            <strong>{zh ? '分類' : 'Category'}</strong>
            <p>{groupInfo[module.group][language]}</p>
          </div>
          <div className="info-card">
            <strong>{zh ? 'API 數量' : 'API members'}</strong>
            <p>{module.members.length}</p>
          </div>
          <div className="info-card">
            <strong>{zh ? '錯誤處理' : 'Error handling'}</strong>
            <p>{zh ? '標示 Fallible 的 API 可能失敗，請依情境使用 try 或錯誤處理區塊。' : 'APIs marked Fallible can fail. Use try or an error-handling block where appropriate.'}</p>
          </div>
          <Link className="button-secondary" href="/modules" style={{ width: '100%' }}>{zh ? '← 所有 Modules' : '← All modules'}</Link>
        </aside>
      </div>
    </div>
  );
}
