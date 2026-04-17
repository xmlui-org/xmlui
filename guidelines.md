# Documentation Guidelines

Guidelines and learnings for writing XMLUI developer documentation. This is a living document — update it as new patterns emerge.

---

## Dual Documentation Principle

Every topic produces two documents:

| Variant | Location | Audience | Format |
|---------|----------|----------|--------|
| **AI doc** | `.ai/xmlui/<topic>.md` | LLM-assisted development | Bullet points, tables, code snippets. No prose. Minimal tokens, maximum signal. |
| **Human doc** | `xmlui/dev-docs/guide/NN-<topic>.md` | Human developers | Conceptual flow, short explanations, diagram placeholders, key takeaways. |

Both docs cover the same facts. They differ in density and readability.

---

## AI Doc Format

- Lead with facts and rules, not explanations
- Use tables for enums, config options, mappings, file inventories
- Use bullet points for sequences and decision trees
- Code snippets: minimal but complete — show real types and real function names
- Include a **Key Files** table at the bottom mapping concepts to source paths
- Include an **Anti-patterns** section where relevant
- No introductory paragraphs, no "why this matters", no conclusions
- Target length: 200–600 lines
- File naming: `kebab-case.md` (e.g., `mental-model.md`, `rendering-pipeline.md`)

## Human Doc Format

- Start with a short "what and why" paragraph (2–3 sentences)
- Use a conceptual flow: overview → how it works → details → examples
- Mark diagram insertion points with `<!-- DIAGRAM: short description -->`
- Use code examples drawn from real framework code, not toy examples
- Cross-reference related docs with relative markdown links
- End with a **Key Takeaways** section (numbered list, 4–6 items)
- Target length: 300–1000 lines
- File naming: `NN-kebab-case.md` where `NN` is the priority rank (e.g., `01-mental-model.md`)

---

## Writing Rules

### Accuracy over elegance
- Every technical claim must be verified against source code before writing
- Use real type names, real function names, real file paths
- If a detail is uncertain, omit it rather than guess

### Conciseness
- One idea per paragraph (human docs) or per bullet (AI docs)
- Avoid filler: "it is important to note that", "as mentioned earlier", "in other words"
- Prefer tables over prose for structured information

### Naming consistency
- Use the exact names from the codebase: `renderChild`, `ComponentWrapper`, `StateContainer` — not paraphrases
- Use backtick formatting for all code identifiers: `renderChild()`, `ContainerActionKind`, `STATE_PART_CHANGED`
- Component names are PascalCase: `DataSource`, `FormItem`, `TextBox`
- File names include extension: `reducer.ts`, `AppRoot.tsx`

### Cross-referencing
- AI docs: reference key files by path in a table
- Human docs: link to related guide docs and to AI docs where deeper detail lives
- Never duplicate large sections across docs — link instead

---

## Diagram Conventions (for future)

Human docs include placeholder markers for diagrams. When adding actual diagrams:

- Use SVG for all diagrams (scalable, versionable)
- Store in `xmlui/dev-docs/images/guide/`
- Name to match the doc: `01-mental-model-lifecycle.svg`, `01-mental-model-providers.svg`
- Marker format: `<!-- DIAGRAM: description of what the diagram should show -->`

---

## Process

1. Read the topic's section in `dev-docs-plan.md` for scope and current-state assessment
2. Read the relevant source code — verify every claim
3. Read existing docs that cover overlapping material (noted in plan)
4. Write the AI doc first (forces precision; easier to expand than to compress)
5. Write the human doc second (expand AI doc into readable narrative with flow and examples)
6. Self-check: does every technical statement match the source code?

---

## Key Lessons

Distilled from writing Topics 1–25. The full per-topic notes have been retired — the knowledge now lives in the finished AI docs.

- **Write the AI doc first.** It forces precision and makes every claim verifiable. The human doc is easier to write once the AI doc exists.
- **Always verify names from source before writing.** One wrong interface method name (`shouldApply` vs `canAttach`) misleads developers for months. If uncertain, omit.
- **Use real function/type names, not paraphrases.** `createEventHandlerCache`, `StateContainer`, `ContainerActionKind` are more useful than "the event cache", "the state holder", "the action kind enum".
- **For multi-step pipelines, include both an ASCII diagram and a summary table.** The diagram gives structure; the table gives quick scannable reference. One without the other is insufficient.
- **State both the mechanism AND the consequence for counterintuitive rules.** Saying "displayWhen=false uses display:none" is incomplete without "so hidden-step fields stay registered with the Form".
- **Prefer detail level to match the audience.** AI docs: list every provider/layer/branch with its purpose. Human docs: show the grouped hierarchy and explain the "why".
- **Short code examples in human docs pay off for non-obvious mechanisms.** Even a 3-line snippet eliminates a paragraph of explanation. AI docs intentionally skip prose examples.
- **Never duplicate large sections across docs — link instead.** The first time you want to copy more than a sentence, write it once and add a cross-reference.

