'use client';

import Link from 'next/link';
import { PageIntro } from '@/components/PageIntro';
import { useLanguage } from '@/components/LanguageProvider';
import { syntaxLessons } from '@/lib/lessons';

export default function LearnPage() {
  const { language, t } = useLanguage();
  const zh = language === 'zh';
  return (
    <div className="container">
      <PageIntro
        eyebrow={zh ? 'SE LANGUAGE GUIDE' : 'SE LANGUAGE GUIDE'}
        title={zh ? '完整語法教學' : 'Learn the SE language'}
        description={zh ? '從 say、read、陣列到 SE Web、Native 與開發工具，教材已同步 SE 0.8.0。' : 'From say and read to arrays, SE Web, native builds and developer tools, aligned with SE 0.8.0.'}
      />
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <strong>{zh ? '課程' : 'Lessons'}</strong>
          {syntaxLessons.map((lesson) => <Link key={lesson.slug} className="sidebar-link" href={`/learn/${lesson.slug}`}>{lesson.order}. {t(lesson.title)}</Link>)}
        </aside>
        <section className="docs-main">
          <div className="notice">
            {zh
              ? '核心語法已同步 SE 0.8.0 正式版，新增 read、型別／多維陣列及開發工具教學。SE Web 0.8 是另一組 Web 語法文件；網頁模擬器不等於原生 SE 執行期。'
              : 'Core language lessons now follow the SE 0.8.0 release. SE Web 0.8 refers to the separate Web language documentation, not a guarantee that all native SE APIs run in the browser simulator.'}
          </div>
          <div className="lesson-list">
            {syntaxLessons.map((lesson) => (
              <Link key={lesson.slug} href={`/learn/${lesson.slug}`} className="lesson-card">
                <span className="lesson-number">{String(lesson.order).padStart(2, '0')}</span>
                <h3>{t(lesson.title)}</h3>
                <p>{t(lesson.summary)}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
