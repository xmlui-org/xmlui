import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type FormEvent,
  type MutableRefObject,
  type ReactNode,
  type SetStateAction,
} from "react";

import { Button } from "../Button/ButtonReact";
import { useModalFormClose } from "../ModalDialog/ModalVisibilityContext";
import { ValidationSummary } from "../ValidationSummary/ValidationSummaryReact";
import {
  FormProvider,
  type FormItemRegistration,
  type FormContextValue,
  type FormValidationIssue,
  type FormValues,
} from "./FormContext";
import styles from "./Form.module.scss";

export type FormProps = {
  id?: string;
  className?: string;
  style?: CSSProperties;
  data?: unknown;
  enabled?: boolean;
  saveLabel?: string;
  savePendingLabel?: string;
  submitFeedbackDelay?: number;
  cancelLabel?: string;
  swapCancelAndSave?: boolean;
  hideButtonRow?: boolean;
  hideButtonRowUntilDirty?: boolean;
  stickyButtonRow?: boolean;
  persist?: boolean;
  storageKey?: string;
  doNotPersistFields?: string[];
  keepOnCancel?: boolean;
  enableSubmit?: boolean;
  submitUrl?: string;
  submitMethod?: string;
  dataAfterSubmit?: "keep" | "reset" | "clear" | string;
  itemLabelPosition?: string;
  itemLabelWidth?: string | number;
  itemLabelBreak?: boolean;
  itemRequireLabelMode?: string;
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
  buttonRowTemplate?: ReactNode;
  children?: ReactNode;
  renderContent?: (dataContext: FormDataContext) => ReactNode;
  onWillSubmit?: (values: FormValues, allValues: FormValues) => unknown | Promise<unknown>;
  onSubmit?: (values: FormValues) => void | Promise<unknown>;
  onSubmitFailed?: (errors: Record<string, string>) => void | Promise<unknown>;
  onCancel?: () => void | Promise<unknown>;
  onReset?: () => void | Promise<unknown>;
  onSuccess?: (result: unknown) => void | Promise<unknown>;
  onSaved?: (result: unknown) => void | Promise<unknown>;
  registerComponentApi?: (api: Record<string, unknown>) => void;
} & Record<string, unknown>;

export type FormDataContext = FormValues & {
  update: (data: Record<string, unknown>) => void;
};

export function Form({
  id,
  className,
  style,
  data,
  enabled = true,
  saveLabel = "Save",
  savePendingLabel = "Validating...",
  submitFeedbackDelay = 100,
  cancelLabel = "Cancel",
  swapCancelAndSave = false,
  hideButtonRow = false,
  hideButtonRowUntilDirty = false,
  stickyButtonRow = false,
  persist = false,
  storageKey,
  doNotPersistFields,
  keepOnCancel = false,
  enableSubmit = true,
  submitUrl,
  submitMethod,
  dataAfterSubmit = "keep",
  itemLabelPosition,
  itemLabelWidth,
  itemLabelBreak,
  itemRequireLabelMode,
  verboseValidationFeedback,
  validationIconSuccess = "checkmark",
  validationIconError = "error",
  buttonRowTemplate,
  children,
  renderContent,
  onWillSubmit,
  onSubmit,
  onSubmitFailed,
  onCancel,
  onReset,
  onSuccess,
  onSaved,
  registerComponentApi,
  ...rest
}: FormProps) {
  const normalizedInputValues = useMemo(() => normalizeValues(data), [data]);
  const effectiveSubmitUrl = submitUrl ?? (isDataUrl(data) ? data : undefined);
  const persistKey = persist ? storageKey || id || "form-data" : undefined;
  const itemsRef = useRef(new Map<string, FormItemRegistration>());
  const knownItemsRef = useRef(new Map<string, FormItemRegistration>());
  const validationRunsRef = useRef(new Map<string, number>());
  const validationCacheRef = useRef(new Map<string, { value: unknown; issues: FormValidationIssue[] }>());
  const requestModalFormClose = useModalFormClose();
  const [initialValues, setInitialValues] = useState<FormValues>(normalizedInputValues);
  const [values, setValues] = useState<FormValues>(normalizedInputValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [issues, setIssues] = useState<FormValidationIssue[]>([]);
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(() => new Set());
  const [validatingFields, setValidatingFields] = useState<Set<string>>(() => new Set());
  const [showValidatingLabel, setShowValidatingLabel] = useState(false);
  const [registrationVersion, setRegistrationVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const applyValues = (nextValues: FormValues) => {
      if (cancelled) {
        return;
      }
      setInitialValues(nextValues);
      setValues(nextValues);
      setErrors({});
      setIssues([]);
      setDirtyFields(new Set());
      validationCacheRef.current.clear();
    };

    if (!isDataUrl(data)) {
      return () => {
        cancelled = true;
      };
    }

    fetch(data)
      .then((response) => response.ok ? response.json() : undefined)
      .then((loadedData) => applyValues(normalizeValues(loadedData)))
      .catch(() => applyValues({}));

    return () => {
      cancelled = true;
    };
  }, [data]);

  useEffect(() => {
    if (!persistKey) {
      return;
    }
    const savedValues = readPersistedValues(persistKey);
    if (!savedValues) {
      return;
    }
    setInitialValues(savedValues);
    setValues(savedValues);
    setErrors({});
    setIssues([]);
    setDirtyFields(new Set());
    validationCacheRef.current.clear();
  }, [persistKey]);

  useEffect(() => {
    if (!persistKey) {
      return;
    }
    writePersistedValues(persistKey, values, doNotPersistFields);
  }, [doNotPersistFields, persistKey, values]);

  const getValue = useCallback((name: string) => getPathValue(values, name), [values]);
  const setValue = useCallback((name: string, value: unknown) => {
    setValues((current) => setPathValue(current, name, value));
    setDirtyFields((current) => {
      const next = new Set(current);
      next.add(name);
      return next;
    });
    setErrors((current) => {
      if (!(name in current)) {
        return current;
      }
      const next = { ...current };
      delete next[name];
      return next;
    });
    setIssues((current) => current.filter((issue) => issue.field !== name));
    validationCacheRef.current.delete(name);
  }, []);
  const registerItem = useCallback((registration: FormItemRegistration) => {
    const activeRegistration = mergeFormItemRegistration(itemsRef.current.get(registration.name), registration);
    const knownRegistration = mergeFormItemRegistration(knownItemsRef.current.get(registration.name), registration);
    itemsRef.current.set(registration.name, activeRegistration);
    knownItemsRef.current.set(registration.name, knownRegistration);
    setRegistrationVersion((version) => version + 1);
    return () => {
      const current = itemsRef.current.get(registration.name);
      if (current === activeRegistration) {
        itemsRef.current.delete(registration.name);
        setRegistrationVersion((version) => version + 1);
      }
    };
  }, []);

  const validateItem = useCallback(async (
    item: FormItemRegistration,
    value: unknown,
  ): Promise<FormValidationIssue[]> => {
    const itemIssues: FormValidationIssue[] = [];
    if (item.required && isEmpty(value)) {
      itemIssues.push(validationIssue(item.name, item.requiredInvalidMessage || "This field is required"));
    }
    if (item.minLength !== undefined && !isEmpty(value) && String(value).length < item.minLength) {
      itemIssues.push(validationIssue(
        item.name,
        item.lengthInvalidMessage || `Input should be at least ${item.minLength} characters`,
      ));
    }
    if (item.pattern && !isEmpty(value) && !matchesPattern(String(value), item.pattern)) {
      itemIssues.push(validationIssue(
        item.name,
        item.patternInvalidMessage || defaultPatternInvalidMessage(item.pattern),
        item.patternInvalidSeverity,
      ));
    }
    if (item.regex && !isEmpty(value) && !matchesRegex(String(value), item.regex)) {
      itemIssues.push(validationIssue(
        item.name,
        item.regexInvalidMessage || "Invalid input",
        item.regexInvalidSeverity,
      ));
    }
    if (item.matchValue !== undefined && !Object.is(value, item.matchValue)) {
      itemIssues.push(validationIssue(item.name, item.matchInvalidMessage || "Input does not match"));
    }
    const customResults = normalizeValidationResults(await item.validate?.(value));
    itemIssues.push(
      ...customResults
        .filter((result) => !result.isValid)
        .map((result) => validationIssue(item.name, result.invalidMessage || "Invalid input", result.severity)),
    );
    return itemIssues;
  }, []);

  const validateField = useCallback(async (name: string, value?: unknown) => {
    const item = itemsRef.current.get(name);
    if (!item) {
      return undefined;
    }
    const runId = (validationRunsRef.current.get(name) ?? 0) + 1;
    validationRunsRef.current.set(name, runId);
    if (item.validate) {
      setValidatingFields((current) => {
        const next = new Set(current);
        next.add(name);
        return next;
      });
    }
    const currentValue = value ?? getPathValue(values, name);
    const fieldIssues = await validateItem(item, currentValue);
    const message = messageFromIssues(fieldIssues);
    if (validationRunsRef.current.get(name) !== runId) {
      return message;
    }
    validationCacheRef.current.set(name, { value: currentValue, issues: fieldIssues });
    setErrors((current) => {
      const next = { ...current };
      if (message) {
        next[name] = message;
      } else {
        delete next[name];
      }
      return next;
    });
    setIssues((current) => [
      ...current.filter((issue) => issue.field !== name),
      ...fieldIssues,
    ]);
    setValidatingFields((current) => {
      if (!current.has(name)) {
        return current;
      }
      const next = new Set(current);
      next.delete(name);
      return next;
    });
    return message;
  }, [validateItem, values]);
  const isFieldValid = useCallback((name: string) => {
    if (errors[name]) {
      return false;
    }
    const item = itemsRef.current.get(name);
    if (!item) {
      return true;
    }
    return validateItemSync(item, getPathValue(values, name)).length === 0;
  }, [errors, values]);

  const validate = useCallback(async () => {
    const nextErrors: Record<string, string> = {};
    const nextIssues: FormValidationIssue[] = [];
    for (const item of itemsRef.current.values()) {
      const value = getPathValue(values, item.name);
      const cached = validationCacheRef.current.get(item.name);
      const itemIssues = cached && Object.is(cached.value, value)
        ? cached.issues
        : await validateItem(item, value);
      const message = messageFromIssues(itemIssues);
      if (message) {
        nextErrors[item.name] = message;
      }
      nextIssues.push(...itemIssues);
    }
    setErrors(nextErrors);
    setIssues(nextIssues);
    return nextErrors;
  }, [validateItem, values]);

  const submit = useCallback(async () => {
    if (validatingFields.size > 0) {
      return;
    }
    const nextErrors = await validate();
    if (Object.keys(nextErrors).length > 0) {
      await onSubmitFailed?.(nextErrors);
      return;
    }
    let dataToSubmit = cleanedSubmitValues(values, knownItemsRef.current);
    const allData = { ...values };
    const willSubmitResult = await onWillSubmit?.(dataToSubmit, allData);
    if (willSubmitResult === false) {
      return;
    }
    if (isPlainObject(willSubmitResult)) {
      dataToSubmit = { ...(willSubmitResult as FormValues) };
    }
    const result = effectiveSubmitUrl
      ? await submitToUrl(effectiveSubmitUrl, resolveSubmitMethod(submitMethod, data), dataToSubmit)
      : await onSubmit?.(dataToSubmit);
    if (isSubmitValidationFailure(result)) {
      const submitIssues = normalizeSubmitIssues(result.error);
      setIssues(submitIssues);
      setErrors(errorsFromIssues(submitIssues));
      await onSubmitFailed?.(errorsFromIssues(submitIssues));
      return;
    }
    setIssues([]);
    setErrors({});
    if (persistKey) {
      deletePersistedValues(persistKey);
    }
    applyDataAfterSubmit(dataAfterSubmit, initialValues, setValues, setDirtyFields, validationCacheRef);
    await onSuccess?.(result);
    await onSaved?.(result);
  }, [data, dataAfterSubmit, effectiveSubmitUrl, initialValues, onSaved, onSubmit, onSubmitFailed, onSuccess, onWillSubmit, persistKey, submitMethod, validate, validatingFields.size, values]);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void submit();
  }, [submit]);
  const handleCancel = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIssues([]);
    setDirtyFields(new Set());
    setValidatingFields(new Set());
    validationCacheRef.current.clear();
    if (persistKey && !keepOnCancel) {
      deletePersistedValues(persistKey);
    }
    void onCancel?.();
    void requestModalFormClose();
  }, [initialValues, keepOnCancel, onCancel, persistKey, requestModalFormClose]);
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIssues([]);
    setDirtyFields(new Set());
    setValidatingFields(new Set());
    validationCacheRef.current.clear();
    void onReset?.();
  }, [initialValues, onReset]);
  const update = useCallback((data: Record<string, unknown>) => {
    setValues((current) => ({ ...current, ...data }));
    Object.keys(data).forEach((key) => validationCacheRef.current.delete(key));
    setDirtyFields((current) => {
      const next = new Set(current);
      Object.keys(data).forEach((key) => next.add(key));
      return next;
    });
  }, []);
  const dataContext = useMemo<FormDataContext>(() => ({
    ...values,
    update,
  }), [update, values]);
  const getData = useCallback(() => cleanedSubmitValues(values, knownItemsRef.current), [values]);
  const isDirty = dirtyFields.size > 0;
  const isValidating = validatingFields.size > 0;
  const shouldShowButtonRow = !hideButtonRow && (!hideButtonRowUntilDirty || isDirty);
  const shouldShowCancelButton = cancelLabel !== "";
  const formContextValue = useMemo<FormContextValue>(() => ({
    values,
    errors,
    issues,
    dirtyFields,
    validatingFields,
    enabled,
    itemLabelPosition,
    itemLabelWidth,
    itemLabelBreak,
    itemRequireLabelMode,
    verboseValidationFeedback,
    validationIconSuccess,
    validationIconError,
    getValue,
    setValue,
    isFieldValid,
    validateField,
    registerItem,
  }), [
    dirtyFields,
    enabled,
    errors,
    getValue,
    isFieldValid,
    issues,
    itemLabelBreak,
    itemLabelPosition,
    itemLabelWidth,
    itemRequireLabelMode,
    registerItem,
    registrationVersion,
    setValue,
    validateField,
    validatingFields,
    values,
    validationIconError,
    validationIconSuccess,
    verboseValidationFeedback,
  ]);

  useEffect(() => {
    if (!isValidating) {
      setShowValidatingLabel(false);
      return;
    }
    const timer = setTimeout(() => setShowValidatingLabel(true), submitFeedbackDelay);
    return () => clearTimeout(timer);
  }, [isValidating, submitFeedbackDelay]);

  useEffect(() => {
    registerComponentApi?.({
      reset,
      update,
      getData,
      validate: async () => {
        const nextErrors = await validate();
        const validationResults = Object.fromEntries(
          Object.entries(nextErrors).map(([field, message]) => [
            field,
            { field, message, severity: "error", isValid: false },
          ]),
        );
        return {
          isValid: Object.keys(nextErrors).length === 0,
          data: getData(),
          errors: Object.entries(nextErrors).map(([field, message]) => ({ field, message })),
          warnings: [],
          validationResults,
        };
      },
    });
  }, [getData, registerComponentApi, reset, update, validate]);

  const submitButton = (
    <Button
      key="submit"
      type="submit"
      data-part-id="submitButton"
      data-xmlui-part="submitButton"
      disabled={!enabled || !enableSubmit || isValidating}
    >
      {showValidatingLabel ? savePendingLabel : saveLabel}
    </Button>
  );

  const cancelButton = shouldShowCancelButton ? (
    <Button
      key="cancel"
      type="button"
      variant="outlined"
      data-part-id="cancelButton"
      data-xmlui-part="cancelButton"
      disabled={!enabled}
      onClick={handleCancel}
    >
      {cancelLabel}
    </Button>
  ) : null;

  return (
    <form
      {...rest}
      id={id}
      className={cx(styles.form, stickyButtonRow && styles.stickyForm, className)}
      style={style}
      onSubmit={handleSubmit}
      noValidate
    >
      <FormProvider value={formContextValue}>
        <div className={styles.content} data-xmlui-part="content">
          {renderContent ? renderContent(dataContext) : children}
        </div>
        {issues.length > 0 && Object.keys(errors).length !== issues.length && <ValidationSummary />}
        {shouldShowButtonRow && (
          buttonRowTemplate ?? (
            <div
              className={cx(styles.buttonRow, stickyButtonRow && styles.stickyButtonRow)}
              data-xmlui-part="buttonRow"
            >
              {swapCancelAndSave
                ? [submitButton, cancelButton]
                : [cancelButton, submitButton]}
            </div>
          )
        )}
      </FormProvider>
    </form>
  );
}

function normalizeValues(data: unknown): FormValues {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return { ...(data as FormValues) };
  }
  return {};
}

function mergeFormItemRegistration(
  existing: FormItemRegistration | undefined,
  registration: FormItemRegistration,
): FormItemRegistration {
  if (!existing) {
    return registration;
  }
  return {
    ...registration,
    noSubmit: existing.noSubmit || registration.noSubmit,
    sanitizeSubmitValue: registration.sanitizeSubmitValue ?? existing.sanitizeSubmitValue,
  };
}

function readPersistedValues(key: string): FormValues | undefined {
  try {
    const stored = globalThis.localStorage?.getItem(key);
    if (!stored) {
      return undefined;
    }
    return normalizeValues(JSON.parse(stored));
  } catch {
    return undefined;
  }
}

function writePersistedValues(
  key: string,
  values: FormValues,
  doNotPersistFields: string[] | undefined,
) {
  try {
    const excluded = new Set(doNotPersistFields ?? []);
    const dataToSave = Object.fromEntries(
      Object.entries(values).filter(([field]) => !excluded.has(field)),
    );
    globalThis.localStorage?.setItem(key, JSON.stringify(dataToSave));
  } catch {
    // Persistence is best-effort compatibility behavior.
  }
}

function deletePersistedValues(key: string) {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // Persistence is best-effort compatibility behavior.
  }
}

function applyDataAfterSubmit(
  mode: string | undefined,
  initialValues: FormValues,
  setValues: Dispatch<SetStateAction<FormValues>>,
  setDirtyFields: Dispatch<SetStateAction<Set<string>>>,
  validationCacheRef: MutableRefObject<Map<string, { value: unknown; message?: string }>>,
) {
  if (mode === "reset") {
    setValues(initialValues);
  } else if (mode === "clear") {
    setValues({});
  } else {
    return;
  }
  setDirtyFields(new Set());
  validationCacheRef.current.clear();
}

function isDataUrl(data: unknown): data is string {
  return typeof data === "string" && data.startsWith("/");
}

function getPathValue(values: FormValues, name: string): unknown {
  if (Object.prototype.hasOwnProperty.call(values, name)) {
    return values[name];
  }
  const path = formPath(name);
  if (path.length <= 1) {
    return values[name];
  }
  let current: unknown = values;
  for (const segment of path) {
    if (!isPlainObject(current) && !Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function setPathValue(values: FormValues, name: string, value: unknown): FormValues {
  const path = formPath(name);
  if (path.length <= 1) {
    return { ...values, [name]: value };
  }
  const next = Array.isArray(values) ? ([...values] as unknown as FormValues) : { ...values };
  let current: Record<string, unknown> | unknown[] = next;
  path.slice(0, -1).forEach((segment, index) => {
    const child = (current as Record<string, unknown>)[segment];
    const nextSegment = path[index + 1];
    const nextChild = Array.isArray(child)
      ? [...child]
      : isPlainObject(child)
        ? { ...child }
        : isArrayIndex(nextSegment)
          ? []
          : {};
    (current as Record<string, unknown>)[segment] = nextChild;
    current = nextChild;
  });
  (current as Record<string, unknown>)[path[path.length - 1]] = value;
  return next;
}

function formPath(name: string): string[] {
  return name.split(".").filter(Boolean);
}

function isArrayIndex(value: string | undefined): boolean {
  return value !== undefined && /^(0|[1-9]\d*)$/.test(value);
}

function cleanedSubmitValues(
  values: FormValues,
  items: Map<string, FormItemRegistration>,
): FormValues {
  let cleaned: FormValues = {};
  for (const item of items.values()) {
    if (item.noSubmit || item.name.endsWith("__UNBOUND_FIELD__")) {
      continue;
    }
    const rawValue = getPathValue(values, item.name);
    const value = item.sanitizeSubmitValue ? item.sanitizeSubmitValue(rawValue) : rawValue;
    if (value === undefined) {
      continue;
    }
    cleaned = setPathValue(cleaned, item.name, deepClone(value));
  }
  return cleaned;
}

function deepClone<T>(value: T): T {
  if (
    (typeof File !== "undefined" && value instanceof File) ||
    (typeof Blob !== "undefined" && value instanceof Blob)
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, deepClone(entryValue)]),
    ) as T;
  }
  return value;
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function validateItemSync(
  item: FormItemRegistration,
  value: unknown,
): FormValidationIssue[] {
  const itemIssues: FormValidationIssue[] = [];
  if (item.required && isEmpty(value)) {
    itemIssues.push(validationIssue(item.name, item.requiredInvalidMessage || "This field is required"));
  }
  if (item.minLength !== undefined && !isEmpty(value) && String(value).length < item.minLength) {
    itemIssues.push(validationIssue(
      item.name,
      item.lengthInvalidMessage || `Input should be at least ${item.minLength} characters`,
    ));
  }
  if (item.pattern && !isEmpty(value) && !matchesPattern(String(value), item.pattern)) {
    itemIssues.push(validationIssue(
      item.name,
      item.patternInvalidMessage || defaultPatternInvalidMessage(item.pattern),
      item.patternInvalidSeverity,
    ));
  }
  if (item.regex && !isEmpty(value) && !matchesRegex(String(value), item.regex)) {
    itemIssues.push(validationIssue(
      item.name,
      item.regexInvalidMessage || "Invalid input",
      item.regexInvalidSeverity,
    ));
  }
  if (item.matchValue !== undefined && !Object.is(value, item.matchValue)) {
    itemIssues.push(validationIssue(item.name, item.matchInvalidMessage || "Input does not match"));
  }
  return itemIssues;
}

type SubmitValidationFailure = {
  ok: false;
  error: unknown;
};

async function submitToUrl(url: string, method: string, values: FormValues): Promise<unknown> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  const text = await response.text();
  const parsed = parseResponseText(text);
  if (!response.ok) {
    return { ok: false, error: parsed } satisfies SubmitValidationFailure;
  }
  return parsed;
}

function parseResponseText(text: string): unknown {
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isSubmitValidationFailure(value: unknown): value is SubmitValidationFailure {
  return isPlainObject(value) && value.ok === false && "error" in value;
}

function normalizeSubmitIssues(value: unknown): FormValidationIssue[] {
  const payload = extractErrorPayload(value);
  const rawIssues = Array.isArray(payload?.issues) ? payload.issues : [];
  const issues = rawIssues.flatMap((issue) => {
    const normalized = normalizeSubmitIssue(issue);
    return normalized ? [normalized] : [];
  });
  if (issues.length > 0) {
    return issues;
  }
  if (typeof payload?.message === "string" && payload.message.length > 0) {
    return [{ message: payload.message, severity: "error" }];
  }
  return [{ message: "Submit failed", severity: "error" }];
}

function extractErrorPayload(value: unknown): Record<string, unknown> | undefined {
  if (!isPlainObject(value)) {
    return undefined;
  }
  if (isPlainObject(value.body)) {
    return value.body;
  }
  if (isPlainObject(value.error)) {
    return value.error;
  }
  return value;
}

function normalizeSubmitIssue(value: unknown): FormValidationIssue | undefined {
  if (!isPlainObject(value) || typeof value.message !== "string" || value.message.length === 0) {
    return undefined;
  }
  return {
    field: typeof value.field === "string" ? value.field : undefined,
    message: value.message,
    severity: value.severity === "warning" ? "warning" : "error",
  };
}

function errorsFromIssues(issues: FormValidationIssue[]): Record<string, string> {
  return Object.fromEntries(
    issues
      .filter((issue) => issue.field)
      .map((issue) => [issue.field as string, issue.message]),
  );
}

function resolveSubmitMethod(submitMethod: string | undefined, data: unknown): string {
  if (submitMethod) {
    return submitMethod.toUpperCase();
  }
  return isPlainObject(data) ? "PUT" : "POST";
}

function matchesPattern(value: string, pattern: string): boolean {
  if (pattern === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  if (pattern === "phone") {
    return /\d/.test(value);
  }
  if (pattern === "url") {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  try {
    return new RegExp(pattern).test(value);
  } catch {
    return true;
  }
}

function matchesRegex(value: string, regex: string): boolean {
  try {
    return stringToRegex(regex).test(value);
  } catch {
    return true;
  }
}

function stringToRegex(value: string): RegExp {
  const match = value.match(/^([/~@;%#'])(.*?)\1([gimsuy]*)$/);
  return match ? new RegExp(match[2], match[3]) : new RegExp(value);
}

function defaultPatternInvalidMessage(pattern: string): string {
  if (pattern === "phone") {
    return "Not a valid phone number";
  }
  if (pattern === "email") {
    return "Not a valid email address";
  }
  return "Invalid input";
}

function validationIssue(
  field: string,
  message: string,
  severity: string | undefined = "error",
): FormValidationIssue {
  return {
    field,
    message,
    severity: severity === "warning" ? "warning" : "error",
  };
}

function messageFromIssues(issues: FormValidationIssue[]): string | undefined {
  return issues.length > 0 ? issues.map((issue) => issue.message).join("\n") : undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

type SingleValidationResult = {
  isValid?: boolean;
  invalidMessage?: string;
  severity?: string;
};

function normalizeValidationResults(value: unknown): SingleValidationResult[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (typeof value === "string") {
    return [{ isValid: false, invalidMessage: value, severity: "error" }];
  }
  if (typeof value === "boolean") {
    return [{ isValid: value, invalidMessage: "Invalid input", severity: "error" }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeValidationResults(item));
  }
  if (typeof value === "object") {
    return [value as SingleValidationResult];
  }
  return [];
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
