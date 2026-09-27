export type Bilingual = { en: string; zh: string };

export type Lesson = {
  slug: string;
  order: number;
  title: Bilingual;
  summary: Bilingual;
  details: Bilingual[];
  code: string;
  notes?: Bilingual[];
};

export const syntaxLessons: Lesson[] = [
  {
    slug: 'hello-se', order: 1,
    title: { en: 'Hello SE', zh: '第一支 SE 程式' },
    summary: { en: 'SE source files use .se. The smallest useful program can be a single say statement.', zh: 'SE 原始碼使用 .se。最小的實用程式只需要一行 say。' },
    details: [
      { en: '`say` prints a value to standard output.', zh: '`say` 會把值輸出到終端。' },
      { en: 'Comments begin with `#`.', zh: '註解以 `#` 開頭。' },
      { en: 'Blocks are controlled by indentation rather than braces.', zh: '區塊使用縮排，不需要大括號。' }
    ],
    code: '# hello.se\nsay "Hello SE"\n\n# Run: se run hello.se\n# Check only: se check hello.se'
  },
  {
    slug: 'values-variables', order: 2,
    title: { en: 'Values & variables', zh: '值與變數' },
    summary: { en: 'Assign values with = and let SE infer common types.', zh: '使用 = 指派值，常見型別可由 SE 自動推斷。' },
    details: [
      { en: 'Core value families include None, Int, Num, Bool, Text, Bytes, List, Map, Set, functions, objects, errors and durations.', zh: '常見值包含 None、Int、Num、Bool、Text、Bytes、List、Map、Set、函式、物件、錯誤與 Duration。' },
      { en: 'Compound assignments include +=, -=, *=, /= and %=`.', zh: '複合指派包含 +=、-=、*=、/=、%=。' }
    ],
    code: 'name = "SE"\nage = 1\nscore = 98.5\nready = true\n\nscore += 1\nsay score'
  },
  {
    slug: 'input-output', order: 3,
    title: { en: 'Input & output', zh: '輸入與輸出' },
    summary: { en: 'Use say for output and ask for simple interactive text input.', zh: '使用 say 輸出，使用 ask 取得互動式文字輸入。' },
    details: [
      { en: '`ask` returns Text.', zh: '`ask` 會回傳 Text。' },
      { en: 'Text can be combined with +.', zh: 'Text 可使用 + 串接。' }
    ],
    code: 'name = ask "Your name?"\nsay "Hello " + name'
  },
  {
    slug: 'literals', order: 4,
    title: { en: 'Literals', zh: '字面值' },
    summary: { en: 'SE has concise literals for numbers, booleans, text, collections, sets and durations.', zh: 'SE 對數字、布林、文字、集合、Set 與時間長度提供簡潔字面值。' },
    details: [
      { en: 'Duration literals include ms, s and min.', zh: 'Duration 可使用 ms、s、min。' },
      { en: 'Map literals use key:value entries inside brackets.', zh: 'Map 在中括號中使用 key:value。' }
    ],
    code: '123\n3.14\ntrue\nfalse\n"text"\n[1, 2, 3]\n["name": "SE"]\nset [1, 2, 3]\n500ms\n2s\n1min'
  },
  {
    slug: 'operators', order: 5,
    title: { en: 'Operators', zh: '運算子' },
    summary: { en: 'Arithmetic, comparison, logic, membership and ranges stay compact.', zh: '算術、比較、邏輯、成員判斷與 Range 都維持簡潔。' },
    details: [
      { en: 'Arithmetic: + - * / % **', zh: '算術：+ - * / % **' },
      { en: 'Comparison: == != > >= < <=', zh: '比較：== != > >= < <=' },
      { en: 'Logic: and, or, not. Membership: in. Range: ..', zh: '邏輯：and、or、not；成員判斷：in；Range：..。' },
      { en: '`**` is right-associative. Precedence from high to low is **, unary -/not, */%, +/-, .., comparisons, ==/!=, and, or.', zh: '`**` 為右結合。優先序由高到低為 **、unary -/not、*/%、+/-、..、比較、==/!=、and、or。' }
    ],
    code: 'a = 10\nb = 3\nsay a + b\nsay a ** 2\nsay a > b\nsay a != b\nsay true and a > b\nsay 3 in [1, 2, 3]\nsay 1..5'
  },
  {
    slug: 'conditions', order: 6,
    title: { en: 'Conditions', zh: '條件判斷' },
    summary: { en: 'Use if, else if and else with indentation.', zh: '使用 if、else if、else 搭配縮排。' },
    details: [
      { en: 'Current source revisions may also accept `elif`; portable examples use `else if`.', zh: '較新的 source 可能接受 `elif`；文件範例以 `else if` 為主。' }
    ],
    code: 'score = 85\n\nif score >= 90\n    say "A"\nelse if score >= 80\n    say "B"\nelse\n    say "C"'
  },
  {
    slug: 'loops', order: 7,
    title: { en: 'Loops & ranges', zh: '迴圈與 Range' },
    summary: { en: 'Repeat fixed work, iterate collections, walk Map pairs, or loop while a condition is true.', zh: '可以固定重複、遍歷集合、遍歷 Map 鍵值，或在條件成立時持續執行。' },
    details: [
      { en: '`repeat` handles a fixed count.', zh: '`repeat` 處理固定次數。' },
      { en: '`for item in values` iterates collections.', zh: '`for item in values` 遍歷集合。' },
      { en: '`for key value in map` iterates Map pairs.', zh: '`for key value in map` 遍歷 Map 鍵值。' }
    ],
    code: 'repeat 3\n    say "Hi"\n\nfor n in 1..5\n    say n\n\nuser = ["name": "SE"]\nfor key value in user\n    say key\n    say value\n\nn = 0\nwhile n < 3\n    say n\n    n += 1'
  },
  {
    slug: 'functions', order: 8,
    title: { en: 'Functions & closures', zh: '函式與 Closure' },
    summary: { en: 'Create functions with make and return values with give. Calls normally omit parentheses.', zh: '使用 make 建立函式，以 give 回傳。一般呼叫不需要括號。' },
    details: [
      { en: 'Functions are values and can form closures.', zh: '函式本身也是值，也能形成 closure。' },
      { en: 'Low-punctuation calls are a core SE design rule.', zh: '低標點函式呼叫是 SE 的核心設計。' }
    ],
    code: 'make add a b\n    give a + b\n\nsay add 5 3\n\nmake make_adder base\n    make inner value\n        give base + value\n    give inner\n\nadd10 = make_adder 10\nsay add10 5'
  },
  {
    slug: 'typing-generics', order: 9,
    title: { en: 'Types & generic functions', zh: '型別與泛型函式' },
    summary: { en: 'Type annotations are optional where inference is sufficient, and generic functions can declare type parameters.', zh: '能推斷時不必寫型別；泛型函式可宣告型別參數。' },
    details: [
      { en: 'Typed parameters use name:Type and return types use -> Type.', zh: '參數型別使用 name:Type，回傳型別使用 -> Type。' }
    ],
    code: 'make add a:Int b:Int -> Int\n    give a + b\n\nmake identity[T] value:T -> T\n    give value'
  },
  {
    slug: 'collections', order: 10,
    title: { en: 'List, Map & Set', zh: 'List、Map 與 Set' },
    summary: { en: 'SE includes first-class collection values with indexing, membership and member operations.', zh: 'SE 內建集合值，支援索引、成員判斷與 member 操作。' },
    details: [
      { en: 'Lists preserve order, Maps store key/value pairs, and Sets keep unique values.', zh: 'List 保留順序，Map 儲存鍵值，Set 保存唯一值。' },
      { en: 'Collection operations are checked instead of exposing C++ undefined behavior.', zh: '集合操作會經過檢查，不把 C++ undefined behavior 直接暴露給使用者。' },
      { en: 'Members use value.member, indexing uses value[index], and supported values can expose basic help through value.help.', zh: 'Member 使用 value.member，索引使用 value[index]；支援的值也可透過 value.help 查看基本說明。' }
    ],
    code: 'nums = [1, 2, 3]\nnums.add 4\nsay nums.len\nsay nums[0]\n\nuser = ["name": "Steve", "role": "student"]\nsay user["name"]\n\nvalues = set [1, 2, 2, 3]\nif 3 in values\n    say "found"\n\nsay nums.help'
  },
  {
    slug: 'text-bytes', order: 11,
    title: { en: 'Text & Bytes', zh: 'Text 與 Bytes' },
    summary: { en: 'Text and binary-safe Bytes are separate value families.', zh: '文字 Text 與 binary-safe 的 Bytes 是不同的值類型。' },
    details: [
      { en: 'Text exposes common members such as len, upper and lower.', zh: 'Text 提供 len、upper、lower 等常用 member。' },
      { en: 'Keeping Bytes separate prevents arbitrary binary data from pretending to be text.', zh: 'Bytes 與 Text 分離可避免任意二進位資料被當作文字。' }
    ],
    code: 'text = "Hello"\nsay text.len\nsay text.upper\nsay text.lower\n\ndata = bytes "hello"\nsay data.len'
  },
  {
    slug: 'types-methods', order: 12,
    title: { en: 'User-defined types & methods', zh: '自訂 Type 與 Method' },
    summary: { en: 'Define compact object-like types with fields and methods.', zh: '使用簡潔語法定義帶有欄位與方法的自訂型別。' },
    details: [
      { en: 'Methods can resolve current-object fields without a mandatory self. prefix.', zh: 'Method 可直接解析目前物件的 field，不必強制寫 self.。' }
    ],
    code: 'type Player\n    name = ""\n    hp = 100\n\n    make hit damage\n        hp = hp - damage\n\n    make alive\n        give hp > 0\n\nplayer = Player\n    name = "Steve"\n\nplayer.hit 20\nsay player.hp'
  },
  {
    slug: 'modules', order: 13,
    title: { en: 'Modules', zh: '模組系統' },
    summary: { en: 'Use one module syntax for source, built-in, package and native modules.', zh: 'source、built-in、package 與 native module 共用同一套 use 語法。' },
    details: [
      { en: 'Top-level names beginning with _ follow the private convention.', zh: 'Top-level 名稱以 _ 開頭時遵循 private convention。' },
      { en: 'Circular imports are rejected with dependency information.', zh: 'Circular import 會被拒絕。' }
    ],
    code: 'use math\nuse statistics\n\nnums = [10, 20, 30]\nsay math.sqrt 25\nsay statistics.mean nums'
  },
  {
    slug: 'errors', order: 14,
    title: { en: 'Recoverable errors & try', zh: '可恢復錯誤與 try' },
    summary: { en: 'SE marks fallible work explicitly and can recover, propagate, or create errors.', zh: 'SE 讓可能失敗的操作明確可見，可處理、傳遞或建立錯誤。' },
    details: [
      { en: '`fail` creates a runtime error.', zh: '`fail` 建立 runtime error。' },
      { en: '`try` can handle a block or propagate a fallible expression where supported.', zh: '`try` 可處理區塊，也可在支援的位置傳遞 fallible expression。' }
    ],
    code: 'try\n    text = read "data.txt"\n    say text\nelse err\n    say err.message\n\nmake load\n    give try read "data.txt"\n\nmake check score\n    if score < 0\n        fail "Invalid score"\n    give score'
  },
  {
    slug: 'match-case', order: 15,
    title: { en: 'Match / case', zh: 'Match / Case' },
    summary: { en: 'SE supports concise value-based matching.', zh: 'SE 支援簡潔的 value-based matching。' },
    details: [
      { en: 'Current matching is equality/value based rather than a full destructuring pattern system.', zh: '目前以值與相等比較為主，尚非完整 destructuring pattern system。' }
    ],
    code: 'match status\n    case 200\n        say "ok"\n    case 404\n        say "not found"\n    else\n        say "other"'
  },
  {
    slug: 'option-result', order: 16,
    title: { en: 'Option & Result', zh: 'Option 與 Result' },
    summary: { en: 'Represent absence and success/failure as explicit values when that is clearer than control-flow errors.', zh: '當資料層需要明確表示「沒有值」或「成功／失敗」時，可使用 Option / Result。' },
    details: [
      { en: 'Option provides some/none helpers.', zh: 'Option 提供 some/none helper。' },
      { en: 'Result provides ok/err helpers.', zh: 'Result 提供 ok/err helper。' }
    ],
    code: 'use option\nuse result\n\nmaybe = option.some 42\nsay option.is_some maybe\n\nanswer = result.ok "done"\nsay result.is_ok answer'
  },
  {
    slug: 'async-threading', order: 17,
    title: { en: 'Async & managed workers', zh: 'Async 與 Managed Worker' },
    summary: { en: 'Start managed tasks and wait for their results using small runtime APIs.', zh: '透過簡潔的 runtime API 啟動 managed task 並等待結果。' },
    details: [
      { en: 'Managed tasks should not be assumed to mean unrestricted parallel execution of arbitrary VM code.', zh: 'Managed task 不代表任意 VM 程式都有無限制平行執行能力。' }
    ],
    code: 'use async\nuse threading\n\njob = async.run work 21\nanswer = async.await job\n\nworker = threading.run work 21\nresult = try threading.join worker'
  },
  {
    slug: 'files-paths-time', order: 18,
    title: { en: 'Files, paths & time', zh: '檔案、路徑與時間' },
    summary: { en: 'Common platform work is available without leaving SE.', zh: '常用平台操作可以直接在 SE 中完成。' },
    details: [
      { en: 'Core file operations include read, write and append.', zh: '核心檔案操作包含 read、write、append。' },
      { en: 'Path and time helpers live in built-in modules.', zh: 'Path 與 Time helper 位於 built-in module。' }
    ],
    code: 'write "hello.txt" "Hello"\nappend "hello.txt" " SE"\ntext = read "hello.txt"\nsay text\n\nuse path\nfile = path.join "data" "user.txt"\nsay path.exists file\n\nuse time\nsay time.now\nwait 500ms'
  },
  {
    slug: 'json-network', order: 19,
    title: { en: 'JSON & networking', zh: 'JSON 與網路' },
    summary: { en: 'SE maps JSON into native SE values and includes HTTP/HTTPS/network helpers.', zh: 'SE 會把 JSON 對應到原生 SE 值，並提供 HTTP/HTTPS/network helper。' },
    details: [
      { en: 'HTTP and HTTPS operations are fallible.', zh: 'HTTP 與 HTTPS 操作可能失敗，需要適當錯誤處理。' }
    ],
    code: 'use json\nuse https\n\nvalue = json.parse "{\\"name\\":\\"SE\\"}"\nsay value["name"]\n\nbody = try https.get "https://example.com"\nsay body'
  },
  {
    slug: 'testing', order: 20,
    title: { en: 'Testing', zh: '測試' },
    summary: { en: 'SE ships a small assertion module and a project test command.', zh: 'SE 內建簡潔 assertion module 與專案測試指令。' },
    details: [
      { en: 'Test files conventionally use *_test.se.', zh: '測試檔慣例使用 *_test.se。' },
      { en: 'Run project tests with `se test .`.', zh: '使用 `se test .` 執行專案測試。' }
    ],
    code: 'use test\n\ntest.equal 4 2 + 2\ntest.ok true\ntest.not_equal 1 2'
  },
  {
    slug: 'web-language', order: 21,
    title: { en: 'SE Web language', zh: 'SE Web 語言' },
    summary: { en: 'Reuse make and indentation to describe components with HTML, CSS and browser behavior.', zh: 'SE Web 沿用 make 與縮排來描述 HTML、CSS 與瀏覽器行為。' },
    details: [
      { en: 'SE Web is versioned separately and is currently documented as 0.8.', zh: 'SE Web 採獨立版本化，目前文件標示為 0.8。' },
      { en: 'Generated output is ordinary HTML, CSS, JavaScript and TypeScript companion output.', zh: '輸出為標準 HTML、CSS、JavaScript，以及 TypeScript companion output。' }
    ],
    code: 'make Button text\n    html\n        button text\n\n    css\n        padding 12\n        border_radius 8\n\n    js\n        when click\n            say text\n\npage "/"\n    Button "Save"'
  },
  {
    slug: 'browser-api', order: 22,
    title: { en: 'Browser API', zh: 'Browser API' },
    summary: { en: 'SE Web includes browser requests, navigation, forms, cancellation and DOM helpers.', zh: 'SE Web 提供瀏覽器 request、導航、表單、取消請求與 DOM helper。' },
    details: [
      { en: 'Async browser requests lower to real JavaScript await inside generated event handlers.', zh: '瀏覽器中的 async request 會在產生的 event handler 中降低成真正的 JavaScript await。' },
      { en: 'Server secrets must stay on the backend.', zh: '伺服器秘密資料必須留在 backend。' }
    ],
    code: 'task = browser.get_json "/api/users" ["timeout": 8000]\nresult = async.await task\nbrowser.text "#status" "Loaded"\n\nbrowser.go "/settings"'
  },
  {
    slug: 'native-interop', order: 23,
    title: { en: 'Native interoperability', zh: 'Native 互通' },
    summary: { en: 'Native libraries are exposed through C ABI descriptions while ordinary SE code keeps normal use syntax.', zh: 'Native library 透過 C ABI description 暴露，一般 SE 程式仍使用正常的 use 語法。' },
    details: [
      { en: 'The bridge supports scalar values, Text, Bytes and managed opaque handles.', zh: 'Bridge 支援 scalar value、Text、Bytes 與 managed opaque handle。' }
    ],
    code: 'use native_test\nsay add 20 22'
  },
  {
    slug: 'cli-workflows', order: 24,
    title: { en: 'CLI workflows', zh: 'CLI 工作流程' },
    summary: { en: 'One CLI covers checking, running, testing, native builds, projects and Web builds.', zh: '同一個 CLI 涵蓋檢查、執行、測試、Native build、建立專案與 Web build。' },
    details: [
      { en: '`se build` currently emits C++20 and therefore requires a C++20 compiler.', zh: '`se build` 目前會產生 C++20，因此需要 C++20 compiler。' }
    ],
    code: 'se check app.se\nse check-all .\nse run app.se\nse test .\nse build app.se\nse new app myapp\nse new web mysite\nse web build app.se dist'
  }
];

export const lessonBySlug = Object.fromEntries(syntaxLessons.map((lesson) => [lesson.slug, lesson]));
