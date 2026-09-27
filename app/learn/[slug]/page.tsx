import { notFound } from 'next/navigation';
import { LessonPageClient } from '@/components/LessonPageClient';
import { lessonBySlug, syntaxLessons } from '@/lib/lessons';

export function generateStaticParams() {
  return syntaxLessons.map((lesson) => ({ slug: lesson.slug }));
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessonBySlug[slug];
  if (!lesson) notFound();
  return <LessonPageClient lesson={lesson} />;
}
