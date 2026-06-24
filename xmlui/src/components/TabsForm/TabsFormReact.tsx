import type { CSSProperties, ReactNode } from "react";

import { Form, type FormProps } from "../Form/FormReact";
import { TabItemComponent } from "../Tabs/TabItemReact";
import { TabsComponent } from "../Tabs/TabsReact";

export type StructuredFormSegment = {
  key: string;
  label: string;
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
  return (
    <Form
      {...rest}
      className={className}
      style={style}
      data={data}
      enabled={enabled}
      saveLabel={saveLabel}
      cancelLabel={cancelLabel}
      hideButtonRow={hideButtonRow}
      enableSubmit={enableSubmit}
      onSubmit={onSubmit}
      onSubmitFailed={onSubmitFailed}
      onCancel={onCancel}
      registerComponentApi={registerComponentApi}
    >
      <TabsComponent
        activeTab={tabsActiveTab}
        orientation={tabsOrientation}
        tabAlignment={tabsTabAlignment}
        accordionView={tabsAccordionView}
        distributeEvenly={tabsDistributeEvenly}
        keepMounted
      >
        {segments.map((segment, index) => (
          <TabItemComponent
            key={segment.key}
            label={segment.label}
            index={index}
          >
            {segment.content}
          </TabItemComponent>
        ))}
      </TabsComponent>
    </Form>
  );
}
