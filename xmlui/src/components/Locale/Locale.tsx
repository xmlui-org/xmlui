import { Fragment, type ComponentType, useCallback, useMemo } from "react";

import { createMetadata } from "../metadata-helpers";
import { wrapComponent } from "../../components-core/wrapComponent";
import {
  LocaleProfileProvider,
  useLocaleProfile,
} from "../../components-core/i18n/LocaleContext";
import {
  normalizeLocaleProfile,
  type LocaleProfileInput,
} from "../../components-core/i18n";
import { pushXsLog } from "../../components-core/inspector/inspectorUtils";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type {
  LayoutContext,
  RenderChildFn,
} from "../../abstractions/RendererDefs";
import type { AppContextObject } from "../../abstractions/AppContextDefs";
import { composeAppContextWithLocaleProfile } from "../../components-core/AppContext";

const COMP = "Locale";

export const LocaleMd = createMetadata({
  status: "experimental",
  description:
    "`Locale` creates a scoped locale context for its descendants. It can override " +
    "the locale ID and locale formatting traits such as decimal and grouping separators.",
  nonVisual: true,
  props: {
    locale: {
      description: "BCP-47 locale ID used by descendants for translation and formatting.",
      valueType: "string",
    },
    decimalSeparator: {
      description: "Override for the decimal separator used by descendant number formatting.",
      valueType: "string",
    },
    groupSeparator: {
      description: "Override for the grouping separator used by descendant number formatting.",
      valueType: "string",
    },
    thousandSeparator: {
      description:
        "Alias for `groupSeparator`. Use this to override the thousands/grouping separator.",
      valueType: "string",
    },
    minusSign: {
      description: "Override for the minus sign used by descendant number formatting.",
      valueType: "string",
    },
    currency: {
      description: "Default currency trait for descendants.",
      valueType: "string",
    },
    numberingSystem: {
      description:
        "Unicode numbering system identifier forwarded to Intl number formatting when supported.",
      valueType: "string",
    },
  },
  opaque: true,
});

export const localeComponentRenderer = wrapComponent(COMP, Fragment as unknown as ComponentType, LocaleMd, {
  customRender: (_props, { node, extractValue, renderChild, layoutContext, appContext }) => {
    const profile = {
      locale: extractValue.asOptionalString(node.props.locale),
      decimalSeparator: extractValue.asOptionalString(node.props.decimalSeparator),
      groupSeparator: extractValue.asOptionalString(node.props.groupSeparator),
      thousandSeparator: extractValue.asOptionalString(node.props.thousandSeparator),
      minusSign: extractValue.asOptionalString(node.props.minusSign),
      currency: extractValue.asOptionalString(node.props.currency),
      numberingSystem: extractValue.asOptionalString(node.props.numberingSystem),
    };

    return (
      <LocaleScope
        profile={profile}
        appContext={appContext}
        layoutContext={layoutContext}
        renderChild={renderChild}
        node={node}
      />
    );
  },
});

function LocaleScope({
  profile,
  appContext,
  layoutContext,
  renderChild,
  node,
}: {
  profile: LocaleProfileInput;
  appContext: AppContextObject;
  layoutContext?: LayoutContext;
  renderChild: RenderChildFn;
  node: ComponentDef;
}) {
  const parentProfile = useLocaleProfile();
  const onInvalidLocale = useCallback(
    (locale: string) => {
      pushXsLog({
        kind: "i18n",
        ts: Date.now(),
        code: "missing-bundle",
        severity: appContext?.xmluiConfig?.strictI18n === true ? "error" : "warn",
        locale,
        message: `Invalid locale "${locale}".`,
      });
    },
    [appContext?.xmluiConfig?.strictI18n],
  );
  const localeProfile = useMemo(
    () => normalizeLocaleProfile(profile, parentProfile, onInvalidLocale),
    [profile, parentProfile, onInvalidLocale],
  );
  const scopedAppContext = useMemo(
    () => composeAppContextWithLocaleProfile(appContext, localeProfile),
    [appContext, localeProfile],
  );

  return (
    <LocaleProfileProvider profile={localeProfile} parent={parentProfile}>
      {renderChild(node.children, layoutContext, undefined, undefined, undefined, {
        appContext: scopedAppContext,
      })}
    </LocaleProfileProvider>
  );
}
