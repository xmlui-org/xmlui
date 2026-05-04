import type { ComponentRendererDef, CompoundComponentRendererInfo } from "./RendererDefs";
import type { ThemeDefinition } from "./ThemingDefs";

export type ComponentExtension = ComponentRendererDef | CompoundComponentRendererInfo;

export interface Extension {
  namespace?: string;
  components?: ComponentExtension[];
  themes?: ThemeDefinition[];
  /** Optional global functions merged into app globalVars when the extension is registered. */
  functions?: Record<string, (...args: any[]) => any>;
  /**
   * PascalCase prefix token for theme-variable namespacing (plan #02).
   *
   * Extension packages **must** declare this field so that CSS variables they
   * produce are unambiguously scoped:
   *
   *   `--xmlui-backgroundColor-Animations_Button`
   *                              ↑ prefix ↑ component name
   *
   * Core components leave this field `undefined` (no prefix, no `_` separator).
   * The canonical prefix for each first-party package is listed in
   * `components-core/themevars/prefix-registry.ts`.
   *
   * The build-time analyzer (plan #13) and the LSP (plan #02 Phase 1) will
   * emit a `theming-missing-prefix` diagnostic for extension packages that
   * omit this field once `strictBuildValidation` is enabled.
   */
  themeNamespacePrefix?: string;
}