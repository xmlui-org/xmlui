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
- `xmlui/tests/components-core/compiled-events/*`
- `xmlui/tests/components-core/script-compiler/event-runtime.test.ts`

A compiled event runtime jelenleg az `afterStatement(...)` végén mindig `await runtime.yield()` hívást végez, amely `setTimeout(0)` alapú macrotask yield. Ez megőrzi a kooperatív futást, de túl gyakori yieldet eredményezhet, különösen sok egyszerű lokális statementnél.

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

## Potenciális későbbi optimalizációk

- Beépített gyors függvény whitelist: `Math.*`, egyszerű `String`/`Array` property olvasások vagy tiszta utilityk után ne kérjünk yield-vizsgálatot.
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
- Ha a yield állapot globális, párhuzamos handler példányok egymás referenciaidejét szennyezhetik. Ezért invocation-scope állapot kell.
- A tesztekben a `performance.now()` kontrollálása ne legyen törékeny; érdemes a runtime időforrását belső helperen keresztül injektálhatóvá tenni tesztekben.

## Elfogadási kritériumok

- A compiled event handler útvonalon nem történik automatikus `setTimeout(0)` minden statement után.
- Egy handler invocation legfeljebb 100ms-onként yieldel, kivéve ha később explicit force-yield döntés születik.
- Egyszerű, yieldet eredményező függvényhívást nem tartalmazó lokális statementek és expression statementek nem kérnek yield-vizsgálatot.
- Yieldet eredményező függvényhívást tartalmazó egyszerű statementek kérnek yield-vizsgálatot.
- Minden handler invocation ugyanazt a közös runtime metódust használja, de külön yield állapottal.
- A meglévő statement boundary, state commit, cancellation, timeout és transactional szerződések nem sérülnek.
