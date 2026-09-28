'use client';

import { PageIntro } from '@/components/PageIntro';
import { ModulesDirectory } from '@/components/ModulesDirectory';
import { useLanguage } from '@/components/LanguageProvider';

export default function ModulesPage() {
  const { language } = useLanguage();
  const zh = language === 'zh';
  return (
    <div className="container">
      <PageIntro
        eyebrow="SE STANDARD LIBRARY"
        title={zh ? '117 個 Built-in Modules' : '117 built-in modules'}
        description={zh ? '目前有 117 個可直接 use 的模組。每個擴充包都有自己的 API 參考與快速範例。' : 'The 117 modules currently available through use. Each package has its own API reference and quick-start example.'}
      />
      <div style={{ paddingBottom: 72 }}>
        <ModulesDirectory />
      </div>
    </div>
  );
}
