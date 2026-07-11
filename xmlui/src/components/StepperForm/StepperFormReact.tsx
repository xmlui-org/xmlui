import type { CSSProperties } from "react";
import { useState, type ReactNode } from "react";

import { Button } from "../Button/ButtonReact";
import { useFormContext } from "../Form/FormContext";
import { FormWithContextVar, type FormProps } from "../Form/FormReact";
import stepperStyles from "../Stepper/Stepper.module.scss";
import styles from "./StepperForm.module.scss";

export type StructuredStepperSegment = {
  key: string;
  label: string;
  fields: string[];
  content: ReactNode;
};

export type StepperFormProps = {
  className?: string;
  style?: CSSProperties;
  data?: unknown;
  enabled?: boolean;
  backLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  stepperOrientation?: "horizontal" | "vertical";
  stepperNonLinear?: boolean;
  stepperStackedLabel?: boolean;
  segments: StructuredStepperSegment[];
  onSubmit?: FormProps["onSubmit"];
  onSubmitFailed?: FormProps["onSubmitFailed"];
  onCancel?: FormProps["onCancel"];
  registerComponentApi?: FormProps["registerComponentApi"];
  formHost?: {
    node: any;
    renderChild: (node: any) => ReactNode;
    extractValue: any;
    rootAttrs: Record<string, unknown>;
    lookupEventHandler: (name: string, options?: Record<string, unknown>) => any;
    registerComponentApi: (api: Record<string, unknown>) => void;
  };
} & Record<string, unknown>;

export function StepperForm({
  className,
  style,
  data,
  enabled = true,
  backLabel = "Back",
  nextLabel = "Next",
  submitLabel = "Submit",
  stepperOrientation = "horizontal",
  stepperNonLinear = false,
  stepperStackedLabel = false,
  segments,
  onSubmit,
  onSubmitFailed,
  onCancel,
  registerComponentApi,
  formHost,
  ...rest
}: StepperFormProps) {
  const body = (
    <StepperFormBody
      backLabel={backLabel}
      enabled={enabled}
      nextLabel={nextLabel}
      segments={segments}
      stepperNonLinear={stepperNonLinear}
      stepperOrientation={stepperOrientation}
      stepperStackedLabel={stepperStackedLabel}
      submitLabel={submitLabel}
    />
  );

  if (formHost) {
    return (
      <div className={cx(styles.stepperForm, className)} style={style}>
        <FormWithContextVar
          node={formHost.node}
          renderChild={() => body}
          extractValue={formHost.extractValue}
          rootAttrs={formHost.rootAttrs}
          lookupEventHandler={formHost.lookupEventHandler}
          registerComponentApi={formHost.registerComponentApi}
        />
      </div>
    );
  }

  return (
    <FormWithContextVar
      {...rest}
      rootAttrs={{ className: cx(styles.stepperForm, className), style }}
      node={{ uid: rest.id, props: { data, enabled, hideButtonRow: true }, children: [] }}
      renderChild={() => body}
      extractValue={fallbackExtractValue}
      lookupEventHandler={(name) => {
        if (name === "submit") return onSubmit;
        if (name === "submitFailed") return onSubmitFailed;
        if (name === "cancel") return onCancel;
        return undefined;
      }}
      registerComponentApi={registerComponentApi ?? (() => {})}
    />
  );
}

function fallbackExtractValue(value: unknown) {
  return value;
}

fallbackExtractValue.asOptionalBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true" ? true : value === "false" ? false : fallback;
  return value === undefined || value === null ? fallback : Boolean(value);
};
fallbackExtractValue.asOptionalNumber = (value: unknown, fallback?: number) => {
  if (value === undefined || value === null || value === "") return fallback;
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};
fallbackExtractValue.asOptionalString = (value: unknown, fallback?: string) =>
  value === undefined || value === null ? fallback : String(value);

function StepperFormBody({
  backLabel,
  enabled,
  nextLabel,
  segments,
  stepperNonLinear,
  stepperOrientation,
  stepperStackedLabel,
  submitLabel,
}: Pick<
  StepperFormProps,
  | "backLabel"
  | "enabled"
  | "nextLabel"
  | "segments"
  | "stepperNonLinear"
  | "stepperOrientation"
  | "stepperStackedLabel"
  | "submitLabel"
>) {
  const form = useFormContext();
  const [activeStep, setActiveStep] = useState(0);
  const boundedActiveStep = Math.min(Math.max(activeStep, 0), Math.max(segments.length - 1, 0));
  const isFirst = boundedActiveStep === 0;
  const isLast = boundedActiveStep >= segments.length - 1;
  const activeSegment = segments[boundedActiveStep];
  const isActiveSegmentValid = activeSegment?.fields.every((field) => form?.isFieldValid(field) ?? true) ?? true;
  const headerClassName = cx(
    stepperStyles.stepper,
    stepperOrientation === "horizontal" ? stepperStyles.horizontal : stepperStyles.vertical,
    stepperStackedLabel && stepperStyles.stackedLabel,
  );

  return (
    <>
      <div className={headerClassName} role="group" aria-label="Stepper">
        <div
          className={styles.headers}
          role={stepperOrientation === "horizontal" ? "list" : undefined}
        >
          {segments.map((segment, index) => {
            const active = index === boundedActiveStep;
            const itemInner = (
              <>
                <span
                  className={cx(
                    stepperStyles.iconCircle,
                    active && stepperStyles.active,
                  )}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className={stepperStyles.labelBlock}>
                  <span className={cx(stepperStyles.label, active && stepperStyles.active)}>
                    {segment.label}
                  </span>
                </span>
              </>
            );
            return stepperOrientation === "horizontal" ? (
              <Fragment key={segment.key}>
                <div className={stepperStyles.headerItem} role="listitem">
                  {stepperNonLinear ? (
                    <button
                      className={cx(stepperStyles.headerItemInner, stepperStyles.clickable)}
                      aria-current={active ? "step" : undefined}
                      onClick={() => setActiveStep(index)}
                      type="button"
                    >
                      {itemInner}
                    </button>
                  ) : (
                    <div
                      className={stepperStyles.headerItemInner}
                      aria-current={active ? "step" : undefined}
                    >
                      {itemInner}
                    </div>
                  )}
                </div>
                {index < segments.length - 1 && (
                  <div
                    className={cx(stepperStyles.connector, index < boundedActiveStep && stepperStyles.completed)}
                    aria-hidden="true"
                  />
                )}
              </Fragment>
            ) : (
              <button
                className={cx(
                  stepperStyles.verticalHeader,
                  stepperNonLinear && stepperStyles.clickable,
                )}
                aria-current={active ? "step" : undefined}
                disabled={!stepperNonLinear}
                key={segment.key}
                onClick={() => stepperNonLinear && setActiveStep(index)}
                type="button"
              >
                {itemInner}
              </button>
            );
          })}
        </div>
      </div>
      <div className={styles.content}>
        {segments[boundedActiveStep]?.content}
        <div className={styles.buttonRow}>
          {!isFirst && (
            <Button type="button" variant="outlined" onClick={() => setActiveStep((value) => Math.max(0, value - 1))}>
              {backLabel}
            </Button>
          )}
          {isLast ? (
            <Button type="submit" themeColor="primary" disabled={!enabled || !isActiveSegmentValid}>
              {submitLabel}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!enabled || !isActiveSegmentValid}
              onClick={() => setActiveStep((value) => Math.min(segments.length - 1, value + 1))}
            >
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

function Fragment({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
