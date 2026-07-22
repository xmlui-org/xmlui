# JavaScript-re fordított szinkron kifejezés-kiértékelés terve

## Cél és határok

Az XMLUI jelenlegi, AST-interpreteren alapuló szinkron binding-kiértékelése kapjon egy kísérleti, JavaScript-re fordított végrehajtási útvonalat. A funkció alapértelmezetten kikapcsolt legyen, és csak konfigurációs kapcsolóval aktiválódjon.

Nem cél az eseménykezelő végrehajtásának átírása. Az async/event/code-behind futtatási útvonalak maradjanak a jelenlegi `eval-tree-async` és statement-runner mechanizmuson. A terv csak ott nyúljon a statement fordításhoz, ahol a szinkron bindingkifejezésben használt IIFE/arrow/function body miatt erre szükség van.

Elfogadott döntések:
- A kapcsoló neve legyen `xmluiConfig.compileBindings`; alapértelmezett értéke `false`.
- A belső, framework-owned fordító használhat `new Function(...)`-t a generált JavaScript betöltésére. Ez nem oldja fel a felhasználói XMLUI kódból elérhető `Function` konstruktor tiltását.
- Nem lesz shadow compare mód.
- Fordított módban az unsupported AST node hiba; nincs interpreter fallback.
- Code-behind JavaScript-re fordítása hosszabb távú cél, de az eseménykezelők fordításával együtt, külön fázisban történik.
- Későbbi cél a source map generálás, böngészőbeli XMLUI-forrás szintű debug, event handler/code-behind fordítás, és Vite build-time fordítás. A mostani infrastruktúra ezeket segítse, de ne valósítsa meg.
- Egyelőre elég a belső dokumentáció.

## Jelenlegi kiindulópont

- Szinkron binding: `xmlui/src/components-core/script-runner/eval-tree-sync.ts`, hívók: `extractParam`, `useVars`, `createValueExtractor`.
- Async esemény/code-behind: külön útvonalon fut, például `xmlui/src/components-core/container/event-handlers.ts`, ezt nem kell átállítani.
- Attribútumokban lévő `{...}` bindingok jelenleg több helyen csak értékeléskor parse-olódnak: `parseParameterString` és `extractParam`.
- `<script>` és code-behind deklarációk már parse-olt `CodeDeclaration` alakban kerülnek tovább.
- Dependency tracking jelenleg AST-t jár be: `collectVariableDependencies`.
- XMLUI-specifikus szemantika: `.`/`[]`/hívás alapból opcionális hozzáférésként viselkedik, a sync bindingban Promise visszatérés hiba, a `new` csak whitelistelt konstruktorokra engedett.
- Sandbox: `isBannedFunction` tiltja például `eval`, `Function`, timer és WebAssembly függvényeket; `isBannedMember` guardolja a globális/DOM hozzáféréseket, `strictDomSandbox` szerint warn vagy throw módban.

## Change detection és dependency-kezelés

A JavaScript-re fordítás nem válthatja ki a jelenlegi változásérzékelési modellt. A change detection továbbra is a parse-olt AST-ből gyűjtött függőségekre épüljön, nem a generált JavaScript futásidejű megfigyelésére.

A jelenlegi mechanizmus lényege:
- `collectVariableDependencies()` megmondja, hogy egy binding mely state/appContext neveket olvas.
- `createValueExtractor()` és `useVars()` ezekből kiválasztja a tényleges dependency value-kat.
- A memoizált `obtainValue` csak akkor fut újra, ha ezek a kiválasztott értékek változnak.
- `FnDepsContext`/`collectFnVarDeps()` kiterjeszti a függőségeket azokra a változókra, amelyeket egy lokális függvény olvas.
- `computedUses` és a container state-narrowing ugyanebből a függőségi világból tud renderzajt csökkenteni.

Az új fordított motor szerepe csak az legyen, hogy amikor a framework már eldöntötte, hogy egy bindinget újra kell értékelni, akkor az AST-interpreter helyett a compiled függvényt hívja meg. A compiled artefaktum ezért tartalmazza továbbra is a `dependencies` mezőt, de azt a parse/analysis pipeline állítja elő AST-ből. A generált JavaScript nem lesz a dependency tracking forrása.

Ennek következményei:
- A change detection viselkedése akkor marad kompatibilis, ha ugyanazt az AST-t használjuk dependency gyűjtésre és codegenre.
- Ha a codegen később új szintaktikai elemet támogat, annak dependency gyűjtését ugyanabban a lépésben kell ellenőrizni.
- Függvényeknél továbbra is transzitív dependency-kre van szükség: ha `label="{format(user)}"` és `format` olvassa `locale`-t, akkor a `label` dependency listájában `locale` is meg kell jelenjen.
- Dinamikus property accessnél, például `obj[key]`, a statikus dependency továbbra is `obj` és `key`, nem a futásidőben kiszámolt konkrét property path. Ez megegyezik a jelenlegi modell természetével.
- A fordított kód helper API-ja hívhat `onWillAccess`/`onWillUpdate` hookokat, de ezek nem helyettesítik a render/memo dependency trackinget; inkább sandbox, update propagation és diagnosztika miatt fontosak.

## Írások és megváltozott változók észlelése

A függőségi lista az olvasási oldalt írja le: mely változók változása miatt kell egy kifejezést újraértékelni. A kiértékelés után megváltozott változókat nem ebből, és nem teljes state-diffből kell kitalálni, hanem az írási műveletek végrehajtása közben kell naplózni.

A jelenlegi event pipeline ezt már így csinálja:
- a handler `localContext` egy copy-on-write proxy;
- assignment, `++`/`--`, property set, array/object mutáció stb. proxyn át változásbejegyzést hoz létre;
- a bejegyzések `pathArray`, `newValue`, `target`, `action` alakban gyűlnek;
- statement boundary után ezek mennek tovább `statePartChanged(...)` felé;
- a state update után a React/container réteg újrarenderel, a memoizált bindingek pedig csak akkor futnak újra, ha a saját dependency értékeik változtak.

A compiled binding motornak ugyanezt a szerződést kell megőriznie:
- Minden direkt írás (`=`, `+=`, `++`, `--`, destructuring assignment) csak runtime helperen át történhet.
- A helper először meghatározza a bal oldal root state nevét és pathját, például `counter`, `user.name`, `items[2]`.
- Az írás a proxyn vagy a meglévő update hookon át történik, hogy változásbejegyzés keletkezzen.
- Ha egy függvényhívás potenciálisan mutálja a receiver objektumot, például `items.push(x)` vagy `user.tags.splice(...)`, akkor a compiled `rt.call(...)` nem hívhat közvetlenül nyers receiveren. A receiver maradjon proxyn keresztüli objektum, vagy a runtime konzervatívan jelölje dirtynek a receiver rootját.
- A változott root nevek halmaza lesz az a dirty set, amely miatt a rájuk függő kifejezések újraértékelődnek.

Fontos különbség:
- `dependencies`: kifejezésenként tárolt olvasási lista, például `totalLabel` függ `count` és `format` transzitív függőségeitől.
- `changes` vagy dirty set: egy konkrét kiértékelés közben történt írások listája, például `count` vagy `items`.

Egy egyszerű példa:

```xml
<Fragment var.count="{0}" var.double="{count * 2}">
  <Button onClick="count++" label="{double}" />
</Fragment>
```

Itt a `double` dependency listája `["count"]`. Amikor a handler végrehajtja a `count++` műveletet, az írási oldal dirtynek jelöli `count`-ot és továbbítja a változást `statePartChanged` felé. Ezután a container új állapotot kap; a `double` csak azért értékelődik újra, mert a saját dependency listája metszi a dirty/changed state-et.

## Írásészlelési unit teszt stratégia

Az írásészleléshez külön, táblavezérelt unit tesztcsomag kell, nem csak néhány E2E regresszió. A cél az, hogy gyakorlatilag minden támogatott írási forma és releváns kombináció igazolja:
- a helyes `pathArray` keletkezik;
- a helyes root változó kerül a dirty setbe;
- a `newValue`, `target`, `action` megfelel a meglévő proxy/update szerződésnek;
- a const/read-only/global/sandbox tiltások ugyanúgy érvényesülnek, mint az interpreterben;
- csak a megváltozott rootokra függő bindingek futnának újra.

Javasolt új tesztterület:
- `xmlui/tests/components-core/compiled-sync/change-detection.test.ts`
- `xmlui/tests/components-core/compiled-sync/write-tracking.test.ts`
- `xmlui/tests/components-core/compiled-sync/dependency-invalidation.test.ts`

A tesztekhez érdemes egy kis harness-t építeni:
- parse-ol egy expressiont vagy statement blockot;
- compiled módban futtatja egy proxizott state objektumon;
- összegyűjti a változásbejegyzéseket;
- opcionálisan lefuttatja ugyanazt interpreterrel paritásellenőrzésként ott, ahol az interpreter útvonal létezik;
- egy dependency index alapján megmondja, mely kifejezések invalidálódnának.

Minimális írásészlelési mátrix:
- egyszerű assignment: `x = 1`, `x = y`, `x = fn()`;
- compound assignment: `+=`, `-=`, `*=`, `/=`, `%=`, `**=`, bitműveletek, `&&=`, `||=`, `??=`;
- prefix/postfix: `++x`, `x++`, `--x`, `x--`;
- nested member write: `user.name = value`, `user.address.city = value`;
- calculated member write: `obj[key] = value`, `items[index] = value`;
- array mutációk: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, index assignment, `length` assignment;
- object mutációk: `delete obj.key`, computed delete, `Object.assign(obj, ...)` ha engedett;
- destructuring assignment: `[a, b] = arr`, `{a, b: c} = obj`, nested destructuring;
- loopon belüli írások: `for`, `for/of`, `for/in`, `while`, `do/while`;
- conditional branch írások: `if/else`, ternary mellékhatással, short-circuit assignment;
- try/catch/finally írások, beleértve throw után futó finally blokkot;
- arrow/IIFE closure írások: külső változó módosítása nested functionből;
- function receiver mutáció: `items.push(x)` és `user.tags.splice(...)` esetén a receiver root dirty legyen;
- több írás egy kiértékelésben: ugyanarra a rootra, több külön rootra, nested pathokra;
- sikertelen írások: const módosítás, read-only `$` változó, tiltott DOM/global member, unsupported node.

Dependency invalidation mátrix:
- `changed = ["count"]` invalidálja a `count`-ot olvasó bindinget, de nem invalidálja a csak `name`-et olvasót;
- `changed = ["user"]` invalidálja a `user.name`-et olvasó bindinget;
- `changed = ["items"]` invalidálja az `items.length`, `items[0]`, `items.map(...)` olvasó bindingeket;
- függvényfüggőségek transzitíven invalidálnak: ha `label` hívja `format(user, locale)`-t, akkor `user` és `locale` változása is invalidálja;
- computed membernél `obj[key]` esetén `obj` és `key` változása is invalidál;
- több változás egy batchben az érintett dependency listák unióját invalidálja.

Ezek a unit tesztek minden codegen-bővítési lépésben bővítendők. Egy AST node típust csak akkor tekintsünk compiled módban támogatottnak, ha a hozzá tartozó írásészlelési és invalidációs tesztek is megvannak.

## Sync timeout megtartása compiled módban

A jelenlegi szinkron interpreter `syncExecutionTimeout` értéket használ, alapértelmezésben 1000 ms-ot. A JavaScript-re fordított végrehajtásnak ugyanezt a szerződést kell megtartania:
- a timeout forrása továbbra is `evalContext.appContext?.xmluiConfig?.syncExecutionTimeout ?? 1000`;
- a compiled futás indulásakor ugyanúgy rögzíteni kell a start időpontot, mint a jelenlegi `processStatementQueue` útvonalon;
- a timeout hibaüzenete maradjon kompatibilis: `Sync evaluation timeout exceeded {N} milliseconds`;
- a timeout ne csak statement blockokra vonatkozzon, hanem minden compiled bindingre, amely hosszú szinkron futást okozhat.

Mivel a natív JS nem preemptálható biztonságosan, a generált kódba explicit guardokat kell beszúrni. A codegen minden olyan pontra tegyen `rt.checkTimeout()` hívást, ahol hosszú futás alakulhat ki:
- compiled függvény belépésénél;
- IIFE/arrow/function body belépésénél;
- loop body elején és loop update/back-edge előtt: `for`, `while`, `do/while`, `for/of`, `for/in`;
- hosszú statement blockok statement boundary pontjain;
- opcionálisan nagy tömbliterál/object literal vagy spread feldolgozás előtt, ha a codegen később ilyen optimalizációt végez.

Ezt nem kell minden egyszerű operátor előtt ellenőrizni, mert az aránytalanul lassítaná a compiled útvonalat. A cél ugyanaz, mint a jelenlegi sync timeoutnál: végtelen vagy túl hosszú szinkron futás megszakítása, nem mikro-pontos instruction budget.

Timeout unit tesztek:
- végtelen `while (true) {}` IIFE compiled bindingban timeouttal megszakad;
- hosszú `for` ciklus megszakad kis `syncExecutionTimeout` mellett;
- nested arrow/IIFE loop is ugyanarra a timeout budgetre fut;
- több egymásba ágyazott függvényhívás nem reseteli a budgetet;
- `syncExecutionTimeout` konfiguráció értéke ténylegesen módosítja a limitet;
- timeout után ne maradjon részlegesen commitolt state-változás olyan esetben, ahol az adott futtatási modell ezt nem engedi; ha a sync binding útvonal élő írásokat enged, ezt a viselkedést külön dokumentálni és tesztelni kell.

## Jövőálló compiler infrastruktúra

Bár az első implementáció csak szinkron bindingekre vonatkozik, a compiler magját ne zárjuk be binding-specifikus API-ba. Javasolt rétegezés:
- `script-compiler/core`: AST járás, codegen segédek, source span kezelés, diagnosztika, unsupported-node hibák;
- `script-compiler/runtime`: sandboxolt read/write/call/new/timeout helper szerződés;
- `script-compiler/targets/binding-sync`: a mostani `compileBindings` cél, szinkron Promise-tiltással és binding dependency szerződéssel;
- későbbi `script-compiler/targets/event-async`: event handler/code-behind fordítás async, cancellation, transactional, scheduler és handler timeout szerződéssel;
- későbbi `script-compiler/vite`: build-time markup parse + compile integráció.

A `CompiledExpression`/`CompiledStatementBlock` alak legyen már most általánosabb `CompiledScriptArtifact`, amely target-specifikus mezőkkel bővíthető:
- `target`: például `"binding-sync"`; később `"event-async"` vagy `"code-behind"`;
- `sourceId`: XMLUI fájl, code-behind fájl vagy virtuális inline forrás stabil azonosítója;
- `sourceText` vagy forrásrészlet debughoz;
- `sourceRange`: az eredeti XMLUI/code-behind forrás pozíciója;
- `dependencies`: binding targetnél olvasási dependency lista;
- `js`: generált JavaScript;
- `mappings`: kezdetben egyszerű generated offset -> source range lista, nem teljes source map;
- `sourceMap`: opcionális, későbbi mező teljes source maphez;
- `nativeFn`: runtime módban `new Function(...)` eredménye;
- `diagnostics`: compile-time figyelmeztetések/hibák.

Source map előkészítés:
- A parser AST node-ok `startToken`/`endToken` adatait ne veszítsük el a compiled artefaktumban.
- A codegen ne egyszerű string konkatenációként nőjön korlátlanul; használjon kis code writer segédet, amely minden kibocsátott JS szelethez opcionális source range-et tud rögzíteni.
- A generált helperhívásoknál is őrizzük meg a felhasználói kifejezés range-ét, hogy töréspont és stack trace később visszamappelhető legyen.
- A `sourceURL`/virtuális fájlnév konvenciót tervezzük meg úgy, hogy runtime `new Function` és Vite build-time kimenet között ne kelljen átnevezni a forrásokat.

Event/code-behind előkészítés:
- A core codegen ne tegyen binding-specifikus feltételezéseket a statementekről. A target döntse el, hogy Promise engedett-e, hogyan működik cancellation, timeout, transactional commit, scheduler, error handling.
- A runtime helper interfész legyen target-paraméterezett: a binding target sync Promise hibát dob, az event target később awaitelhet vagy async proxykat használhat.
- A code-behind module/import metadata maradjon meg a compiled artefaktumban, hogy később több forrásfájl source mapje és import gráfja is visszaállítható legyen.

Vite build-time előkészítés:
- A parse-időben elkészített artefaktum legyen serializálható. Runtime-only részek, például `nativeFn`, ne kerüljenek a serializált build outputba.
- Legyen külön `compileToArtifact(ast, options)` és `instantiateCompiledArtifact(artifact, runtime)` lépés. Runtime módban mindkettő a böngészőben futhat; Vite módban az első build-time, a második runtime.
- A cache kulcsok tartalmazzanak `sourceId`, compiler version, target és releváns xmluiConfig opciókat, hogy build-time és runtime cache ne keveredjen.

## Megvalósítási tanulságok naplózása

A megvalósítás során minden váratlan viselkedést, döntést és jövőbeli képességet érintő tanulságot rögzíteni kell egy rövid belső naplóban:
- javasolt fájl: `.plan/compiled-sync-expressions-notes.md`;
- alternatíva, ha a terv egyben maradjon: külön `## Megvalósítási napló` szakasz ebben a fájlban.

Rögzítendő témák:
- AST/source range hiányosságok, amelyek source mapnél problémát okoznának;
- olyan XMLUI nyelvi elemek, amelyek binding targetben furcsák, de event/code-behind targetben fontosak lesznek;
- sandbox/helper API döntések, amelyek async event fordításnál mást igényelhetnek;
- timeout, cancellation, transactional commit és dirty tracking közötti nem várt interakciók;
- Vite build-time serializációt akadályozó runtime-only állapotok;
- tesztekből kiderülő paritáseltérések az interpreter és compiled útvonal között;
- teljesítmény- vagy debugolhatósági kompromisszumok.

Minden ilyen bejegyzés legyen rövid, de tartalmazza:
- dátum vagy implementációs lépés azonosítója;
- érintett fájl/modul;
- megfigyelés;
- döntés vagy nyitva hagyott kérdés;
- melyik jövőbeli képességet érinti: source map, event/code-behind compile, Vite build-time compile, vagy általános compiler core.

## 1. lépés: konfiguráció és üres integrációs pont

Vezessünk be egy `xmluiConfig.compileBindings` kapcsolót, alapértelmezett `false` értékkel. A kapcsoló kerüljön be az engine-konfiguráció dokumentált listájába és az `EvalTreeOptions` típusba, de kezdetben ne változtasson viselkedést.

Érintett helyek:
- `xmlui/src/components-core/abstractions/standalone.ts`
- `xmlui/src/components-core/script-runner/BindingTreeEvaluationContext.ts`
- `StateContainer`, `ComponentAdapter`, `LoaderComponent` környéki `createValueExtractor`/`useVars` opciótovábbítás

Ellenőrzés:
- Unit teszt arra, hogy a flag explicit `false`/hiányzó állapotban a régi interpretert használja.
- TypeScript ellenőrzés: `npx tsc --noEmit -p xmlui/tsconfig.json`.

## 2. lépés: közös sync runtime helper API

Emeljük ki a jelenlegi sync interpreter biztonsági és szemantikai műveleteit egy olyan kis helper API-ba, amelyet az interpreter és a későbbi fordított kód is használhat.

Javasolt helper műveletek:
- `readIdentifier(name, evalContext, thread)`
- `readMember(obj, key, options, rootInfo)`
- `writeTarget(...)`
- `deleteTarget(...)`
- `markReceiverDirty(...)`
- `callFunction(fn, thisArg, args, callSiteInfo)`
- `constructValue(constructor, args)`
- `assertSyncResult(value)`
- `startTimeoutBudget(...)` és `checkTimeout()`
- `enter/leaveBlock`, vagy ennek minimális változata az arrow/IIFE statement bodykhoz

Fontos: a helper API hívja tovább ugyanazt a `isBannedFunction`, `isBannedMember`, UDC capability és Promise-tiltás logikát, mint a jelenlegi interpreter. A fordított kód sem közvetlen property accesszel, sem közvetlen function callal ne kerülhesse meg ezeket.

Ellenőrzés:
- A meglévő `bannedFunctions`, `bannedMembers`, `eval-tree-sync`, `process-statement-sync` unit tesztek maradjanak zöldek.
- Adjunk célzott tesztet arra, hogy a helperen át hívott `setTimeout`, `Function`, `window`, `document.body`, `fetch` ugyanúgy viselkedik, mint az interpreter.
- Hozzuk létre az írásészlelési tesztharnesst, és fedjük le a helper szintű alapműveleteket: root assignment, nested assignment, computed assignment, delete, prefix/postfix, compound assignment, receiver dirty jelölés.
- Helper unit teszt: `checkTimeout()` ugyanazt a limitet és hibaüzenetet használja, mint a jelenlegi sync interpreter.

## 3. lépés: fordított kód objektummodell és cache

Hozzunk létre egy általános `script-compiler` modult, azon belül első targetként `binding-sync` támogatással. Az AST-ből ne rögtön natív függvényt, hanem először egy serializálható `CompiledScriptArtifact` objektumot állítsunk elő.

Javasolt alak:
- `target`: kezdetben `"binding-sync"`
- `sourceId`: XMLUI fájl vagy virtuális inline forrás azonosítója
- `sourceText`: debughoz, trace-hez
- `sourceRange`: eredeti XMLUI forrás pozíciója
- `astNodeId` vagy parse-id alapú azonosító
- `dependencies`: továbbra is `collectVariableDependencies` eredménye
- `js`: generált JavaScript forrás
- `mappings`: kezdeti, egyszerű source-span mapping lista
- `execute(evalContext, thread): any`
- `nativeFn`: runtime példányosításkor a belső fordító által `new Function(...)`-nel létrehozott futtatható függvény

A cache kulcsa kezdetben legyen AST objektum vagy expression source string + flag + debug mód. Ne változtassuk meg a meglévő memoizáció dependency-szemantikáját.

Ellenőrzés:
- Unit teszt: ugyanazt az AST-t kétszer fordítva cache-hit történik.
- Unit teszt: nem fordítható node esetén fordított módban hiba keletkezik, nincs interpreter fallback.
- Unit teszt: az artefaktum `nativeFn` nélkül serializálható, és külön instantiate lépésből újra futtatható.
- Unit teszt: legalább néhány egyszerű expression mappingje tartalmazza az eredeti `sourceRange` adatot.

## 4. lépés: kifejezés-codegen minimális, side-effect nélküli részhalmazra

Elsőként csak tiszta, gyakori kifejezéstípusokat fordítsunk:
- literal, identifier
- member és calculated member access opcionális XMLUI szemantikával
- unary, binary, conditional, sequence
- array/object literal, spread azokon a pontokon, ahol az interpreter is engedi
- template literal

A generált JS minden olvasást helperen keresztül végezzen, például ne `obj.prop`, hanem `rt.member(obj, "prop", meta)`.

Ellenőrzés:
- Új unit paritásteszt-tábla: interpreter eredmény === compiled eredmény.
- Kötelező esetek: `null.foo`, `undefined["x"]`, `foo.bar.baz`, `Math.floor(...)`, `items[missing]`, `a ?? b`, `a && b`, ternary.
- Mivel ez a lépés elvileg side-effect nélküli részhalmaz, külön unit teszt igazolja, hogy ezek a kifejezések nem hoznak létre változásbejegyzést és nem dirtyznek root változót.

## 5. lépés: függvényhívás, arrow és IIFE fordítása

Bővítsük a codegent function invocation és arrow expression támogatással. Ez kritikus, mert XMLUI bindingban lehet IIFE vagy magasabb rendű függvény:

```xml
var.value="{(() => { let x = 1; return x + 1; })()}"
var.items="{items.map(item => ({ id: item.id }))}"
```

Az arrow/function body fordítása statement blockot igényel. A fordított closure-nek meg kell tartania:
- lexical/block scope lookupot
- `this`/host objektum kontextust member callnál
- implicit context támogatást ott, ahol a sync interpreter ma használja
- tiltott függvényellenőrzést minden hívás előtt
- sync Promise hibát minden hívás után

Ellenőrzés:
- Paritásteszt `Array.map/filter/reduce` arrow callbackekre.
- Paritásteszt IIFE-re, nested arrowra, recursive arrowra.
- Írásészlelési unit tesztek arrow/IIFE esetekre: külső változó módosítása, lokális block/closure változó módosítása dirty root nélkül, receiver mutáció callbackből, több root módosítása nested functionből.
- Timeout unit teszt: nested arrow/IIFE hosszú ciklusa ugyanazon sync timeout budgetből fogyaszt, és nem reseteli a limitet.
- E2E célpont később: `xmlui/tests-e2e/binding-regression.spec.ts` fordított módban.

## 6. lépés: statement codegen a sync bindinghoz szükséges teljes nyelvi felületre

Mivel egy binding IIFE tartalmazhat utasításokat, a statement fordítást a sync interpreter által támogatott statementekre kell kiterjeszteni:
- block, empty, expression statement
- let/const deklarációk, destructuring
- if/else
- return, throw
- while, do/while, for, for/in, for/of
- break, continue
- switch
- try/catch/finally
- function declaration és hoisting a fordított blockon belül

A `var` XMLUI-reaktív szemantikáját ne engedjük function bodyban fordított módban sem; ugyanaz a hiba maradjon: `"'var' declarations are not allowed within functions"`.

Ellenőrzés:
- A meglévő `process-statement-sync` unit tesztkészletből hozzunk létre compiled-mode változatot vagy paraméterezett futtatást.
- Külön teszt: loop timeout továbbra is érvényesül `syncExecutionTimeout` szerint.
- Külön teszt: `try/finally` return/throw/break interakció paritás.
- A teljes írásészlelési mátrixot itt kell teljessé tenni: assignment operátorok, destructuring, delete, loopon belüli írások, branch-specifikus írások, try/catch/finally írások, több írás egy batchben, sikertelen írások.
- Dependency invalidation unit tesztek: a futásból keletkező dirty set alapján csak a kapcsolódó dependency listájú kifejezések jelölődnek újraértékelendőnek.
- A teljes timeout mátrixot itt kell teljessé tenni: végtelen loop, hosszú loop, nested loop, nested function loop, konfigurált rövid/hosszú timeout.

## 7. lépés: parse-időben előállított fordítási artefaktum

Miután a codegen stabil, módosítsuk a markup/script parse pipeline-t úgy, hogy a kifejezések AST-je mellé opcionálisan elkészülhessen a compiled artefaktum is.

Javasolt fokozatok:
1. `parseAttributeValue` és/vagy `parseParameterString` adjon vissza AST + opcionális compiled placeholder alakot.
2. `xmlui-parser/transform.ts` őrizze meg a nyers string kompatibilitást, de ahol már parse-ol, tegye el a compiled-ready alakot.
3. `extractParam` és `useVars` fogadjon egységes `ParsedExpressionSegment` alakot a string mellett.
4. A parse pipeline adjon stabil `sourceId`/`sourceRange` adatot a compiled artefaktumnak, későbbi source map és Vite build-time compile célból.

Ezt a lépést csak azután érdemes bekapcsolni, hogy a runtime váltás és az unsupported-node hibakezelés stabil, mert sok hívó ma stringet vár.

Ellenőrzés:
- Parser unit tesztek: meglévő string inputok kompatibilisek maradnak.
- Snapshot/paritástesztek: forrásmegjelenítés, diagnosztikai pozíciók és dependency tracking nem romlik.
- Unit teszt: inline attribute expression, `var.*`, `<script>` eredetű declaration és standalone/runtime forrás esetén is stabil `sourceId`/`sourceRange` keletkezik, még ha a code-behind target compile későbbre marad is.

## 8. lépés: runtime váltás és hibastratégia

Az `evalBinding` maradjon publikus belépési pont, de flag alapján válasszon:

- flag `false`: kizárólag interpreter
- flag `true`: kizárólag compiled; unsupported node esetén explicit hiba
- nincs shadow compare mód

Az unsupported-node hiba legyen fejlesztőbarát: tartalmazza a node típusát, a kifejezés forrását, és ha elérhető, a forráspozíciót. `xsVerbose` módban a compiled binding futás és fordítási hiba trace-elhető legyen.

Ellenőrzés:
- Unit teszt mindkét útra: off/interpreter és on/compiled.
- Unit teszt unsupported node hibára.
- Hibaparitás tesztek: syntax/runtime error üzenetek legalább lényegileg azonosak maradnak.
- Runtime integrációs unit teszt: compiled kiértékelés után a változásbejegyzések ugyanazon `statePartChanged`/dirty-set útvonalra kerülnek, amelyet a container reaktív újraértékelése használ.
- Re-evaluation unit teszt kis mű-state-tel: több binding dependency listából csak azok futnak újra, amelyek metszik a dirty root halmazt.

## 9. lépés: E2E futtatás kapcsolóval

Tegyük lehetővé, hogy egy jól meghatározott E2E részhalmaz ugyanazokkal a spec fájlokkal fusson compiled módban.

Javaslat:
- `xmlui/src/testing/fixtures.ts` olvasson egy környezeti változót, például `XMLUI_COMPILE_BINDINGS=true`.
- A fixture ezt merge-elje a testbed `xmluiConfig` objektumába, de az adott teszt explicit `xmluiConfig` értéke felülírhassa.
- Adjunk npm scriptet, például `test:e2e:compiled-bindings`, amely csak a binding/script regressziós készletet futtatja.
- Az infrastruktúra támogassa ugyanannak az E2E részhalmaznak két futtatását: egyszer klasszikus módban, egyszer `compileBindings: true` módban. Ez lehet külön npm scriptpár vagy egy magasabb szintű script, amely egymás után indítja a két Playwright futást.

Első célzott készlet:
- `xmlui/tests-e2e/binding-regression.spec.ts`
- `xmlui/tests-e2e/scripting.spec.ts`
- később komponens-spec fájlokból azok, amelyek sok bindingot használnak, de nem elsősorban event scheduler viselkedést tesztelnek

Ellenőrzés:
- `npx playwright test xmlui/tests-e2e/binding-regression.spec.ts --reporter=line` klasszikus módban.
- Ugyanez `XMLUI_COMPILE_BINDINGS=true` módban.
- A teljes E2E suite futtatása csak külön jóváhagyással, mert a repo irányelve szerint lassú.

## 10. lépés: teljes paritás- és teljesítményellenőrzés

Amikor a célzott tesztek stabilak, készítsünk mérési harness-t:
- sok ismételt binding-kiértékelés interpreterrel és compiled móddal
- memoizációs viselkedés ellenőrzése render közben
- dependency tracking változatlanság mérése `computedUses` regressziókkal
- artefaktum méret, instantiation költség, mapping-adat overhead mérése

Ellenőrzés:
- Unit benchmark jellegű smoke teszt, nem törékeny időlimittel.
- Dokumentált kézi mérési parancs fejlesztőknek.
- A megvalósítási napló tartalmazza a source map, event/code-behind compile és Vite build-time compile szempontjából releváns tanulságokat.

## Code-behind álláspont

Első körben a code-behind fájlokat ne állítsuk át compiled sync végrehajtásra. Indokok:
- code-behind és event útvonal async/statement queue modellhez kötődik;
- import/module validáció és hoisting külön pipeline;
- a felhasználói kérés szerint az eseménykezelő végrehajtásához nem akarunk nyúlni.

A code-behindből származó függvények akkor érintettek, ha szinkron bindingként hívott függvényértékké válnak. Mivel fordított módban nincs fallback, ezt explicit határként kell kezelni: az ilyen hívás kezdetben unsupported hibát adjon, vagy csak olyan code-behind függvény legyen hívható bindingból, amelyhez már készült compiled reprezentáció. A code-behind teljes JavaScript-re fordítása későbbi fázis, az eseménykezelő-fordítással együtt.

## Lezárt kérdések és döntések

1. A belső fordító használhat `new Function(...)`-t.
2. A rövid kapcsolónév: `compileBindings`.
3. Nem lesz shadow compare mód.
4. Unsupported node esetén fordított módban hiba keletkezik.
5. A code-behind hosszabb távon JavaScript-re fordítandó, de az event handler fordítással együtt.
6. Az E2E infrastruktúra támogassa ugyanazon regressziós készlet klasszikus és compiled módban való futtatását.
7. Egyelőre belső dokumentáció elég.
