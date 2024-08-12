import { useMemo } from "react";
import { Stack } from "@components/Stack/Stack";
import {Icon} from "@components/Icon/Icon";
import { Text } from "@components/Text/Text";
import classnames from "@components-core/utils/classnames";
import styles from "./ValidationSummary.module.scss";
import { SpaceFiller } from "@components/SpaceFiller/SpaceFiller";
import { Button } from "@components/Button/Button";
import { SingleValidationResult, ValidationResult, ValidationSeverity } from "@components/Form/FormContext";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "@components-core/constants";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function ValidationSummary({
  fieldValidationResults = EMPTY_OBJECT,
  generalValidationResults = EMPTY_ARRAY,
}: {
  fieldValidationResults?: Record<string, ValidationResult>;
  generalValidationResults: Array<SingleValidationResult>;
}) {
  const [animateContainerRef] = useAutoAnimate({ duration: 100 });
  const groupedInvalidResults = useMemo(() => {
    const ret: Record<ValidationSeverity | string, Array<ValidationIssue>> = {};
    Object.entries(fieldValidationResults).forEach(([field, validationResult]) => {
      validationResult.validations.forEach((singleValidationResult) => {
        if (!singleValidationResult.isValid) {
          ret[singleValidationResult.severity] = ret[singleValidationResult.severity] || [];
          ret[singleValidationResult.severity].push({
            field,
            message: singleValidationResult.invalidMessage || "",
          });
        }
      });
    });
    generalValidationResults.forEach((singleValidationResult) => {
      ret[singleValidationResult.severity] = ret[singleValidationResult.severity] || [];
      ret[singleValidationResult.severity].push({
        message: singleValidationResult.invalidMessage || "",
      });
    });
    return ret;
  }, [fieldValidationResults, generalValidationResults]);

  return (
    <div ref={animateContainerRef} className={styles.summaryContainer}>
      <ValidationDisplay issues={groupedInvalidResults.warning} severity={"warning"} heading={"Validation warnings"} />
      <ValidationDisplay issues={groupedInvalidResults.error} severity={"error"} heading={"Validation errors"} />
    </div>
  );
}

type ValidationDisplayProps = {
  heading?: string;
  issues: Array<ValidationIssue>;
  severity?: ValidationSeverity | "info";
  onClose?: (...args: any[]) => any;
};

type ValidationIssue = { field?: string; message: string };

const ValidationDisplay = ({ heading, issues = EMPTY_ARRAY, severity = "error", onClose }: ValidationDisplayProps) => {
  const [animateContainerRef] = useAutoAnimate({ duration: 100 });
  if (issues.length === 0) {
    return null;
  }
  return (
    <div
      className={classnames(styles.validationContainer, {
        [styles.valid]: severity === "valid",
        [styles.info]: severity === "info",
        [styles.warning]: severity === "warning",
        [styles.error]: severity === "error",
      })}
      style={{ paddingTop: !onClose ? "0.5rem" : undefined }}
    >
      <Stack orientation="horizontal" verticalAlignment="center" layout={{ gap: "0.5rem" }}>
        <Icon className={styles.heading} name={severity} size="md" />
        <div className={styles.heading}>
          <Text>{heading}</Text>
        </div>
        {!!onClose && (
          <>
            <SpaceFiller />
            <Button
              onClick={onClose}
              variant={"ghost"}
              themeColor={"secondary"}
              icon={<Icon name={"close"} size={"sm"} />}
              orientation={"vertical"}
            />
          </>
        )}
      </Stack>
      <ul ref={animateContainerRef}>
        {issues.map((issue, i) => (
          <ValidationEntry key={i} issue={issue} />
        ))}
      </ul>
    </div>
  );
};

// --- ValidationEntry
const ValidationEntry = ({ issue }: { issue: ValidationIssue }) => {
  const { field, message } = issue;
  return (
    <li>
      <span style={{ display: "inline-flex", gap: field ? "0.25rem" : undefined }}>
        {field && <Text variant="small" fontWeight="bold">{`${field}:`}</Text>}
        <Text variant="small" preserveLinebreaks={true}>
          {message}
        </Text>
      </span>
    </li>
  );
};
