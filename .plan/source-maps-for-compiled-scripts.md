# Source map támogatás fordított XMLUI scriptekhez

## Cél

Dev server alatt a JavaScript-re fordított XMLUI binding expressionök, event handlerek és `.xs` / `.xmlui.xs` code-behind források jelenjenek meg a böngésző DevTools forrásnézetében eredeti `.xmlui` és `.xs` forrásként, és lehessen töréspontot tenni az eredeti forrássorokra.

A képesség elsődleges célja fejlesztői debugolhatóság. Production buildben a meglévő működés maradjon alapértelmezés szerint változatlan, és a sourcemap-kimenet csak a már létező Vite sourcemap szabályokhoz igazodva jelenjen meg.

## Kiindulópont

- A compiled script infrastruktúra már létezik: `xmlui/src/components-core/script-compiler/`.
- A `CompiledScriptArtifact` már tartalmaz `sourceId`, `sourceText`, `sourceRange`, `js` és `mappings` mezőket.
- A `CompiledScriptCodeWriter` már generated offset -> source range jellegű mappingeket gyűjt, de ez még nem szabványos Source Map v3.
- Bindingek parse-time compiled artifactot kaphatnak `ParameterParser` / `AttributeValueParser` útvonalon.
- Event handlerek parse-time compiled artifactot kaphatnak az XMLUI parser `transform.ts` útvonalán, Vite-ban a közös `compileScripts` opcióval. A régi `compileEventHandlers` opció kompatibilitási alias.
- A Vite plugin jelenleg `.xmlui`, `.xmlui.xs` és `.xmlui.xm` fájlokra `map: { mappings: "" }` üres sourcemapet ad vissza.
- `.xs` / code-behind esetben a Vite plugin parse-olja és `dataToEsm`-ként serializálja a deklarációkat, de nincs compiled JavaScript source map vagy virtuális forrás-szolgáltatás.

## Megvalósítási állapot

- 1. lépés kész: a compiled artifactok source identity, debug URL, több-forrásos metadata és abszolút source origin támogatást kaptak.
- 2. lépés kész: elkészült a Source Map v3 builder a compiler köztes mappingjeiből.
- 3. lépés kész: a binding és event generated JS wrapper kimenete stabilabb sortöréseket kapott, és a mappingek az offsetelt source range-ekre épülnek.
- 4. lépés kész: a runtime `new Function(...)` body builder tud `sourceURL` és inline/external `sourceMappingURL` kommenteket generálni, az eval option pipeline pedig átviszi a `compiledScriptSourceMaps` módot.
- 5. lépés kész: a Vite `.xmlui` transform opt-in esetben Source Map v3 alapot és `debugSources` metadata-t ad vissza.
- 6. lépés kész: a `.xmlui.xs` / `.xs` transform opt-in esetben a fő és importált module source-okat is debug source-ként serializálja.
- 7. lépés kész: a Vite dev server `/@xmlui-source/...` virtuális source és `.map` endpointot szolgál ki path traversal védelemmel.
- 7a. lépés kész: a runtime sourcemap mód és `xsVerbose` mellett deduplikált, source text nélküli `debug-source` Inspector trace esemény keletkezik.
- 8. lépés kész: bekerült egy Chromium/CDP smoke teszt, amely URL-alapú breakpointtal megállítja a dinamikusan fordított scriptet, és visszaellenőrzi az inline sourcemap eredeti `.xmlui` source metadata-ját.
- 9. lépés kész: frissült a belső expression-eval, build-system és inspector-debugging dokumentáció.
- 10. lépés kész: production viselkedést nem kapcsol be automatikusan; `xmlui start` dev módban compiled event handlerek mellett `external` sourcemapet használ, explicit `false` felülírással kikapcsolható.

## Validáció

- Fókuszált unit tesztek: `npm run test:unit -w xmlui -- script-compiler/source-map.test.ts script-compiler/artifact.test.ts script-compiler/debug-source-trace.test.ts script-compiler/binding-sync.test.ts script-compiler/event-async.test.ts script-runner/eval-options.test.ts nodejs/xmlui-plugin-options.test.ts nodejs/virtual-sources.test.ts bin/vite-plugin-import.test.ts` — 9 fájl, 256 teszt sikeres.
- Böngészős smoke: `npx playwright test xmlui/tests-e2e/compiled-script-sourcemap.spec.ts --reporter=line` — 1 teszt sikeres.
- TypeScript ellenőrzés: `npx tsc --noEmit -p xmlui/tsconfig.json` az új sourcemap kódon nem jelzett hibát, de megállt a már meglévő `xmlui/src/components-core/wrapComponent.tsx` `never` típushibákon.

## Ismert korlátok

- A CDP smoke a generated script URL-re állított breakpointot validálja, és az inline sourcemap eredeti `.xmlui` source metadata-ját ellenőrzi. Az eredeti `.xmlui` source sorra közvetlenül beállított DevTools breakpoint teljes UI-s validációját külön, browser DevTools frontend szintű teszttel érdemes tovább keményíteni.
- A `.xs` / `.xmlui.xs` oldalon az eredeti és importált források debug source-ként és sourcemap source-ként elérhetők, de a token-pontos code-behind breakpoint validációhoz külön, a code-behind compiler runtime útját célzó E2E fixture kell.

## Tervezési döntések

- A canonical debug forrásazonosító legyen URL-szerű, stabil és DevTools-barát:
  - `xmlui-source:///src/Main.xmlui`
  - `xmlui-source:///src/Main.xmlui#event-3`
  - `xmlui-source:///src/Main.xmlui#expr-1`
  - `xmlui-source:///src/helpers.xs`
- A böngészőben látható forrásfájl az eredeti `.xmlui` / `.xs` teljes szövegét mutassa, ne csak az inline handler részletet. Az inline expression és handler mappingek az eredeti fájl range-eire mutassanak.
- A compiler belső `CompiledScriptMapping` maradhat egyszerű offset alapú köztes formátum, de legyen egy jól tesztelt konverziós réteg Source Map v3-ra.
- Runtime `new Function(...)` esetén debugger-barát `//# sourceURL=...` és `//# sourceMappingURL=...` megoldás kell. Vite build/dev transform esetén a plugin által visszaadott `map` legyen az elsődleges mechanizmus.
- A binding és event target ugyanazt a sourcemap buildert használja; target-specifikus csak az, hogy melyik generated JS wrapper sorai számítanak user-code mappingnek.
- A breakpoint pontosság első körben sor/oszlop szinten legyen helyes az expression/statement kezdetére. Binding expression esetén elfogadható, ha a debugger a felhasználói source-ra visszamappelt helperhívásnál áll meg; nem kell első körben teljesen emberi, helpermentes generált expression kódot előállítani.
- `.xs` és importált `.xm` modulok esetén a debuggerben az eredeti forrásfájlnév jelenjen meg, ne egy internal/resolved artifact név.
- Inspector trace-ben legyen könnyű debug-source metadata esemény, ha ez nem jár jelentős memória- vagy teljesítményköltséggel. A trace ne tartalmazza alapértelmezetten a teljes source textet; elég source URL, target, sourcemap mód, range és artifact/debug azonosító.
- A funkciót dev mode-ban kell először bekapcsolni, külön opt-innel. Javasolt config:
  - `xmluiConfig.compileScripts?: boolean`
  - `xmluiConfig.compiledScriptSourceMaps?: boolean | "inline" | "external"`
  - Vite plugin opció: `compiledScriptSourceMaps?: boolean | "inline" | "external"`

### Mit jelent a runtime `new Function` inline sourcemap?

A compiled script runtime útvonalon nem mindig Vite által generált modulból fut. A `instantiateCompiledScriptArtifact()` jelenleg egy stringként összeállított JavaScript bodyt ad át a böngésző natív `new Function(...)` API-jának. Ilyenkor a böngésző alapból csak egy névtelen, dinamikusan létrehozott függvényt látna.

Két speciális kommenttel lehet ezt debugolhatóbbá tenni:

- `//# sourceURL=...` nevet ad a dinamikus scriptnek a DevTools Sources panelben.
- `//# sourceMappingURL=data:application/json;base64,...` ugyanabba a stringbe ágyazza a sourcemapet, így a DevTools az eredeti `.xmlui` / `.xs` forrásra tud visszalépni akkor is, ha nincs külön sourcemap fájl.

Dev server alatt, ahol a Vite plugin és egy virtuális source endpoint is rendelkezésre áll, az external sourcemap és `/@xmlui-source/...` kiszolgálás legyen a preferált út. A `new Function(...)` runtime útvonal is ezt kövesse: `sourceMappingURL` lehetőleg dev-server endpoint URL-re mutasson. Inline sourcemap csak fallback és unit-tesztelhető safety net legyen olyan esetekre, ahol a compiled artifact Vite/dev-server környezet nélkül instantiate-olódik.

## Nem cél az első körben

- Production bundle méretének optimalizálása sourcemapekkel.
- Teljes interpreter-sourcemap. Ez a terv a JavaScript-re fordított útvonalat célozza.
- Minifikált production kód token-pontos sourcemap paritása.
- Böngészőfüggetlen DevTools viselkedés garantálása minden edge case-re; Chromium/Playwright legyen az első referencia.

## 1. lépés: source identity és range modell stabilizálása

Vezessünk be egy kis source identity modult a compilerben, amely minden compiled artifacthoz egységesen előállítja:

- az eredeti fájl normalized útvonalát;
- a debug URL-t;
- az inline fragment azonosítót (`expr-N`, `event-N`, `codebehind-function-name`);
- az eredeti fájlon belüli abszolút `sourceRange`-et.

Érintett helyek:

- `xmlui/src/components-core/script-compiler/types.ts`
- `xmlui/src/components-core/script-compiler/source.ts`
- `xmlui/src/components-core/script-runner/ParameterParser.ts`
- `xmlui/src/components-core/script-runner/AttributeValueParser.ts`
- `xmlui/src/parsers/xmlui-parser/transform.ts`
- `xmlui/src/nodejs/vite-xmlui-plugin.ts`

Tesztelés:

- Unit teszt arra, hogy `.xmlui` attribútum binding range-e a teljes fájl abszolút sor/oszlop pozíciójára mutat.
- Unit teszt arra, hogy multiline `onClick` handler mappingje a handler tényleges kezdősorára mutat.
- Regression teszt arra, hogy a régi `sourceId`-re épülő cache kulcsok nem ütköznek több fájl azonos inline sorszámai esetén.

## 2. lépés: Source Map v3 builder a köztes mappingekből

Készítsünk `CompiledScriptSourceMapBuilder` segédet, amely a jelenlegi `CompiledScriptMapping[]` listából szabványos Source Map v3 objektumot és opcionális base64 inline commentet állít elő.

Feladatok:

- Generated offsetek konvertálása generated line/column pozíciókra.
- Source range-ek konvertálása original line/column pozíciókra.
- `sources`, `sourcesContent`, `names`, `mappings` mezők előállítása.
- Több eredeti forrás támogatása egy artifactban, hogy `.xs` import gráf később természetes legyen.
- Snapshot-barát determinisztikus output.

Érintett helyek:

- új: `xmlui/src/components-core/script-compiler/source-map.ts`
- `xmlui/src/components-core/script-compiler/index.ts`
- `xmlui/tests/components-core/script-compiler/`

Tesztelés:

- Unit teszt egy egyszerű bindingre (`count + 1`), amely ellenőrzi a `sources`, `sourcesContent` és decoded mapping pozíciókat.
- Unit teszt multiline event handlerre, amely generated wrapper sorok mellett is az eredeti handler sorokra mutat.
- Unit teszt több sourceId-vel, hogy a builder nem mossa össze `.xmlui` és `.xs` forrásokat.

## 3. lépés: debugger-barát generated JS kibocsátás

A compiler code writer kapjon olyan módot, amely explicit statement boundary-ket és source-map-barát sortöréseket bocsát ki. A cél, hogy a DevTools ne egyetlen hosszú `new Function` soron mutassa a futást.

Feladatok:

- A generated wrapper sorai legyenek stabilak és tesztelhetők.
- User code-hoz kapcsolódó helperhívások source range-et kapjanak.
- Framework-only helperhívások vagy ne kapjanak mappinget, vagy külön internal source-ként legyenek jelölve.
- Artifact szinten jelenjen meg `sourceMap` opcionális mező vagy generált sourcemap getter.

Érintett helyek:

- `xmlui/src/components-core/script-compiler/code-writer.ts`
- `xmlui/src/components-core/script-compiler/artifact.ts`
- `xmlui/src/components-core/script-compiler/targets/binding-sync.ts`
- `xmlui/src/components-core/script-compiler/targets/event-async.ts`

Tesztelés:

- Unit teszt, hogy a generated JS sorokra tagolt és ugyanarra a sourcemapre épül.
- Existing compiler paritástesztek futtatása binding és event targetre.
- Snapshot vagy targeted assertion a `sourceURL` / `sourceMappingURL` jelenlétére, ha debug mód aktív.

## 4. lépés: runtime `new Function` sourcemap integráció

Az `instantiateCompiledScriptArtifact` tudjon debug mód esetén `sourceURL` és inline `sourceMappingURL` commentet fűzni a `new Function` body végére.

Feladatok:

- Runtime option felvétele: `compiledScriptSourceMaps`.
- Inline sourcemap csak dev/debug módban készüljön, hogy ne növelje feleslegesen a runtime memóriát.
- Cache kulcs tartalmazza, hogy sourcemap-pel vagy anélkül instantiate-olunk.
- A sourcemap `sourcesContent` mezője tartalmazza az eredeti `.xmlui` / `.xs` forrást, mert `new Function` esetén nincs valódi fájl URL.

Érintett helyek:

- `xmlui/src/components-core/script-compiler/artifact.ts`
- `xmlui/src/components-core/script-compiler/targets/binding-sync-executor.ts`
- `xmlui/src/components-core/script-compiler/targets/event-async-executor.ts`
- `xmlui/src/components-core/script-runner/eval-options.ts`
- `xmlui/src/components-core/script-runner/BindingTreeEvaluationContext.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

Tesztelés:

- Unit teszt, hogy debug option nélkül nincs sourcemap comment.
- Unit teszt, hogy debug optionnel van `sourceURL` és inline `sourceMappingURL`.
- Unit teszt, hogy serialized artifact továbbra sem tartalmaz `nativeFn`-t és nem kever runtime-only állapotot.

## 5. lépés: Vite plugin sourcemap összefűzés `.xmlui` transzformhoz

A Vite plugin jelenleg `dataToEsm(file)` kimenetet állít elő. Dev serverben és sourcemap-enabled buildben a visszaadott JS modulhoz olyan sourcemap kell, amely:

- a modulban serializált compiled artifact `js` szakaszaira vissza tud mutatni az eredeti `.xmlui` fájlra;
- megőrzi az eredeti `.xmlui` forrást `sourcesContent`-ben;
- kompatibilis Vite HMR-rel;
- nem rontja el az analyzer, a11y, type-contract és reactive-cycle futásokat.

Feladatok:

- A `dataToEsm` helyett vagy mellett olyan ESM generátort használni, amely tud generated offseteket adni a serialized artifact mezőkhöz.
- A compiled artifact sourcemapjeit compose-olni a teljes ESM modul sourcemapjébe.
- A plugin `map: { mappings: "" }` helyett valós mapet adjon vissza, amikor `compiledScriptSourceMaps` aktív.

Érintett helyek:

- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
- opcionálisan új `xmlui/src/nodejs/source-map-utils.ts`
- `xmlui/tests/bin/vite-plugin-import.test.ts`

Tesztelés:

- Vite plugin unit/integration teszt, amely `.xmlui` inputból valós sourcemapet vár.
- Teszt, hogy disabled állapotban a jelenlegi üres map / output viselkedés marad.
- HMR-szerű dupla transform teszt, hogy a sourcemap determinisztikus és nincs stale source.

## 6. lépés: `.xs` és `.xmlui.xs` code-behind sourcemap alapok

A code-behind forrásokat ugyanabba a debug source registrybe kell bekötni, mint az inline `.xmlui` expressionöket.

Feladatok:

- A `.xs` / `.xmlui.xs` transform őrizze meg a teljes source textet és normalized source URL-t.
- Code-behind deklarációk compiled artifactjai saját `.xs` sourceId-t kapjanak.
- Importált `.xm` modulok is önálló source-ként jelenjenek meg.
- Module validation/parsing errors továbbra is az eredeti fájl soraira mutassanak.

Érintett helyek:

- `xmlui/src/parsers/scripting/code-behind-collect.ts`
- `xmlui/src/parsers/scripting/ModuleLoader.ts`
- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
- `xmlui/src/abstractions/scripting/Compilation.ts`

Tesztelés:

- Unit teszt egy `.xmlui.xs` fájl compiled function mappingjére.
- Unit teszt importált `.xm` függvény mappingjére.
- Vite plugin teszt, hogy `.xs` transform sourcemapje tartalmazza az eredeti source contentet.

## 7. lépés: virtuális források kiszolgálása dev serverben

A DevTools akkor működik kiszámíthatóan, ha a sourcemapben szereplő `sources` URL-ekhez a dev server is tud tartalmat adni, nem csak `sourcesContent` van.

Feladatok:

- Vite plugin `configureServer` hookban kis virtual-source registry.
- Vite-kompatibilis `/@xmlui-source/...` endpointokhoz forrástartalom visszaadása. A sourcemapben szereplő URL-ek is ezt használják első implementációként, mert ezt a böngésző és a Vite dev server természetes HTTP forrásként tudja kezelni.
- HMR update esetén registry frissítése.
- Path traversal és workspace-en kívüli path kiszolgálás tiltása.
- A registry display name-ként az eredeti `.xmlui`, `.xs` vagy `.xm` fájlnevet őrizze meg, importált moduloknál is.

Érintett helyek:

- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
- opcionálisan új `xmlui/src/nodejs/virtual-sources.ts`

Tesztelés:

- Unit teszt registry normalizációra és path traversal védelemre.
- Vite dev server integration teszt, amely lekéri a virtuális source URL-t.
- Teszt, hogy file módosítás után a registry az új source-t adja vissza.
- Teszt, hogy importált `.xm` modulnál a registryben és sourcemapben az eredeti fájlnév szerepel.

## 7a. lépés: Inspector trace debug-source metadata

Adjunk egy alacsony költségű Inspector trace eseményt a compiled artifact létrehozásához vagy első futtatásához. Ez segít runtime hibáknál és felhasználói hibajelentéseknél összekötni a futó artifactot az eredeti forrással.

Javasolt trace shape:

```ts
{
  kind: "debug-source",
  target: "binding-sync" | "event-async" | "code-behind",
  sourceUrl: "/@xmlui-source/src/Main.xmlui",
  originalFile: "/src/Main.xmlui",
  sourceRange: { startLine, startColumn, endLine, endColumn },
  artifactId,
  sourcemapMode: "inline" | "external" | "off"
}
```

Korlátok:

- Ne tegyük bele alapértelmezetten a teljes `sourceText` mezőt.
- Dedupoljunk artifactId vagy `sourceUrl + target + range` alapján.
- Csak dev/debug sourcemap módnál emitáljunk, vagy külön verbose kapcsoló mögött.

Érintett helyek:

- `xmlui/src/components-core/script-compiler/artifact.ts`
- `xmlui/src/components-core/script-compiler/targets/binding-sync-executor.ts`
- `xmlui/src/components-core/script-compiler/targets/event-async-executor.ts`
- Inspector trace helper modulok a meglévő trace minták szerint.

Tesztelés:

- Unit teszt, hogy trace esemény sourcemap/debug módnál egyszer jelenik meg.
- Unit teszt, hogy a trace nem tartalmaz teljes source textet.
- Unit teszt, hogy disabled sourcemap/debug módnál nincs extra trace zaj.

## 8. lépés: böngészős breakpoint validáció Playwrighttal

Kell egy end-to-end debug validáció, különben a sourcemap könnyen “helyesnek tűnik”, de a böngészőben használhatatlan.

Feladatok:

- Kis fixture XMLUI app:
  - binding expression több soros vagy legalább nem első soros attribútumban;
  - event handler több statementtel;
  - `.xs` code-behind függvényhívás;
  - egy importált `.xm` helper.
- Playwright Chrome DevTools Protocol használata:
  - sourcemap források listázása;
  - breakpoint beállítása eredeti `.xmlui` sorra;
  - UI esemény kiváltása;
  - pause helyének ellenőrzése eredeti source URL és sor/oszlop alapján.

Érintett helyek:

- új fixture a Vite/plugin tesztek alatt;
- `xmlui/tests-e2e/` vagy meglévő node/vite integration tesztek, attól függően, hol van már CDP harness.

Tesztelés:

- E2E: event handler breakpoint megáll az eredeti `.xmlui` soron.
- E2E: `.xs` helper breakpoint megáll az eredeti `.xs` soron.
- E2E: disabled config mellett nincs extra debug source.

## 9. lépés: dokumentáció és fejlesztői konfiguráció

Dokumentálni kell, hogyan kapcsolható be a debug mód, és milyen korlátai vannak.

Feladatok:

- Belső dev docs frissítés a compiler/source-map architektúráról.
- Felhasználói docs rövid szakasz a Vite dev server debugolásról.
- Config példák:
  - `xmluiConfig.compileScripts`
  - legacy aliasok: `xmluiConfig.compileBindings`, `xmluiConfig.compileEventHandlers`
  - `xmluiConfig.compiledScriptSourceMaps`
  - Vite plugin top-level override-ok.
- Troubleshooting: DevTools sourcemap cache, HMR után frissítés, production sourcemap beállítás.

Érintett helyek:

- `.ai/xmlui/expression-eval.md`
- `.ai/xmlui/build-system.md`
- docs oldal, ha már van scripting/debugging témájú oldal.

Tesztelés:

- Docs example test csak akkor, ha új `xmlui-pg` példa kerül be.
- Link/check build a docs pipeline releváns részén.

## 10. lépés: rollout és alapértelmezések

Elsőként opt-in dev feature legyen, majd stabilizálás után lehet finomítani az alapértelmezéseket.

Javasolt rollout:

- W1: compiler sourcemap builder és runtime inline sourcemap unit tesztekkel.
- W2: Vite `.xmlui` transform sourcemap opt-in.
- W3: `.xs` / `.xm` source registry és mapping.
- W4: Playwright/CDP breakpoint E2E.
- W5: docs, config stabilizálás, known limitations.

Alapértelmezések:

- `compileScripts`: default `false`.
- `compileBindings` / `compileEventHandlers`: legacy aliasok maradnak célzott opt-in/opt-out használathoz.
- `compiledScriptSourceMaps`: production/build default `false`; `xmlui start` dev módban bármilyen script fordítás mellett `external`, ha nincs explicit config érték.
- Production build csak Vite/Rollup `sourcemap` beállítás mellett adjon ki sourcemapet.

## Eldöntött nyitott kérdések

- DevTools/dev server irány: első implementációban Vite-kompatibilis `/@xmlui-source/...` endpointot használunk.
- Runtime `new Function` sourcemap: dev server alatt external sourcemap + virtual source endpoint a preferált, praktikus út. Inline sourcemap csak fallback/runtime safety net.
- Binding expression breakpoint: első körben elég a visszamappelt helperhívásnál megállni.
- `.xs` importált modulok: a debuggerben az eredeti fájlnév jelenjen meg.
- Inspector trace: legyen könnyű, deduplikált `debug-source` metadata esemény, teljes source text nélkül.

## Lezárt implementációs döntések

- A `/@xmlui-source/...` URL-ek projekt-root relatív pathból képződnek.
- Az Inspector trace esemény első runtime futtatáskor keletkezik, deduplikált artifact kulccsal.
- A `compiledScriptSourceMaps` production/build alapértelmezése továbbra is `false`; `xmlui start` dev módban bármilyen script fordítás mellett automatikusan `"external"` módot használ, explicit `false` esetén nem.

## Elfogadási kritériumok

- Dev server alatt opt-in configgal a compiled event handler forrása megjelenik a böngésző Sources panelében eredeti `.xmlui` fájlként.
- Ugyanilyen configgal egy `.xs` code-behind függvény eredeti `.xs` fájlként jelenik meg.
- Playwright/CDP teszt bizonyítja, hogy legalább egy `.xmlui` event handler soron és egy `.xs` helper soron beállított breakpoint megáll.
- Disabled config mellett a Vite plugin outputja és sourcemap viselkedése kompatibilis marad a jelenlegi tesztekkel.
- A compiled artifact továbbra is serializálható runtime-only függvények nélkül.
- A source map generálás nem változtatja meg a binding/event handler futási szemantikát.
