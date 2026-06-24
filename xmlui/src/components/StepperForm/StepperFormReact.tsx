import type { CSSProperties } from "react";
import { useState, type ReactNode } from "react";

import { Button } from "../Button/ButtonReact";
import { Form, type FormProps } from "../Form/FormReact";
import styles from "./StepperForm.module.scss";

export type StructuredStepperSegment = {
  key: string;
  label: string;
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
  ...rest
}: StepperFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const boundedActiveStep = Math.min(Math.max(activeStep, 0), Math.max(segments.length - 1, 0));
  const isFirst = boundedActiveStep === 0;
  const isLast = boundedActiveStep >= segments.length - 1;

  return (
    <Form
      {...rest}
      className={cx(styles.stepperForm, className)}
      style={style}
      data={data}
      enabled={enabled}
      hideButtonRow
      onSubmit={onSubmit}
      onSubmitFailed={onSubmitFailed}
      onCancel={onCancel}
      registerComponentApi={registerComponentApi}
    >
      <div
        className={cx(styles.headers, stepperOrientation === "vertical" && styles.verticalHeaders)}
        role={stepperOrientation === "horizontal" ? "list" : undefined}
        aria-label="Stepper"
      >
        {segments.map((segment, index) => {
          const active = index === boundedActiveStep;
          const headerClassName = cx(
            styles.header,
            stepperNonLinear && styles.headerButton,
            active && styles.activeHeader,
            stepperStackedLabel && styles.stackedHeader,
          );
          return stepperOrientation === "horizontal" ? (
            <div role="listitem" key={segment.key}>
              <button
                className={headerClassName}
                disabled={!stepperNonLinear}
                onClick={() => stepperNonLinear && setActiveStep(index)}
                type="button"
              >
                {segment.label}
              </button>
            </div>
          ) : (
            <button
              className={headerClassName}
              disabled={!stepperNonLinear}
              key={segment.key}
              onClick={() => stepperNonLinear && setActiveStep(index)}
              type="button"
            >
              {segment.label}
            </button>
          );
        })}
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
            <Button type="submit" themeColor="primary">{submitLabel}</Button>
          ) : (
            <Button type="button" onClick={() => setActiveStep((value) => Math.min(segments.length - 1, value + 1))}>
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
