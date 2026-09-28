export type ModuleMember = {
  name: string;
  usage: string;
  description: { en: string; zh: string };
  kind?: 'function' | 'value';
};

export type SeModule = {
  name: string;
  group: string;
  description: { en: string; zh: string };
  members: ModuleMember[];
  example: string;
  aliasFor?: string;
};

const zhExact: Record<string, string> = {
  'Read a file. Fallible.': '讀取檔案。此操作可能失敗。',
  'Write a file. Fallible.': '寫入檔案。此操作可能失敗。',
  'Append Text to a file. Fallible.': '將 Text 追加到檔案。此操作可能失敗。',
  'Open a file handle. Fallible.': '開啟檔案 handle。此操作可能失敗。',
  'Copy a file. Fallible.': '複製檔案。此操作可能失敗。',
  'Move or rename a path. Fallible.': '移動或重新命名路徑。此操作可能失敗。',
  'Recursively copy a directory. Fallible.': '遞迴複製目錄。此操作可能失敗。',
  'Remove a file or directory tree. Fallible.': '移除檔案或整個目錄樹。此操作可能失敗。',
  'Create directories. Fallible.': '建立目錄。此操作可能失敗。',
  'Join one or more path parts.': '合併一個或多個路徑片段。',
  'Return the final path component.': '回傳路徑最後一個元件。',
  'Return the extension.': '回傳副檔名。',
  'Return the parent path.': '回傳父層路徑。',
  'Check whether a path exists.': '檢查路徑是否存在。',
  'Check whether a path is a file.': '檢查路徑是否為檔案。',
  'Check whether a path is a directory.': '檢查路徑是否為目錄。',
  'Return the current Time value.': '回傳目前的 Time 值。',
  'Convert Time to a Unix timestamp.': '將 Time 轉換成 Unix timestamp。',
  'Convert a Unix timestamp to Time.': '將 Unix timestamp 轉換成 Time。',
  'Format Time as UTC ISO-8601.': '將 Time 格式化為 UTC ISO-8601。',
  'Random Int in an inclusive range.': '在包含端點的範圍內產生隨機 Int。',
  'Random Num in [0, 1).': '產生 [0, 1) 範圍的隨機 Num。',
  'Parse JSON Text into an SE value.': '將 JSON Text 解析成 SE 值。',
  'Serialize an SE value as compact JSON.': '將 SE 值序列化為精簡 JSON。',
  'Serialize an SE value as formatted JSON.': '將 SE 值序列化為格式化 JSON。',
  'Trim surrounding whitespace.': '移除文字前後空白。',
  'Check whether Text contains a substring.': '檢查 Text 是否包含子字串。',
  'Check a prefix.': '檢查文字開頭。',
  'Check a suffix.': '檢查文字結尾。',
  'Replace text.': '替換文字。',
  'Split Text into a List.': '將 Text 切割成 List。',
  'Join values using a separator.': '使用分隔符號連接值。',
  'Repeat Text.': '重複 Text。',
  'Reverse a collection.': '反轉集合。',
  'Check membership.': '檢查成員是否存在。',
  'Return the first value.': '回傳第一個值。',
  'Return the last value.': '回傳最後一個值。',
  'Remove duplicate values.': '移除重複值。',
  'Sort values.': '排序值。',
  'Return Map keys.': '回傳 Map 的 keys。',
  'Return Map values.': '回傳 Map 的 values。',
  'Assert a Bool is true.': '斷言 Bool 為 true。',
  'Assert two values are equal.': '斷言兩個值相等。',
  'Assert two values differ.': '斷言兩個值不同。',
  'Fail a test explicitly.': '明確讓測試失敗。',
  'Start a managed task.': '啟動 managed task。',
  'Wait for a managed task. Fallible.': '等待 managed task 完成。此操作可能失敗。',
  'Check whether a task is complete.': '檢查 task 是否完成。',
  'Start a managed worker task.': '啟動 managed worker task。',
  'Wait for a managed worker task. Fallible.': '等待 managed worker task 完成。此操作可能失敗。',
  'Check whether a worker task is complete.': '檢查 worker task 是否完成。',
  'Create an Option containing a value.': '建立包含值的 Option。',
  'Create an empty Option.': '建立空的 Option。',
  'Check whether an Option contains a value.': '檢查 Option 是否包含值。',
  'Check whether an Option is empty.': '檢查 Option 是否為空。',
  'Get the contained value. Fallible.': '取得其中的值。此操作可能失敗。',
  'Return the value or a fallback.': '回傳值；沒有值時回傳 fallback。',
  'Create a successful Result.': '建立成功的 Result。',
  'Create a failed Result.': '建立失敗的 Result。',
  'Check for success.': '檢查是否成功。',
  'Check for failure.': '檢查是否失敗。',
  'Get the success value. Fallible.': '取得成功值。此操作可能失敗。',
  'Get the error message.': '取得錯誤訊息。',
  'Return success value or fallback.': '成功時回傳值，否則回傳 fallback。',
  'Generate a random UUID v4.': '產生隨機 UUID v4。',
  'Validate a UUID string.': '驗證 UUID 字串。',
  'Arithmetic mean.': '算術平均數。',
  'Median.': '中位數。',
  'Sample variance.': '樣本變異數。',
  'Population variance.': '母體變異數。',
  'Sample standard deviation.': '樣本標準差。',
  'Population standard deviation.': '母體標準差。',
  'Encode Text as Base64.': '將 Text 編碼成 Base64。',
  'Decode Base64 Text. Fallible.': '解碼 Base64 Text。此操作可能失敗。',
  'Current UTC ISO timestamp.': '目前 UTC ISO 時間字串。',
  'Current Unix timestamp.': '目前 Unix timestamp。',
  'Serialize a value as safe JSON Text.': '將值序列化為安全的 JSON Text。',
  'Deserialize safe JSON Text. Fallible.': '反序列化安全 JSON Text。此操作可能失敗。',
  'Return the runtime SE type name.': '回傳 runtime 中的 SE 型別名稱。',
  'Check the runtime type name.': '檢查 runtime 型別名稱。',
  'Assert a runtime type and return the value.': '確認 runtime 型別後回傳原值。'
};

function zh(en: string): string {
  if (zhExact[en]) return zhExact[en];
  let s = en
    .replace(/Fallible\./g, '此操作可能失敗。')
    .replace(/^Return /, '回傳 ')
    .replace(/^Create /, '建立 ')
    .replace(/^Check whether /, '檢查是否 ')
    .replace(/^Check /, '檢查 ')
    .replace(/^Run /, '執行 ')
    .replace(/^Start /, '啟動 ')
    .replace(/^Open /, '開啟 ')
    .replace(/^Read /, '讀取 ')
    .replace(/^Write /, '寫入 ')
    .replace(/^Parse /, '解析 ')
    .replace(/^Serialize /, '序列化 ')
    .replace(/^Convert /, '轉換 ')
    .replace(/^Generate /, '產生 ')
    .replace(/^Validate /, '驗證 ')
    .replace(/^Execute /, '執行 ')
    .replace(/^Perform /, '執行 ')
    .replace(/^Capture /, '擷取 ')
    .replace(/^Set /, '設定 ')
    .replace(/^Get /, '取得 ')
    .replace(/^Remove /, '移除 ')
    .replace(/^Append /, '加入 ')
    .replace(/^Copy /, '複製 ')
    .replace(/^Move /, '移動 ')
    .replace(/^Find /, '尋找 ')
    .replace(/^Format /, '格式化 ')
    .replace(/^Add /, '加入 ')
    .replace(/^Subtract /, '相減 ')
    .replace(/^Multiply /, '相乘 ')
    .replace(/^Divide /, '相除 ')
    .replace(/^Map /, '映射 ')
    .replace(/^Filter /, '篩選 ')
    .replace(/^Reduce /, '歸約 ')
    .replace(/^Sort /, '排序 ')
    .replace(/^Match /, '比對 ')
    .replace(/^Invoke /, '呼叫 ')
    .replace(/^Connect /, '連線 ')
    .replace(/^Download /, '下載 ')
    .replace(/^Compile /, '編譯 ')
    .replace(/^Percent-encode /, "將以下內容進行 URL 百分比編碼：")
    .replace(/^Decode /, "解碼")
    .replace(/^Encode /, "編碼")
    .replace(/^Sum /, "計算總和：")
    .replace(/^Mean /, "計算平均數：")
    .replace(/^Transpose /, "轉置")
    .replace(/^Multiply /, "相乘")
    .replace(/^Dot /, "計算內積：")
    .replace(/^Factorial /, "計算階乘：")
    .replace(/^Combination /, "計算組合數：")
    .replace(/^Convert /, "轉換")
    .replace(/^Extract /, "擷取")
    .replace(/^Count /, "計算")
    .replace(/^Create /, "建立")
    .replace(/^Read /, "讀取")
    .replace(/^Write /, "寫入")
    .replace(/^Parse /, "解析")
    .replace(/^Serialize /, "序列化")
    .replace(/^Compute /, "計算")
    .replace(/^Sign /, "簽署")
    .replace(/^Verify /, "驗證")
    .replace(/^Compose /, "建立")
    .replace(/^Send /, "寄送")
    .replace(/^Run /, "執行")
    .replace(/^Exchange /, "交換")
    .replace(/^Request /, "向端點請求")
    .replace(/^Fit /, "擬合")
    .replace(/^Predict /, "預測")
    .replace(/^Return /, "回傳")
    .replace(/^Start /, "啟動")
    .replace(/^Stop /, "停止")
    .replace(/^Add /, "加入")
    .replace(/^Render /, "渲染")
    .replace(/^Detect /, "偵測")
    .replace(/^Save /, "儲存")
    .replace(/^Generate /, "產生")
    .replace(/^Escape /, "跳脫")
    .replace(/^Check /, "檢查")
    .replace(/^Set /, "設定")
    .replace(/^List /, "列出")
    .replace(/^Download /, "下載")
    .replace(/^Upload /, "上傳")
    .replace(/^Enable /, "啟用")
    .replace(/^Test /, "測試")
    replace(/^Evaluate /, '執行並取得結果 ');
  return s;
}

const f = (name: string, usage: string, en: string, kind: 'function' | 'value' = 'function'): ModuleMember => ({
  name, usage, description: { en, zh: zh(en) }, kind
});

const groupInfo: Record<string, { en: string; zh: string }> = {
  core: { en: 'Core & system', zh: '核心與系統' },
  data: { en: 'Data & text', zh: '資料與文字' },
  math: { en: 'Math & utility', zh: '數學與工具' },
  io: { en: 'Files & processes', zh: '檔案與 Process' },
  network: { en: 'Networking & web', zh: '網路與 Web' },
  concurrency: { en: 'Async & concurrency', zh: 'Async 與並行' },
  safety: { en: 'Types & safe values', zh: '型別與安全值' },
  ecosystem: { en: 'Ecosystem bridges', zh: '生態系 Bridge' },
  database: { en: 'Database', zh: '資料庫' },
  testing: { en: 'Testing & logging', zh: '測試與 Logging' }
};

export { groupInfo };

const base: Record<string, Omit<SeModule, 'name'>> = {
  file: {
    group: 'io', description: { en: 'File reading, writing, copy, move, and directory helpers.', zh: '檔案讀寫、複製、移動與目錄操作。' },
    members: [f('read','read path','Read a file. Fallible.'),f('write','write path text','Write a file. Fallible.'),f('append','append path text','Append Text to a file. Fallible.'),f('open','open path','Open a file handle. Fallible.'),f('copy','copy source target','Copy a file. Fallible.'),f('move','move source target','Move or rename a path. Fallible.'),f('copytree','copytree source target','Recursively copy a directory. Fallible.'),f('remove','remove path','Remove a file or directory tree. Fallible.'),f('mkdir','mkdir path','Create directories. Fallible.')],
    example: 'use file\n\ntext = try file.read "notes.txt"\nsay text\ntry file.write "copy.txt" text'
  },
  path: {
    group: 'io', description: { en: 'Filesystem path helpers.', zh: '檔案系統路徑處理工具。' },
    members: [f('join','join part...','Join one or more path parts.'),f('name','name path','Return the final path component.'),f('ext','ext path','Return the extension.'),f('parent','parent path','Return the parent path.'),f('exists','exists path','Check whether a path exists.'),f('is_file','is_file path','Check whether a path is a file.'),f('is_dir','is_dir path','Check whether a path is a directory.')],
    example: 'use path\n\nfile = path.join "data" "users.json"\nsay file\nsay path.ext file\nsay path.exists file'
  },
  time: {
    group: 'core', description: { en: 'SE Time value helpers.', zh: 'SE Time 值與 Unix/ISO 時間工具。' },
    members: [f('now','now','Return the current Time value.'),f('unix','unix time','Convert Time to a Unix timestamp.'),f('from_unix','from_unix timestamp','Convert a Unix timestamp to Time.'),f('iso','iso time','Format Time as UTC ISO-8601.')],
    example: 'use time\n\nnow = time.now\nsay time.iso now\nsay time.unix now'
  },
  math: {
    group: 'math', description: { en: 'Mathematics, trigonometry, combinatorics, and statistics.', zh: '數學、三角函數、組合數學與基礎統計。' },
    members: [
      f('pi','pi','Pi.','value'),f('e','e','Euler number.','value'),f('tau','tau','Tau (2*pi).','value'),f('inf','inf','Positive infinity.','value'),
      ...['sqrt','cbrt','abs','floor','ceil','round','trunc','sin','cos','tan','asin','acos','atan','sinh','cosh','tanh','asinh','acosh','atanh','exp','exp2','expm1','log','log10','log2','log1p','degrees','radians','gamma','lgamma','erf','erfc'].map(n=>f(n,`${n} number`,'Numeric math helper.')),
      ...['atan2','pow','fmod','remainder','copysign','nextafter'].map(n=>f(n,`${n} a b`,'Two-number math helper.')),
      f('hypot','hypot number number...','Euclidean norm for two or more values.'),f('min','min number number...','Minimum of two or more values.'),f('max','max number number...','Maximum of two or more values.'),f('clamp','clamp value min max','Clamp a number into a range.'),f('lerp','lerp a b t','Linear interpolation.'),f('map_range','map_range value in_min in_max out_min out_max','Map a value between ranges.'),f('sign','sign number','Return -1, 0, or 1.'),f('isfinite','isfinite number','Check whether a number is finite.'),f('isinf','isinf number','Check whether a number is infinite.'),f('isnan','isnan number','Check whether a number is NaN.'),f('gcd','gcd int int...','Greatest common divisor.'),f('lcm','lcm int int...','Least common multiple.'),f('factorial','factorial int','Factorial for a non-negative Int.'),f('comb','comb n k','Number of combinations.'),f('perm','perm n k','Number of permutations.'),f('sum','sum list','Sum numeric List values.'),f('mean','mean list','Mean of numeric List values.'),f('median','median list','Median of numeric List values.'),f('variance','variance list','Population variance helper.'),f('stddev','stddev list','Population standard deviation helper.')
    ],
    example: 'use math\n\nsay math.sqrt 81\nsay math.factorial 5\nsay math.clamp 120 0 100\nsay math.pi'
  },
  random: {
    group: 'math', description: { en: 'Random integer and number generation.', zh: '隨機整數與浮點數產生器。' },
    members: [f('int','int min max','Random Int in an inclusive range.'),f('num','num','Random Num in [0, 1).')],
    example: 'use random\n\nsay random.int 1 6\nsay random.num'
  },
  os: {
    group: 'core', description: { en: 'Operating-system and environment helpers.', zh: '作業系統與環境變數工具。' },
    members: [f('platform','platform','Current platform name.','value'),f('cwd','cwd','Current working directory.'),f('getenv','getenv name','Read an environment variable.'),f('has_env','has_env name','Check whether an environment variable exists.')],
    example: 'use os\n\nsay os.platform\nsay os.cwd\nif os.has_env "HOME"\n    say os.getenv "HOME"'
  },
  json: {
    group: 'data', description: { en: 'JSON parsing and serialization.', zh: 'JSON 解析與序列化。' },
    members: [f('parse','parse text','Parse JSON Text into an SE value.'),f('stringify','stringify value','Serialize an SE value as compact JSON.'),f('pretty','pretty value','Serialize an SE value as formatted JSON.')],
    example: 'use json\n\ndata = json.parse "{\\"name\\":\\"SE\\"}"\nsay data["name"]\nsay json.pretty data'
  },
  text: {
    group: 'data', description: { en: 'Text manipulation helpers.', zh: '文字處理工具。' },
    members: [f('trim','trim text','Trim surrounding whitespace.'),f('contains','contains text search','Check whether Text contains a substring.'),f('starts','starts text prefix','Check a prefix.'),f('ends','ends text suffix','Check a suffix.'),f('replace','replace text old new','Replace text.'),f('split','split text separator','Split Text into a List.'),f('join','join values separator','Join values using a separator.'),f('repeat','repeat text count','Repeat Text.')],
    example: 'use text\n\nwords = text.split "SE is simple" " "\nsay text.join words "-"\nsay text.trim "  hello  "'
  },
  collections: {
    group: 'data', description: { en: 'List, Map, Set, sorting, mapping, and filtering helpers.', zh: 'List、Map、Set、排序、map 與 filter 工具。' },
    members: [f('reverse','reverse values','Reverse a collection.'),f('contains','contains values value','Check membership.'),f('first','first values','Return the first value.'),f('last','last values','Return the last value.'),f('unique','unique values','Remove duplicate values.'),f('sort','sort values','Sort values.'),f('keys','keys map','Return Map keys.'),f('values','values map','Return Map values.'),f('filter','filter list predicate','Return values for which predicate is true.'),f('map','map list function','Transform every value into a new List.'),f('reduce','reduce list initial function','Reduce a List into one value.'),f('slice','slice list start end','Return a List slice.'),f('take','take list count','Take the first count values.'),f('drop','drop list count','Drop the first count values.'),f('sort_by','sort_by list field','Sort by a field/key.'),f('sort_by_desc','sort_by_desc list field','Sort descending by field/key.'),f('sort_with','sort_with list comparator','Sort using a comparator function.')],
    example: 'use collections\n\nnums = [3, 1, 3, 2]\nsay collections.sort nums\nsay collections.unique nums\nsay collections.first nums'
  },
  test: {
    group: 'testing', description: { en: 'Assertions for SE tests.', zh: 'SE 測試 assertion。' },
    members: [f('ok','ok condition','Assert a Bool is true.'),f('equal','equal actual expected','Assert two values are equal.'),f('not_equal','not_equal actual expected','Assert two values differ.'),f('fail','fail message','Fail a test explicitly.')],
    example: 'use test\n\ntest.equal 4 2 + 2\ntest.ok true\ntest.not_equal "SE" "Python"'
  },
  process: {
    group: 'io', description: { en: 'External process execution.', zh: '外部 process 執行。' },
    members: [f('run','run command args...','Run an external process. Fallible.'),f('output','output command','Capture process output. Fallible.')],
    example: 'use process\n\nversion = try process.output "node --version"\nsay version'
  },
  http: {
    group: 'network', description: { en: 'HTTP client helpers.', zh: 'HTTP client 工具。' },
    members: [f('get','get url','Perform an HTTP GET request. Fallible.'),f('post','post url body','Perform an HTTP POST request. Fallible.'),f('post_json','post_json url json','POST a JSON body. Fallible.'),f('request','request method url body','Perform a general HTTP request. Fallible.')],
    example: 'use http\n\nbody = try http.get "http://example.com"\nsay body'
  },
  web: {
    group: 'network', description: { en: 'SE HTTP server and routing.', zh: 'SE 內建 HTTP server 與 routing。' },
    members: [...['get','post','put','patch','delete'].map(n=>f(n,`${n} path handler`,`Register an HTTP ${n.toUpperCase()} route.`)),f('listen','listen port','Start the SE web server. Fallible.'),f('text','text body','Create a text response.'),f('json','json body','Create a JSON response.'),f('response','response status body type','Create a custom response.'),f('method','method','Current request method.'),f('path','path','Current request path.'),f('query','query','Current request query string.'),f('body','body','Current request body.'),f('header','header name','Read a request header.'),f('param','param name','Read a route parameter.'),f('handle','handle method path body','Invoke a route in-process.'),f('handle_status','handle_status method path body','Return in-process route status.'),f('route_count','route_count','Number of registered routes.')],
    example: 'use web\n\nmake home\n    give web.text "Hello from SE"\n\nweb.get "/" home\ntry web.listen 8080'
  },
  js: {
    group: 'ecosystem', description: { en: 'JavaScript bridge.', zh: 'JavaScript bridge。' },
    members: [f('run','run file','Run a JavaScript file. Fallible.'),f('output','output file','Run JavaScript and capture output. Fallible.'),f('eval','eval code','Evaluate JavaScript and capture output. Fallible.')],
    example: 'use js\n\nanswer = try js.eval "console.log(6 * 7)"\nsay answer'
  },
  ts: {
    group: 'ecosystem', description: { en: 'TypeScript bridge.', zh: 'TypeScript bridge。' },
    members: [f('run','run file','Run TypeScript. Fallible.'),f('compile','compile file','Compile TypeScript. Fallible.'),f('output','output file','Run TypeScript and capture output. Fallible.')],
    example: 'use ts\n\ntry ts.compile "app.ts"\noutput = try ts.output "app.ts"\nsay output'
  },
  function: {
    group: 'safety', description: { en: 'Function-value and higher-order helpers.', zh: '函式值與高階函式工具。' },
    members: [f('bind','bind function args...','Partially bind function arguments.'),f('partial','partial function args...','Create a partially applied function.'),f('call','call function args...','Call a function value.'),f('pipe','pipe value functions...','Pass a value through functions.'),f('reduce','reduce function list initial?','Reduce a List using a function.'),f('map','map function list','Map a function over a List.'),f('filter','filter function list','Filter a List using a predicate.')],
    example: 'use function\n\nmake double x\n    give x * 2\n\nnums = [1, 2, 3]\nsay function.map double nums'
  },
  async: {
    group: 'concurrency', description: { en: 'Managed asynchronous tasks.', zh: 'Managed asynchronous task。' },
    members: [f('run','run function args...','Start a managed task.'),f('await','await task','Wait for a managed task. Fallible.'),f('ready','ready task','Check whether a task is complete.')],
    example: 'use async\n\njob = async.run work 21\nanswer = try async.await job\nsay answer'
  },
  threading: {
    group: 'concurrency', description: { en: 'Managed worker tasks.', zh: 'Managed worker task。' },
    members: [f('run','run function args...','Start a managed worker task.'),f('join','join task','Wait for a managed worker task. Fallible.'),f('ready','ready task','Check whether a worker task is complete.')],
    example: 'use threading\n\nworker = threading.run work 21\nanswer = try threading.join worker\nsay answer'
  },
  option: {
    group: 'safety', description: { en: 'Optional-value helpers.', zh: 'Optional value 工具。' },
    members: [f('some','some value','Create an Option containing a value.'),f('none','none','Create an empty Option.'),f('is_some','is_some option','Check whether an Option contains a value.'),f('is_none','is_none option','Check whether an Option is empty.'),f('value','value option','Get the contained value. Fallible.'),f('or','or option fallback','Return the value or a fallback.')],
    example: 'use option\n\nvalue = option.some 42\nsay option.is_some value\nsay option.or value 0'
  },
  result: {
    group: 'safety', description: { en: 'Success/failure result helpers.', zh: '成功／失敗 Result 工具。' },
    members: [f('ok','ok value','Create a successful Result.'),f('err','err message','Create a failed Result.'),f('is_ok','is_ok result','Check for success.'),f('is_err','is_err result','Check for failure.'),f('value','value result','Get the success value. Fallible.'),f('error','error result','Get the error message.'),f('or','or result fallback','Return success value or fallback.')],
    example: 'use result\n\nanswer = result.ok 42\nsay result.is_ok answer\nsay result.or answer 0'
  },
  match: {
    group: 'safety', description: { en: 'Functional matching helpers.', zh: '函式式 matching 工具。' },
    members: [f('value','value subject pattern handler ... fallback','Match values with handler functions.'),f('option','option option some_handler none_handler','Match an Option.'),f('result','result result ok_handler error_handler','Match a Result.')],
    example: 'use match\nuse option\n\nvalue = option.some 5\nanswer = match.option value on_some on_none\nsay answer'
  },
  db: {
    group: 'database', description: { en: 'Local key/value database.', zh: '本機 key/value 資料庫。' },
    members: [f('open','open path','Open a local key/value database. Fallible.'),f('set','set database key value','Set and persist a Text value. Fallible.'),f('get','get database key','Get a value as Option.'),f('has','has database key','Check whether a key exists.'),f('remove','remove database key','Remove and persist a key. Fallible.'),f('keys','keys database','List keys.'),f('save','save database','Persist the database. Fallible.')],
    example: 'use db\n\nstore = try db.open "app.db"\ntry db.set store "name" "SE"\nvalue = db.get store "name"\nsay value'
  },
  https: {
    group: 'network', description: { en: 'HTTPS client through curl.', zh: '透過 curl 提供的 HTTPS client。' },
    members: [f('get','get url','Perform an HTTPS GET request. Fallible.'),f('post','post url body','Perform an HTTPS POST request. Fallible.'),f('post_json','post_json url json','POST JSON over HTTPS. Fallible.')],
    example: 'use https\n\nbody = try https.get "https://example.com"\nsay body'
  },
  data: {
    group: 'data', description: { en: 'Mutable List/Map/Set data helpers.', zh: '可變 List/Map/Set 資料操作工具。' },
    members: [f('append','append list value','Append to a List.'),f('extend','extend list values','Extend a List.'),f('insert','insert list index value','Insert into a List.'),f('pop','pop list index?','Remove and return a List value.'),f('clear','clear collection','Clear a List, Map, or Set.'),f('copy','copy collection','Shallow-copy a List, Map, or Set.'),f('get','get map key default?','Read a Map value with optional default.'),f('set','set map key value','Set a Map value.'),f('update','update map source','Merge Map values.'),f('delete','delete map key','Delete a Map key.'),f('has','has collection value','Check a List value or Map key.'),f('keys','keys map','List Map keys.'),f('values','values map','List Map values.'),f('items','items map','List Map key/value pairs.')],
    example: 'use data\n\nnums = [1, 2]\ndata.append nums 3\nsay nums\n\nuser = ["name": "SE"]\nsay data.get user "name" "unknown"'
  },
  net: {
    group: 'network', description: { en: 'HTTP/HTTPS networking through curl.', zh: '透過 curl 的 HTTP/HTTPS 網路工具。' },
    members: [f('get','get url','GET an HTTP/HTTPS URL through curl. Fallible.'),f('post','post url body','POST Text through curl. Fallible.'),f('post_json','post_json url json','POST JSON through curl. Fallible.'),f('request','request method url body','General network request. Fallible.'),f('download','download url path','Download a URL to a file. Fallible.')],
    example: 'use net\n\nbody = try net.get "https://example.com"\ntry net.download "https://example.com/file.txt" "file.txt"'
  },
  node: {
    group: 'ecosystem', description: { en: 'Node.js, npm, and npx bridge.', zh: 'Node.js、npm 與 npx bridge。' },
    members: [f('version','version','Return Node.js version. Fallible.'),f('run','run file','Run a Node.js file. Fallible.'),f('output','output file','Run Node.js and capture output. Fallible.'),f('eval','eval code','Evaluate JavaScript with Node.js. Fallible.'),f('npm','npm args','Run npm arguments. Fallible.'),f('npx','npx args','Run npx arguments. Fallible.')],
    example: 'use node\n\nsay try node.version\noutput = try node.eval "console.log(21 * 2)"\nsay output'
  },
  next: {
    group: 'ecosystem', description: { en: 'Next.js project commands.', zh: 'Next.js 專案指令 bridge。' },
    members: [f('create','create project','Create a Next.js project. Fallible.'),f('dev','dev project','Run npm run dev. Fallible.'),f('build','build project','Run npm run build. Fallible.'),f('start','start project','Run npm run start. Fallible.'),f('lint','lint project','Run npm run lint. Fallible.')],
    example: 'use next\n\ntry next.create "my-site"\ntry next.build "my-site"'
  },
  game: {
    group: 'ecosystem', description: { en: 'Small canvas-game scene builder.', zh: '輕量 Canvas 遊戲場景 builder。' },
    members: [f("new","new width height title","Create a game scene and return its id."),f("background","background scene color","Set scene background."),f("clear","clear scene","Clear draw commands."),f("rect","rect scene x y width height color fill","Draw a rectangle."),f("circle","circle scene x y radius color fill","Draw a circle."),f("line","line scene x1 y1 x2 y2 color width","Draw a line."),f("text","text scene text x y size color","Draw text."),f("script","script scene javascript","Append browser JavaScript to a scene."),f("html","html scene","Return generated scene HTML."),f("save","save scene path","Save scene HTML. Fallible."),f("show","show scene","Open scene in a browser. Fallible."),f("image","image scene url x y width height","Draw a browser image."),f("sprite","sprite scene name url x y width height","Add an image sprite."),f("sprite_color","sprite_color scene name x y width height color","Add a colored sprite."),f("position","position scene name x y","Set a sprite position."),f("move","move scene name dx dy","Move a sprite."),f("velocity","velocity scene name vx vy","Set sprite velocity."),f("animate","animate scene fps","Start the sprite animation loop."),f("key_move","key_move scene name key dx dy","Move a sprite when a key is pressed."),f("follow_mouse","follow_mouse scene name","Follow the mouse with a sprite."),f("sound","sound scene name url","Register a browser sound."),f("play","play scene name loop volume","Play a registered sound."),f("stop","stop scene name","Stop a registered sound."),f("fullscreen","fullscreen scene","Enable double-click fullscreen."),f("camera","camera scene x y","Set the scene camera offset."),f("particles","particles scene x y count color speed","Emit particles."),f("rect_hit","rect_hit ax ay aw ah bx by bw bh","Test rectangle overlap."),f("circle_hit","circle_hit ax ay ar bx by br","Test circle overlap."),f("distance","distance x1 y1 x2 y2","Distance between two points."),f("vector","vector x y","Create a 2D vector List.")],
    example: 'use game\n\nscene = game.new 640 360 "SE Game"\ngame.background scene "#111"\ngame.circle scene 320 180 50 "#8b7cff" true\ntry game.show scene'
  },
  statistics: {
    group: 'math', description: { en: 'Mean, median, variance, and standard deviation.', zh: '平均數、中位數、變異數與標準差。' },
    members: [f('mean','mean list','Arithmetic mean.'),f('median','median list','Median.'),f('variance','variance list','Sample variance.'),f('pvariance','pvariance list','Population variance.'),f('stdev','stdev list','Sample standard deviation.'),f('pstdev','pstdev list','Population standard deviation.')],
    example: 'use statistics\n\nnums = [10, 20, 30, 40]\nsay statistics.mean nums\nsay statistics.median nums\nsay statistics.stdev nums'
  },
  regex: {
    group: 'data', description: { en: 'Regular-expression helpers.', zh: 'Regular expression 工具。' },
    members: [f('match','match pattern text','Check whether all Text matches a regex.'),f('search','search pattern text','Search Text with a regex.'),f('replace','replace pattern text replacement','Regex replacement.'),f('split','split pattern text','Split Text with a regex.')],
    example: 'use regex\n\nemail = "hello@example.com"\nsay regex.search "@" email\nsay regex.replace "example" email "se"'
  },
  base64: {
    group: 'data', description: { en: 'Base64 encoding and decoding.', zh: 'Base64 編碼與解碼。' },
    members: [f('encode','encode text','Encode Text as Base64.'),f('decode','decode text','Decode Base64 Text. Fallible.')],
    example: 'use base64\n\nencoded = base64.encode "Hello SE"\nsay encoded\nsay try base64.decode encoded'
  },
  uuid: {
    group: 'data', description: { en: 'UUID v4 generation and validation.', zh: 'UUID v4 產生與驗證。' },
    members: [f('v4','v4','Generate a random UUID v4.'),f('valid','valid text','Validate a UUID string.')],
    example: 'use uuid\n\nid = uuid.v4\nsay id\nsay uuid.valid id'
  },
  iter: {
    group: 'data', description: { en: 'Range, enumerate, zip, product, permutations, and combinations.', zh: 'Range、enumerate、zip、product、排列與組合工具。' },
    members: [f('range','range stop | range start stop step?','Build an Int range as a List.'),f('enumerate','enumerate list','Pair indexes with values.'),f('zip','zip list list','Zip two Lists.'),f('product','product list list','Cartesian product.'),f('permutations','permutations list r?','Generate permutations.'),f('combinations','combinations list r','Generate combinations.')],
    example: 'use iter\n\nnums = iter.range 1 6\nsay nums\nsay iter.enumerate nums\nsay iter.combinations nums 2'
  },
  copy: {
    group: 'data', description: { en: 'Shallow and deep collection copying.', zh: '集合的 shallow / deep copy。' },
    members: [f('shallow','shallow value','Shallow-copy List, Map, or Set values.'),f('deep','deep value','Recursively copy supported collection values.')],
    example: 'use copy\n\noriginal = [[1, 2], [3, 4]]\nclone = copy.deep original\nsay clone'
  },
  operator: {
    group: 'math', description: { en: 'Operator functions.', zh: '把運算子當作函式使用。' },
    members: [...['add','sub','mul','div','mod','eq','ne','lt','le','gt','ge'].map(n=>f(n,`${n} a b`,'Call an operator as a function.'))],
    example: 'use operator\n\nsay operator.add 20 22\nsay operator.gt 10 3'
  },
  decimal: {
    group: 'math', description: { en: 'Text-based decimal arithmetic helpers.', zh: '以 Text 表示的 decimal 算術工具。' },
    members: [f('parse','parse text','Normalize decimal Text.'),f('add','add a b','Add decimal Text values.'),f('sub','sub a b','Subtract decimal Text values.'),f('mul','mul a b','Multiply decimal Text values.'),f('div','div a b precision?','Divide decimal Text values.'),f('quantize','quantize value precision','Format decimal Text to a precision.')],
    example: 'use decimal\n\nprice = decimal.parse "19.95"\nsay decimal.add price "5.05"\nsay decimal.quantize "3.14159" 2'
  },
  csv: {
    group: 'data', description: { en: 'CSV parsing, serialization, and files.', zh: 'CSV 解析、序列化與檔案操作。' },
    members: [f('parse','parse text','Parse CSV Text into rows.'),f('stringify','stringify rows','Serialize rows as CSV.'),f('read','read path','Read and parse a CSV file. Fallible.'),f('write','write path rows','Write rows as CSV. Fallible.')],
    example: 'use csv\n\nrows = csv.parse "name,score\\nSE,100"\nsay rows\ntry csv.write "scores.csv" rows'
  },
  datetime: {
    group: 'core', description: { en: 'UTC date/time text and timestamp helpers.', zh: 'UTC 日期時間文字與 timestamp 工具。' },
    members: [f('now','now','Current UTC ISO timestamp.'),f('timestamp','timestamp','Current Unix timestamp.'),f('from_timestamp','from_timestamp timestamp','Convert timestamp to UTC ISO Text.'),f('format','format timestamp format','Format a timestamp.'),f('add_seconds','add_seconds timestamp seconds','Add seconds to a timestamp.')],
    example: 'use datetime\n\nsay datetime.now\nts = datetime.timestamp\nsay datetime.from_timestamp ts'
  },
  hash: {
    group: 'data', description: { en: 'SHA-256 hashing helpers.', zh: 'SHA-256 hashing 工具。' },
    members: [f('sha256','sha256 text','SHA-256 digest for Text. Fallible.'),f('file_sha256','file_sha256 path','SHA-256 digest for a file. Fallible.')],
    example: 'use hash\n\nsay try hash.sha256 "Hello SE"\nsay try hash.file_sha256 "app.se"'
  },
  pickle: {
    group: 'data', description: { en: 'Safe JSON-based serialization helpers.', zh: '安全、以 JSON 為基礎的序列化工具。' },
    members: [f('dumps','dumps value','Serialize a value as safe JSON Text.'),f('loads','loads text','Deserialize safe JSON Text. Fallible.')],
    example: 'use pickle\n\ndata = ["name": "SE"]\nencoded = pickle.dumps data\nrestored = try pickle.loads encoded\nsay restored'
  },
  args: {
    group: 'core', description: { en: 'Command-line argument parsing helpers.', zh: '命令列參數解析工具。' },
    members: [f('parse','parse argv','Parse CLI argument Text values.'),f('get','get parsed name default?','Read a parsed argument.'),f('flag','flag parsed name','Read a Bool flag.')],
    example: 'use args\n\nparsed = args.parse ["--name", "SE", "--fast"]\nsay args.get parsed "name" "guest"\nsay args.flag parsed "fast"'
  },
  log: {
    group: 'testing', description: { en: 'Logging helpers.', zh: 'Logging 工具。' },
    members: [f('level','level name','Set logging threshold.'),f('debug','debug message','Write a debug log.'),f('info','info message','Write an info log.'),f('warn','warn message','Write a warning log.'),f('error','error message','Write an error log.')],
    example: 'use log\n\nlog.level "info"\nlog.info "SE started"\nlog.warn "Example warning"'
  },
  shutil: {
    group: 'io', description: { en: 'Filesystem copy/move helpers.', zh: '檔案系統複製與移動工具。' },
    members: [f('copy','copy source target','Copy a file. Fallible.'),f('move','move source target','Move or rename a path. Fallible.'),f('copytree','copytree source target','Recursively copy a directory. Fallible.'),f('remove','remove path','Remove a path tree. Fallible.'),f('mkdir','mkdir path','Create directories. Fallible.')],
    example: 'use shutil\n\ntry shutil.mkdir "backup"\ntry shutil.copy "app.se" "backup/app.se"'
  },
  glob: {
    group: 'io', description: { en: 'Filesystem wildcard matching.', zh: '檔案系統 wildcard matching。' },
    members: [f('match','match pattern text','Match Text against a wildcard pattern.'),f('find','find pattern','Find filesystem paths by wildcard. Fallible.')],
    example: 'use glob\n\nsay glob.match "*.se" "app.se"\nfiles = try glob.find "src/*.se"\nsay files'
  },
  zip: {
    group: 'io', description: { en: 'ZIP archive helpers.', zh: 'ZIP 壓縮檔工具。' },
    members: [f('create','create archive files','Create a ZIP archive. Fallible.'),f('extract','extract archive directory','Extract a ZIP archive. Fallible.'),f('list','list archive','List ZIP entries. Fallible.')],
    example: 'use zip\n\ntry zip.create "project.zip" ["app.se", "README.md"]\nsay try zip.list "project.zip"'
  },
  subprocess: {
    group: 'io', description: { en: 'Shell process helpers.', zh: 'Shell process 工具。' },
    members: [f('run','run command','Run a shell command. Fallible.'),f('output','output command','Capture shell command output. Fallible.')],
    example: 'use subprocess\n\nout = try subprocess.output "echo SE"\nsay out'
  },
  socket: {
    group: 'network', description: { en: 'DNS resolution and simple TCP helpers.', zh: 'DNS 解析與簡單 TCP 工具。' },
    members: [f('resolve','resolve host','Resolve a hostname. Fallible.'),f('tcp','tcp host port payload','Connect, send, and receive TCP data. Fallible.')],
    example: 'use socket\n\naddress = try socket.resolve "example.com"\nsay address'
  },
  queue: {
    group: 'concurrency', description: { en: 'FIFO queue helpers.', zh: 'FIFO queue 工具。' },
    members: [f('new','new','Create a FIFO queue.'),f('put','put queue value','Append a value.'),f('get','get queue','Remove the first value. Fallible when empty.'),f('empty','empty queue','Check whether a queue is empty.'),f('size','size queue','Return queue size.')],
    example: 'use queue\n\nq = queue.new\nqueue.put q "first"\nqueue.put q "second"\nsay try queue.get q\nsay queue.size q'
  },
  sqlite: {
    group: 'database', description: { en: 'SQLite CLI bridge.', zh: 'SQLite CLI bridge。' },
    members: [f('open','open path','Open a SQLite database handle.'),f('exec','exec database sql','Execute SQL. Fallible.'),f('query','query database sql','Run a query and return CSV-style rows. Fallible.')],
    example: 'use sqlite\n\ndb = sqlite.open "app.db"\ntry sqlite.exec db "create table if not exists users(name text)"\nrows = try sqlite.query db "select * from users"\nsay rows'
  },
  functools: {
    group: 'safety', description: { en: 'Higher-order function helpers.', zh: '高階函式工具。' },
    members: [f('partial','partial function args...','Create a partially applied function.'),f('reduce','reduce function list initial?','Reduce a List.'),f('map','map function list','Map a function over a List.'),f('filter','filter function list','Filter a List.')],
    example: 'use functools\n\nmake double x\n    give x * 2\n\nsay functools.map double [1, 2, 3]'
  },
  enum: {
    group: 'safety', description: { en: 'Runtime enumeration helpers.', zh: 'Runtime enumeration 工具。' },
    members: [f('make','make names','Create name -> integer enum Map starting at zero.'),f('name','name enum value','Find the name for a value. Fallible.'),f('value','value enum name','Find the value for a name. Fallible.'),f('has','has enum name','Check whether a name exists.')],
    example: 'use enum\n\nColor = enum.make ["Red", "Green", "Blue"]\nsay Color\nsay try enum.value Color "Green"'
  },
  typing: {
    group: 'safety', description: { en: 'Runtime type inspection helpers.', zh: 'Runtime 型別檢查工具。' },
    members: [f('type_of','type_of value','Return the runtime SE type name.'),f('is','is value type_name','Check the runtime type name.'),f('cast','cast value type_name','Assert a runtime type and return the value.')],
    example: 'use typing\n\nvalue = 42\nsay typing.type_of value\nsay typing.is value "Int"\nsay typing.cast value "Int"'
  },
  url: {
    group: "data", description: { en: "URL percent encoding and query strings.", zh: "URL 百分比編碼、解碼與 query string 工具。" },
    members: [f("encode","encode text","Percent-encode URL text."),f("decode","decode text","Decode percent-encoded text. Fallible."),f("query","query map","Build a URL query string from a Map."),f("parse_query","parse_query text","Parse a query string into a Map. Fallible.")],
    example: "use url\\n\\nencoded = url.encode \"SE language\"\\nsay encoded\\nsay try url.decode encoded"
  },
  encoding: {
    group: "data", description: { en: "Hexadecimal encoding and UTF-8 validation.", zh: "十六進位編碼與 UTF-8 驗證工具。" },
    members: [f("hex","hex text","Encode text as hexadecimal."),f("unhex","unhex text","Decode hexadecimal text. Fallible."),f("utf8_valid","utf8_valid text","Check UTF-8 validity.")],
    example: "use encoding\\n\\nsay encoding.hex \"SE\"\\nsay try encoding.unhex \"5345\""
  },
  dotenv: {
    group: "core", description: { en: "Parse simple KEY=VALUE configuration.", zh: "讀取及查詢 KEY=VALUE 設定。" },
    members: [f("parse","parse text","Parse KEY=VALUE lines into a Map. Fallible."),f("get","get config key","Read a required key from a configuration Map. Fallible.")],
    example: "use dotenv\\n\\nconfig = try dotenv.parse \"MODE=dev\\\\nPORT=3000\"\\nsay try dotenv.get config \"MODE\""
  },
  array: {
    group: "data", description: { en: "Numeric List statistics and slicing.", zh: "數值 List 的總和、平均數與切片。" },
    members: [f("sum","sum values","Sum a numeric List."),f("mean","mean values","Mean of a numeric List. Fallible."),f("slice","slice values start end","Slice a List with checked bounds. Fallible.")],
    example: "use array\\n\\nnums = [1, 2, 3, 4]\\nsay array.sum nums\\nsay try array.mean nums"
  },
  matrix: {
    group: "math", description: { en: "Matrix multiplication, transposition, and dot products.", zh: "矩陣轉置、乘法與向量內積。" },
    members: [f("transpose","transpose rows","Transpose a matrix. Fallible."),f("multiply","multiply left right","Multiply two matrices. Fallible."),f("dot","dot left right","Dot product of equal-length vectors. Fallible.")],
    example: "use matrix\\n\\nrows = [[1, 2], [3, 4]]\\nsay try matrix.transpose rows"
  },
  probability: {
    group: "math", description: { en: "Factorial and combination counts.", zh: "階乘與組合數計算。" },
    members: [f("factorial","factorial n","Factorial for 0 to 20. Fallible."),f("choose","choose n k","Combination count with bounded inputs. Fallible.")],
    example: "use probability\\n\\nsay try probability.factorial 5\\nsay try probability.choose 5 2"
  },
  fraction: {
    group: "math", description: { en: "Reduced fractions and decimal conversion.", zh: "建立約分分數並轉換成小數。" },
    members: [f("make","make numerator denominator","Create a reduced fraction List. Fallible."),f("decimal","decimal fraction","Convert a fraction List to a number. Fallible.")],
    example: "use fraction\\n\\npart = try fraction.make 3 6\\nsay part\\nsay try fraction.decimal part"
  },
  complex: {
    group: "math", description: { en: "Complex numbers represented as [real, imaginary].", zh: "複數建立、加法、乘法與模長計算。" },
    members: [f("make","make real imaginary","Create a complex number List."),f("add","add left right","Add complex numbers. Fallible."),f("multiply","multiply left right","Multiply complex numbers. Fallible."),f("magnitude","magnitude value","Magnitude of a complex number. Fallible.")],
    example: "use complex\\n\\na = complex.make 2 3\\nb = complex.make 1 4\\nsay try complex.add a b"
  },
  calculus: {
    group: "math", description: { en: "One-variable polynomial evaluation, derivative, and definite integral.", zh: "多項式求值、導數與定積分。" },
    members: [f("polynomial","polynomial coefficients x","Evaluate a polynomial with ascending coefficients."),f("derivative","derivative coefficients x","Evaluate its derivative."),f("integral","integral coefficients start end","Definite integral of a polynomial.")],
    example: "use calculus\\n\\ncoefficients = [1, 2, 3]\\nsay calculus.polynomial coefficients 2\\nsay calculus.derivative coefficients 2"
  },
  units: {
    group: "math", description: { en: "Length, time, mass, and temperature conversions.", zh: "長度、時間、質量與溫度單位換算。" },
    members: [f("convert","convert value from_unit to_unit","Convert compatible length, time, or mass units. Fallible."),f("celsius_to_fahrenheit","celsius_to_fahrenheit value","Convert Celsius to Fahrenheit."),f("fahrenheit_to_celsius","fahrenheit_to_celsius value","Convert Fahrenheit to Celsius.")],
    example: "use units\\n\\nsay try units.convert 1 \"km\" \"m\"\\nsay units.celsius_to_fahrenheit 0"
  },
  table: {
    group: "data", description: { en: "Read and project columns from Map rows.", zh: "讀取 Map 列資料並選取欄位。" },
    members: [f("column","column rows name","Extract a column from Map rows. Fallible."),f("row_count","row_count rows","Count table rows."),f("select","select rows columns","Project table columns. Fallible.")],
    example: "use table\\n\\nrows = [[\"name\": \"Amy\", \"score\": 92], [\"name\": \"Ben\", \"score\": 85]]\\nsay try table.column rows \"score\""
  },
  cookie: {
    group: "network", description: { en: "Parse Cookie headers and create Set-Cookie values.", zh: "解析 Cookie 標頭並建立 Set-Cookie 值。" },
    members: [f("parse","parse header","Parse a Cookie header into a Map."),f("set","set name value","Create a Set-Cookie header. Fallible.")],
    example: "use cookie\\n\\nvalues = cookie.parse \"theme=dark; lang=zh\"\\nsay values[\"theme\"]\\nsay try cookie.set \"theme\" \"dark\""
  },
  cors: {
    group: "network", description: { en: "Construct CORS response headers.", zh: "建立 CORS 回應標頭。" },
    members: [f("allow_origin","allow_origin origin","Create CORS origin headers. Fallible."),f("preflight","preflight origin methods","Create CORS preflight headers. Fallible.")],
    example: "use cors\\n\\nheaders = try cors.allow_origin \"https://example.com\"\\nsay headers"
  },
  template: {
    group: "data", description: { en: "HTML-escaped {{key}} template rendering.", zh: "HTML 跳脫與 {{key}} 樣板渲染。" },
    members: [f("escape","escape text","Escape HTML text."),f("render","render source values","Render escaped {{key}} placeholders. Fallible.")],
    example: "use template\\n\\npage = try template.render \"Hello {{name}}\" [\"name\": \"SE\"]\\nsay page"
  },
  static: {
    group: "io", description: { en: "Read rooted static files and detect MIME types.", zh: "讀取指定根目錄內的靜態檔案並判斷 MIME 類型。" },
    members: [f("mime","mime filename","Detect MIME type from an extension."),f("read","read root filename","Read a file inside a root directory. Fallible.")],
    example: "use static\\n\\nsay static.mime \"index.html\""
  },
  upload: {
    group: "io", description: { en: "Save data within an existing root directory.", zh: "將上傳內容存入指定根目錄。" },
    members: [f("save","save root filename body","Save a file within an existing root directory. Fallible.")],
    example: "use upload\\n\\ntry upload.save \"uploads\" \"note.txt\" \"Hello SE\""
  },
  tilemap: {
    group: "ecosystem", description: { en: "Parse and inspect text tile maps.", zh: "解析文字 tile map 並讀取格子內容。" },
    members: [f("parse","parse text","Parse a rectangular text tilemap. Fallible."),f("at","at map x y","Read a tile at coordinates. Fallible."),f("size","size map","Return tilemap dimensions.")],
    example: "use tilemap\\n\\nworld = try tilemap.parse \"###\\\\n#.#\\\\n###\"\\nsay tilemap.size world\\nsay try tilemap.at world 1 1"
  },
  toml: {
    group: "data", description: { en: "TOML parsing through Python 3.11+.", zh: "透過 Python 解析 TOML。" },
    members: [f("parse","parse text","Parse TOML using Python 3.11+. Fallible.")],
    example: "use toml\\n\\nsettings = try toml.parse \"name = \\\\\\\"SE\\\\\\\"\"\\nsay settings[\"name\"]"
  },
  yaml: {
    group: "data", description: { en: "YAML parsing and serialization (requires PyYAML).", zh: "解析與序列化 YAML（需要 PyYAML）。" },
    members: [f("parse","parse text","Parse YAML using PyYAML. Fallible."),f("stringify","stringify value","Serialize YAML using PyYAML. Fallible.")],
    example: "use yaml\\n\\nsettings = try yaml.parse \"name: SE\"\\nsay settings[\"name\"]\\nsay try yaml.stringify settings"
  },
  xml: {
    group: "data", description: { en: "XML parsing and escaping through Python.", zh: "透過 Python 解析 XML 並跳脫文字。" },
    members: [f("parse","parse text","Parse XML using Python. Fallible."),f("escape","escape text","Escape XML text. Fallible.")],
    example: "use xml\\n\\nvalue = try xml.parse \"<name>SE</name>\"\\nsay try xml.escape \"SE & Web\""
  },
  markdown: {
    group: "data", description: { en: "CommonMark rendering (requires markdown-it-py).", zh: "使用 CommonMark 渲染 Markdown（需要 markdown-it-py）。" },
    members: [f("render","render text","Render Markdown using markdown-it-py. Fallible.")],
    example: "use markdown\\n\\nhtml = try markdown.render \"# Hello SE\"\\nsay html"
  },
  crypto: {
    group: "safety", description: { en: "SHA-256, HMAC, secure randomness, and constant-time comparison.", zh: "SHA-256、HMAC、安全亂數與固定時間比較。" },
    members: [f("sha256","sha256 text","Compute a SHA-256 hex digest. Fallible."),f("hmac_sha256","hmac_sha256 key text","Compute an HMAC-SHA256 hex digest. Fallible."),f("random_hex","random_hex byte_count","Generate cryptographically random hex. Fallible."),f("constant_time_equal","constant_time_equal left right","Compare text in constant time. Fallible.")],
    example: "use crypto\\n\\nsay try crypto.sha256 \"SE\"\\nsay try crypto.random_hex 8"
  },
  jwt: {
    group: "safety", description: { en: "HS256 signing and verification.", zh: "建立與驗證 HS256 JSON claims。" },
    members: [f("sign","sign claims secret","Sign HS256 JSON claims. Fallible."),f("verify","verify token secret","Verify an HS256 token and return claims. Fallible.")],
    example: "use jwt\\n\\nclaims = [\"sub\": \"student\"]\\ntoken = try jwt.sign claims \"local-demo-secret\"\\nsay try jwt.verify token \"local-demo-secret\""
  },
  session: {
    group: "safety", description: { en: "Signed, stateless session claims using HS256.", zh: "使用 HS256 編碼與解碼簽章 session claims。" },
    members: [f("encode","encode claims secret","Encode signed session claims. Fallible."),f("decode","decode token secret","Decode signed session claims. Fallible.")],
    example: "use session\\n\\nclaims = [\"user\": \"student\"]\\ntoken = try session.encode claims \"local-demo-secret\"\\nsay try session.decode token \"local-demo-secret\""
  },
  auth: {
    group: "safety", description: { en: "PBKDF2 password hashing and verification.", zh: "使用 PBKDF2 雜湊與驗證密碼。" },
    members: [f("hash_password","hash_password password","Create a PBKDF2 password hash. Fallible."),f("verify_password","verify_password password encoded_hash","Verify a password hash. Fallible.")],
    example: "use auth\\n\\nhashed = try auth.hash_password \"example-password\"\\nsay try auth.verify_password \"example-password\" hashed"
  },
  email: {
    group: "network", description: { en: "Compose and parse email messages.", zh: "建立與解析 email 訊息。" },
    members: [f("compose","compose sender recipient subject body","Compose an email message. Fallible."),f("parse","parse message","Parse an email message. Fallible.")],
    example: "use email\\n\\nmessage = try email.compose \"from@example.com\" \"to@example.com\" \"Hello\" \"Message body\"\\nsay message"
  },
  smtp: {
    group: "network", description: { en: "Send mail with SMTP over TLS.", zh: "透過 TLS 使用 SMTP 寄信。" },
    members: [f("send","send host port username password recipient message","Send email over SMTP with TLS. Fallible.")],
    example: "use smtp\\n\\n# Provide mail server credentials before running.\\ntry smtp.send \"smtp.example.com\" 465 \"user\" \"password\" \"to@example.com\" \"message\""
  },
  imap: {
    group: "network", description: { en: "Read mail subjects with IMAP over TLS.", zh: "透過 TLS 讀取 IMAP 郵件主旨。" },
    members: [f("subjects","subjects host username password mailbox limit","Read IMAP message subjects over TLS. Fallible.")],
    example: "use imap\\n\\n# Provide mail server credentials before running.\\nsay try imap.subjects \"imap.example.com\" \"user\" \"password\" \"INBOX\" 10"
  },
  ftp: {
    group: "network", description: { en: "List, download, and upload files through FTPS.", zh: "透過 FTPS 列出、下載與上傳檔案。" },
    members: [f("list","list host username password directory","List files over FTPS. Fallible."),f("download","download host username password filename","Download a file over FTPS. Fallible."),f("upload","upload host username password filename body","Upload a file over FTPS. Fallible.")],
    example: "use ftp\\n\\n# Provide FTPS credentials before running.\\nsay try ftp.list \"ftp.example.com\" \"user\" \"password\" \"/\""
  },
  ssh: {
    group: "network", description: { en: "Run a remote command using Paramiko and known_hosts.", zh: "透過 Paramiko 與 known_hosts 執行遠端命令。" },
    members: [f("run","run host username command","Run an SSH command using known_hosts. Fallible.")],
    example: "use ssh\\n\\n# Requires a trusted host entry in known_hosts.\\nsay try ssh.run \"server.example.com\" \"user\" \"whoami\""
  },
  websocket: {
    group: "network", description: { en: "One-message WSS exchange (requires websockets).", zh: "透過 WSS 傳送一則訊息並接收回覆。" },
    members: [f("exchange","exchange url message","Exchange a message over WSS. Fallible.")],
    example: "use websocket\\n\\n# Connect to a WSS endpoint that accepts one message.\\nsay try websocket.exchange \"wss://example.com/socket\" \"Hello\""
  },
  ai: {
    group: "ecosystem", description: { en: "Chat with a compatible HTTPS AI endpoint.", zh: "呼叫相容的 HTTPS AI 端點進行對話。" },
    members: [f("chat","chat endpoint api_key model prompt","Request an HTTPS chat completion. Fallible.")],
    example: "use ai\\n\\n# Supply a compatible endpoint, API key, and model.\\nanswer = try ai.chat \"https://api.example.com/v1\" \"API_KEY\" \"model\" \"Explain SE briefly\"\\nsay answer"
  },
  embedding: {
    group: "ecosystem", description: { en: "Create vectors through a compatible HTTPS embedding endpoint.", zh: "呼叫相容的 HTTPS embedding 端點建立向量。" },
    members: [f("create","create endpoint api_key model text","Request an HTTPS embedding vector. Fallible.")],
    example: "use embedding\\n\\n# Supply a compatible endpoint and API key.\\nvector = try embedding.create \"https://api.example.com/v1\" \"API_KEY\" \"model\" \"SE language\"\\nsay vector"
  },
  ml: {
    group: "math", description: { en: "One-variable linear regression and prediction.", zh: "單變數線性迴歸與數值預測。" },
    members: [f("linear_regression","linear_regression xs ys","Fit a one-variable linear regression. Fallible."),f("predict","predict model x","Predict a numeric value. Fallible.")],
    example: "use ml\\n\\nmodel = try ml.linear_regression [1, 2, 3] [3, 5, 7]\\nsay try ml.predict model 4"
  },
  tensor: {
    group: "math", description: { en: "Numeric tensor shape, addition, and 2D multiplication.", zh: "數值 tensor 維度、加法與二維乘法。" },
    members: [f("shape","shape values","Return tensor dimensions. Fallible."),f("add","add left right","Add tensors elementwise. Fallible."),f("matmul","matmul left right","Multiply 2D tensors. Fallible.")],
    example: "use tensor\\n\\na = [[1, 2], [3, 4]]\\nb = [[1, 0], [0, 1]]\\nsay try tensor.shape a\\nsay try tensor.add a b"
  },
  video: {
    group: "ecosystem", description: { en: "Add browser video to an SE game scene.", zh: "將瀏覽器影片加入 SE game scene。" },
    members: [f("add","add scene url x y width height","Add browser video to a scene."),f("stop","stop scene","Stop scene video playback.")],
    example: "use video\\n\\nscene = game.new 640 360 \"Video demo\"\\nvideo.add scene \"clip.mp4\" 0 0 320 180"
  },
  camera: {
    group: "ecosystem", description: { en: "Request and display browser camera video.", zh: "請求瀏覽器相機並顯示影像。" },
    members: [f("start","start scene x y width height","Request browser camera for a scene."),f("stop","stop scene","Stop browser camera capture.")],
    example: "use camera\\n\\nscene = game.new 640 360 \"Camera demo\"\\ncamera.start scene 0 0 320 240"
  }
};

const aliases: Record<string, string> = {
  re: 'regex',
  itertools: 'iter',
  hashlib: 'hash',
  argparse: 'args',
  logging: 'log',
  zipfile: 'zip',
  sqlite3: 'sqlite',
  config: 'dotenv',
  series: 'array',
  linear: 'matrix',
  dataset: 'table',
  http_server: 'web',
  router: 'web',
  dns: 'socket',
  gui: 'game',
  window: 'game',
  canvas: 'game',
  input: 'game',
  sprite: 'game',
  physics: 'game',
  sound: 'game',
  keyboard: 'game',
  mouse: 'game',
  animation: 'game',
  scene: 'game',
  collision: 'game',
  image: 'game',
  audio: 'game'
};

const moduleOrder = ['file','path','time','math','random','os','json','text','collections','test','process','http','web','js','ts','function','async','threading','option','result','match','db','https','data','net','node','next','game','statistics','regex','re','base64','uuid','iter','itertools','copy','operator','decimal','csv','datetime','hash','hashlib','pickle','args','argparse','log','logging','shutil','glob','zip','zipfile','subprocess','socket','queue','sqlite','sqlite3','functools','enum','typing','url','encoding','dotenv','config','array','series','matrix','linear','probability','fraction','complex','calculus','units','table','dataset','cookie','cors','template','static','upload','tilemap','http_server','router','dns','toml','yaml','xml','markdown','crypto','jwt','session','auth','email','smtp','imap','ftp','ssh','websocket','ai','embedding','ml','tensor','video','camera','gui','window','canvas','input','sprite','physics','sound','keyboard','mouse','animation','scene','collision','image','audio'
];

function aliasModule(name: string, target: string): SeModule {
  const original = base[target];
  return {
    name,
    group: original.group,
    description: {
      en: `Alias for ${target}. ${original.description.en}`,
      zh: `${target} 的別名。${original.description.zh}`
    },
    members: original.members,
    example: original.example.replace(`use ${target}`, `use ${name}`).replaceAll(`${target}.`, `${name}.`),
    aliasFor: target
  };
}

const helpMember = f('help', 'help', 'Show this module\'s available members and descriptions.', 'value');

export const modules: SeModule[] = moduleOrder.map((name) => {
  if (aliases[name]) return { ...aliasModule(name, aliases[name]), members: [helpMember, ...aliasModule(name, aliases[name]).members] };
  const data = base[name];
  if (!data) throw new Error(`Missing module data: ${name}`);
  return { name, ...data, members: [helpMember, ...data.members] };
});

export const moduleByName = Object.fromEntries(modules.map((m) => [m.name, m]));
export const moduleAliases = aliases;
export const moduleCount = modules.length;
