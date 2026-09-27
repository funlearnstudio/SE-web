import { notFound } from 'next/navigation';
import { ModulePageClient } from '@/components/ModulePageClient';
import { moduleByName, modules } from '@/lib/modules';

export function generateStaticParams() {
  return modules.map((module) => ({ name: module.name }));
}

export default async function ModulePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const module = moduleByName[name];
  if (!module) notFound();
  return <ModulePageClient module={module} />;
}
