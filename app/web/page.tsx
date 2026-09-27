'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { PageIntro } from '@/components/PageIntro';
import { useLanguage } from '@/components/LanguageProvider';

export default function WebPage() {
  const { language } = useLanguage();
  const zh = language === 'zh';
  return (
    <div className="container" style={{ paddingBottom: 72 }}>
      <PageIntro
        eyebrow="SE WEB · 0.8 DOCS"
        title={zh ? '用 SE 描述 Web component' : 'Build Web components with SE'}
        description={zh ? 'SE Web 保留熟悉的 HTML、CSS 與 browser 概念，同時沿用 make、縮排與 SE control flow。' : 'SE Web keeps HTML, CSS, and browser concepts recognizable while reusing make, indentation, and familiar SE control flow.'}
      />
      <div className="notice">
        {zh ? 'SE Web 採獨立的 0.8 版本文件。產生的 app.ts 是 TypeScript-compatible companion output；進階 browser 功能仍可能需要 native escape hatch。' : 'SE Web is documented separately as 0.8. Generated app.ts is a TypeScript-compatible companion output, and advanced browser features may still use the native escape hatch.'}
      </div>
      <div className="web-guide-grid">
        <section className="guide-card">
          <h2>{zh ? 'Component' : 'Components'}</h2>
          <p>{zh ? 'Web component 直接沿用 make；html、css、js section 會綁定到 component instance。' : 'Web components reuse make. html, css, and js sections are associated with each component instance.'}</p>
          <CodeBlock code={'make Button text\n    html\n        button text\n\n    css\n        padding 12\n        border_radius 8\n\n    js\n        when click\n            say text'} />
        </section>
        <section className="guide-card">
          <h2>{zh ? 'Pages 與 Routing' : 'Pages & routing'}</h2>
          <p>{zh ? '宣告多個 page，產生的 router 使用 History API 切換。' : 'Declare multiple pages; the generated router uses the History API for navigation.'}</p>
          <CodeBlock code={'page "/"\n    Home\n\npage "/settings"\n    Settings\n\npage "/about"\n    About'} />
        </section>
        <section className="guide-card">
          <h2>HTML + CSS</h2>
          <p>{zh ? 'HTML tag 保持 Web 概念；CSS property 可用 underscore 寫法，如 border_radius。' : 'HTML tags remain Web concepts, while CSS properties can use SE-style underscores such as border_radius.'}</p>
          <CodeBlock code={'html\n    main\n        h1 "Hello"\n        p "Welcome"\n\ncss\n    padding 12\n    background "white"\n\n    button:hover\n        opacity 0.8'} />
        </section>
        <section className="guide-card">
          <h2>{zh ? 'Browser behavior' : 'Browser behavior'}</h2>
          <p>{zh ? 'Event code 支援常見 assignment、condition、loop、error handling 與 async browser operation。' : 'Event code supports common assignments, conditions, loops, error handling, and supported async browser operations.'}</p>
          <CodeBlock code={'js\n    when click\n        count += 1\n        if count >= 10\n            say "10+"\n        else\n            say count'} />
        </section>
      </div>

      <section className="section-tight">
        <div className="section-heading"><div><h2>{zh ? 'Browser API' : 'Browser API'}</h2><p>{zh ? 'Request、JSON、form、upload、navigation、cancellation 與常用 DOM 操作。' : 'Requests, JSON, forms, uploads, navigation, cancellation, and common DOM helpers.'}</p></div></div>
        <div className="web-guide-grid">
          <section className="guide-card">
            <h2>{zh ? 'Request 與 Async' : 'Requests & async'}</h2>
            <CodeBlock code={'options = [\n    "timeout": 8000,\n    "retries": 2,\n    "throw_http": true\n]\n\ntask = browser.get_json "/api/users" options\nresult = async.await task\nsay result.data'} />
          </section>
          <section className="guide-card">
            <h2>{zh ? '導航與 DOM' : 'Navigation & DOM'}</h2>
            <CodeBlock code={'browser.go "/settings"\nbrowser.back()\n\nbrowser.text "#status" "Saved"\nbrowser.set_value "#name" "SE"\nbrowser.disable "#save"'} />
          </section>
        </div>
      </section>

      <section className="section-tight">
        <div className="section-heading"><div><h2>{zh ? 'Browser API helper 清單' : 'Browser API helper list'}</h2><p>{zh ? '目前 0.8 文件列出的 request、navigation、DOM 與 cancellation helper。' : 'The request, navigation, DOM, and cancellation helpers documented for 0.8.'}</p></div></div>
        <CodeBlock title="Browser API" code={'browser.request\nbrowser.get\nbrowser.get_json\nbrowser.post\nbrowser.post_json\nbrowser.put_json\nbrowser.patch_json\nbrowser.delete\nbrowser.submit_json\nbrowser.upload\nbrowser.cancel\nbrowser.cancel_all\nbrowser.form_json\nbrowser.go\nbrowser.replace\nbrowser.back\nbrowser.forward\nbrowser.reload\nbrowser.open\nbrowser.text\nbrowser.value\nbrowser.set_value\nbrowser.show\nbrowser.hide\nbrowser.disable\nbrowser.enable\nbrowser.attr\nbrowser.html\nbrowser.pretty\nbrowser.online'} />
      </section>

      <section className="section-tight">
        <div className="section-heading"><div><h2>{zh ? 'Native escape hatch' : 'Native escape hatch'}</h2><p>{zh ? '尚未映射的 Web 平台能力可以在 html / css / js 區塊使用 native。' : 'For Web platform features not yet mapped by SE Web, use native inside html, css, or js sections.'}</p></div></div>
        <CodeBlock code={'html\n    native "<dialog open>Advanced HTML</dialog>"\n\ncss\n    native "accent-color: auto;"\n\njs\n    native "console.info(\'native browser code\')"'} />
      </section>

      <section className="section-tight">
        <div className="section-heading"><div><h2>{zh ? 'Build output' : 'Build output'}</h2></div></div>
        <CodeBlock title="Terminal" code={'se web build app.se dist\n\n# dist/\n#   index.html\n#   style.css\n#   app.js\n#   app.ts'} />
      </section>

      <div className="notice warning">
        {zh ? 'API secret、database password、server-only credential 不可放進 browser `.se` source。CORS、authentication、authorization、CSRF 與 server validation 仍是 backend / browser security model 的責任。' : 'Do not place API secrets, database passwords, or server-only credentials in browser `.se` source. CORS, authentication, authorization, CSRF, and server-side validation remain backend/browser security responsibilities.'}
      </div>
    </div>
  );
}
