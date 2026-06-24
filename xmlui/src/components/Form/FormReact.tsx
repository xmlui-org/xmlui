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
  cancelLabel?: string;
  hideButtonRow?: boolean;
  hideButtonRowUntilDirty?: boolean;
  enableSubmit?: boolean;
  children?: ReactNode;
  onSubmit?: (values: FormValues) => void | Promise<unknown>;
  onSubmitFailed?: (errors: Record<string, string>) => void | Promise<unknown>;
  onCancel?: () => void | Promise<unknown>;
  registerComponentApi?: (api: Record<string, unknown>) => void;
} & Record<string, unknown>;

export function Form({
  className,
  style,
  data,
  enabled = true,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  hideButtonRow = false,
  hideButtonRowUntilDirty = false,
  enableSubmit = true,
  children,
  onSubmit,
  onSubmitFailed,
  onCancel,
  registerComponentApi,
  ...rest
}: FormProps) {
  const initialValues = useMemo(() => normalizeValues(data), [data]);
  const itemsRef = useRef(new Map<string, FormItemRegistration>());
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(() => new Set());

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

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    for (const item of itemsRef.current.values()) {
      if (item.required && isEmpty(values[item.name])) {
        nextErrors[item.name] = item.requiredInvalidMessage ||
          `${item.label || item.name} is required.`;
      }
    }
    setErrors(nextErrors);
    return nextErrors;
  }, [values]);

  const submit = useCallback(async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      await onSubmitFailed?.(nextErrors);
      return;
    }
    await onSubmit?.(values);
  }, [onSubmit, onSubmitFailed, validate, values]);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  }, [submit]);
  const handleCancel = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setDirtyFields(new Set());
    void onCancel?.();
  }, [initialValues, onCancel]);
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setDirtyFields(new Set());
  }, [initialValues]);
  const update = useCallback((data: Record<string, unknown>) => {
    setValues((current) => ({ ...current, ...data }));
    setDirtyFields((current) => {
      const next = new Set(current);
      Object.keys(data).forEach((key) => next.add(key));
      return next;
    });
  }, []);
  const getData = useCallback(() => ({ ...values }), [values]);
  const isDirty = dirtyFields.size > 0;
  const shouldShowButtonRow = !hideButtonRow && (!hideButtonRowUntilDirty || isDirty);

  useEffect(() => {
    registerComponentApi?.({
      reset,
      update,
      getData,
      validate: () => {
        const nextErrors = validate();
        return {
          isValid: Object.keys(nextErrors).length === 0,
          data: { ...values },
          errors: Object.entries(nextErrors).map(([field, message]) => ({ field, message })),
          warnings: [],
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
      <FormProvider value={{ values, errors, dirtyFields, enabled, getValue, setValue, registerItem }}>
        <div className={styles.content} data-xmlui-part="content">
          {children}
        </div>
        {shouldShowButtonRow && (
          <div className={styles.buttonRow} data-xmlui-part="buttonRow">
            <Button type="submit" disabled={!enabled || !enableSubmit}>
              {saveLabel}
            </Button>
            <Button type="button" variant="outlined" disabled={!enabled} onClick={handleCancel}>
              {cancelLabel}
            </Button>
          </div>
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

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
