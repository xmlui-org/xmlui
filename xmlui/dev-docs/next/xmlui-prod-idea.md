# Product Vision: AI-Generated App Extensions Built on XMLUI

We want to build a product on top of XMLUI that lets users create custom, AI-generated UI inside the web applications they already use.

Developers integrate the product once, provide application semantics and safe attachment points, and users can then generate task-specific screens without waiting for new development or deployment. The generated UI is rendered with XMLUI's concise markup and sandboxed execution, can use the host application's existing APIs, and can be persisted for reuse.

The product turns workflow gaps and expensive UI changes into governed self-service customization.

## Pitch

**One-line pitch:** Users create custom, AI-generated screens inside the applications they already use, while developers define the safe boundaries once.

**Spoken pitch:** Most applications cannot keep up with every workflow their users need. This product lets users generate custom screens from a prompt, directly inside the application they already use. Developers provide application semantics and safe attachment points, and XMLUI renders the result as sandboxed, reusable UI. It turns workflow gaps, long-tail feature requests, and legacy UI pain into governed self-service customization.

**Buyer message:** The product helps software vendors and enterprise app teams make existing applications AI-extensible. It reduces pressure on product roadmaps, increases user satisfaction, and offers a practical modernization path for legacy systems without rewriting the old application.

## Core Promise

**For users:** Create the screen you need, when you need it, inside the app you already use.

**For product teams:** Satisfy workflow demand without turning every request into a roadmap item.

**For developers:** Define safe boundaries and let users generate controlled UI extensions.

**For organizations:** Increase application adaptability while keeping data access, permissions, and execution inside governed systems.

## Why It Matters

Most mature applications accumulate unmet workflow demand. The more successful an application becomes, the more varied its users' needs become.

This is especially painful in older enterprise systems such as CRM, ERP, back-office, and industry-specific applications. In these systems, adding new UI can be expensive because of old source code, obsolete UI frameworks, limited developer availability, fragile release processes, or weak tooling.

The product creates a governed AI-generated UI layer between rigid application functionality and uncontrolled external workarounds, allowing applications to become adaptive without becoming chaotic.

---

## Product Positioning

This product is not another web UI framework. It is an AI-powered extension product for making existing web applications user-extensible through generated, sandboxed UI.

XMLUI remains the framework underneath. The product built on top of it packages XMLUI with AI generation, application semantics, trigger integration, persistence, governance, reuse, and solution memory.

## Foundation: XMLUI

XMLUI remains a web UI framework that developers can use directly to build business applications, internal tools, documentation sites, blog sites, and other structured web experiences.

Because XMLUI represents UI as concise text files, AI can generate it reliably and systems can persist it as data. Developers and users are not expected to inspect or modify the generated UI in everyday use, but they can when they need to. Because XMLUI runs code in a sandboxed environment, generated interfaces can be executed with stronger protection against malicious scripts, unsafe behavior, or unintended access.

## How It Works

An application developer integrates the product once into an existing web application. That integration provides:

1. **An integrated creation experience** provided by the product, such as a chat panel, drawer, extra menu command, or other embedded UI that can be easily added to the existing application.
2. **Trigger points** where generated UI can be attached, such as buttons, menus, dropdown commands, side panels, contextual actions, or dashboard slots. These trigger points also handle XMLUI execution when the generated interface is opened.
3. **Application semantics** that describe what the host app means and how it works, using sources such as Markdown documentation, OpenAPI specifications, data dictionaries, permission descriptions, or workflow notes.
4. **API usage derived from semantics**, so the product can identify the relevant endpoints for a requested operation and generate UI that uses the host application's existing APIs through the same controlled backend boundaries as the original app.
5. **Persistence for generated UI and its context**, so users can save, reopen, share, and refine the interfaces they create. Persistence can use endpoints provided by the host application, such as endpoints backed by the same database as the existing app, or persistence services provided by the product itself.
6. **Solution memory**, so completed generations can be stored with their conversation history and summary, then analyzed later to reuse or adapt similar UI solutions.

When the host application evolves, developers can optionally update the semantic context so the AI understands new APIs, changed behavior, or newly supported workflows.

## Solution Memory

The product can persist more than the generated UI itself. It can save the AI-assisted conversation that produced the UI, together with a summary of the user's motives, the task being solved, what the UI does, and how it works.

Over time, this creates a reusable knowledge base. When a user asks for a new interface, the product can analyze prior conversations and generated UIs to detect whether someone has already solved the same or a similar problem.

## Primary Use Cases

- **Long-tail product requests:** Users create narrow UI that would otherwise wait behind higher-priority roadmap work.
- **Operational workflows:** Teams create temporary screens for review, approval, reporting, cleanup, or coordination.
- **Legacy system extension:** Organizations add modern UI around old CRM, ERP, back-office, or industry systems where direct development is slow, risky, or expensive.
- **Customer-specific SaaS customization:** Vendors support customer-specific workflows without forking the product.
- **Disposable UI:** Users create one-off interfaces for short-lived projects, migrations, data cleanup, audits, or exception handling.

### Example Scenario

A customer success manager works inside a SaaS admin console. They need a special view for customers approaching renewal who also have unresolved support tickets and declining usage.

Instead of asking the product team for a new dashboard, they prompt:

> Create a renewal risk panel that shows accounts renewing in the next 60 days, open critical tickets, usage trend, owner, and a button to create a follow-up task.

The product generates an XMLUI panel using the host application's documented APIs and semantics. The user attaches it to the account dashboard. If useful, they save it and share it with their team. No new application release is required.

### Legacy System Scenario

An enterprise runs an old ERP system that still contains critical business data and processes. The source code is difficult to change, the UI framework is obsolete, and every new screen requires expensive specialist development.

The organization integrates the product around selected parts of the ERP. Developers provide semantics for common entities, workflows, and APIs, then expose safe attachment points inside the existing UI.

Business users can then generate modern task-specific screens, such as exception review panels, approval queues, customer lookup tools, or audit dashboards, without changing the old ERP UI directly.

### Customer-Specific SaaS Scenario

A SaaS vendor has several enterprise customers asking for slightly different workflows around the same product area. One customer wants a custom renewal dashboard, another wants a special approval queue, and another wants a data quality review screen.

Today, each request competes with the core roadmap or becomes professional services work. With the product integrated, each customer can generate task-specific UI within the boundaries defined by the vendor.

The vendor avoids product forks while customers get workflows that feel native to the product.

### Operations Exception Scenario

An operations team manages a high-volume process where most cases follow the standard path, but exceptions require careful human judgment. Examples include failed payments, delayed shipments, suspicious account activity, support escalations, or incomplete onboarding records.

Instead of building a new exception console for every changing process, users can generate focused review screens that combine the relevant data, actions, filters, and notes for the current operational need.

The UI can be saved while the exception process is active, then retired or adapted when the process changes.

### Compliance and Audit Scenario

A compliance team needs temporary views for audits, investigations, or internal controls. The required UI often depends on the audit scope, the current regulation, the business unit, and the data sources involved.

The product lets authorized users generate governed audit screens inside the existing application, using approved APIs and permission boundaries. The generated UI, the prompt conversation, and the summary of intent can be persisted as part of the audit trail.

This helps teams respond quickly without exporting sensitive data into spreadsheets.

### Data Cleanup and Migration Scenario

During migrations, integrations, or data quality projects, teams often need temporary interfaces for reviewing, correcting, merging, or approving records.

These screens are usually too temporary to justify formal product development, but too important to handle entirely in spreadsheets. The product can generate purpose-built cleanup UI that reads and updates data through approved APIs.

When the project ends, the UI can be archived or used as a starting point for the next cleanup effort.

### Internal Admin Scenario

Many applications need internal admin tools for support, customer success, implementation, finance, or operations teams. These tools are often low priority for product teams but essential for daily work.

With the product, internal teams can generate small, controlled admin screens for lookup, correction, triage, reporting, or bulk actions. Developers define what is safe and available; users assemble the UI they need for the current task.

This reduces pressure on engineering while improving the speed and quality of internal operations.

## Differentiation

The product differs from traditional customization and automation approaches:

- **Embedded, not external:** Generated UI appears inside the existing application experience.
- **User-generated, not developer-built:** Users create interfaces from prompts after the initial integration.
- **Persistent, not merely conversational:** Generated UI, the conversation that created it, and a summary of its purpose can be saved, reused, shared, and improved over time.
- **Governed, not uncontrolled:** The host app defines available APIs, semantics, permissions, and attachment points.
- **Declarative, not brittle:** UI is stored as XMLUI markup and related text files, not as opaque screenshots, scripts, or browser hacks.
- **Sandboxed, not arbitrary script execution:** XMLUI provides a secure runtime boundary for generated UI logic.
- **Cumulative, not isolated:** Each generated solution can become part of a searchable memory of prior user needs and UI patterns.
- **Useful for legacy modernization:** Older systems can gain modern task-specific UI without rewriting their original frontend.
- **Composable with releases:** As the host app changes, developers can update the semantic context without rebuilding every generated interface manually.

## Working Title Direction

The earlier working names with high or medium risk should not be used as active candidates. A quick web search found conflicts or close active uses for names such as AppForge, FlowPanel, PromptLayer, AdaptUI, AppCanvas, Interface Studio, Extension Studio, Worksurface, PromptSurface, and UserExtensions.

Punny or metaphorical names may be a better direction, especially names that suggest adding, fitting, grafting, or inlaying new UI into an existing application. These ideas are not trademark-cleared and still need proper legal, domain, and market review:

- **UInlay**: A compact pun on "UI" and "inlay"; suggests placing new interface pieces inside an existing product.
- **InlayUI**: Clearer than UInlay, with the same embedded-interface metaphor.
- **ScreenGraft**: Suggests adding a living new interface layer onto an existing application.
- **GraftUI**: Shorter and more technical; points to attaching generated UI to an existing host.
- **UIPatch**: Suggests a lightweight UI addition without a full application release.
- **FitUI**: Suggests custom UI that fits the user's task and the host application.
- **TaskFace**: A pun on interface; suggests task-specific surfaces generated for users.
- **AppSplice**: Suggests safely splicing new UI into existing applications.

## Tagline Options

- **User-generated UI for the apps you already have.**
- **Make every application adaptable.**
- **AI-generated interfaces, governed by your app.**
- **Custom UI without custom releases.**
- **Modern UI for legacy systems and long-tail workflows.**
- **From feature requests to user-created workflows.**

## Key Takeaway

The product built on XMLUI transforms UI from a fixed product surface into a governed, AI-generated extension layer. It gives users the power to adapt software to their work while giving developers and organizations the control they need to keep those adaptations safe, integrated, and reusable.
