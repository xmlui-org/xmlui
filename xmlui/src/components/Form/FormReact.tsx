import {
  type CSSProperties,
  type Dispatch,
  type FormEvent,
  type ForwardedRef,
  forwardRef,
  memo,
  type ReactNode,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import produce from "immer";

import styles from "./Form.module.scss";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type {
  LookupEventHandlerFn,
  RegisterComponentApiFn,
  RenderChildFn,
  ValueExtractor,
} from "../../abstractions/RendererDefs";
import type { ContainerAction } from "../../components-core/rendering/containers";
import { EMPTY_OBJECT } from "../../components-core/constants";
import type { GenericBackendError } from "../../components-core/EngineError";
import { useCallback } from "react";
import { useEvent } from "../../components-core/utils/misc";
import {
  backendValidationArrived,
  FormActionKind,
  formSubmitted,
  formSubmitting,
  triedToSubmit,
  UNBOUND_FIELD_SUFFIX,
} from "../../components/Form/formActions";
import { ThemedModalDialog as ModalDialog } from "../../components/ModalDialog/ModalDialog";
import { ThemedText as Text } from "../../components/Text/Text";
import { ThemedStack as Stack } from "../../components/Stack/Stack";
import { useModalFormClose } from "../../components/ModalDialog/ModalVisibilityContext";
import { ThemedButton as Button } from "../Button/Button";
import { ValidationSummary } from "../ValidationSummary/ValidationSummary";
import { groupInvalidValidationResultsBySeverity } from "../FormItem/Validations";
import { type FormAction, formReset } from "../Form/formActions";
import type { FormMd } from "./Form";
import type { InteractionFlags, SingleValidationResult, ValidationResult } from "./FormContext";
import { FormContext } from "./FormContext";
import { cloneDeep, get, set } from "lodash-es";
import classnames from "classnames";
import { Slot } from "@radix-ui/react-slot";
import { resolveLayoutProps } from "../../components-core/theming/layout-resolver";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { Part } from "../Part/Part";
import { MemoizedItem } from "../container-helpers";
import type { RequireLabelMode } from "../abstractions";
import {
  deleteLocalStorage,
  readLocalStorage,
  writeLocalStorage,
} from "../../components-core/appContext/local-storage-functions";

const PART_CANCEL_BUTTON = "cancelButton";
const PART_SUBMIT_BUTTON = "submitButton";

export const getByPath = (obj: any, path: string) => {
  return get(obj, path);
};

const formReducer = produce((state: FormState, action: ContainerAction | FormAction) => {
  const { uid } = action.payload;
  if (uid !== undefined && !state.interactionFlags[uid]) {
    state.interactionFlags[uid] = {
      isDirty: false,
      invalidToValid: false,
      isValidOnFocus: false,
      isValidLostFocus: false,
      focused: false,
      afterFirstDirtyBlur: false,
      forceShowValidationResult: false,
    };
  }
  switch (action.type) {
    case FormActionKind.FIELD_INITIALIZED: {
      // Initialize the value only when the field truly has no value yet.
      // A FormItem may remount (tab switch with keepMounted=false, conditional
      // rendering, multi-step wizard) — in that case state.subject[uid] already
      // holds the user's typed value and must not be clobbered. `force` still
      // allows explicit re-initialization.
      if (action.payload.value !== undefined) {
        const alreadyHasValue = get(state.subject, uid) !== undefined;
        const shouldSet =
          action.payload.force ||
          (!alreadyHasValue && !state.interactionFlags[uid].isDirty);
        if (shouldSet) {
          set(state.subject, uid, action.payload.value);
        }
      }
      // Track noSubmit flag - if multiple FormItems reference the same bindTo,
      // and any of them has noSubmit: true, the field should NOT be submitted.
      if (state.noSubmitFields[uid] === true || action.payload.noSubmit === true) {
        state.noSubmitFields[uid] = true;
      } else {
        state.noSubmitFields[uid] = false;
      }
      break;
    }
    case FormActionKind.FIELD_REMOVED: {
      delete state.validationResults[uid];
      delete state.interactionFlags[uid];
      delete state.noSubmitFields[uid];
      break;
    }
    case FormActionKind.FIELD_VALUE_CHANGED: {
      set(state.subject, uid, action.payload.value);
      state.interactionFlags[uid].isDirty = true;
      state.interactionFlags[uid].forceShowValidationResult = false;
      break;
    }
    case FormActionKind.FIELD_VALIDATED: {
      // If there are no validation errors AND no async validation is pending, clear the entry.
      // When partial is true we must keep the entry so callers can detect in-flight validation.
      if (action.payload.validationResult.validations.length === 0 && !action.payload.validationResult.partial) {
        delete state.validationResults[uid];
        break;
      }
      const prevValid = state.validationResults[uid]?.isValid;
      //if it's a partial validation (without the async stuff), we leave the previous async validations there as a stale placeholder
      if (action.payload.validationResult.partial) {
        const mergedValidations = [
          ...action.payload.validationResult.validations,
          ...(state.validationResults[uid]?.validations.filter((val) => val.async) || []).map(
            (val) => ({
              ...val,
              stale: true,
            }),
          ),
        ];
        state.validationResults[uid] = {
          ...action.payload.validationResult,
          isValid: mergedValidations.find((val) => !val.isValid) === undefined,
          validations: mergedValidations,
        };
      } else {
        state.validationResults[uid] = action.payload.validationResult;
      }
      const currentIsInvalidToValid = !prevValid && state.validationResults[uid].isValid;
      if (currentIsInvalidToValid) {
        state.interactionFlags[uid].invalidToValid = true;
      }
      break;
    }
    case FormActionKind.FIELD_FOCUSED: {
      state.interactionFlags[uid].isValidOnFocus = !!state.validationResults[uid]?.isValid;
      state.interactionFlags[uid].focused = true;
      break;
    }
    case FormActionKind.FIELD_LOST_FOCUS: {
      state.interactionFlags[uid].isValidLostFocus = !!state.validationResults[uid]?.isValid;
      state.interactionFlags[uid].focused = false;
      state.interactionFlags[uid].afterFirstDirtyBlur = state.interactionFlags[uid].isDirty;
      state.interactionFlags[uid].invalidToValid = false;
      break;
    }
    case FormActionKind.TRIED_TO_SUBMIT: {
      Object.keys(state.interactionFlags).forEach((key) => {
        state.interactionFlags[key].forceShowValidationResult = true;
      });
      break;
    }
    case FormActionKind.SUBMITTING: {
      state.submitInProgress = true;
      break;
    }
    case FormActionKind.SUBMITTED: {
      state.submitInProgress = false;
      state.generalValidationResults = [];
      state.interactionFlags = {};
      Object.keys(state.validationResults).forEach((key) => {
        state.validationResults[key].validations = state.validationResults[key].validations?.filter(
          (validation) => !validation.fromBackend,
        );
        state.validationResults[key].isValid =
          state.validationResults[key].validations.find((val) => !val.isValid) === undefined;
      });
      break;
    }
    case FormActionKind.BACKEND_VALIDATION_ARRIVED: {
      state.submitInProgress = false;
      state.generalValidationResults = action.payload.generalValidationResults;
      Object.keys(state.validationResults).forEach((key) => {
        state.validationResults[key].validations = state.validationResults[key].validations?.filter(
          (validation) => !validation.fromBackend,
        );
      });
      Object.entries(action.payload.fieldValidationResults).forEach(
        ([field, singleValidationResults]) => {
          if (!state.validationResults[field]) {
            state.validationResults[field] = {
              isValid: false,
              validations: [],
              partial: false,
              validatedValue: state.subject[field],
            };
          }

          state.validationResults[field].validations = [
            ...(state.validationResults[field]?.validations || []),
            ...((singleValidationResults as Array<SingleValidationResult>) || []),
          ];
          state.validationResults[field].isValid =
            state.validationResults[field].validations.find((val) => !val.isValid) === undefined;
        },
      );
      break;
    }
    case FormActionKind.RESET: {
      return {
        ...initialState,
        resetVersion: (state.resetVersion ?? 0) + 1,
      };
    }
    default:
      break;
  }
});

interface FormState {
  subject: any;
  validationResults: Record<string, ValidationResult>;
  generalValidationResults: Array<SingleValidationResult>;
  interactionFlags: Record<string, InteractionFlags>;
  noSubmitFields: Record<string, boolean>; // Track noSubmit flag for each field
  submitInProgress?: boolean;
  resetVersion?: number;
}

const initialState: FormState = {
  subject: {},
  validationResults: {},
  generalValidationResults: [],
  interactionFlags: {},
  noSubmitFields: {},
  submitInProgress: false,
  resetVersion: 0,
};

type OnSubmit = (
  params: Record<string, any> | undefined,
  options: { passAsDefaultBody: boolean },
) => Promise<void>;
type OnWillSubmit = (data: Record<string, any> | undefined, allData: Record<string, any> | undefined) => Promise<boolean | void | null | undefined | string | Record<string, any>>;
type OnSuccess = (result: any) => Promise<void>;
type OnCancel = () => void;
type OnReset = () => void;
type Props = {
  formState: FormState;
  dispatch: Dispatch<ContainerAction | FormAction>;
  id?: string;
  initialValue?: any;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  enabled?: boolean;
  cancelLabel?: string;
  saveLabel?: string;
  saveInProgressLabel?: string;
  savePendingLabel?: string;
  submitFeedbackDelay?: number;
  saveIcon?: string;
  swapCancelAndSave?: boolean;
  onWillSubmit?: OnWillSubmit;
  onSubmit?: OnSubmit;
  onCancel?: OnCancel;
  onReset?: OnReset;
  onSuccess?: OnSuccess;
  buttonRow?: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
  itemLabelBreak?: boolean;
  itemLabelWidth?: string;
  itemLabelPosition?: string; // type LabelPosition
  itemRequireLabelMode?: RequireLabelMode;
  keepModalOpenOnSubmit?: boolean;
  hideButtonRowUntilDirty?: boolean;
  hideButtonRow?: boolean;
  stickyButtonRow?: boolean;
  enableSubmit?: boolean;
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
  persist?: boolean;
  storageKey?: string;
  doNotPersistFields?: string[];
  keepOnCancel?: boolean;
  onPersistClear?: () => void;
  dataAfterSubmit?: "keep" | "reset" | "clear";
  onClearAfterSubmit?: () => void;
};

export const defaultProps: Pick<
  Props,
  | "cancelLabel"
  | "saveLabel"
  | "saveInProgressLabel"
  | "savePendingLabel"
  | "submitFeedbackDelay"
  | "itemLabelPosition"
  | "itemLabelBreak"
  | "keepModalOpenOnSubmit"
  | "swapCancelAndSave"
  | "hideButtonRowUntilDirty"
  | "hideButtonRow"
  | "stickyButtonRow"
  | "enableSubmit"
  | "itemRequireLabelMode"
  | "validationIconSuccess"
  | "validationIconError"
  | "keepOnCancel"
  | "dataAfterSubmit"
> = {
  cancelLabel: "Cancel",
  saveLabel: "Save",
  saveInProgressLabel: "Saving...",
  savePendingLabel: "Validating...",
  submitFeedbackDelay: 100,
  itemLabelPosition: "top",
  itemLabelBreak: true,
  keepModalOpenOnSubmit: false,
  swapCancelAndSave: false,
  hideButtonRowUntilDirty: false,
  hideButtonRow: false,
  stickyButtonRow: false,
  enableSubmit: true,
  itemRequireLabelMode: "markRequired",
  validationIconSuccess: "checkmark",
  validationIconError: "error",
  keepOnCancel: false,
  dataAfterSubmit: "keep" as const,
};

// --- Remove the properties from formState.subject where the property name ends with UNBOUND_FIELD_SUFFIX
// --- or where the field has noSubmit set to true
function cleanUpSubject(subject: any, noSubmitFields: Record<string, boolean>) {
  return Object.entries(subject || {}).reduce(
    (acc, [key, value]) => {
      if (!key.endsWith(UNBOUND_FIELD_SUFFIX) && !noSubmitFields[key]) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );
}

// --- Remove only the UNBOUND_FIELD_SUFFIX properties, keeping noSubmit fields.
// --- Used for willSubmit which should receive all form data including noSubmit fields.
function cleanUpSubjectForWillSubmit(subject: any) {
  return Object.entries(subject || {}).reduce(
    (acc, [key, value]) => {
      if (!key.endsWith(UNBOUND_FIELD_SUFFIX)) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );
}

const Form = memo(forwardRef(function (
  {
    formState,
    dispatch,
    initialValue = EMPTY_OBJECT,
    children,
    style,
    className,
    classes,
    enabled = true,
    cancelLabel = defaultProps.cancelLabel,
    saveLabel = defaultProps.saveLabel,
    saveInProgressLabel = defaultProps.saveInProgressLabel,
    savePendingLabel = defaultProps.savePendingLabel,
    submitFeedbackDelay = defaultProps.submitFeedbackDelay,
    swapCancelAndSave,
    onWillSubmit,
    onSubmit,
    onCancel,
    onReset,
    onSuccess,
    buttonRow,
    id,
    registerComponentApi,
    itemLabelBreak = defaultProps.itemLabelBreak,
    itemLabelWidth,
    itemLabelPosition = defaultProps.itemLabelPosition,
    itemRequireLabelMode = defaultProps.itemRequireLabelMode,
    keepModalOpenOnSubmit = defaultProps.keepModalOpenOnSubmit,
    hideButtonRowUntilDirty = defaultProps.hideButtonRowUntilDirty,
    hideButtonRow = defaultProps.hideButtonRow,
    stickyButtonRow = defaultProps.stickyButtonRow,
    enableSubmit = defaultProps.enableSubmit,
    verboseValidationFeedback,
    validationIconSuccess = defaultProps.validationIconSuccess,
    validationIconError = defaultProps.validationIconError,
    persist,
    storageKey,
    doNotPersistFields,
    keepOnCancel = defaultProps.keepOnCancel,
    onPersistClear,
    dataAfterSubmit = defaultProps.dataAfterSubmit,
    onClearAfterSubmit,
    ...rest
  }: Props,
  ref: ForwardedRef<HTMLFormElement>,
) {
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmSubmitModalVisible, setConfirmSubmitModalVisible] = useState(false);
  const requestModalFormClose = useModalFormClose();

  // Check if any field has async validation in-flight (partial=true).
  // The Save button is disabled while this is true.
  const isValidating = useMemo(() => {
    return Object.values(formState.validationResults).some((r) => r.partial);
  }, [formState.validationResults]);

  // Delay showing feedback labels by submitFeedbackDelay so that fast operations
  // don't cause a visible label flash on the Save button.
  const [showValidatingLabel, setShowValidatingLabel] = useState(false);
  useEffect(() => {
    if (!isValidating) {
      setShowValidatingLabel(false);
      return;
    }
    const timer = setTimeout(() => setShowValidatingLabel(true), submitFeedbackDelay);
    return () => clearTimeout(timer);
  }, [isValidating, submitFeedbackDelay]);

  const [showInProgressLabel, setShowInProgressLabel] = useState(false);
  useEffect(() => {
    if (!formState.submitInProgress) {
      setShowInProgressLabel(false);
      return;
    }
    const timer = setTimeout(() => setShowInProgressLabel(true), submitFeedbackDelay);
    return () => clearTimeout(timer);
  }, [formState.submitInProgress, submitFeedbackDelay]);

  // Resolve the effective storage key for persistence
  const persistKey = persist ? (storageKey || id || "form-data") : undefined;

  const isEnabled = enabled && !formState.submitInProgress;
  const isDirty = useMemo(() => {
    return Object.entries(formState.interactionFlags).some(([key, flags]) => {
      if (flags.isDirty) {
        return true;
      }
      return false;
    });
  }, [formState.interactionFlags]);

  const formContextValue = useMemo(() => {
    return {
      itemLabelBreak,
      itemLabelWidth,
      itemLabelPosition,
      itemRequireLabelMode,
      subject: formState.subject,
      originalSubject: initialValue,
      validationResults: formState.validationResults,
      interactionFlags: formState.interactionFlags,
      dispatch,
      enabled: isEnabled,
      verboseValidationFeedback,
      validationIconSuccess,
      validationIconError,
    };
  }, [
    dispatch,
    formState.interactionFlags,
    formState.subject,
    formState.validationResults,
    initialValue,
    isEnabled,
    itemLabelBreak,
    itemLabelPosition,
    itemLabelWidth,
    itemRequireLabelMode,
    verboseValidationFeedback,
    validationIconSuccess,
    validationIconError,
  ]);

  const doCancel = useEvent(() => {
    if (persistKey && !keepOnCancel) {
      deleteLocalStorage(persistKey);
      onPersistClear?.();
    }
    onCancel?.();
    void requestModalFormClose();
  });

  const doValidate = useEvent(() => {
    // Trigger validation display on all fields
    dispatch(triedToSubmit());

    // If any field still has async validation in-flight (partial=true), block submission.
    // The partial flag means sync checks passed but the async onValidate hasn't resolved yet.
    const hasPendingAsyncValidation = Object.values(formState.validationResults).some(
      (result) => result.partial,
    );

    // Get validation results grouped by severity
    const { error, warning } = groupInvalidValidationResultsBySeverity(
      Object.values(formState.validationResults),
    );

    // Prepare cleaned data
    const cleanedData = cleanUpSubject(formState.subject, formState.noSubmitFields);

    // Return validation result
    return {
      isValid: !hasPendingAsyncValidation && error.length === 0,
      data: cleanedData,
      errors: error,
      warnings: warning,
      validationResults: formState.validationResults,
    };
  });

  const doSubmit = useEvent(async (event?: FormEvent<HTMLFormElement>) => {
    /* console.log(`🚀 Form submit started`);
    console.log(`🔍 Initial values:`, {
      initialValue,
      EMPTY_OBJECT,
      isEqual: initialValue === EMPTY_OBJECT,
      initialValueType: typeof initialValue,
      emptyObjectType: typeof EMPTY_OBJECT
    }); */
    event?.preventDefault();
    event?.stopPropagation(); // Prevent event from bubbling to parent forms
    if (!isEnabled) {
      return;
    }
    setConfirmSubmitModalVisible(false);

    // Use the extracted validation logic
    const validationResult = doValidate();

    if (!validationResult.isValid) {
      // Emit validation:error trace event when xsVerbose is enabled
      if (typeof window !== "undefined" && (window as any).__xsVerbose) {
        const { pushXsLog, createLogEntry, pushTrace, popTrace } = (window as any).__xsTraceHelpers || {};
        if (pushXsLog && createLogEntry) {
          // Don't push a new trace — inherit the current trace context
          // (the Save click's traceId) so validation:error lands in the same step
          const errorFields: string[] = [];
          const errorMessages: string[] = [];
          for (const [field, result] of Object.entries(validationResult.validationResults)) {
            const vr = result as any;
            if (!vr.isValid) {
              errorFields.push(field);
              const msgs = (vr.validations || [])
                .filter((v: any) => !v.isValid)
                .map((v: any) => v.invalidMessage || "invalid");
              errorMessages.push(...msgs);
            }
          }
          const formAriaLabel = rest["aria-label"] || id;
          pushXsLog(createLogEntry("validation:error", {
            component: "Form",
            componentLabel: formAriaLabel || undefined,
            ariaName: formAriaLabel || undefined,
            displayLabel: `${formAriaLabel || "Form"}: ${errorFields.length} error${errorFields.length > 1 ? "s" : ""}: ${errorFields.join(", ")}`,
            errorFields,
            errorMessages,
          }));
        }
      }
      return;
    }
    if (validationResult.warnings.length > 0 && !confirmSubmitModalVisible) {
      setConfirmSubmitModalVisible(true);
      return;
    }
    const prevFocused = document.activeElement;
    dispatch(formSubmitting());
    try {
      const filteredSubject = validationResult.data;
      // Pass cleaned data as first arg and full data (including noSubmit fields) as second arg.
      // This lets willSubmit do cross-field validation while knowing exactly what onSubmit will receive.
      const fullSubject = cleanUpSubjectForWillSubmit(formState.subject);
      const willSubmitResult = await onWillSubmit?.(filteredSubject, fullSubject);

      // Handle different return values from willSubmit
      if (willSubmitResult === false) {
        // --- We do not reset the form but allow the next submit.
        dispatch(
          backendValidationArrived({ generalValidationResults: [], fieldValidationResults: {} }),
        );
        return;
      }

      // Determine what data to submit
      let dataToSubmit = filteredSubject;
      if (willSubmitResult !== null &&
          willSubmitResult !== undefined &&
          willSubmitResult !== "" &&
          typeof willSubmitResult === "object" &&
          !Array.isArray(willSubmitResult)) {
        // Submit the returned object instead
        dataToSubmit = willSubmitResult as Record<string, any>;
      }
      // For null, undefined, empty string, or any non-object: proceed with original data

      const result = await onSubmit?.(dataToSubmit, {
        passAsDefaultBody: true,
      });
      dispatch(formSubmitted());
      // Clear any persisted form data after successful submit
      if (persistKey) {
        deleteLocalStorage(persistKey);
        onPersistClear?.();
      }
      await onSuccess?.(result);

      if (!keepModalOpenOnSubmit) {
        void requestModalFormClose();
      }
      if (dataAfterSubmit === "reset") {
        flushSync(() => {
          doReset();
        });
      } else if (dataAfterSubmit === "clear") {
        flushSync(() => {
          onClearAfterSubmit?.();
          doReset();
        });
      } else {
        // "keep" (default): fire the reset event (backward compat) without resetting form state
        onReset?.();
      }
      if (prevFocused && typeof (prevFocused as HTMLElement).focus === "function") {
        (prevFocused as HTMLElement).focus();
      }
    } catch (e: any) {
      const generalValidationResults: Array<SingleValidationResult> = [];
      const fieldValidationResults: Record<string, Array<SingleValidationResult>> = {};
      if (
        e instanceof Error &&
        "errorCategory" in e &&
        e.errorCategory === "GenericBackendError" &&
        (e as GenericBackendError).details?.issues &&
        Array.isArray((e as GenericBackendError).details.issues)
      ) {
        (e as GenericBackendError).details.issues.forEach((issue: any) => {
          const validationResult = {
            isValid: false,
            invalidMessage: issue.message,
            severity: issue.severity || "error",
            fromBackend: true,
          };
          if (issue.field !== undefined) {
            fieldValidationResults[issue.field] = fieldValidationResults[issue.field] || [];
            fieldValidationResults[issue.field].push(validationResult);
          } else {
            generalValidationResults.push(validationResult);
          }
        });
      } else {
        generalValidationResults.push({
          isValid: false,
          invalidMessage: e.message || "Couldn't save the form.",
          severity: "error",
          fromBackend: true,
        });
      }
      dispatch(
        backendValidationArrived({
          generalValidationResults,
          fieldValidationResults,
        }),
      );
    }
  });

  const doReset = useEvent(() => {
    dispatch(formReset());
    onReset?.();
  });

  const updateData = useEvent((change: any) => {
    if (typeof change !== "object" || change === null || change === undefined) {
      return;
    }
    Object.entries(change).forEach(([key, value]) => {
      dispatch({
        type: FormActionKind.FIELD_VALUE_CHANGED,
        payload: {
          uid: key,
          value: value,
        },
      });
    });
  });

  const cancelButton =
    cancelLabel === "" ? null : (
      <Part partId={PART_CANCEL_BUTTON} key={PART_CANCEL_BUTTON}>
        <Button
          key="cancel"
          type="button"
          themeColor={"secondary"}
          variant={"ghost"}
          onClick={doCancel}
        >
          {cancelLabel}
        </Button>
      </Part>
    );
  const submitButton = useMemo(
    () => (
      <Part partId={PART_SUBMIT_BUTTON} key={PART_SUBMIT_BUTTON}>
        <Button
          key="submit"
          type={"submit"}
          disabled={!isEnabled || !enableSubmit || isValidating}
        >
          {showValidatingLabel
            ? savePendingLabel
            : showInProgressLabel
              ? saveInProgressLabel
              : saveLabel}
        </Button>
      </Part>
    ),
    [
      isEnabled,
      enableSubmit,
      isValidating,
      showValidatingLabel,
      savePendingLabel,
      showInProgressLabel,
      formState.submitInProgress,
      saveInProgressLabel,
      saveLabel,
    ],
  );

  const getData = useCallback(() => {
    return cloneDeep(cleanUpSubject(formState.subject, formState.noSubmitFields));
  }, [formState.subject, formState.noSubmitFields]);

  const getIsDirtyFlag = useCallback(()=>{
    return isDirty;
  }, [isDirty]);

  // Load persisted form data on mount when persist is enabled
  useEffect(() => {
    if (!persistKey) return;
    const saved = readLocalStorage(persistKey);
    if (saved && typeof saved === "object") {
      Object.entries(saved).forEach(([key, value]) => {
        dispatch({
          type: FormActionKind.FIELD_VALUE_CHANGED,
          payload: { uid: key, value },
        });
      });
    }
    // Run only on mount (persistKey should not change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistKey]);

  // Autosave form data to localStorage whenever subject changes and persist is enabled
  useEffect(() => {
    if (!persistKey) return;
    if (Object.keys(formState.subject).length === 0) return;
    const dataToSave = Object.entries(formState.subject).reduce(
      (acc, [key, value]) => {
        if (!key.endsWith(UNBOUND_FIELD_SUFFIX) && !(doNotPersistFields?.includes(key))) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>,
    );
    writeLocalStorage(persistKey, dataToSave);
  }, [persistKey, formState.subject, doNotPersistFields]);

  useEffect(() => {
    registerComponentApi?.({
      reset: doReset,
      update: updateData,
      validate: doValidate,
      getData,
      isDirty: getIsDirtyFlag
    });
  }, [doReset, updateData, doValidate, getData, registerComponentApi, getIsDirtyFlag]);

  let safeButtonRow = (
    <>
      {buttonRow || (
        <div className={classnames(styles.buttonRow, { [styles.stickyButtonRow]: stickyButtonRow })}>
          {swapCancelAndSave && [submitButton, cancelButton]}
          {!swapCancelAndSave && [cancelButton, submitButton]}
        </div>
      )}
    </>
  );
  return (
    <>
      <form
        {...rest}
        noValidate={true}
        style={style}
        className={classnames(styles.formWrapper, { [styles.stickyForm]: stickyButtonRow }, classes?.[COMPONENT_PART_KEY], className)}
        onSubmit={doSubmit}
        onReset={doReset}
        id={id}
        key={formState.resetVersion}
        ref={formRef}
      >
        <ValidationSummary generalValidationResults={formState.generalValidationResults} />
        <FormContext.Provider value={formContextValue}>{children}</FormContext.Provider>
        {!hideButtonRow && (!hideButtonRowUntilDirty || isDirty) && safeButtonRow}
      </form>
      {confirmSubmitModalVisible && (
        <ModalDialog
          onClose={() => setConfirmSubmitModalVisible(false)}
          isInitiallyOpen={true}
          title={"Are you sure want to move forward?"}
        >
          <Stack orientation={"vertical"} style={{ gap: "0.5rem" }}>
            <Text>
              The following warnings were found during validation. Please make sure you are willing
              to move forward despite these issues.
            </Text>
            <ValidationSummary
              generalValidationResults={formState.generalValidationResults}
              fieldValidationResults={formState.validationResults}
            />
            <Stack orientation={"horizontal"} horizontalAlignment={"end"} style={{ gap: "1em" }}>
              <Button
                variant={"ghost"}
                themeColor={"secondary"}
                onClick={() => setConfirmSubmitModalVisible(false)}
              >
                No
              </Button>
              <Button onClick={() => doSubmit()} autoFocus={true}>
                Yes, proceed
              </Button>
            </Stack>
          </Stack>
        </ModalDialog>
      )}
    </>
  );
}));

type FormComponentDef = ComponentDef<typeof FormMd>;

export const FormWithContextVar = forwardRef(function (
  {
    node,
    renderChild,
    extractValue,
    style,
    classes,
    lookupEventHandler,
    registerComponentApi,
    appContext,
  }: {
    node: FormComponentDef;
    renderChild: RenderChildFn;
    extractValue: ValueExtractor;
    style?: CSSProperties;
    classes?: Record<string, string>;
    lookupEventHandler: LookupEventHandlerFn<typeof FormMd>;
    registerComponentApi: RegisterComponentApiFn;
    appContext?: any;
  },
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [formState, dispatch] = useReducer(formReducer, initialState);
  // Track which resetVersion was triggered by a "clear" submit so that
  // effectiveInitialValue stays EMPTY_OBJECT for that cycle (and won't flip
  // back, which would cause FormItem re-initialization to restore old data).
  const [clearedAtResetVersion, setClearedAtResetVersion] = useState<number | null>(null);

  // Build a stable callback that captures the *current* resetVersion so that
  // when called inside flushSync it sets the correct target version.
  const handleClearAfterSubmit = useCallback(() => {
    setClearedAtResetVersion((formState.resetVersion ?? 0) + 1);
  }, [formState.resetVersion]);

  const $data = useMemo(() => {
    const updateData = (change: any) => {
      if (typeof change !== "object" || change === null || change === undefined) {
        return;
      }
      Object.entries(change).forEach(([key, value]) => {
        dispatch({
          type: FormActionKind.FIELD_VALUE_CHANGED,
          payload: {
            uid: key,
            value: value,
          },
        });
      });
    };

    return { ...cleanUpSubject(formState.subject, formState.noSubmitFields), update: updateData };
  }, [formState.subject, formState.noSubmitFields]);

  // $validationIssues: { [fieldName]: SingleValidationResult[] } — only invalid entries.
  const $validationIssues = useMemo(() => {
    const result: Record<string, Array<SingleValidationResult>> = {};
    Object.entries(formState.validationResults).forEach(([field, validationResult]) => {
      const invalidResults = validationResult.validations.filter((v) => !v.isValid);
      if (invalidResults.length > 0) {
        result[field] = invalidResults;
      }
    });
    return result;
  }, [formState.validationResults]);

  // $hasValidationIssue(fieldName?): When called without an argument, return true if ANY field has validation issues.
  // When called with a fieldName, return true if that specific field has issues.
  const $hasValidationIssue = useCallback(
    (fieldName?: string) => {
      if (fieldName === undefined) {
        return Object.keys($validationIssues).length > 0;
      }
      return ($validationIssues[fieldName]?.length ?? 0) > 0;
    },
    [$validationIssues],
  );

  const nodeWithItem = useMemo(() => {
    return {
      type: "Fragment",
      vars: {
        $data: $data,
        $validationIssues: $validationIssues,
        $hasValidationIssue: $hasValidationIssue,
      },
      children: node.children,
    };
  }, [$data, $validationIssues, $hasValidationIssue, node.children]);

  const rawInitialValue = extractValue(node.props.data);
  // Use EMPTY_OBJECT when the current resetVersion was produced by a "clear" submit.
  // Once the user triggers another reset the versions differ and raw data is restored.
  const effectiveInitialValue =
    clearedAtResetVersion !== null && clearedAtResetVersion === formState.resetVersion
      ? EMPTY_OBJECT
      : rawInitialValue;
  const submitMethod =
    extractValue.asOptionalString(node.props.submitMethod) || (rawInitialValue ? "put" : "post");
  const inProgressNotificationMessage =
    extractValue.asOptionalString(node.props.inProgressNotificationMessage) || "";
  const completedNotificationMessage =
    extractValue.asOptionalString(node.props.completedNotificationMessage) || "";
  const errorNotificationMessage =
    extractValue.asOptionalString(node.props.errorNotificationMessage) || "";

  const submitUrl =
    extractValue.asOptionalString(node.props.submitUrl) ||
    extractValue.asOptionalString(node.props._data_url);

  const itemLabelWidth = extractValue.asOptionalString(node.props.itemLabelWidth);
  const { cssProps: itemLabelWidthCssProps } = resolveLayoutProps({ width: itemLabelWidth }, undefined, appContext?.appGlobals?.disableInlineStyle, appContext?.appGlobals?.applyLayoutProperties);

  return (
    <Slot ref={ref} style={style}>
      <Form
        keepModalOpenOnSubmit={extractValue.asOptionalBoolean(node.props.keepModalOpenOnSubmit)}
        itemLabelPosition={extractValue.asOptionalString(node.props.itemLabelPosition)}
        itemLabelBreak={extractValue.asOptionalBoolean(node.props.itemLabelBreak)}
        itemLabelWidth={itemLabelWidthCssProps.width as string}
        itemRequireLabelMode={extractValue.asOptionalString(node.props.itemRequireLabelMode)}
        hideButtonRowUntilDirty={extractValue.asOptionalBoolean(node.props.hideButtonRowUntilDirty)}
        hideButtonRow={extractValue.asOptionalBoolean(node.props.hideButtonRow)}
        stickyButtonRow={extractValue.asOptionalBoolean(node.props.stickyButtonRow)}
        enableSubmit={extractValue.asOptionalBoolean(node.props.enableSubmit)}
        verboseValidationFeedback={extractValue.asOptionalBoolean(node.props.verboseValidationFeedback)}
        validationIconSuccess={extractValue.asOptionalString(node.props.validationIconSuccess)}
        validationIconError={extractValue.asOptionalString(node.props.validationIconError)}
        formState={formState}
        dispatch={dispatch}
        id={node.uid}
        classes={classes}
        cancelLabel={extractValue(node.props.cancelLabel)}
        saveLabel={extractValue(node.props.saveLabel)}
        saveInProgressLabel={extractValue(node.props.saveInProgressLabel)}
        savePendingLabel={extractValue(node.props.savePendingLabel)}
        submitFeedbackDelay={extractValue.asOptionalNumber(node.props.submitFeedbackDelay)}
        swapCancelAndSave={extractValue.asOptionalBoolean(node.props.swapCancelAndSave, false)}
        onWillSubmit={lookupEventHandler("willSubmit", {
          context: {
            $data,
          },
        })}
        onSubmit={lookupEventHandler("submit", {
          defaultHandler: submitUrl
            ? `(eventArgs)=> Actions.callApi({ url: "${submitUrl}", method: "${submitMethod}", body: eventArgs, inProgressNotificationMessage: "${inProgressNotificationMessage}", completedNotificationMessage: "${completedNotificationMessage}", errorNotificationMessage: "${errorNotificationMessage}" })`
            : undefined,
          context: {
            $data,
          },
        })}
        onCancel={lookupEventHandler("cancel", {
          context: {
            $data,
          },
        })}
        onReset={lookupEventHandler("reset", {
          context: {
            $data,
          },
        })}
        onSuccess={lookupEventHandler("success", {
          context: {
            $data,
          },
        })}
        initialValue={effectiveInitialValue}
        buttonRow={
          node.props.buttonRowTemplate ? (
            <MemoizedItem
              node={node.props.buttonRowTemplate}
              renderChild={renderChild}
              contextVars={{
                $data,
              }}
            />
          ) : undefined
        }
        registerComponentApi={registerComponentApi}
        persist={!!extractValue.asOptionalString(node.props.persist) || extractValue.asOptionalBoolean(node.props.persist)}
        storageKey={extractValue.asOptionalString(node.props.storageKey)}
        doNotPersistFields={extractValue(node.props.doNotPersistFields) as string[] | undefined}
        keepOnCancel={extractValue.asOptionalBoolean(node.props.keepOnCancel)}
        dataAfterSubmit={extractValue.asOptionalString(node.props.dataAfterSubmit) as "keep" | "reset" | "clear" | undefined}
        onClearAfterSubmit={handleClearAfterSubmit}
        enabled={
          extractValue.asOptionalBoolean(node.props.enabled, true) &&
          !extractValue.asOptionalBoolean((node.props as any).loading, false)
        } //the as any is there to not include this property in the docs (temporary, we disable the form until it's data is loaded)
      >
        {renderChild(nodeWithItem)}
      </Form>
    </Slot>
  );
});
FormWithContextVar.displayName = "FormWithContextVar";
