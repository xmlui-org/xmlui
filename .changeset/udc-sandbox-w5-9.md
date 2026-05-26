---
"xmlui": patch
---

UDC sandbox foundation (plan #14, W5-9). Adds the `components-core/udc-sandbox` module with diagnostic codes (`UdcDiagCode`), `UdcContract` types, and stub scope / capability gates. Parser now recognises `<Prop>`, `<Event>`, `<Method>`, and `<Slot>` declaration blocks inside `<Component>` definitions and attaches the resulting contract to the `CompoundComponentDef`. When a UDC has a declared contract, references to `$props.<name>` without a matching `<Prop>` declaration emit a `udc-prop-undeclared` info-level trace entry. `strictUdcSandbox` is documented as a new `App.appGlobals` flag (escalation lands in W6). Legacy UDCs without declaration blocks continue to work unchanged.
