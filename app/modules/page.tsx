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
        description={zh ? '目前 SE 可直接 use 的 117 個 module 名稱。包含 28 個相容 alias；每個頁面列出 API、signature、用途與快速範例。別名包含：re→regex、itertools→iter、hashlib→hash、argparse→args、logging→log、zipfile→zip、sqlite3→sqlite、config→dotenv、series→array、linear→matrix、dataset→table、http_server／router→web、dns→socket，以及 gui、window、canvas、input、sprite、physics、sound、keyboard、mouse、animation、scene、collision、image、audio→game。' : 'The 117 module names currently available through use. Twenty-eight are compatibility aliases; every page includes API signatures, descriptions, and a quick-start example.'}
      />
      <div className="notice">
        {zh ? '117 個名稱中有 28 個 alias：re→regex、itertools→iter、hashlib→hash、argparse→args、logging→log、zipfile→zip、sqlite3→sqlite。' : 'Twenty-eight names are compatibility aliases. Aliases include re→regex, itertools→iter, hashlib→hash, argparse→args, logging→log, zipfile→zip, sqlite3→sqlite, config→dotenv, series→array, linear→matrix, dataset→table, http_server/router→web, dns→socket, and gui, window, canvas, input, sprite, physics, sound, keyboard, mouse, animation, scene, collision, image, and audio→game.'}
      </div>
      <div style={{ paddingBottom: 72 }}>
        <ModulesDirectory />
      </div>
    </div>
  );
}
