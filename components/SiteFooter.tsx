'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';

export function SiteFooter() {
  const { language } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">SE</div>
          <p>{language === 'en' ? 'Simple at every level.' : '每一層都保持簡單。'}</p>
        </div>
        <div>
          <strong>{language === 'en' ? 'Documentation' : '文件'}</strong>
          <Link href="/learn">{language === 'en' ? 'Language guide' : '語言教學'}</Link>
          <Link href="/modules">{language === 'en' ? 'Module reference' : 'Module 參考'}</Link>
          <Link href="/web">SE Web</Link>
        </div>
        <div>
          <strong>{language === 'en' ? 'Tools' : '工具'}</strong>
          <Link href="/playground">{language === 'en' ? 'Playground' : '線上模擬器'}</Link>
          <Link href="/install">{language === 'en' ? 'Install SE' : '安裝 SE'}</Link>
          <a href="https://github.com/funlearnstudio/SE/releases" target="_blank" rel="noreferrer">Releases</a>
        </div>
      </div>
      <div className="footer-bottom">SE · MIT License · funlearnstudio/SE</div>
    </footer>
  );
}
