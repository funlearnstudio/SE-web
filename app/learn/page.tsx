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
        description={zh ? '從第一行 say 到型別、錯誤處理、Async、Native 與 SE Web。每一章都使用目前文件中的 SE 語法。' : 'From your first say statement to types, error handling, async, native interoperability and SE Web. Each lesson follows the current SE documentation.'}
      />
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <strong>{zh ? '課程' : 'Lessons'}</strong>
          {syntaxLessons.map((lesson) => <Link key={lesson.slug} className="sidebar-link" href={`/learn/${lesson.slug}`}>{lesson.order}. {t(lesson.title)}</Link>)}
        </aside>
        <section className="docs-main">
          <div className="notice">
            {zh
              ? 'Core language 以 SE 0.7.0 正式版文件為主；SE Web / Browser API 另以 0.8 版本文件標示，避免把版本化 Web 功能和 0.7 runtime 混在一起。'
              : 'Core language lessons follow the SE 0.7.0 release documentation. SE Web and the Browser API are labeled separately as 0.8 documentation so versioned Web work is not confused with the 0.7 runtime.'}
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
