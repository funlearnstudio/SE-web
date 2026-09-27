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
    .replace(/^Evaluate /, '執行並取得結果 ');
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
    members: [f('new','new width height title','Create a game scene and return its id.'),f('background','background scene color','Set scene background.'),f('clear','clear scene','Clear draw commands.'),f('rect','rect scene x y width height color fill','Draw a rectangle.'),f('circle','circle scene x y radius color fill','Draw a circle.'),f('line','line scene x1 y1 x2 y2 color width','Draw a line.'),f('text','text scene text x y size color','Draw text.'),f('script','script scene javascript','Append browser JavaScript to a scene.'),f('html','html scene','Return generated scene HTML.'),f('save','save scene path','Save scene HTML. Fallible.'),f('show','show scene','Open scene in a browser. Fallible.')],
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
  }
};

const aliases: Record<string, string> = {
  re: 'regex',
  itertools: 'iter',
  hashlib: 'hash',
  argparse: 'args',
  logging: 'log',
  zipfile: 'zip',
  sqlite3: 'sqlite'
};

const moduleOrder = [
  'file','path','time','math','random','os','json','text','collections','test','process','http','web','js','ts','function','async','threading','option','result','match','db','https','data','net','node','next','game','statistics','regex','re','base64','uuid','iter','itertools','copy','operator','decimal','csv','datetime','hash','hashlib','pickle','args','argparse','log','logging','shutil','glob','zip','zipfile','subprocess','socket','queue','sqlite','sqlite3','functools','enum','typing'
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

export const modules: SeModule[] = moduleOrder.map((name) => {
  if (aliases[name]) return aliasModule(name, aliases[name]);
  const data = base[name];
  if (!data) throw new Error(`Missing module data: ${name}`);
  return { name, ...data };
});

export const moduleByName = Object.fromEntries(modules.map((m) => [m.name, m]));
export const moduleAliases = aliases;
export const moduleCount = modules.length;
