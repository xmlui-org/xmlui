# Event handler valódi JavaScript compiler terv

## Mi volt hibás az előző tervben?

Az előző terv túl sok runtime-helper szerződést őrzött meg:

```js
await runtime.start(evalContext, thread);
await runtime.beforeStatement(evalContext);
await runtime.afterStatement(evalContext, undefined, { checkYield: false });
```

Ezeknek nincs helyük a gyors úton generált, valódi JavaScript kódban.

A cél nem az, hogy a jelenlegi interpreter-szerű futtatást JavaScript szövegbe írjuk át. A cél az, hogy az eseménykezelőből olyan JavaScript függvény készüljön, amely a lokális JavaScript részeket ténylegesen natív JS-ként futtatja, és csak ott hív XMLUI runtime bridge-et, ahol XMLUI-specifikus művelet történik.

## Cél

Az XMLUI event handler compiler generáljon valódi JavaScript kódot.

Példa input:

```xml
<Button onClick="
  const start = Date.now();
  let sum = 0;
  for (let i = 0; i < 10000; i++) {
    sum += i;
  }
  toast.success(`Sum: ${sum}, Time taken: ${Date.now() - start}ms`);
">Test</Button>
```

Elvárt jellegű output:

```js
return async function xmluiCompiledEventHandler(__xmlui) {
  const start = Date.now();
  let sum = 0;

  let __xmluiLoopCounter_0 = 0;
  for (let i = 0; i < 10000; i++) {
    sum += i;

    if ((++__xmluiLoopCounter_0 % 1000) === 0) {
      await __xmlui.checkpointIfDue();
    }
  }

  await __xmlui.callGlobal(
    "toast.success",
    [`Sum: ${sum}, Time taken: ${Date.now() - start}ms`],
  );
  await __xmlui.checkpointIfDue();
};
```

Fontos különbség: a lokális ciklusban nincs `await`, nincs `runtime.complete`, nincs `runtime.id`, nincs `beforeStatement`, nincs `afterStatement`.

## Alapelv

A compiler kétféle dolgot különböztessen meg:

1. **Native JS rész**: statikusan bizonyítottan lokális JavaScript. Ezt közvetlen JS-ként kell generálni.
2. **XMLUI bridge rész**: globális XMLUI érték, komponens API, state írás/olvasás, action, toast, navigate, async API, bizonytalan member access. Ezek menjenek egy kicsi, célzott bridge API-n keresztül.

Ne legyen általános `runtime.complete(...)` minden expression körül.

## Új runtime bridge

Hozz létre egy minimális compiled-event bridge-et. Ez ne az interpreter runtime másolata legyen.

Javasolt fájl:

```text
xmlui/src/components-core/script-compiler/event-bridge.ts
```

Javasolt interface:

```ts
export interface CompiledEventBridge {
  get(name: string): any;
  set(name: string, value: any): any;
  getMember(target: any, member: string): any;
  setMember(target: any, member: string, value: any): any;
  call(fn: any, thisArg: any, args: any[]): Promise<any>;
  callGlobal(path: string, args: any[]): Promise<any>;
  checkpointIfDue(): Promise<void>;
}
```

Az első körben csak azt implementáld, ami ténylegesen kell:

- `get(...)` nem lokális azonosítókhoz;
- `set(...)` nem lokális assignmenthez;
- `callGlobal("toast.success", args)` a minta handlerhez;
- `checkpointIfDue()` időalapú yield/cancel ellenőrzéshez.

## Checkpoint szemantika

Ne legyen checkpoint minden statement előtt és után. De ne is maradjon checkpoint nélküli hosszú lokális ciklus.

A compiler kétféle helyre szúrjon be yield-ellenőrzést:

1. **Minden olyan utasítás után**, amely nem garantáltan gyors lefutású függvényhívást tartalmaz.
2. **Minden 1000. ciklus iterációnál**, függetlenül attól, hogy a ciklus body-ban vannak-e függvényhívások.

Fontos: az ellenőrzés nem jelenti azt, hogy mindig yield történik. A generált kód csak meghívja a közös checkpoint helper-t. A helper megnézi, hogy az előző yield-ellenőrzés óta eltelt-e legalább 100ms. Ha nem, azonnal visszatér. Ha igen, frissíti a referencia időpontot, ellenőrzi a cancel tokent, és engedi a JavaScript event loopnak, hogy más munkára váltson.

A 100ms-os referenciaidőpont ne handlerenként generált lokális utility metódusban éljen, hanem a közös bridge/invocation állapotában. Több event handler példány használhatja ugyanazt a bridge implementációt, de az invocation state legyen elszigetelt.

Javasolt bridge implementáció:

```ts
function createCompiledEventBridge(evalContext, thread): CompiledEventBridge {
  let lastYieldCheck = performance.now();

  return {
    async checkpointIfDue() {
      const now = performance.now();
      if (now - lastYieldCheck < 100) return;

      lastYieldCheck = now;
      // cancel ellenőrzés, ha van aktív token/thread
      // Promise.resolve() vagy meglévő XMLUI yield helper
      await yieldToEventLoop();
    },
  };
}
```

Az elnevezésben fontos a `IfDue`: a compiler sok helyen hívhatja, de a tényleges yield ritka és időalapú.

### Statement-szintű szabály

Egy statement után csak akkor kell `await __xmlui.checkpointIfDue()`, ha a statement tartalmaz legalább egy olyan függvényhívást, amely nem szerepel a garantáltan gyors safe-call listán.

Példák, ahol nem kell statement utáni ellenőrzés:

```js
let x = 1 + 2;
sum += i;
const t = Date.now();
const m = Math.max(a, b);
```

Példák, ahol kell statement utáni ellenőrzés:

```js
doWork();
const value = expensive();
toast.success(message);
items.map(callback);
obj.method();
```

Ez expression statementre is igaz: egy expression statement átugorhatja az ellenőrzést, ha nincs benne yield-et eredményező függvényhívás.

Javasolt compiler helper:

```ts
function statementRequiresCheckpointAfter(statement: Statement, context: CompilerContext): boolean {
  return statementContainsCall(statement, (call) => !isGuaranteedFastCall(call, context));
}
```

Az `isGuaranteedFastCall(...)` kizárólag explicit safe-list alapján adhat `true` értéket. Minden más call, beleértve a bridge callokat is, checkpoint-köteles.

### Ciklus-szintű szabály

Minden ciklusba kerüljön iterációszámláló alapú ellenőrzés. A szabály első körben egyszerű legyen:

- classic `for`;
- `while`;
- `do while`;
- később `for of` / `for in`, ha támogatottak lesznek.

Minden 1000. iterációnál hívd:

```js
await __xmlui.checkpointIfDue();
```

Ez biztosítja, hogy egy `100_000_000` iterációs, tisztán lokális ciklus se blokkolja percekig az event loopot.

Javasolt generált ciklusforma:

```js
let __xmluiLoopCounter_0 = 0;

for (let i = 0; i < 100_000_000; i++) {
  sum += i;

  if ((++__xmluiLoopCounter_0 % 1000) === 0) {
    await __xmlui.checkpointIfDue();
  }
}
```

Későbbi optimalizáció lehet, hogy konstansból bizonyítottan rövid ciklusoknál ez elhagyható, de az első megvalósításban minden ciklus kapja meg.

## Fallback kikapcsolása

A megvalósítás alatt ne legyen csendes interpreter fallback.

Követelmények:

- ha a compiled event handler nem fordítható, dobjon hibát;
- ha parse-time artifact nincs, de compiled event handler elvárt, dobjon hibát;
- ha runtime compile failure történik, dobjon hibát;
- a `test-compiled-events` így gyűjtse össze a hiányzó compiler támogatást.

Javasolt konfiguráció:

```ts
compiledEventHandlerFallback: "allow" | "throw"
```

A compiled-event regressziós tesztekben az érték legyen `"throw"`.

## Diagnosztika

A beszélgetés elején bevezetett konzol diagnosztika maradjon kikapcsolva.

Ne legyen alapértelmezett kimenet:

- parse-time compiled source log;
- runtime dispatch decision log;
- artifact execution log;
- fallback warning.

Később külön, célzott compiler-debug kapcsolóval vissza lehet hozni, de ez nem része az első körös gyors compilernek.

## Compiler architektúra

Javasolt fájl:

```text
xmlui/src/components-core/script-compiler/targets/event-js.ts
```

Ez legyen az új valódi JS target. A régi `event-async.ts` maradhat átmeneti összehasonlításra, de a compiled-event útvonal fokozatosan az új targetet használja.

Fő lépések:

1. AST safety analysis.
2. Scope analysis.
3. Native JS emitter.
4. Bridge emitter.
5. Artifact executor.

## Scope analysis

A compiler tartson nyilván lokális változókat:

- `let`;
- `const`;
- `var`;
- function parameter;
- loop initializer változók;
- destructuring declaration változók, ha támogatott.

Egy identifier native, ha:

- lokális scope-ban deklarált;
- nem shadowolja veszélyesen a bridge internal neveket;
- érvényes JS identifierként kibocsátható.

Egy identifier bridge-es, ha:

- nincs lokálisan deklarálva;
- XMLUI contextből/globalsból jöhet;
- component state vagy app context érték lehet.

## Native-safe expression első kör

Ezek generálhatók közvetlen JS-ként:

- literalok: string, number, boolean, null, undefined;
- lokális identifier;
- array literal, ha minden elem native-safe;
- object literal, ha minden property value native-safe és nincs getter/setter/spread;
- template literal, ha minden expression native-safe vagy safe-call;
- unary operatorok: `!`, `+`, `-`, `typeof`;
- binary operatorok: aritmetika, összehasonlítás, equality, logical;
- assignment lokális identifierre;
- update lokális identifieren: `i++`, `++i`, `i--`, `--i`;
- conditional expression, ha mindhárom ág native-safe;
- safe-call.

Nem native-safe első körben:

- nem lokális identifier;
- általános member access;
- általános function call;
- `new`;
- `delete`;
- optional chaining bizonytalan receiveren;
- spread;
- `await`;
- `yield`;
- user-defined callback hívás, ha nem lokálisan deklarált.

## Safe-call lista első kör

Közvetlen JS-ként generálható:

- `Date.now()`;
- `Math.*`, a már bevezetett safe-list alapján;
- alapvető pure String/Number/Boolean statikus függvények csak külön ellenőrzés után.

Feltételek:

- a globális objektum neve nincs lokálisan shadowolva;
- minden argumentum native-safe;
- a metódus szerepel explicit safe-listben.

Példa:

```js
const t = Date.now();
const x = Math.max(a, b);
```

De ez ne legyen native-safe:

```js
const Date = fakeDate;
Date.now();
```

## Statement emitter első kör

Közvetlen JS-ként generálható:

- `let` / `const` / `var` declaration native-safe initializerrel;
- expression statement native-safe expressionnel;
- block statement;
- `if` native-safe conditionnel;
- classic `for`;
- `while`;
- `break`;
- `continue`;
- `return` native-safe expressionnel.

Bridge kell:

- nem lokális assignment;
- nem lokális call;
- component/global/context read;
- async művelet;
- XMLUI action/API/toast/navigate.

## Minta handler elvárt generálása

Az input handlerből az új target ilyen szerkezetet generáljon:

```js
return async function xmluiCompiledEventHandler(__xmlui) {
  const start = Date.now();
  let sum = 0;

  let __xmluiLoopCounter_0 = 0;
  for (let i = 0; i < 10000; i++) {
    sum += i;

    if ((++__xmluiLoopCounter_0 % 1000) === 0) {
      await __xmlui.checkpointIfDue();
    }
  }

  await __xmlui.callGlobal(
    "toast.success",
    [`Sum: ${sum}, Time taken: ${Date.now() - start}ms`],
  );
  await __xmlui.checkpointIfDue();
}
```

Elfogadási feltétel a lokális ciklusra:

- nincs `runtime.complete`;
- nincs `runtime.id`;
- nincs `runtime.assignId`;
- nincs `runtime.member`;
- nincs `beforeStatement`;
- nincs `afterStatement`;
- nincs statementenkénti `await`;
- van 1000 iterációnkénti `checkpointIfDue()` hívás;
- a ciklus natív `for`.

## Artifact executor

Az artifact executor példányosítsa a generált függvényt, és adja át neki a bridge-et:

```ts
const fn = instantiateCompiledScriptArtifact<CompiledEventFn>(artifact);
return await fn(createCompiledEventBridge(evalContext, thread));
```

A generált függvény signature-je legyen stabil:

```ts
type CompiledEventFn = (__xmlui: CompiledEventBridge) => Promise<any>;
```

## Implementációs szeletek

### Slice 1: új target skeleton

- Hozd létre az `event-js.ts` targetet.
- Generáljon artifactot egyszerű literal/expression statementre.
- Executor tudja futtatni.
- Fallback tiltott módban bukjon, ha unsupported node van.

Teszt:

```ts
compileEventJsStatementSource("let x = 1 + 2;", "test");
```

Shape:

```js
let x = 1 + 2;
```

### Slice 2: scope analysis

- Lokális deklarációk gyűjtése.
- Shadowing ellenőrzés.
- Identifier döntés: native local vagy bridge global.

Teszt:

```js
let sum = 0;
sum += 1;
```

Elvárt: közvetlen JS.

```js
count += 1;
```

Elvárt: bridge `set/get`, nem lokális JS változó.

### Slice 3: native expression emitter

- Literalok.
- Lokális identifier.
- Binary/unary/logical.
- Assignment/update.
- Template literal.

Teszt minden támogatott expression típusra.

### Slice 4: classic loop emitter

- `for (let i = 0; i < n; i++)`.
- Native body statementek.
- Loop checkpoint minden 1000. iterációnál.
- A checkpoint helper belül csak akkor yieldel, ha az előző yield-ellenőrzés óta eltelt legalább 100ms.

Teszt:

```js
let sum = 0;
for (let i = 0; i < 100_000_000; i++) {
  sum += i;
}
```

Elvárt:

- a generált kódban van loop counter;
- a generált kódban van `checkpointIfDue()`;
- a mockolt checkpoint helper minden 1000. iterációnál meghívódik;
- tényleges yield csak akkor történik, ha a mockolt idő szerint eltelt 100ms.

### Slice 5: safe-call emitter

- `Date.now()`.
- `Math.*` safe-list.
- Shadowing tiltás.

Teszt minden safe-list elemre.

### Slice 6: XMLUI bridge call

- `toast.success(...)` bridge-en keresztül.
- Később `navigate(...)`, `Actions.*`, component API.

Teszt:

```js
toast.success(`Sum: ${sum}`);
```

Elvárt: bridge call, de argument template literal native JS.

### Slice 7: dispatcher bekötés

- Parse-time compiled artifact az új `event-js` targetből készüljön.
- Runtime compile csak átmeneti/dev eset legyen.
- Fallback tiltott teszt módban.

### Slice 8: régi event-async target kivezetési döntés

- Ha az új target lefedi a regressziós készletet, a régi targetet töröld vagy tedd legacy név alá.
- Ne maradjon két párhuzamos compiled-event útvonal hosszú távon.

## Tesztterv

Új tesztfájl:

```text
xmlui/tests/components-core/compiled-events/event-js-native.test.ts
```

Kötelező tesztek:

- declaration native output;
- assignment native output;
- binary expression native output;
- template literal native output;
- classic for loop native output;
- loop checkpoint jelen van minden 1000. iterációra;
- nem lassú függvényhívásos statement után nincs statement checkpoint;
- lassú/bizonytalan függvényhívásos statement után van `checkpointIfDue()`;
- `Date.now()` native output;
- minden `Math.*` safe-list elem native output;
- shadowolt `Date` nem native output;
- shadowolt `Math` nem native output;
- `toast.success(...)` bridge call;
- nem lokális assignment bridge call;
- unsupported node fallback tiltott módban hibát dob.

Shape tesztek:

```ts
expect(artifact.js).toContain("for (let i = 0; i < 10000; i++)");
expect(artifact.js).toContain("sum += i");
expect(artifact.js).not.toContain("runtime.complete");
expect(artifact.js).not.toContain("runtime.id");
expect(artifact.js).not.toContain("beforeStatement");
expect(artifact.js).not.toContain("afterStatement");
expect(artifact.js).toContain("checkpointIfDue");
```

Runtime tesztek:

- lokális loop eredmény;
- bridge global read/write;
- toast mock hívás;
- checkpoint mock hívódik minden 1000. ciklusiterációnál;
- checkpoint mock nem yieldel 100ms előtt;
- checkpoint mock yieldel, ha az utolsó yield-ellenőrzés óta eltelt 100ms;
- `Date.now()` és `Math.*` safe-call statementek után nincs felesleges checkpoint;
- nem safe-listes függvényhívásos statement után van checkpoint.

## Validáció

Fejlesztés közben:

```bash
npm --workspace xmlui run test:unit -- tests/components-core/compiled-events
npm --workspace xmlui run test:unit -- tests/components-core/script-compiler/event-async.test.ts
npm --workspace xmlui run test:unit -- tests/parsers/xmlui/transform.element.test.ts tests/bin/vite-plugin-import.test.ts
npx tsc --noEmit -p xmlui/tsconfig.json
git diff --check
```

Felhasználói regressziógyűjtés:

```bash
test-compiled-events
```

Végső regresszió:

```bash
test-compiled-bindings
```

## Elfogadási kritérium

A minta `Button onClick` handler:

- compiled artifact útvonalon fut;
- nincs interpreter fallback;
- toast megjelenik;
- a lokális ciklus natív JS;
- 10 000 iteráció nem tart másodpercekig;
- a generált JS-ben nincs interpreter-szerű statement wrapper;
- a generált JS-ben csak célzott XMLUI bridge hívás van ott, ahol tényleg XMLUI runtime kell.
