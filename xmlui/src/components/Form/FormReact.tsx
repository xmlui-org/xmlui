import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";

import { Button } from "../Button/ButtonReact";
import { FormProvider, type FormItemRegistration, type FormValues } from "./FormContext";
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
  hideButtonRow?: boolean;
  hideButtonRowUntilDirty?: boolean;
  enableSubmit?: boolean;
  itemLabelPosition?: string;
  itemLabelWidth?: string | number;
  itemLabelBreak?: boolean;
  itemRequireLabelMode?: string;
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
  className,
  style,
  data,
  enabled = true,
  saveLabel = "Save",
  savePendingLabel = "Validating...",
  submitFeedbackDelay = 100,
  cancelLabel = "Cancel",
  hideButtonRow = false,
  hideButtonRowUntilDirty = false,
  enableSubmit = true,
  itemLabelPosition,
  itemLabelWidth,
  itemLabelBreak,
  itemRequireLabelMode,
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
  const initialValues = useMemo(() => normalizeValues(data), [data]);
  const itemsRef = useRef(new Map<string, FormItemRegistration>());
  const validationRunsRef = useRef(new Map<string, number>());
  const validationCacheRef = useRef(new Map<string, { value: unknown; message?: string }>());
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(() => new Set());
  const [validatingFields, setValidatingFields] = useState<Set<string>>(() => new Set());
  const [showValidatingLabel, setShowValidatingLabel] = useState(false);

  const getValue = useCallback((name: string) => values[name], [values]);
  const setValue = useCallback((name: string, value: unknown) => {
    setValues((current) => ({ ...current, [name]: value }));
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
    validationCacheRef.current.delete(name);
  }, []);
  const registerItem = useCallback((registration: FormItemRegistration) => {
    itemsRef.current.set(registration.name, registration);
    return () => {
      const current = itemsRef.current.get(registration.name);
      if (current === registration) {
        itemsRef.current.delete(registration.name);
      }
    };
  }, []);

  const validateItem = useCallback(async (
    item: FormItemRegistration,
    value: unknown,
  ): Promise<string | undefined> => {
    if (item.required && isEmpty(value)) {
      return item.requiredInvalidMessage || "This field is required";
    }
    const customResults = normalizeValidationResults(await item.validate?.(value));
    const firstInvalid = customResults.find((result) => !result.isValid);
    return firstInvalid ? firstInvalid.invalidMessage || "Invalid input" : undefined;
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
    const message = await validateItem(item, value ?? values[name]);
    if (validationRunsRef.current.get(name) !== runId) {
      return message;
    }
    validationCacheRef.current.set(name, { value: value ?? values[name], message });
    setErrors((current) => {
      const next = { ...current };
      if (message) {
        next[name] = message;
      } else {
        delete next[name];
      }
      return next;
    });
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

  const validate = useCallback(async () => {
    const nextErrors: Record<string, string> = {};
    for (const item of itemsRef.current.values()) {
      const value = values[item.name];
      const cached = validationCacheRef.current.get(item.name);
      const message = cached && Object.is(cached.value, value)
        ? cached.message
        : await validateItem(item, value);
      if (message) {
        nextErrors[item.name] = message;
      }
    }
    setErrors(nextErrors);
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
    let dataToSubmit = { ...values };
    const allData = { ...values };
    const willSubmitResult = await onWillSubmit?.(dataToSubmit, allData);
    if (willSubmitResult === false) {
      return;
    }
    if (isPlainObject(willSubmitResult)) {
      dataToSubmit = { ...(willSubmitResult as FormValues) };
    }
    const result = await onSubmit?.(dataToSubmit);
    await onSuccess?.(result);
    await onSaved?.(result);
  }, [onSaved, onSubmit, onSubmitFailed, onSuccess, onWillSubmit, validate, validatingFields.size, values]);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  }, [submit]);
  const handleCancel = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setDirtyFields(new Set());
    setValidatingFields(new Set());
    validationCacheRef.current.clear();
    void onCancel?.();
  }, [initialValues, onCancel]);
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
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
  const getData = useCallback(() => ({ ...values }), [values]);
  const isDirty = dirtyFields.size > 0;
  const isValidating = validatingFields.size > 0;
  const shouldShowButtonRow = !hideButtonRow && (!hideButtonRowUntilDirty || isDirty);

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
          data: { ...values },
          errors: Object.entries(nextErrors).map(([field, message]) => ({ field, message })),
          warnings: [],
          validationResults,
        };
      },
    });
  }, [getData, registerComponentApi, reset, update, validate, values]);

  return (
    <form
      {...rest}
      className={cx(styles.form, className)}
      style={style}
      onSubmit={handleSubmit}
      noValidate
    >
      <FormProvider value={{
        values,
        errors,
        dirtyFields,
        validatingFields,
        enabled,
        itemLabelPosition,
        itemLabelWidth,
        itemLabelBreak,
        itemRequireLabelMode,
        getValue,
        setValue,
        validateField,
        registerItem,
      }}>
        <div className={styles.content} data-xmlui-part="content">
          {renderContent ? renderContent(dataContext) : children}
        </div>
        {shouldShowButtonRow && (
          buttonRowTemplate ?? (
            <div className={styles.buttonRow} data-xmlui-part="buttonRow">
              <Button type="submit" disabled={!enabled || !enableSubmit || isValidating}>
                {showValidatingLabel ? savePendingLabel : saveLabel}
              </Button>
              <Button type="button" variant="outlined" disabled={!enabled} onClick={handleCancel}>
                {cancelLabel}
              </Button>
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

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === "";
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
