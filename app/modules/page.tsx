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
        title={zh ? '59 個 Built-in Modules' : '59 built-in modules'}
        description={zh ? '目前 SE 可直接 use 的 59 個 module 名稱。包含 7 個相容 alias；每個頁面列出 API、signature、用途與快速範例。' : 'The 59 module names currently available through use. Seven are compatibility aliases; every page includes API signatures, descriptions, and a quick-start example.'}
      />
      <div className="notice">
        {zh ? '59 個名稱中有 7 個 alias：re→regex、itertools→iter、hashlib→hash、argparse→args、logging→log、zipfile→zip、sqlite3→sqlite。' : 'Seven names are aliases: re→regex, itertools→iter, hashlib→hash, argparse→args, logging→log, zipfile→zip, and sqlite3→sqlite.'}
      </div>
      <div style={{ paddingBottom: 72 }}>
        <ModulesDirectory />
      </div>
    </div>
  );
}
