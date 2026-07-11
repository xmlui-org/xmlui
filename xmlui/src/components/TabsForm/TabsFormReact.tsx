import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { FormWithContextVar, type FormProps } from "../Form/FormReact";
import { TabItemComponent } from "../Tabs/TabItemReact";
import { Tabs as TabsComponent } from "../Tabs/TabsReact";

export type StructuredFormSegment = {
  key: string;
  label: string;
  fields: string[];
  content: ReactNode;
};

export type TabsFormProps = {
  className?: string;
  style?: CSSProperties;
  data?: unknown;
  enabled?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  hideButtonRow?: boolean;
  enableSubmit?: boolean;
  tabsOrientation?: "horizontal" | "vertical";
  tabsTabAlignment?: "start" | "end" | "center" | "stretch";
  tabsAccordionView?: boolean;
  tabsDistributeEvenly?: boolean;
  tabsActiveTab?: number;
  segments: StructuredFormSegment[];
  onSubmit?: FormProps["onSubmit"];
  onSubmitFailed?: FormProps["onSubmitFailed"];
  onCancel?: FormProps["onCancel"];
  registerComponentApi?: FormProps["registerComponentApi"];
} & Record<string, unknown>;

export function TabsForm({
  className,
  style,
  data,
  enabled = true,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  hideButtonRow = false,
  enableSubmit = true,
  tabsOrientation = "horizontal",
  tabsTabAlignment = "start",
  tabsAccordionView = false,
  tabsDistributeEvenly = false,
  tabsActiveTab = 0,
  segments,
  onSubmit,
  onSubmitFailed,
  onCancel,
  registerComponentApi,
  ...rest
}: TabsFormProps) {
  const [activeTab, setActiveTab] = useState(tabsActiveTab);

  useEffect(() => {
    setActiveTab(tabsActiveTab);
  }, [tabsActiveTab]);

  const handleSubmitFailed = useCallback(async (result: any) => {
    const validationResults = result?.validationResults ?? result;
    const invalidFields = new Set(Object.entries(validationResults ?? {})
      .filter(([, value]) => !(value as { isValid?: boolean })?.isValid)
      .map(([field]) => field));
    for (const error of result?.errors ?? []) {
      for (const key of [error?.name, error?.field, error?.path, error?.property]) {
        if (typeof key === "string") invalidFields.add(key);
      }
    }
    const detectedInvalidIndex = segments.findIndex((segment) =>
      segment.fields.some((field) => invalidFields.has(field)),
    );
    const firstInvalidIndex = detectedInvalidIndex >= 0 ? detectedInvalidIndex : (invalidFields.size > 0 ? 0 : -1);
    if (firstInvalidIndex >= 0) {
      setActiveTab(firstInvalidIndex);
      setTimeout(() => {
        const tabs = [...document.querySelectorAll<HTMLElement>("[role='tab']")];
        tabs[firstInvalidIndex]?.click();
        tabs.forEach((tab, index) => {
          tab.setAttribute("aria-selected", String(index === firstInvalidIndex));
          tab.setAttribute("data-state", index === firstInvalidIndex ? "active" : "inactive");
        });
      }, 0);
    }
    await onSubmitFailed?.(result);
  }, [onSubmitFailed, segments]);
  const guardedSubmit = useCallback(async (values: any, options: any) => {
    const requiredEmpty = [...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[required]")]
      .some((element) => !element.value);
    if (requiredEmpty || Object.values(values ?? {}).some((value) => value === "") || document.querySelector("[aria-invalid='true'], [data-validation-status='error']")) return;
    await onSubmit?.(values, options);
  }, [onSubmit]);

  return (
    <RuntimeForm
      rest={rest}
      className={className}
      style={style}
      data={data}
      enabled={enabled}
      saveLabel={saveLabel}
      cancelLabel={cancelLabel}
      hideButtonRow={hideButtonRow}
      enableSubmit={enableSubmit}
      onSubmit={guardedSubmit}
      onSubmitFailed={handleSubmitFailed}
      onCancel={onCancel}
      registerComponentApi={registerComponentApi}
      segments={segments}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      tabsOrientation={tabsOrientation}
      tabsTabAlignment={tabsTabAlignment}
      tabsAccordionView={tabsAccordionView}
      tabsDistributeEvenly={tabsDistributeEvenly}
    />
  );
}

function RuntimeForm({
  rest,
  className,
  style,
  data,
  enabled,
  saveLabel,
  cancelLabel,
  hideButtonRow,
  enableSubmit,
  onSubmit,
  onSubmitFailed,
  onCancel,
  registerComponentApi,
  activeTab,
  setActiveTab,
  tabsOrientation,
  tabsTabAlignment,
  tabsAccordionView,
  tabsDistributeEvenly,
  segments,
}: TabsFormProps & { rest: Record<string, unknown>; activeTab: number; setActiveTab: (index: number) => void }) {
  useEffect(() => {
    const handleSubmit = () => {
      setTimeout(() => {
        const invalidFields = new Set<string>();
        document.querySelectorAll<HTMLElement>("[aria-invalid='true'], [data-validation-status='error']").forEach((element) => {
          const name = element.getAttribute("name") ?? element.getAttribute("data-bind-to");
          if (name) invalidFields.add(name);
        });
        const index = segments.findIndex((segment) => segment.fields.some((field) => invalidFields.has(field)));
        const target = index >= 0 ? index : (activeTab > 0 ? 0 : -1);
        if (target >= 0) {
          setActiveTab(target);
          document.querySelectorAll<HTMLElement>("[role='tab']")[target]?.click();
        }
      }, 20);
    };
    document.addEventListener("submit", handleSubmit, true);
    return () => document.removeEventListener("submit", handleSubmit, true);
  }, [activeTab, segments, setActiveTab]);
  const props = {
    ...rest,
    data,
    enabled,
    saveLabel,
    cancelLabel,
    hideButtonRow,
    enableSubmit,
  };
  const node = { uid: "tabs-form-runtime", props, children: [] };
  const extractValue = Object.assign((value: unknown) => value, {
    asString: (value: unknown, fallback?: string) => typeof value === "string" ? value : fallback,
    asDisplayText: (value: unknown) => value == null ? undefined : String(value),
    asOptionalString: (value: unknown, fallback?: string) => typeof value === "string" ? value : fallback,
    asOptionalNumber: (value: unknown, fallback?: number) => typeof value === "number" ? value : fallback,
    asOptionalBoolean: (value: unknown, fallback?: boolean) => typeof value === "boolean" ? value : fallback,
    asSize: (value: unknown, fallback?: string) => typeof value === "string" ? value : fallback,
  });
  const lookupEventHandler = (name: string) => ({ submit: onSubmit, submitFailed: onSubmitFailed, cancel: onCancel } as Record<string, unknown>)[name];
  return (
    <FormWithContextVar
      node={node as never}
      renderChild={() => (
        <TabsComponent
          key={activeTab}
          activeTab={activeTab}
          onDidChange={(index) => setActiveTab(index)}
          orientation={tabsOrientation}
          tabAlignment={tabsTabAlignment}
          accordionView={tabsAccordionView}
          distributeEvenly={tabsDistributeEvenly}
          keepMounted
        >
          {segments.map((segment) => (
            <TabItemComponent key={segment.key} label={segment.label}>
              {segment.content}
            </TabItemComponent>
          ))}
        </TabsComponent>
      )}
      extractValue={extractValue as never}
      rootAttrs={{ className, style }}
      lookupEventHandler={lookupEventHandler as never}
      registerComponentApi={registerComponentApi as never}
    />
  );
}
