# Compiled event handler yield optimalizálási terv

## Cél

A JavaScript-re fordított eseménykezelők ne engedjék át az event loopot minden egyes XMLUI statement után. A statement boundary szerződés megmaradjon, de az event-loop yield csak akkor történjen meg, ha:

- az aktuális handler-példány legutóbbi yield referenciaideje óta eltelt legalább 100ms;
- és az adott statement yield-vizsgálatra jogosult.

Fontos kitétel: a yield-vizsgáló logika ne generálódjon külön minden eseménykezelőhöz. Egy közös runtime metódust használjon minden handler, de a metódus handler-példányonként elszigetelt runtime állapotot kapjon.

## Jelenlegi helyzet

Érintett fő fájlok:

- `xmlui/src/components-core/script-compiler/event-runtime.ts`
- `xmlui/src/components-core/script-compiler/targets/event-async.ts`
- `xmlui/src/components-core/script-compiler/targets/event-async-executor.ts`
- `xmlui/src/parsers/xmlui-parser/transform.ts`
- `xmlui/tests/components-core/compiled-events/*`
- `xmlui/tests/components-core/script-compiler/event-runtime.test.ts`

A compiled event runtime már handler-invocation scope-hoz kötött yield állapotot használ. Az `afterStatement(...)` minden statement boundary-n megtartja a completion hookot és a cancellation checket, de az event-loop yield csak `maybeYield(...)` útján, 100ms-os intervallum után történik. A codegen már képes `{ checkYield: false }` metaadatot adni egyszerű statementekhez.

A következő optimalizáció célja a függvényhívást tartalmazó statementek finomabb osztályozása. Ma minden `T_FUNCTION_INVOCATION_EXPRESSION` yieldet eredményező hívásnak számít; ezt kell bővíteni egy biztonságos, unit tesztekkel védett safe-call listával.

## Megőrzendő szerződések

- `beforeStatement(...)` és `afterStatement(...)` továbbra is lefusson minden XMLUI statement boundary-n.
- Az `afterStatement(...)` továbbra is meghívja az `evalContext.onStatementCompleted(...)` hookot.
- A cancellation továbbra is kooperatív maradjon: a runtime a statement boundary-k környékén ellenőrizze a `$cancel` tokent.
- Állapotváltozás után a dispatcher meglévő commit/frissítés mechanizmusa maradjon érintetlen.
- A változtatás csak a compiled event handler útvonal event-loop yield gyakoriságát optimalizálja; az interpreter útvonal viselkedését csak külön döntéssel módosítsuk.

## Javasolt runtime API

Vezessünk be egy handler-példányonkénti yield állapotot, például:

```ts
type EventYieldState = {
  lastYieldCheckTs: number;
  intervalMs: number;
};
```

Az állapotot a közös runtime metódus használja, de nem globális singletonként. A `runtime.start(...)` vagy a compiled executor hozzon létre/állítson be egy példányállapotot az adott handler invocation számára.

Javasolt runtime metódus:

```ts
async maybeYield(
  evalContext: BindingTreeEvaluationContext,
  options?: { forceCheck?: boolean }
): Promise<void>
```

Szemantika:

- aktuális idő: `performance.now()` ha elérhető, különben `Date.now()`;
- ha `now - state.lastYieldCheckTs < 100`, nincs yield;
- ha eltelt legalább 100ms, `state.lastYieldCheckTs = now`, majd `await runtime.yield()`;
- cancellation ellenőrzés maradjon az `afterStatement(...)` környezetében, hogy a ritkább yield ne jelentse azt, hogy a cancellation ritkán figyelődik meg.

Az `afterStatement(...)` kapjon statement metaadatot:

```ts
type EventStatementBoundaryOptions = {
  checkYield?: boolean;
};
```

Így az alap forma:

```ts
await runtime.afterStatement(evalContext, statement, { checkYield: true });
```

Egyszerű statementeknél a codegen `checkYield: false` értéket adhat.

## Statement-osztályozás az első körben

Az első implementációban legyen konzervatív az osztályozás.

Mindig kérjen yield-vizsgálatot:

- loop guard és loop update boundary-k: `while`, `do while`, `for`, `for..in`, `for..of`;
- `return`, `throw`, `break`, `continue`;
- `if`, `switch`, `try/catch/finally` boundary-k;
- olyan expression statement, amely yieldet eredményező függvényhívást tartalmaz;
- olyan `let`/`const` deklaráció, amelynek inicializálója függvényhívást tartalmaz;
- destrukturáló deklaráció, ha az initializer függvényhívást tartalmaz;
- callback/arrow body statementek, mert ezek async proxykon és felhasználói callbackeken keresztül futnak.

Átugorhatja a yield-vizsgálatot:

- egyszerű `let`/`const` lokális deklaráció literállal, identifierrel, member read-del, unary/binary kifejezéssel, ha nincs benne függvényhívás;
- expression statement, ha nincs benne yieldet eredményező függvényhívás;
- egyszerű lokális értékadás, ha a jobb oldal nem tartalmaz függvényhívást;
- üres statement;
- block statement saját wrapper boundary-je, ha a gyerek statementek külön boundary-t kapnak.

Fontos: ez csak a yield-vizsgálatot hagyja ki, nem a statement boundary hookokat és nem a cancellation ellenőrzést.

## Függvényhívás detektálás

Készüljön statikus helper a codegenhez:

```ts
function expressionMayCallFunction(expr: Expression): boolean
function statementMayCallFunction(statement: Statement): boolean
```

Az első verzióban legyen szándékosan túlbecslő:

- `T_FUNCTION_INVOCATION_EXPRESSION`: true;
- member/calculated member receiver és index rekurzív vizsgálata;
- array/object literal elemek/properties rekurzív vizsgálata;
- assignment jobb oldal és célkifejezés rekurzív vizsgálata;
- unary/binary/pre-post operandusok rekurzív vizsgálata;
- arrow expression esetén a body-t ne számítsuk bele az arrow létrehozásába, de az arrow body statementjei saját codegen döntést kapjanak, amikor futnak.

Később finomítható whitelisttel, például gyors, tiszta beépített függvényekre.

## Safe-call lista: nem yieldet eredményező alapfüggvények

Vezessünk be egy explicit, központi ellenőrzést azokhoz az alap JavaScript hívásokhoz, amelyek után nem kérünk yield-vizsgálatot. A cél nem általános purity analysis, hanem egy szűk, áttekinthető lista.

Javasolt helper:

```ts
function isKnownNonYieldingCall(expr: FunctionInvocationExpression): boolean
```

A helper csak statikusan felismerhető hívásokat engedjen át:

- `Math.*(...)`, ahol a property név ismert és a `Math` globálon van;
- `Number.*(...)` biztonságos statikus metódusai;
- `String.*(...)` biztonságos statikus metódusai;
- `Object.*(...)` kifejezetten kiválasztott, szinkron, kiszámítható metódusai;
- primitív string metódusok literálon vagy nyilvánvaló string expressionön;
- primitív number metódusok number literálon vagy nyilvánvaló number expressionön;
- primitív boolean metódusok boolean literálon;
- `Array.isArray(...)`.

Első körös javasolt lista:

- `Math`: `abs`, `acos`, `acosh`, `asin`, `asinh`, `atan`, `atan2`, `atanh`, `cbrt`, `ceil`, `clz32`, `cos`, `cosh`, `exp`, `expm1`, `floor`, `fround`, `hypot`, `imul`, `log`, `log10`, `log1p`, `log2`, `max`, `min`, `pow`, `round`, `sign`, `sin`, `sinh`, `sqrt`, `tan`, `tanh`, `trunc`, `random`.
- `Number`: `isFinite`, `isInteger`, `isNaN`, `isSafeInteger`, `parseFloat`, `parseInt`.
- `String`: `fromCharCode`, `fromCodePoint`, `raw`.
- `Array`: `isArray`.
- String prototype: `at`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `includes`, `indexOf`, `lastIndexOf`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `split`, `startsWith`, `substring`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `trim`, `trimEnd`, `trimStart`, `valueOf`.
- Number prototype: `toExponential`, `toFixed`, `toLocaleString`, `toPrecision`, `toString`, `valueOf`.
- Boolean prototype: `toString`, `valueOf`.
- Array prototype csak külön óvatossággal: `includes`, `indexOf`, `lastIndexOf`, `at`, `join`, `slice`, `toString`, `toLocaleString`. Callbacket futtató vagy iteráló magasabb rendű metódusok (`map`, `filter`, `forEach`, `reduce`, stb.) maradjanak yieldet eredményezőnek.

Kizárások az első körben:

- user-defined, code-behind, importált vagy component API függvények;
- `Date.*` és `Intl.*`, amíg nincs külön döntés;
- `JSON.parse`/`JSON.stringify`, mert nagy inputon blokkolhatnak;
- `Object.keys/values/entries/assign/freeze/...`, amíg nincs méret- és objektumkezelési döntés;
- minden callbacket futtató metódus;
- minden computed member call, például `Math[name]()` vagy `value[method]()`.

Fontos: a safe-call döntés csak a hívás saját yield-jogosultságát veszi el. Az argumentumokat továbbra is rekurzívan vizsgálni kell; például `Math.max(getValue(), 1)` továbbra is yield-vizsgálatot kérjen a `getValue()` miatt.

## Parse-time compiled source konzol kapcsoló

Legyen külön kapcsoló, amely csak akkor aktív, amikor parse során ténylegesen elkészül egy compiled event artifact. Ez fejlesztői diagnosztikai eszköz, alapértelmezésben `false`.

Javasolt név:

```ts
xmluiConfig.logCompiledEventHandlerSource
```

Parser opció szinten:

```ts
XmluiParserOptions.logCompiledEventHandlerSource?: boolean
```

Szemantika:

- csak parse-time compiled event artifact esetén logoljon, tehát amikor `compileEventHandlers === true` és a `ParsedEventValue.compiled` létrejött;
- dinamikus runtime-compilation cache miss esetén ne logoljon ebben az első körben;
- a log csoportosított és könnyen kereshető legyen, például `[xmlui] compiled event handler`;
- tartalmazza: `sourceId`, eredeti event source, generált JavaScript (`artifact.js`);
- ha `console.groupCollapsed` elérhető, használja azt; egyébként `console.log`;
- production/runtime behavior ne változzon, a kapcsoló nélkül nulla console output legyen.

Nyitott döntés jóváhagyás előtt:

- A kapcsolót csak `xmluiConfig`-ból vezessük, vagy legyen E2E/dev env alias is, például `XMLUI_LOG_COMPILED_EVENT_HANDLERS=true`?
- A logolás helye a parser transform legyen-e, közvetlenül a `compiled` artifact létrehozása után, vagy a compiler target (`compileEventAsyncStatements`) kapjon opcionális logger callbacket?

Javaslat: első körben parser transformban logoljunk, mert a kérés kifejezetten a parse során lefordított eseménykezelők forráskódjára vonatkozik.

## Megvalósítási lépések

1. Runtime állapot bevezetése
   - `event-runtime.ts` kapjon handler-invocation scope-hoz kötött yield állapotot.
   - Legyen közös `maybeYield(...)` metódus.
   - Az intervallum induljon fix `100` ms értékkel; később konfigurálhatóvá tehető.

2. `afterStatement(...)` szétválasztása
   - A boundary hook és cancellation maradjon mindig.
   - Az event-loop yield csak `checkYield !== false` esetén fusson, és akkor is csak `maybeYield(...)` alapján.

3. Codegen metaadat
   - `emitAfterStatement(...)` kapjon opciót.
   - A statement emitterek adják át, hogy kell-e yield-vizsgálat.
   - Egyszerű deklarációk és egyszerű assignment expression statementek használjanak statikus hívásdetektálást.

4. Regressziós tesztek
   - Runtime unit teszt: 100ms előtt nincs yield, 100ms után van yield, referenciaidő frissül.
   - Runtime unit teszt: két handler-invocation külön állapotot használ.
   - Codegen teszt: egyszerű `let/const` nem kér yield-vizsgálatot.
   - Codegen teszt: `let x = getValue()` kér yield-vizsgálatot.
   - Codegen teszt: egyszerű expression statement nem kér yield-vizsgálatot, de yieldet eredményező függvényhívást tartalmazó expression statement igen.
   - Compiled event parity teszt: sok egyszerű statement nem yieldel minden statement után, de a boundary hookok továbbra is lefutnak.
   - Cancellation teszt: ritkább yield mellett is statement boundary-n figyelt marad a `$cancel`.

5. Dokumentáció/notes frissítése
   - `.plan/compiled-async-event-handlers-notes.md` kapjon új lépésjegyzetet.
   - `.ai/xmlui/action-execution.md` jelenlegi "minden statement után yield lehetőség" leírását pontosítani kell, ha a változtatás elkészül.

6. Safe-call detector bevezetése
   - Központi allowlist a compiled event codegen közelében vagy külön `safe-calls.ts` modulban.
   - `expressionMayYield(...)` a `T_FUNCTION_INVOCATION_EXPRESSION` ágon először az argumentumokat vizsgálja, majd a callee-t `isKnownNonYieldingCall(...)` alapján.
   - Computed member call továbbra is yieldet eredményező legyen.
   - Bare event references továbbra is yieldet eredményezőnek számítsanak.

7. Safe-call unit tesztek
   - Minden allowlist kategóriára legyen legalább egy pozitív unit teszt.
   - Minden kizárt kategóriára legyen negatív unit teszt.
   - Argumentum rekurzió teszt: `Math.max(getValue(), 1)` kér yield-checket.
   - Callback metódus negatív teszt: `items.map(x => x + 1)` kér yield-checket.
   - Computed member negatív teszt: `Math[name](value)` kér yield-checket.

8. Parse-time source logging kapcsoló
   - Konfig típusok és parser opciók bővítése.
   - Parser transform logoljon a parse-time artifact létrehozásakor.
   - Unit teszt console spy-jal: flag nélkül nincs log, flaggel van log, és tartalmazza `sourceId`, eredeti source, generált JS.
   - Unit teszt: `compileEventHandlers: false` mellett a logging flag önmagában nem fordít és nem logol.

9. Következő dokumentáció/notes frissítése
   - `.plan/compiled-async-event-handlers-notes.md` kapjon új lépésjegyzetet.
   - `.ai/xmlui/action-execution.md` említse, hogy ismert safe-callok nem kérnek yield-checket.

## Potenciális későbbi optimalizációk

- Különbségtétel user-defined/code-behind/importált függvények és ismert natív függvények között.
- Adaptív intervallum: rövid handlereknél 100ms, hosszabbaknál vagy ismételt timeout-közeli futásnál kisebb intervallum.
- Statement súlybecslés: loop body, nested object/array feldolgozás, async proxy callbackek magasabb súlyt kapjanak.
- Budget-alapú ellenőrzés: ne csak időt, hanem generált statement-súlyt is számoljunk, így alacsony felbontású timer mellett is kiszámíthatóbb a kooperativitás.
- Runtime tracing: inspector/debug módban opcionálisan logolható legyen, hányszor vizsgált és hányszor ténylegesen yieldelt a handler.
- Konfigurálható yield intervallum fejlesztői vagy app-level kapcsolóval, például későbbi `appGlobals.defaultHandlerYieldIntervalMs`.
- Build-time statikus optimalizáció: Vite compiled módban agresszívebb osztályozás és esetleges dead-code alapú yield-check törlés.

## Kockázatok

- Ha a cancellation csak yieldkor futna, a ritkább yield rontaná a megszakíthatóságot. Ezért a cancellation ellenőrzés maradjon minden boundary-n.
- Ha a codegen túl optimista, hosszú tisztán szinkron számítás blokkolhatja a fő szálat. Az első osztályozás inkább túl sok checket hagyjon bent.
- A safe-call whitelist túl szélesre nyitása regressziót okozhat nagy inputokon. Ezért az első lista legyen szűk, és minden elemhez legyen unit teszt.
- Prototype metódusoknál a receiver típusa statikusan gyakran nem bizonyítható. Csak literál vagy nyilvánvaló expression esetén tekintsük safe-callnak; egy sima `value.trim()` első körben maradhat yieldet eredményező, ha `value` típusa nem statikusan ismert.
- A console logging kapcsoló nagy generált kódot írhat a konzolra. Alapértelmezésben maradjon kikapcsolva, és csak parse-time artifactre vonatkozzon.
- Ha a yield állapot globális, párhuzamos handler példányok egymás referenciaidejét szennyezhetik. Ezért invocation-scope állapot kell.
- A tesztekben a `performance.now()` kontrollálása ne legyen törékeny; érdemes a runtime időforrását belső helperen keresztül injektálhatóvá tenni tesztekben.

## Elfogadási kritériumok

- A compiled event handler útvonalon nem történik automatikus `setTimeout(0)` minden statement után.
- Egy handler invocation legfeljebb 100ms-onként yieldel, kivéve ha később explicit force-yield döntés születik.
- Egyszerű, yieldet eredményező függvényhívást nem tartalmazó lokális statementek és expression statementek nem kérnek yield-vizsgálatot.
- Yieldet eredményező függvényhívást tartalmazó egyszerű statementek kérnek yield-vizsgálatot.
- A safe-call allowlistbe tartozó alap JS hívások önmagukban nem kérnek yield-vizsgálatot.
- A safe-call argumentumai továbbra is rekurzívan számítanak; yieldet eredményező argumentum esetén a statement kérjen yield-vizsgálatot.
- A parse-time compiled event source logging flag nélkül ne legyen konzol output; flaggel jelenjen meg az eredeti handler source és a generált JS.
- Minden handler invocation ugyanazt a közös runtime metódust használja, de külön yield állapottal.
- A meglévő statement boundary, state commit, cancellation, timeout és transactional szerződések nem sérülnek.
