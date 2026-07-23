# Event handler directive prologue terv

## Cél

Hozzuk át a kísérleti ág szemantikáját a jelenlegi compiled event handler útvonalra: az eseménykezelő elején álló string literal statementek speciális direktívákként működhessenek.

Támogatott direktívák:

- `"async"`
- `"sync"`
- `"queue"`
- `"block"`

Nem cél ebben a körben:

- a kísérleti ág implementációjának mechanikus másolása;
- a `"dedicatedYield"` direktíva átvétele;
- valódi, teljesen szinkron event-dispatcher átállás;
- új XMLUI markup attribútumok bevezetése.

## Jelenlegi ág kontextusa

A jelenlegi ágban már léteznek azok az építőelemek, amelyekhez a direktívákat illeszteni kell:

- `xmlui/src/components-core/container/event-handlers.ts`
  - async dispatcher;
  - scheduler wrapper;
  - handler coordinator;
  - timeout;
  - transactional buffer;
  - compiled/interpreted fallback.
- `xmlui/src/components-core/concurrency/policy.ts`
  - `parallel`;
  - `single-flight`;
  - `queue`;
  - `drop-while-running`.
- `xmlui/src/components-core/script-compiler/event-runtime.ts`
  - per-invocation yield state;
  - `maybeYield(...)`;
  - statement boundary cancellation checks.
- `xmlui/src/components-core/script-compiler/targets/event-async.ts`
  - compiled event codegen;
  - yield-check classification;
  - safe-call allowlist.
- `xmlui/src/components-core/utils/statementUtils.ts`
  - handler parse;
  - `prepareHandlerStatements(...)`, amely már átírhat egyes expression statementeket arrow invocation formára.
- `xmlui/src/parsers/xmlui-parser/transform.ts`
  - parse-time `ParsedEventValue.compiled` artifact készítés.

## Direktíva-prológus felismerés

Az eseménykezelő elején álló, önálló string literal expression statementek alkothatnak direktíva-prológust.

Példák:

```xml
<Button onClick='"sync"; let sum = 0; while (i < 100000) i++;' />
<Button onClick='"queue"; save()' />
<Button onClick='"block"; submit()' />
<Button onClick='"async"; "queue"; save()' />
```

Felismerési szabály:

- csak a handler elejéről induló statementek számítanak;
- csak `T_EXPRESSION_STATEMENT` + `T_LITERAL` + string value;
- csak a támogatott értékeket fogyasztjuk el direktívaként;
- az első nem támogatott string literal vagy nem string-literal statement lezárja a prologue scan-t;
- a direktíva statementek nem kerülnek végrehajtásra és nem kerülnek compiled artifactbe.

Kompatibilitási döntés:

- egy ismeretlen string literal, például `"hello"; doIt()`, maradjon normál statement, ne legyen hiba;
- ha utána `"sync"` következik, az már nem direktíva, mert a prologue az ismeretlen literalnál lezárult.

## Szemantika

### `"async"`

Explicit alapértelmezés.

- Execution mode: `async`.
- Cooperative yield marad aktív.
- Ha nincs scheduling direktíva, a meglévő `handlerPolicy`/attribútum/default dönti el a policyt.
- A direktíva statement törlődik a végrehajtandó statementek közül.

### `"sync"`

A jelenlegi ágban első körben compiled-only yield-policy direktíva, nem teljes dispatcher-szintű szinkron event futtatás.

Szemantika:

- compiled event handler útvonalon a cooperative event-loop yield checkpointok nem futnak;
- interpreted útvonalon a `"sync"` direktívát ignoráljuk;
- statement boundary hookok továbbra is futnak;
- cancellation checkek továbbra is statement boundary-n futnak;
- state commit, transactional, timeout és error handling továbbra is a meglévő async dispatcher szerződést használja;
- Promise-t visszaadó felhasználói hívások továbbra is awaitelődhetnek az XMLUI implicit async szemantikája miatt.

Implementációs irány:

- compiled útvonalon `eventAsyncRuntime.createInvocation({ suppressYield: true })` vagy ezzel ekvivalens invocation option;
- `runtime.afterStatement(...)` ilyenkor kihagyja a `maybeYield(...)` hívást, függetlenül a codegen `checkYield` metaadatától;
- interpreted útvonalon nem vezetünk be yield-suppress opciót; a meglévő interpreter no-change cooperative `delay(0)` viselkedése marad.

Szinkron-biztonság:

- első körben ne blokkoljuk hard errorral a `"sync"` handlereket;
- adjunk külön statikus helper tervet ismert async-capable hívások figyelmeztetésére;
- ismert async-capable hívások: `delay`, `emitEvent`, `navigate`, `Actions.callApi`, `Actions.uploadFile`, `Actions.downloadFile`, ismeretlen component API/member callok;
- a warning ne változtassa a futást, csak diagnosztikai jelzés legyen.

Későbbi szigorítás:

- `xmluiConfig.strictEventHandlerDirectives === true` esetén a `"sync"` + async-capable call lehet hard diagnostic.

### `"queue"`

Scheduling direktíva.

- A handler invocationök FIFO sorba kerülnek ugyanazon `(componentUid, eventName)` sloton.
- A meglévő coordinator `handlerPolicy: "queue"` policyjére képezzük le.
- Nem módosítja az async/sync yield módot.
- Komponálható `"async"` és `"sync"` direktívával.

Precedencia:

- handler source direktíva nyer a component propból érkező `handlerPolicy` felett;
- ha nincs direktíva, marad a meglévő prop/default viselkedés.

### `"block"`

Scheduling direktíva.

- Ha ugyanazon `(componentUid, eventName)` sloton már fut handler, az új invocation nem indul el.
- A meglévő coordinator `handlerPolicy: "drop-while-running"` policyjére képezzük le.
- Nem módosítja az async/sync yield módot.
- Komponálható `"async"` és `"sync"` direktívával.

Névmagyarázat:

- author-facing direktíva: `"block"`;
- runtime policy: `"drop-while-running"`.

## Direktíva-konfliktusok

Több direktíva is állhat egymás után.

Javasolt szabály:

- `"async"` és `"sync"` közül legfeljebb egy szerepelhet;
- `"queue"` és `"block"` közül legfeljebb egy szerepelhet;
- duplikált azonos direktíva idempotens;
- konfliktus esetén első körben warning + determinisztikus feloldás:
  - execution mode conflictnál az utolsó nyer;
  - scheduling conflictnál az utolsó nyer;
- későbbi strict módban ezek hard diagnosticok lehetnek.

Példák:

```xml
onClick='"sync"; "queue"; doWork()'
```

- sync execution mode;
- queue scheduling.

```xml
onClick='"queue"; "block"; doWork()'
```

- warning;
- effective scheduling: block/drop-while-running.

## Adatmodell

Új típus:

```ts
type EventHandlerExecutionMode = "async" | "sync";
type EventHandlerSchedulingDirective = "queue" | "block";

type EventHandlerDirectiveInfo = {
  executionMode?: EventHandlerExecutionMode;
  scheduling?: EventHandlerSchedulingDirective;
  consumedCount: number;
  warnings: Array<{
    code: "handler-directive-conflict" | "handler-directive-sync-async-call";
    message: string;
  }>;
};
```

Javasolt modul:

- `xmlui/src/components-core/utils/event-handler-directives.ts`

Exportált helper:

```ts
function extractEventHandlerDirectives(statements: Statement[]): {
  directives: EventHandlerDirectiveInfo;
  executableStatements: Statement[];
};
```

`ParsedEventValue` bővítés:

```ts
directives?: EventHandlerDirectiveInfo;
```

`LookupActionOptions` bővítés:

```ts
handlerExecutionMode?: "async" | "sync";
handlerDirectiveWarnings?: EventHandlerDirectiveInfo["warnings"];
```

Megjegyzés: a parse-time artifact kapja a direktíváktól megtisztított statement listát. A raw `source` maradjon az eredeti handler string, hogy inspector/debug továbbra is azt mutassa, amit a user írt.

## Dispatcher integráció

### Futási sorrend

A direktívákat a coordinator `enter(...)` előtt kell ismerni, mert `"queue"` és `"block"` befolyásolja a policyt.

Jelenlegi sorrendben a statement előkészítés későn történik. Ezt át kell rendezni:

1. `source` -> raw statements:
   - `ParsedEventValue` esetén már megvannak;
   - string esetén `parseHandlerCode(source)` a dispatcher elején.
2. Direktíva extraction.
3. Effective options képzése:
   - source direktíva scheduling nyer `options.handlerPolicy` felett;
   - source direktíva execution mode bekerül `evalContext.options`-be.
4. Scheduler wrapper és coordinator entry az effective policyvel.
5. `prepareHandlerStatements(executableStatements, evalContext)`.
6. Compiled/interpreted végrehajtás.

Fontos: a scheduling direktívát a deterministic scheduler wrapper előtt is érdemes ismerni, de a jelenlegi `App.scheduleHandler` wrapper FIFO/concurrent app-szintű determinism és a handler coordinator policy más réteg. A source-level `"queue"`/`"block"` első körben a coordinator policyt módosítsa.

### Effective policy mapping

```ts
function applyDirectiveOptions(options, directives) {
  if (directives.scheduling === "queue") handlerPolicy = "queue";
  if (directives.scheduling === "block") handlerPolicy = "drop-while-running";
  if (directives.executionMode === "sync") handlerExecutionMode = "sync";
  if (directives.executionMode === "async") handlerExecutionMode = "async";
}
```

## Compiled event runtime integráció

`executeCompiledEventAsyncArtifact(...)` vagy `executeCompiledEventAsyncHandler(...)` kapjon execution optiont.

Javasolt forma:

```ts
executeCompiledEventAsyncHandler(statements, evalContext, thread, artifact, sourceId, sourceText, {
  suppressYield: directives.executionMode === "sync",
});
```

vagy az `evalContext.options` részeként:

```ts
evalContext.options.handlerExecutionMode = "sync";
```

Javaslat: `evalContext.options.handlerExecutionMode` legyen a közös jel, de csak a compiled executor használja yield-suppress döntésre. Az interpreted útvonal ezt az opciót első körben tudatosan figyelmen kívül hagyja.

Runtime változás:

- `eventAsyncRuntime.createInvocation({ suppressYield?: boolean })`;
- `afterStatement(...)`:
  - completion hook mindig;
  - cancellation check mindig;
  - `maybeYield(...)` csak ha `!suppressYield && checkYield !== false`.

## Interpreted async útvonal integráció

Az async interpreterben jelenleg no-change statementek után 100 futásenként `delay(0)` történik. A `"sync"` direktíva ezt az útvonalat nem módosítja.

Javasolt döntés:

- interpreter módban a `"sync"` direktívát ignoráljuk;
- a direktíva statementek ettől még ne fussanak normál user statementként;
- `"queue"` és `"block"` scheduling direktívák interpreter módban is hatnak, mert a coordinator policyt módosítják;
- ha compiled execution unsupported node miatt interpreter fallbackre vált, a `"sync"` yield-suppress hatása elveszik, és az interpreter meglévő cooperative yield viselkedése fut.

Megjegyzés: a fallback viselkedést dokumentálni kell, mert a `"sync"` első körben nem compile-flag független szerződés.

## Parse-time artifact integráció

`transform.ts` jelenleg `ParsedEventValue.compiled` artifactet készít a teljes statement listából. A direktívák után:

1. parse raw statements;
2. extract directives;
3. compile only `executableStatements`;
4. store:

```ts
{
  __PARSED: true,
  statements: executableStatements,
  directives,
  source: originalSource,
  compiled: compileEventAsyncStatements(executableStatements, ...)
}
```

Így runtime-ban nem kell még egyszer ugyanazt a parse-time direktívát leválasztani, de string/dynamic handler esetén ugyanazt a helper modult használjuk.

## Diagnosztika és logging

Első körben warning szint:

- conflicting execution directives;
- conflicting scheduling directives;
- `"sync"` handlerben ismert async-capable call.

Javasolt csatorna:

- parser transform warning list, ahol parse-time markupból jön;
- runtime string handler esetén `console.warn` + inspector trace későbbi lépésben.

Minimális első implementáció:

- unit tesztekben ellenőrizhető `directives.warnings`;
- runtime console warning csak akkor, ha már van stabil hely a duplikáció elkerülésére.

## Tesztterv

### Direktíva extraction unit tesztek

- üres handler -> nincs direktíva;
- `"async"; doIt()` -> executionMode async, executable `doIt()`;
- `"sync"; doIt()` -> executionMode sync;
- `"queue"; doIt()` -> scheduling queue;
- `"block"; doIt()` -> scheduling block;
- `"sync"; "queue"; doIt()` -> mindkettő;
- ismeretlen `"hello"; "sync"; doIt()` -> nincs direktíva, minden statement executable;
- duplikált `"sync"; "sync"; doIt()` -> idempotens;
- konfliktus `"async"; "sync"; doIt()` -> warning, utolsó nyer;
- konfliktus `"queue"; "block"; doIt()` -> warning, utolsó nyer.

### Parser transform tesztek

- parse-time compiled artifact nem tartalmazza a direktíva string statementet;
- `ParsedEventValue.directives` megőrzi a direktívákat;
- `source` továbbra is az eredeti handler string;
- JSON serialization továbbra is működik;
- logging flaggel a generált JS direktíva nélküli artifactet mutat.

### Dispatcher/concurrency tesztek

- `"queue"` direktíva effective policyként `queue`;
- `"block"` direktíva effective policyként `drop-while-running`;
- source direktíva felülírja `handlerPolicy` propot;
- direktíva nélküli handler nem változtatja a meglévő policyt.

### Sync/yield tesztek

- compiled `"sync"` handler nem hív `runtime.maybeYield(...)` akkor sem, ha a statement yield-checkre jogosult lenne;
- compiled `"async"` vagy default handler megtartja a meglévő yield viselkedést;
- interpreted `"sync"` handler ignorálja a sync yield-suppress hatást, de a direktíva statement nem fut normál statementként;
- cancellation check `"sync"` módban is fut statement boundary-n;
- state write/commit viselkedés `"sync"` módban is paritásban marad.

### Fallback/paritás tesztek

- unsupported compiled node esetén interpreter fallback ugyanazzal a direktíva nélküli executable statement listával fut;
- runtime string handler és parse-time `ParsedEventValue` ugyanazt a direktíva szemantikát kapja.

## Dokumentáció

Frissítendő:

- `.ai/xmlui/action-execution.md`;
- `.ai/xmlui/concurrency.md`;
- `.plan/compiled-async-event-handlers-notes.md`;
- `.plan/compiled-event-yield-optimization.md`, ha a `"sync"` yield suppress a checkpoint optimizer részévé válik.

## Kockázatok

- Ha a direktívát túl későn elemezzük, a `"queue"`/`"block"` nem tudja befolyásolni a coordinator entryt.
- Ha parse-time artifactbe bekerül a direktíva literal, az runtime statementként viselkedik vagy felesleges boundary-t hoz létre.
- A `"sync"` név félreérthető lehet, mert első körben nem jelent teljes, DOM-boundary szinkron handler futást; ezt dokumentálni kell.
- A source-level policy override meglepő lehet, ha valaki component propból állított `handlerPolicy`-t. A terv szerint a handler source a specifikusabb, ezért nyer.
- Runtime string handlernél a korábbi késői parse helyett korábbi parse történik, hogy a policy ismert legyen. Ez kis költség akkor is, ha `"block"` később dropolná az invocationt.
- Conflict warningok csatornáját úgy kell kialakítani, hogy ne spam-eljen cached handlereknél.

## Elfogadási kritériumok

- A négy direktíva felismerhető a handler elején és nem fut normál statementként.
- `"async"` megőrzi a jelenlegi default viselkedést.
- `"sync"` kikapcsolja a cooperative event-loop yieldet compiled útvonalon, interpreted útvonalon ignorált, és nem kapcsolja ki a statement boundary hookokat vagy cancellation checket.
- `"queue"` a meglévő coordinator queue policyjét használja.
- `"block"` a meglévő coordinator drop-while-running policyjét használja.
- Parse-time és runtime string handlerek azonos direktíva szemantikát kapnak.
- Direktívák nélküli handlerek regresszió nélkül működnek.
- A root `test-compiled-bindings` marad a manuális végső regressziós kapu.
