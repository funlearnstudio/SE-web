'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';

const links = [
  { href: '/learn', en: 'Learn', zh: '學習' },
  { href: '/modules', en: 'Modules', zh: '函式庫' },
  { href: '/playground', en: 'Playground', zh: '線上模擬器' },
  { href: '/web', en: 'SE Web', zh: 'SE Web' },
  { href: '/install', en: 'Install', zh: '安裝' }
];

export function SiteHeader() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="SE home">
          <Image src="/se-logo.png" alt="SE" width={38} height={38} priority />
          <span>SE</span>
          <span className="version-chip">0.7</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href} className={active ? 'nav-link active' : 'nav-link'}>
                {language === 'en' ? link.en : link.zh}
              </Link>
            );
          })}
        </nav>
        <div className="header-actions">
          <button
            className="language-toggle"
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            aria-label="Switch language"
          >
            {language === 'en' ? '中文' : 'EN'}
          </button>
          <a className="github-link" href="https://github.com/funlearnstudio/SE" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
