import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: { default: 'SE — Simple at every level', template: '%s · SE' },
  description: 'The official-style documentation site for SE, a low-punctuation, safety-first programming language.',
  icons: { icon: '/se-logo.png' },
  openGraph: {
    title: 'SE — Simple at every level',
    description: 'Learn SE, browse all built-in modules, and try the browser playground.',
    type: 'website'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
