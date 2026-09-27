'use client';

import Link from 'next/link';
import { CodeBlock } from './CodeBlock';
import { PageIntro } from './PageIntro';
import { useLanguage } from './LanguageProvider';
import { Lesson, syntaxLessons } from '@/lib/lessons';

export function LessonPageClient({ lesson }: { lesson: Lesson }) {
  const { language, t } = useLanguage();
  const zh = language === 'zh';
  const index = syntaxLessons.findIndex((item) => item.slug === lesson.slug);
  const previous = index > 0 ? syntaxLessons[index - 1] : null;
  const next = index < syntaxLessons.length - 1 ? syntaxLessons[index + 1] : null;

  return (
    <div className="container">
      <PageIntro
        eyebrow={`${zh ? '第' : 'LESSON'} ${lesson.order}${zh ? ' 章' : ''}`}
        title={t(lesson.title)}
        description={t(lesson.summary)}
      />
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <strong>{zh ? '全部課程' : 'All lessons'}</strong>
          {syntaxLessons.map((item) => <Link key={item.slug} href={`/learn/${item.slug}`} className="sidebar-link">{item.order}. {t(item.title)}</Link>)}
        </aside>
        <article className="docs-main lesson-content">
          <h2>{zh ? '概念' : 'Concept'}</h2>
          <ul>
            {lesson.details.map((detail, i) => <li key={i}>{t(detail)}</li>)}
          </ul>
          <h3>{zh ? '範例' : 'Example'}</h3>
          <CodeBlock code={lesson.code} title={lesson.slug.includes('cli') ? 'Terminal' : 'SE'} />
          {lesson.notes?.length ? <><h3>{zh ? '注意事項' : 'Notes'}</h3><ul>{lesson.notes.map((note, i) => <li key={i}>{t(note)}</li>)}</ul></> : null}
          <div className="lesson-nav">
            <div>{previous ? <Link href={`/learn/${previous.slug}`}>← {t(previous.title)}</Link> : null}</div>
            <div>{next ? <Link href={`/learn/${next.slug}`}>{t(next.title)} →</Link> : <Link href="/modules">{zh ? '前往 Modules →' : 'Browse modules →'}</Link>}</div>
          </div>
        </article>
      </div>
    </div>
  );
}
