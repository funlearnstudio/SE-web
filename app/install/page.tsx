'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { PageIntro } from '@/components/PageIntro';
import { useLanguage } from '@/components/LanguageProvider';

export default function InstallPage() {
  const { language } = useLanguage();
  const zh = language === 'zh';
  return (
    <div className="container" style={{ paddingBottom: 72 }}>
      <PageIntro
        eyebrow="INSTALL SE 0.7.5"
        title={zh ? '安裝與核心工作流程' : 'Install and start building'}
        description={zh ? '預編譯版本可直接使用 REPL、run、check、check-all、test 與 web build。Native `se build` 另外需要 C++20 compiler。' : 'The prebuilt release supports the REPL, run, check, check-all, test, and web build. Native `se build` additionally requires a C++20 compiler.'}
      />
      <div className="install-grid">
        <section className="install-card">
          <h2>macOS / Linux</h2>
          <p>{zh ? '使用正式安裝腳本，完成後執行 se doctor 檢查環境。' : 'Use the release installer, then verify the environment with se doctor.'}</p>
          <CodeBlock title="Terminal" code={'curl -fsSL https://raw.githubusercontent.com/funlearnstudio/SE/main/install.sh | sh\n\nse --version\nse doctor'} />
        </section>
        <section className="install-card">
          <h2>Windows PowerShell</h2>
          <p>{zh ? '在 PowerShell 執行安裝指令並驗證 CLI。' : 'Run the installer in PowerShell, then verify the CLI.'}</p>
          <CodeBlock title="PowerShell" code={'irm https://raw.githubusercontent.com/funlearnstudio/SE/main/install.ps1 | iex\n\nse --version\nse doctor'} />
        </section>
      </div>

      <section className="section-tight">
        <div className="section-heading"><div><h2>{zh ? '每天會用到的指令' : 'The core workflow'}</h2><p>{zh ? '檢查、執行、測試、Native build 和 Web build 使用同一個 `se` CLI。' : 'Check, run, test, build native programs, and compile Web projects through one `se` CLI.'}</p></div></div>
        <CodeBlock title="Terminal" code={'se check app.se          # static checking\nse check-all .            # check a project\nse run app.se            # interpreter\nse test .                # tests\nse build app.se          # C++20 native backend\nse new app myapp         # new app\nse new web mysite        # new Web project\nse web build app.se dist # Web compiler'} />
      </section>

      <section className="section-tight">
        <div className="section-heading"><div><h2>{zh ? '從原始碼編譯 SE' : 'Build SE from source'}</h2><p>{zh ? '適合要開發 compiler/runtime 或使用 main 最新 source 的情況。' : 'Use this path when developing the compiler/runtime or testing the latest main source.'}</p></div></div>
        <CodeBlock title="Terminal" code={'git clone https://github.com/funlearnstudio/SE.git\ncd SE\ncmake -S . -B build -DCMAKE_BUILD_TYPE=Release\ncmake --build build --parallel\nctest --test-dir build --output-on-failure\n./build/se --version'} />
      </section>
      <div className="notice warning">
        {zh ? '`se build` 目前的 Native backend 會產生 C++20，因此即使 SE CLI 是用預編譯安裝包安裝，Native build 仍需要系統 C++20 compiler。' : '`se build` currently emits C++20. Even when the SE CLI comes from a prebuilt package, native builds still require a system C++20 compiler.'}
      </div>
    </div>
  );
}
