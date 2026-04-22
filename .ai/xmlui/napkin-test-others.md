# Napkin Test: React, Angular, Tcl, Lisp — For Comparison with XMLUI

**Purpose:** Apply the same napkin test from `napkin-test.md` to four reference points — two UI frameworks (React, Angular) and two languages historically praised for conceptual economy (Tcl, Lisp). Sources are the official documentation and canonical references for each; all examples are drawn directly from those sources.

---

## Lisp — The Gold Standard (7 axioms, 1960)

**Source:** John McCarthy, "Recursive Functions of Symbolic Expressions and Their Computation by Machine" (1960), as reconstructed by Paul Graham in "The Roots of Lisp" (2001) and confirmed by the Wikipedia article on Lisp.

Lisp is the benchmark. McCarthy showed that a whole programming language — including its own interpreter — can be derived from seven primitive operators and two syntax rules. Everything else is built up from those nine rules.

### The 2 Syntax Rules

**Rule S1 — Everything is an atom or a list (S-expression).**
An atom is a symbol (`foo`, `x`) or a number (`42`). A list is a parenthesized sequence of atoms and lists: `(car (cons x y))`. There are no other syntactic forms.

```lisp
(list 1 2 (list 3 4))   ; => (1 2 (3 4))
foo                      ; atom: the symbol foo
42                       ; atom: the number 42
```

**Rule S2 — Evaluating a list calls a function; quoting a list prevents evaluation.**
When the evaluator sees a list, the first element is the function and the rest are arguments — both evaluated before the call. `quote` (abbreviated `'`) suppresses evaluation so you can pass a list as data, not a call.

```lisp
(+ 1 2 3)          ; calls +, evaluates to 6
'(1 2 3)           ; quoted — returns the list (1 2 3), not a call
(quote (a b c))    ; same as above, verbose form
```

### The 7 Primitive Operators

| Operator | What it does |
|----------|-------------|
| `(quote x)` | Returns `x` unevaluated |
| `(atom x)` | Returns `t` if `x` is an atom, `()` otherwise |
| `(eq x y)` | Returns `t` if two atoms are equal |
| `(car x)` | Returns the first element of list `x` |
| `(cdr x)` | Returns the rest of list `x` (all but first) |
| `(cons x y)` | Prepends `x` to list `y`, returning a new list |
| `(cond (p1 e1) …)` | Evaluates the first `eN` whose `pN` is true |

```lisp
(car '(a b c))          ; => a
(cdr '(a b c))          ; => (b c)
(cons 'a '(b c))        ; => (a b c)
(eq 'foo 'foo)          ; => t
(atom 'foo)             ; => t
(atom '(a b))           ; => ()  (a list, not an atom)
(cond ((eq x 'a) 1)
      ((eq x 'b) 2))    ; conditional branch
```

`lambda` is how functions are written; it is expressible in terms of the primitives rather than being a primitive itself in the strict McCarthy sense, but it is needed in practice:

```lisp
((lambda (x) (cons x '(b c))) 'a)   ; => (a b c)
```

### Napkin test verdict

**Passes cleanly.** Nine rules, fits on a napkin. Every other feature of the language — booleans, `let`, `defun`, `if`, `and`, `or`, `list`, recursion, even the evaluator itself — is derivable from these nine rules. Paul Graham demonstrated this in "The Roots of Lisp" by implementing a working Lisp interpreter in about 60 lines of Common Lisp that use only the seven primitives.

**Why it works:** Code and data share the same representation (homoiconicity). The evaluator is itself a Lisp program. There are no special cases for syntax versus semantics.

---

## Tcl — Almost as Clean (12 rules, the Dodekalogue)

**Source:** The official Tcl reference manual, reproduced at [wiki.tcl-lang.org/page/Dodekalogue](https://wiki.tcl-lang.org/page/Dodekalogue). The 12 rules are the normative specification of the entire Tcl language syntax and evaluation model.

Tcl ("Tool Command Language") was designed by John Ousterhout around one axiom: **everything is a string**. The Dodekalogue (twelve rules) is the complete formal specification of how that string is interpreted. Prior to rule 12 (argument expansion, added in Tcl 8.5), there were only 11 rules (the Endekalogue).

### The 12 Rules

**Rule 1 — Commands.** A Tcl script is a string. Semicolons and newlines separate commands; close brackets terminate commands during command substitution.

**Rule 2 — Evaluation.** A command is evaluated in two steps: first the interpreter breaks it into words and performs substitutions; then the first word locates a command procedure which is called with the remaining words as arguments.

```tcl
puts "Hello, world"     ; command=puts, argument="Hello, world"
set x 42                ; command=set, arguments=x and 42
```

**Rule 3 — Words.** Words are separated by whitespace (not newlines, which are command separators).

**Rule 4 — Double quotes.** A word enclosed in `"…"` may contain whitespace and semicolons without them acting as separators. Variable, command, and backslash substitutions are performed inside quotes.

```tcl
puts "value is $x"      ; substitution happens inside quotes
set msg "a b c"         ; "a b c" is one word despite the spaces
```

**Rule 5 — Argument expansion.** A word starting with `{*}` is expanded as a list: its elements become separate words of the command.

```tcl
set args {a b c}
cmd {*}$args            ; equivalent to: cmd a b c
```

**Rule 6 — Braces.** A word enclosed in `{…}` is passed verbatim — no substitutions are performed (except backslash-newline). Braces nest.

```tcl
set body { puts $x }    ; $x is not substituted — the literal string
proc double {n} { expr {$n * 2} }
```

**Rule 7 — Command substitution.** `[script]` is replaced by the result of evaluating the script recursively.

```tcl
set len [string length "hello"]   ; len = 5
puts "2+2=[expr {2+2}]"           ; prints: 2+2=4
```

**Rule 8 — Variable substitution.** `$name` is replaced by the variable's value. `${name}` allows arbitrary variable names.

```tcl
set greeting "Hello"
puts $greeting          ; Hello
puts ${greeting}        ; Hello (braced form)
```

**Rule 9 — Backslash substitution.** `\n` → newline, `\t` → tab, `\\` → backslash, `\x41` → `A`, etc. Backslash-newline is replaced by a single space (line continuation).

**Rule 10 — Comments.** `#` at the position where a command name is expected starts a comment through end of line.

```tcl
# This is a comment
set x 1  ; # this is NOT a comment (it's the third word of set)
set x 1  ;# this IS a comment (semicolon separates command, # starts new command)
```

**Rule 11 — Order of substitution.** Substitutions are performed left to right; each substitution is evaluated completely before the next begins. A substituted value is never re-substituted.

**Rule 12 — Substitution and word boundaries.** Substitutions do not affect word boundaries (except `{*}` argument expansion from Rule 5).

### Napkin test verdict

**Passes, with one asterisk.** Twelve rules covers the entire language. The rules are concrete and complete — they are literally the specification, not a summary of it. A developer who memorizes the twelve rules can predict the behavior of any Tcl script.

**The asterisk:** The rules specify *parsing and substitution* but not the standard library. `proc`, `if`, `while`, `foreach`, `expr`, `list`, `string`, `dict` are all standard commands, not syntax — which is elegant in theory (commands are first-class) but means the napkin stops at the parser level. To be practically useful you also need to know the command library, which is large.

**The central insight:** Because everything is a string and substitution rules are fixed, you can always reason about what a Tcl script does by mentally applying the 12 rules in order. This is the source of both Tcl's power and its infamous "quoting hell" — the same substitution rules apply everywhere, but combining them for nested cases (e.g. `expr` inside `proc` inside `eval`) requires careful brace placement.

---

## React — Doesn't Pass Cleanly (~10 rules, but they have hidden depth)

**Source:** [react.dev/learn](https://react.dev/learn) (Quick Start) and [react.dev/learn/thinking-in-react](https://react.dev/learn/thinking-in-react).

React's official documentation itself structures the mental model around a small set of ideas, but several of them have sub-rules that make the napkin test harder to pass.

### The ~10 Rules

**Rule 1 — Everything is a component.** A React component is a JavaScript function that accepts props and returns JSX. Component names start with a capital letter; HTML tags are lowercase.

```jsx
function MyButton() {
  return <button>Click me</button>;
}
```

**Rule 2 — JSX is markup in JavaScript.** JSX looks like HTML but is JavaScript. Curly braces `{…}` embed any JavaScript expression. Attributes use camelCase (`className`, not `class`). Every tag must be closed.

```jsx
const name = "Alice";
return <h1 className="title">Hello, {name.toUpperCase()}!</h1>;
```

**Rule 3 — Data flows one way: props go down, events go up.** A parent passes data to a child as props (read-only in the child). A child communicates back by calling a callback function the parent passed as a prop.

```jsx
// Parent passes count and a handler down
<MyButton count={count} onClick={() => setCount(count + 1)} />

// Child calls the prop to send data up
function MyButton({ count, onClick }) {
  return <button onClick={onClick}>Clicked {count} times</button>;
}
```

**Rule 4 — State is declared with `useState`; updating it re-renders the component.** `const [value, setValue] = useState(initialValue)` gives you the current value and a setter. Call the setter to trigger a re-render. Each component instance has its own state.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count}</button>;
}
```

**Rule 5 — Lift state up to share it between components.** If two components need the same state, move it to their closest common parent and pass it down as props.

**Rule 6 — Hooks are functions starting with `use`; they must be called at the top level of a component.** `useState`, `useEffect`, `useContext`, `useMemo`, and custom hooks follow this rule. Hooks cannot be called inside conditions, loops, or nested functions.

```jsx
// Correct: top level
function MyComponent() {
  const [x, setX] = useState(0);          // ✓
  const [y, setY] = useState(0);          // ✓
  // ...
}

// Wrong: inside a condition
if (condition) {
  const [z, setZ] = useState(0);          // ✗ violates Hook rules
}
```

**Rule 7 — Conditions and lists use plain JavaScript.** There is no `@if` or `@for` — use ternary `? :`, `&&`, and `.map()`. List items need a stable `key` prop.

```jsx
{isLoggedIn ? <AdminPanel /> : <LoginForm />}
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

**Rule 8 — Side effects belong in `useEffect`.** Anything that interacts with the outside world (fetch, DOM manipulation, subscriptions) goes in a `useEffect` with a dependency array. An empty array `[]` means "run once on mount".

```jsx
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
}, []); // runs once on mount
```

**Rule 9 — Derived data should be computed, not stored.** If a value can be computed from state or props, compute it inline — don't store it in state. Only store data that changes independently and cannot be derived.

**Rule 10 — Keys, refs, and context are escape hatches.** When the one-way data model becomes impractical (DOM access, sharing data across many levels, optimizing expensive re-renders), React provides `ref`, `createContext`/`useContext`, and `useMemo`/`useCallback` as controlled escape hatches.

### Napkin test verdict

**Borderline pass.** The first five rules form a coherent, napkin-sized mental model that covers most React apps. The rules beyond that — especially the Hook rules (Rule 6) and the escape hatches (Rule 10) — are non-trivial and introduce hidden complexity.

**What blocks simplicity:**

1. **The Hook rules are surprising.** "Call Hooks at the top level" is not derivable from any general principle — it is a constraint imposed by React's implementation (the order of Hook calls must be stable across renders). A developer can write syntactically correct code that violates this rule and only discover the bug at runtime.

2. **State update semantics are asynchronous and batched.** `setValue(value + 1)` twice in a row does not increment by 2 — it increments by 1 because both calls see the same captured `value`. The functional updater form (`setValue(v => v + 1)`) fixes this, but the difference is not obvious from the declarative surface.

3. **`useEffect` dependency array is a footgun.** Getting the dependency array wrong causes either infinite re-render loops or stale closure bugs. The ESLint plugin `eslint-plugin-react-hooks` exists precisely because the rule is hard to apply correctly by hand.

4. **JSX is a compile step.** Unlike XMLUI (which parses XML at runtime) or Tcl (which is all string-based), JSX requires a compiler (Babel or TypeScript). The runtime behavior of `<MyButton />` depends on understanding that it compiles to `React.createElement(MyButton, null)`.

---

## Angular — Does Not Pass (too many orthogonal systems)

**Source:** [angular.dev/essentials](https://angular.dev/essentials), specifically the components, signals, templates, and dependency injection sections.

Angular is a full-featured framework, not a library. It makes deliberate choices to provide complete solutions for components, routing, forms, HTTP, internationalization, animation, and testing — all first-party. The cost is a larger set of orthogonal concepts that cannot be summarized on a napkin.

### The Core Concepts (not 10 rules — more like 6 subsystems)

**Subsystem 1 — Components.** Every Angular component is a TypeScript class decorated with `@Component`. The decorator provides a `selector` (CSS selector used as a custom HTML tag), a `template` or `templateUrl` (the HTML), and optional `styles`. Components must declare the other components they use in their `imports` array.

```typescript
@Component({
  selector: 'user-profile',
  imports: [ProfilePhoto],
  template: `
    <h1>{{ userName() }}</h1>
    <profile-photo />
  `,
})
export class UserProfile {
  userName = signal('Alice');
}
```

**Subsystem 2 — Signals (reactive state).** State is held in `signal()` wrappers. A signal is read by calling it as a function: `mySignal()`. It is written with `.set(value)` or `.update(fn)`. Derived state uses `computed(() => expr)`, which re-evaluates automatically when its dependencies change.

```typescript
const count = signal(0);
const doubled = computed(() => count() * 2);

count.set(5);
console.log(doubled()); // 10
```

**Subsystem 3 — Templates.** Angular extends HTML with:
- `{{ expression }}` — text interpolation (reads signals automatically)
- `[property]="expression"` — property binding (square brackets)
- `(event)="handler()"` — event binding (parentheses)
- `@if (condition) { … }` — conditional block
- `@for (item of items(); track item.id) { … }` — loop block

```html
<h1>Profile for {{ userName() }}</h1>
<button [disabled]="!isValid()">Save</button>
<button (click)="submitForm()">Submit</button>
@if (isAdmin()) { <admin-panel /> }
@for (user of users(); track user.id) { <li>{{ user.name }}</li> }
```

**Subsystem 4 — Dependency Injection.** Services are TypeScript classes decorated with `@Injectable`. They are injected into components either via the constructor or via `inject()`. Angular's DI tree determines service scope (application-wide vs. component-tree-scoped).

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  getUsers() { return this.http.get<User[]>('/api/users'); }
  constructor(private http: HttpClient) {}
}

@Component({ /* … */ })
export class MyComponent {
  private userService = inject(UserService);
}
```

**Subsystem 5 — Routing, Forms, HTTP.** Three separate first-party subsystems — `@angular/router`, `@angular/forms` (reactive forms with `FormGroup`/`FormControl`), and `@angular/common/http` (`HttpClient`) — each with their own module/provider setup and API surface.

**Subsystem 6 — Lifecycle hooks and change detection.** `ngOnInit`, `ngOnDestroy`, `ngOnChanges`, `AfterViewInit`, etc. are TypeScript interfaces a component class implements to hook into Angular's rendering lifecycle.

### Napkin test verdict

**Does not pass.** Angular requires fluency in at minimum six orthogonal subsystems before you can write a realistic application. The subsystems are individually well-designed and internally consistent, but they are separate — knowing signals does not help you understand DI, and knowing templates does not help you understand routing.

**Why it is designed this way:** Angular is an opinionated, "batteries-included" enterprise framework. Its goal is that every large team builds the same patterns for every concern (state, HTTP, forms, routing) rather than choosing ad-hoc. The complexity budget is justified by predictability at scale. The trade-off is that the learning curve is steep and the "napkin test" is not a design goal.

**What would a napkin for Angular look like?** You could write: *"A component is a TypeScript class + HTML template; signals are reactive state; `[…]` binds properties, `(…)` binds events; inject services for shared logic."* That is honest for the rendering layer but leaves routing, forms, and HTTP entirely unaddressed.

---

## Comparison Table

| | **Lisp (McCarthy)** | **Tcl** | **React** | **Angular** | **XMLUI** |
|--|--|--|--|--|--|
| **Primary abstraction** | S-expression (atom or list) | String | Component (JS function → JSX) | Component (TS class + decorator) | Component (XML tag) |
| **Number of core rules** | 9 (2 syntax + 7 operators) | 12 (Dodekalogue) | ~10 (but with hidden depth) | 6 subsystems (not reducible to rules) | 10 |
| **Napkin test** | ✓ Passes | ✓ Passes | Borderline | ✗ Does not pass | ✓ Passes |
| **Reactivity model** | None (pure functional by default) | None (imperative) | Pull (re-render on `setState`) | Push (signals track reads/writes) | Push (expression dependency tracking) |
| **State location** | Passed explicitly or closed over | Global or passed | `useState` in component tree, lifted to common parent | `signal()` in component class | `var.` on component tag, scoped downward |
| **Data flow** | Explicit arguments | Explicit arguments | Props down, callbacks up | Props down (`@Input`), events up (`@Output`) or services | Props down (`$props`), events up (`emitEvent`) |
| **Markup language** | S-expressions | Tcl scripts | JSX (JS + HTML hybrid) | HTML + Angular-extended syntax | XML |
| **Build step required** | No | No | Yes (JSX compiler) | Yes (TypeScript + Angular compiler) | No (standalone mode) |
| **Hidden complexity** | Quoting/evaluation order; macros | Quoting hell in nested contexts | Hook rules; stale closures; `useEffect` deps | DI providers; module system; lifecycle hooks | `var` shadowing after mutation; sandbox restrictions |
| **Can write interpreter in itself** | Yes (proof of concept in the paper) | Partially (Tcl-in-Tcl is possible) | No | No | No |
| **Target user** | Language theorists, PL researchers | Sysadmins, embedded scripting | Web developers (JS expertise assumed) | Enterprise teams (TypeScript expertise assumed) | Non-JS developers, app builders |

---

## What This Comparison Tells Us About XMLUI

**XMLUI sits in the same class as Tcl** in terms of napkin-test score: it can be summarized in ~10 rules that cover the vast majority of real programs, the rules are mutually consistent, and they hold up under scrutiny. Neither XMLUI nor Tcl reaches the extreme economy of Lisp (which is a theoretical achievement), but both are substantially more reducible than React and far more reducible than Angular.

**The key difference between XMLUI and Tcl:** Tcl's rules describe parsing and substitution only — the standard library is separate and large. XMLUI's 10 rules describe parsing, reactivity, data flow, component boundaries, data fetching, styling, and scripting in one unified model. In that sense, XMLUI's rules have broader coverage per rule than Tcl's.

**The key difference between XMLUI and React:** React's rules require JavaScript fluency to use (JSX, closures, the Hook rules, `useEffect`). XMLUI's rules are learnable without prior JavaScript knowledge — the XML markup is familiar from HTML, and the reactive binding model is self-contained. The sandbox restrictions (Rule 10) mean XMLUI is less expressive than React but also less dangerous and more predictable.

**What Lisp's economy teaches us:** The extreme brevity of Lisp's rule set comes from homoiconicity — code and data share the same representation. XMLUI has a weaker form of this: `.xmlui` component definitions and the runtime data they describe both use XML-like tree structures. That structural homogeneity is part of what keeps XMLUI's rule count low.
