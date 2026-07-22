# JavaScript-re fordított aszinkron eseménykezelők terve

## Cél és határok

Az XMLUI eseménykezelői kapjanak egy kísérleti, JavaScript-re fordított végrehajtási útvonalat. A funkció alapértelmezetten kikapcsolt legyen, és csak új konfigurációs kapcsolóval aktiválódjon.

Javasolt kapcsoló:

- `xmluiConfig.compileEventHandlers`, alapértelmezett értéke `false`.
- A meglévő `compileBindings` kapcsolótól független legyen. A két compiled útvonal később együtt is futtatható, de az event handler fordítás önállóan bekapcsolható és tesztelhető legyen.

Nem cél az első körben:

- a régi interpreter eltávolítása;
- Vite build-time kötelező fordítás;
- source map teljes megvalósítása;
- teljesítményoptimalizálás a szemantikai paritás előtt.

Nem cél hosszabb távon sem az explicit `async`/`await` XMLUI nyelvi támogatása. Az XMLUI eseménykezelők továbbra is async szemantikával fussanak `async` és `await` kulcsszavak nélkül; az explicit `async` function, async arrow és `await` továbbra is runtime hibát adjon.

Jövőbeli termékképességként viszont számoljunk Vite build idejű fordítással, source map generálással és böngészőbeli debug támogatással. Ez a fázis ezeket ne valósítsa meg, de az artifact és codegen rétegek ne zárják ki őket.

A kapcsoló bekapcsolásakor az elvárás ugyanaz, mint a binding fordításnál: az összes E2E tesztnek sikeresen kell futnia compiled event módban is. A teljes E2E készletet minden lépés után kézi kapuként kell kezelni; az implementáló agent ne indítsa el saját maga a teljes készletet.

## Miért nehezebb ez, mint a szinkron binding fordítás

Az XMLUI event handler nem egyszerűen egy JavaScript függvény:

- a handler async módon fut akkor is, ha a felhasználói kód nem ír `async`/`await` kulcsszavakat;
- minden függvényhívás eredményét rekurzívan be kell várni `completePromise()` szemantikával;
- az async evaluator speciális array method proxykat használ (`map`, `filter`, `forEach`, stb.);
- statement boundary után állapotváltozásokat kell commitolni, majd meg kell várni a React/container frissülést;
- hosszú handlernél kooperatívan yieldelni kell az event loopnak;
- `$cancel`, handler policy, timeout, transactional commit, inspector logging és lifecycle state mind a dispatcher szerződés része.

Ezért a fordított handlernek nem natív, blokkoló JavaScript függvényként kell viselkednie. A generált kód legyen `async`, minden XMLUI statement után hívjon target runtime hookot, és minden XMLUI szemantikájú értékelési ponton használjon async runtime helper API-t.

## Megőrzendő szerződések

Az új compiled event targetnek paritásban kell maradnia a következő útvonallal:

- `xmlui/src/components-core/container/event-handlers.ts`
- `xmlui/src/components-core/script-runner/process-statement-async.ts`
- `xmlui/src/components-core/script-runner/eval-tree-async.ts`
- `xmlui/src/components-core/script-runner/eval-tree-common.ts`
- `xmlui/src/components-core/script-runner/asyncProxy.ts`

Különösen megőrzendő:

- identifier/member/call optional-access alapértelmezés;
- banned function és banned member sandbox;
- `new` constructor whitelist;
- `async` function, async arrow és `await` tiltása;
- `var` csak main threaden, `let`/`const` block scope;
- function declaration hoisting;
- XMLUI lazy arrow objektumok és closure scope;
- code-behind/import function szemantika;
- `completePromise()` rekurzív Promise, tömb és objektum kezelése;
- async array proxy szemantika;
- statement boundary utáni `onStatementStarted`/`onStatementCompleted`;
- CoW state proxy írásnaplózás;
- `$this`, `$cancel`, event args és injected context vars;
- `handlerPolicy`, scheduler, timeout és cancellation;
- transactional handler buffer commit/discard;
- inspector `handler:start`, `handler:complete`, `handler:error`, `state:changes`;
- `EVENT_HANDLER_STARTED`, `EVENT_HANDLER_COMPLETED`, `EVENT_HANDLER_ERROR` lifecycle state.

## Compiler target és artifact modell

A meglévő `script-compiler` infrastruktúrára építsünk új targetet:

- `script-compiler/targets/event-async.ts`
- `script-compiler/targets/event-async-executor.ts`
- opcionálisan `script-compiler/event-runtime.ts` vagy a meglévő `runtime.ts` target-specifikus bővítése

Az artifact:

- `target: "event-async"`;
- `sourceId`, `sourceText`, `sourceRange`, `mappings` ugyanúgy, mint a binding targetben;
- `js` serializálható generált kód;
- `nativeFn` csak instantiate után, ne kerüljön a parse/build artifactbe;
- ne tartalmazzon binding dependency listát mint invalidációs forrást; event handlernél a változásokat runtime írásnaplózás adja.

A target API-nak már az elején különböznie kell a binding targettől:

- binding runtime: sync, Promise tiltott;
- event runtime: async, Promise automatikusan awaitelt;
- binding runtime: timeout guard;
- event runtime: statement boundary + cancellation/yield hook;
- binding runtime: dependency collector alapján invalidál;
- event runtime: CoW proxy change log alapján commitol.

## Event-loop yield szabály

A compiled event handler minden XMLUI statement után adjon lehetőséget az event loopnak futni.

Javasolt runtime hook:

```ts
await runtime.afterStatement(evalContext, statementInfo);
```

A hook felelőssége:

- meghívja a meglévő `evalContext.onStatementCompleted(...)` hookot;
- commitolja vagy buffereli a `changes` listát a dispatcher meglévő mechanizmusán keresztül;
- megvárja a React/container state update promise-t, ha volt állapotváltozás;
- állapotváltozás nélkül is kooperatívan yieldeljen;
- ellenőrizze a `$cancel` tokent és dobjon `HandlerCancelledError`-t, ha abortált;
- frissítse az `evalContext.localContext` CoW proxyját ugyanúgy, ahogy a jelenlegi dispatcher teszi.

Az első implementáció ne próbáljon okos yield batchinget. A cél a felhasználói kérés szerinti erős garancia: minden egyes XMLUI statement után legyen event-loop yield lehetőség. Ha később teljesítmény miatt lazítanánk, az külön kapcsoló vagy külön terv legyen.

## 1. lépés: konfiguráció és üres integrációs pont

Vezessük be a `xmluiConfig.compileEventHandlers` kapcsolót úgy, hogy kezdetben ne változtasson viselkedést.

Érintett helyek:

- `xmlui/src/components-core/abstractions/standalone.ts` vagy a konfiguráció típusának aktuális helye;
- `BindingTreeEvaluationContext` opciótípusai, ha a flaget oda kell továbbítani;
- E2E/testbed konfigurációs merge pontok.

Ellenőrzés:

- unit teszt arra, hogy hiányzó/false flaggel a régi `processStatementQueueAsync` útvonal fut;
- unit teszt arra, hogy true flag mellett a dispatcher látja a kapcsolót, de még explicit módon interpreterre megy;
- TypeScript ellenőrzés.

Teljes E2E-t ne futtasson az agent. Kézi kapu: a felhasználó futtathatja a jelenlegi teljes E2E készletet.

## 2. lépés: event-async artifact skeleton és unsupported executor

Hozzuk létre az új target fájlokat, de a compiled executor kezdetben csak artifactet készítsen és explicit unsupported hibát adjon, ha ténylegesen futtatni próbálják.

Feladatok:

- `compileEventAsyncStatements(statements, options)` létrehozása;
- `instantiateEventAsyncArtifact(...)` váz;
- `UnsupportedCompiledScriptNodeError` használata vagy event-specifikus kiegészítése;
- source range és mapping megőrzése;
- cache kulcsban `target: "event-async"` szerepeltetése.

Ellenőrzés:

- unit teszt: parse-olt statement listából serializálható `event-async` artifact készül;
- unit teszt: source id/range megmarad;
- unit teszt: unsupported futtatás fejlesztőbarát hibát ad.

## 3. lépés: async runtime helper szerződés

Készítsünk event-target runtime API-t, amely a meglévő async interpreter közös szemantikáját használja, nem duplikálja ad hoc módon.

Javasolt helper műveletek:

- `start(evalContext, thread)`;
- `beforeStatement(evalContext, statementInfo)`;
- `afterStatement(evalContext, statementInfo)`;
- `id(name, evalContext, thread)`;
- `member(obj, key, evalContext)`;
- `call(functionObj, thisArg, args, evalContext, thread, updateRootName?)`;
- `arrow(expr, evalContext, thread)`;
- `executeArrow(arrowObj, args, evalContext, thread)`;
- `assignId`, `assignMember`, `prePostId`, `prePostMember`, `deleteMember`;
- `construct(constructor, args, evalContext, thread)`;
- `complete(value)`;
- `checkCancel(evalContext)`;
- `yield(evalContext)`.

A `call(...)` helper legyen async, és:

- használja az async proxykat;
- XMLUI lazy arrow objektumot az async arrow execution útvonalon hívjon;
- minden visszatérési értéket `completePromise()` szerint várjon be;
- megőrizze a banned function/member sandboxot.

Ellenőrzés:

- táblavezérelt unit tesztek helper szinten: sync függvény, Promise-t visszaadó függvény, nested Promise objektumban/tömbben, XMLUI arrow, async array proxy;
- sandbox paritás tesztek banned function/member esetekre;
- cancellation helper teszt `HandlerCancelledError` dobásra.

## 4. lépés: minimális statement subset compiled futtatással

Az első valódi compiled execution subset legyen kicsi:

- expression statement;
- return statement;
- block statement;
- let/const egyszerű deklaráció;
- simple assignment/pre-post;
- if/else.

Minden statement után kötelező:

```ts
await runtime.afterStatement(evalContext, info);
```

Minden expression helperhívás async legyen ott, ahol Promise keletkezhet.

Ellenőrzés:

- új unit tesztcsomag: `xmlui/tests/components-core/compiled-events/event-async-basic.test.ts`;
- minden eset futtatható interpreterrel és compiled móddal, eredmény és state changes paritással;
- külön teszt arra, hogy két statement között egy előre beütemezett microtask/macrotask futási lehetőséget kap;
- return value paritás event handlerként és arrow invocationként.

## 5. lépés: dispatcher integráció kapcsoló mögött

A `createEventHandlers(...).runCodeAsync` útvonal válasszon executor-t:

- flag false/hiányzik: régi `processStatementQueueAsync`;
- flag true: `executeCompiledEventAsyncStatements`;
- unsupported node esetén nincs automatikus interpreter fallback.

A dispatcher többi része maradjon közös:

- stateRef refresh;
- CoW proxy létrehozás;
- handler logger;
- lifecycle dispatch;
- runWithTimeout;
- coordinator enter/exit;
- transactional buffer;
- cancellation token abort cleanup.

Ellenőrzés:

- unit/integration teszt false/true útválasztásra;
- compiled módban ugyanazok a lifecycle dispatch események keletkeznek;
- handler error ugyanúgy `handler:error` logot és `EVENT_HANDLER_ERROR` dispatch-et ad;
- `HandlerCancelledError` továbbra is swallowed.

## 6. lépés: statement boundary és event-loop paritás

Erősítsük meg külön tesztcsomaggal, hogy a compiled handler nem blokkolja hosszan a fő szálat.

Tesztmátrix:

- `a = 1; b = 2;` esetén két külön statement boundary történik;
- állapotváltozás után a következő statement már friss `localContext` snapshotot lát;
- állapotváltozás nélküli hosszú statement sorozat is yieldel minden statement után;
- loop body statementjei iterációnként yieldelnek;
- `$cancel` abort két statement között megszakítja a futást;
- timeout abort `HandlerCancelledError`/timeout diagnosztika paritásban működik;
- transactional handlernél statement boundary van, de state commit csak sikeres handler végén történik.

Ellenőrzés:

- `compiled-events/yield-and-cancellation.test.ts`;
- meglévő `concurrency/*` unit tesztek compiled variánsai vagy paraméterezett futtatása.

## 7. lépés: control-flow lefedettség bővítése

Bővítsük a statement codegent a meglévő async statement runner fő nyelvi elemeire:

- while, do/while, for;
- for/of, for/in;
- break, continue;
- switch;
- throw;
- try/catch/finally;
- function declarations és hoisting;
- destructuring let/const;
- `var` main-thread szabály megtartása.

Minden új node csak akkor számít támogatottnak, ha van paritásteszt.

Ellenőrzés:

- a meglévő `xmlui/tests/components-core/scripts-runner/process-statement.test.ts`, `process-try.test.ts`, `process-switch.test.ts`, `process-statement-destruct.test.ts` releváns eseteinek compiled-event paraméterezése vagy másolása;
- try/finally return/throw/break/continue paritás;
- loop cancellation/yield paritás.

## 8. lépés: arrow és code-behind függvényhívások

Oldjuk meg, hogy a compiled event handler helyesen hívja:

- inline XMLUI arrow értékeket;
- `var.*` lazy arrow bindingekből származó függvényeket;
- code-behindből/importból érkező függvénydeklarációkat;
- natív callback pozícióba átadott XMLUI arrowkat.

Ez a binding compiler jegyzetei alapján különösen kényes: az arrow mint érték és az arrow mint natív callback nem ugyanaz a szemantika.

Ellenőrzés:

- `compiled-events/arrow-and-codebehind.test.ts`;
- callbackes array methodok async proxyval: `map`, `forEach`, `filter`, `some`, `every`, `find`, `findIndex`, `flatMap`;
- code-behind import function call;
- closure scope írás/olvasás paritás;
- bindingből meghívott lazy arrow és eventből meghívott lazy arrow eltérő sync/async szabályainak tesztje.

## 9. lépés: parse-time compiled event artifact és runtime cache döntés

A markup/script parse pipeline őrizze meg az event handler AST mellett az opcionális compiled artifactet, hasonlóan a binding parse-time artifacthez.

Érintett helyek:

- `ParsedEventValue` típus bővítése opcionális `compiled?: CompiledScriptArtifact` mezővel;
- event attribute parser;
- standalone és Vite compilation output;
- cache kulcsok `parseId`, `sourceId`, compiler version alapján.

Fontos: a parse-time artifact létrehozása csak akkor történjen meg, ha a flag ezt kéri vagy a build pipeline explicit kéri. Ne tegyen érvényes, de még unsupported régi handlereket parse-time hibássá alapértelmezett módban.

A parse-time artifact kérdés lényege: két helyen lehet fordítani. Az egyik lehetőség, hogy az XMLUI markup parse-olásakor rögtön elkészül és eltárolódik a serializálható compiled artifact. Ez illeszkedik a későbbi Vite build-time fordításhoz és source maphez. A másik lehetőség, hogy a runtime executor az első handler-futtatáskor fordít, majd cache-el. Ez egyszerűbb kezdeti integráció, de kevésbé készíti elő a build-time útvonalat.

Döntés: a fordítás már parse időben történjen meg. A runtime executor később a parse-time artifactet használja, és legfeljebb cache/instantiate réteget tartson fenn a natív függvényekhez. Ez készíti elő rendesen a Vite build idejű fordítást, a source mapet és a böngészőbeli debugot.

Ellenőrzés:

- parser unit teszt event attribute compiled mezőre;
- serializációs teszt;
- runtime executor előnyben részesíti a parse-time artifactet, de tud runtime compile-olni cache alapján.

## 10. lépés: E2E kapcsoló és célzott compiled-event E2E részhalmaz

Adjunk teszt infrastruktúrát az E2E testbedhez:

- `XMLUI_COMPILE_EVENT_HANDLERS=true`;
- `xmluiConfig.compileEventHandlers = true`;
- a spec által explicit megadott `xmluiConfig` felülírhassa az env defaultot;
- npm script célzott részhalmazra, például `test:e2e:compiled-events`.

Az első script ne a teljes készlet legyen. Javasolt részhalmaz:

- scripting/event handler regressziók;
- concurrency/cancellation E2E-k, ha vannak;
- form submit és async API hívásos példák;
- DataSource/APICall event handler integrációk;
- olyan binding regression spec, amely eventből módosít state-et.

Ellenőrzés:

- agent csak célzott E2E subsetet futtasson, ha szükséges és rövid;
- teljes E2E kézi kapu: a felhasználó futtatja a teljes suite-ot compiled-event módban.

## 11. lépés: teljes paritás audit a meglévő E2E készlethez

Miután a unit és célzott E2E részhalmaz stabil, következzen a kézi teljes E2E kapu:

```sh
XMLUI_COMPILE_EVENT_HANDLERS=true npm run test-compiled-events
```

Ha érdemes a binding és event compiled módot együtt is ellenőrizni:

```sh
XMLUI_COMPILE_BINDINGS=true XMLUI_COMPILE_EVENT_HANDLERS=true npm run test-compiled-bindings
```

A pontos scriptnév a megvalósításkor kialakított package scripthez igazodjon. Az agent ne indítsa el a teljes E2E készletet; a felhasználó futtatja, majd a hibákat lépésenként vissza lehet hozni javításra.

Minden teljes E2E hiba kapjon jegyzetet:

- melyik spec;
- milyen handler szemantika sérült;
- interpreter és compiled eltérés;
- javítás;
- regressziós unit vagy célzott E2E teszt.

## 12. lépés: dokumentáció és release guard

Miután a kapcsoló stabil:

- belső dev dokumentáció frissítése: `.ai/xmlui/expression-eval.md`, `.ai/xmlui/concurrency.md`;
- konfigurációs referencia frissítése;
- `compiled-async-event-handlers-notes.md` létrehozása vagy vezetése;
- changeset, ha framework user-visible experimental flagként kerül ki.

## Javasolt tesztstratégia

Minden implementációs lépés után futtatható rövid ellenőrzések:

- érintett unit tesztfájlok;
- TypeScript ellenőrzés;
- célzott Playwright spec csak akkor, ha a lépés tényleg browser/event integrációt érint.

Ne fusson automatikusan minden lépés után:

- teljes E2E suite;
- teljes `test-compiled-bindings`;
- combined compiled binding + event suite.

Kézi kapuk:

- minden lépés végén a felhasználó dönthet teljes E2E futtatásról;
- a terv fő elfogadási kapuja az, hogy `compileEventHandlers` bekapcsolása után a teljes E2E suite zöld;
- későbbi kapu: `compileBindings` és `compileEventHandlers` együtt is zöld.

## Elfogadott döntések

1. A kapcsoló végleges neve: `xmluiConfig.compileEventHandlers`.
2. A fordítás parse időben történjen meg; a runtime csak a parse-time artifact instantiate/cache kezelését végezze.
3. A kezdeti megoldás a legegyszerűbb yield stratégiát használja: minden XMLUI statement után legyen event-loop yield lehetőség. Később külön optimalizálható, hogy pontosan mely statementek után szükséges yield.
4. A code-behind fordítás ugyanennek a `compileEventHandlers` kapcsolónak a része legyen.
5. Unsupported node compiled módban mindig hiba. Ne legyen interpreter fallback.

## Megvalósítási jegyzetek vezetése

A megvalósítás közben érdemes külön naplót vezetni:

- javasolt fájl: `.plan/compiled-async-event-handlers-notes.md`;
- formátum: lépés, érintett modul, megfigyelés, döntés, jövőbeli hatás.

Különösen naplózandó témák:

- async proxy és natív callback paritáseltérések;
- lazy XMLUI arrow és compiled native function határ;
- statement boundary/yield teljesítményhatása;
- transactional handler és compiled state commit interakció;
- cancellation/timeout eltérések;
- source range hiányosságok;
- Vite build-time serializációs akadályok.
