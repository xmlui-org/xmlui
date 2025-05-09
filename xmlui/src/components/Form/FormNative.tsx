import {
  type CSSProperties,
  type Dispatch,
  type FormEvent,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
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
import type { ContainerAction } from "../../components-core/abstractions/containers";
import { EMPTY_OBJECT } from "../../components-core/constants";
import type { GenericBackendError } from "../../components-core/EngineError";
import { useEvent } from "../../components-core/utils/misc";
import {
  backendValidationArrived,
  FormActionKind,
  formSubmitted,
  formSubmitting,
  triedToSubmit,
  UNBOUND_FIELD_SUFFIX,
} from "../../components/Form/formActions";
import { ModalDialog } from "../../components/ModalDialog/ModalDialogNative";
import { Text } from "../../components/Text/TextNative";
import { Stack } from "../../components/Stack/StackNative";
import { useModalFormClose } from "../../components/ModalDialog/ModalVisibilityContext";
import { Button } from "../Button/ButtonNative";
import { ValidationSummary } from "../ValidationSummary/ValidationSummary";
import { groupInvalidValidationResultsBySeverity } from "../FormItem/Validations";
import { type FormAction, formReset } from "../Form/formActions";
import type { FormMd } from "./Form";
import type { InteractionFlags, SingleValidationResult, ValidationResult } from "./FormContext";
import { FormContext } from "./FormContext";
import { get, set } from "lodash-es";

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
      forceShowValidationResult: false,
    };
  }
  switch (action.type) {
    case FormActionKind.FIELD_INITIALIZED: {
      if (!state.interactionFlags[uid].isDirty || action.payload.force) {
        set(state.subject, uid, action.payload.value);
      }
      break;
    }
    case FormActionKind.FIELD_REMOVED: {
      delete state.validationResults[uid];
      delete state.interactionFlags[uid];
      break;
    }
    case FormActionKind.FIELD_VALUE_CHANGED: {
      set(state.subject, uid, action.payload.value);
      state.interactionFlags[uid].isDirty = true;
      state.interactionFlags[uid].forceShowValidationResult = false;
      break;
    }
    case FormActionKind.FIELD_VALIDATED: {
      // it means no validation happened, ignore it
      if (action.payload.validationResult.validations.length === 0) {
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
      state.interactionFlags[uid].invalidToValid =
        !prevValid && state.validationResults[uid].isValid;
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
      const { originalSubject } = action.payload;
      return {
        ...initialState,
        subject: originalSubject,
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
  submitInProgress?: boolean;
  resetVersion?: number;
}

const initialState: FormState = {
  subject: {},
  validationResults: {},
  generalValidationResults: [],
  interactionFlags: {},
  submitInProgress: false,
  resetVersion: 0,
};

type OnSubmit = (
  params: Record<string, any> | undefined,
  options: { passAsDefaultBody: boolean },
) => Promise<void>;
type OnCancel = () => void;
type OnReset = () => void;
type Props = {
  formState: FormState;
  dispatch: Dispatch<ContainerAction | FormAction>;
  id?: string;
  initialValue?: any;
  children: ReactNode;
  style?: CSSProperties;
  enabled?: boolean;
  cancelLabel?: string;
  saveLabel?: string;
  saveInProgressLabel?: string;
  saveIcon?: string;
  swapCancelAndSave?: boolean;
  onSubmit?: OnSubmit;
  onCancel?: OnCancel;
  onReset?: OnReset;
  buttonRow?: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
  itemLabelBreak?: boolean;
  itemLabelWidth?: string;
  itemLabelPosition?: string; // type LabelPosition
  keepModalOpenOnSubmit?: boolean;
};

export const defaultProps: Pick<
  Props,
  | "cancelLabel"
  | "saveLabel"
  | "saveInProgressLabel"
  | "itemLabelPosition"
  | "itemLabelBreak"
  | "keepModalOpenOnSubmit"
> = {
  cancelLabel: "Cancel",
  saveLabel: "Save",
  saveInProgressLabel: "Saving...",
  itemLabelPosition: "top",
  itemLabelBreak: true,
  keepModalOpenOnSubmit: false,
};

// --- Remove the properties from formState.subject where the property name ends with UNBOUND_FIELD_SUFFIX
function cleanUpSubject(subject: any) {
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

const Form = forwardRef(function (
  {
    formState,
    dispatch,
    initialValue = EMPTY_OBJECT,
    children,
    style,
    enabled = true,
    cancelLabel = "Cancel",
    saveLabel = "Save",
    saveInProgressLabel = "Saving...",
    swapCancelAndSave,
    onSubmit,
    onCancel,
    onReset,
    buttonRow,
    id,
    registerComponentApi,
    itemLabelBreak = true,
    itemLabelWidth,
    itemLabelPosition = "top",
    keepModalOpenOnSubmit = false,
  }: Props,
  ref: ForwardedRef<HTMLFormElement>,
) {
  const formRef = useRef<HTMLFormElement>(null);
  useImperativeHandle(ref, () => formRef.current!);
  const [confirmSubmitModalVisible, setConfirmSubmitModalVisible] = useState(false);
  const requestModalFormClose = useModalFormClose();

  const isEnabled = enabled && !formState.submitInProgress;

  const formContextValue = useMemo(() => {
    return {
      itemLabelBreak,
      itemLabelWidth,
      itemLabelPosition,
      subject: formState.subject,
      originalSubject: initialValue,
      validationResults: formState.validationResults,
      interactionFlags: formState.interactionFlags,
      dispatch,
      enabled: isEnabled,
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
  ]);

  const doCancel = useEvent(() => {
    onCancel?.();
    requestModalFormClose();
  });

  const doSubmit = useEvent(async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!isEnabled) {
      return;
    }
    setConfirmSubmitModalVisible(false);
    dispatch(triedToSubmit());
    const { error, warning } = groupInvalidValidationResultsBySeverity(
      Object.values(formState.validationResults),
    );
    if (error.length) {
      return;
    }
    if (warning.length && !confirmSubmitModalVisible) {
      setConfirmSubmitModalVisible(true);
      return;
    }
    const prevFocused = document.activeElement;
    dispatch(formSubmitting());
    try {
      const filteredSubject = cleanUpSubject(formState.subject);

      await onSubmit?.(filteredSubject, {
        passAsDefaultBody: true,
      });
      dispatch(formSubmitted());

      if (!keepModalOpenOnSubmit) {
        requestModalFormClose();
      }
      // we only reset the form automatically if the initial value is empty ()
      if (initialValue === EMPTY_OBJECT) {
        flushSync(() => {
          doReset();
        });
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
    dispatch(formReset(initialValue));
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
      <Button
        key="cancel"
        type="button"
        themeColor={"secondary"}
        variant={"ghost"}
        onClick={doCancel}
      >
        {cancelLabel}
      </Button>
    );
  const submitButton = useMemo(
    () => (
      <Button key="submit" type={"submit"} disabled={!isEnabled}>
        {formState.submitInProgress ? saveInProgressLabel : saveLabel}
      </Button>
    ),
    [isEnabled, formState.submitInProgress, saveInProgressLabel, saveLabel],
  );

  useEffect(() => {
    registerComponentApi?.({
      reset: doReset,
      update: updateData,
    });
  }, [doReset, updateData, registerComponentApi]);

  return (
    <>
      <form
        style={style}
        className={styles.wrapper}
        onSubmit={doSubmit}
        onReset={doReset}
        id={id}
        key={formState.resetVersion}
        ref={formRef}
      >
        <ValidationSummary generalValidationResults={formState.generalValidationResults} />
        <FormContext.Provider value={formContextValue}>{children}</FormContext.Provider>
        {buttonRow || (
          <div className={styles.buttonRow}>
            {swapCancelAndSave && [submitButton, cancelButton]}
            {!swapCancelAndSave && [cancelButton, submitButton]}
          </div>
        )}
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
});
Form.displayName = "Form";

type FormComponentDef = ComponentDef<typeof FormMd>;

export function FormWithContextVar({
  node,
  renderChild,
  extractValue,
  style,
  lookupEventHandler,
  registerComponentApi,
}: {
  node: FormComponentDef;
  renderChild: RenderChildFn;
  extractValue: ValueExtractor;
  style: CSSProperties;
  lookupEventHandler: LookupEventHandlerFn<typeof FormMd>;
  registerComponentApi: RegisterComponentApiFn;
}) {
  const [formState, dispatch] = useReducer(formReducer, initialState);

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

    return { ...cleanUpSubject(formState.subject), update: updateData };
  }, [formState.subject]);

  const nodeWithItem = useMemo(() => {
    return {
      type: "Fragment",
      vars: {
        $data: $data,
      },
      children: node.children,
    };
  }, [$data, node.children]);

  const initialValue = extractValue(node.props.data);
  const submitMethod =
    extractValue.asOptionalString(node.props.submitMethod) || (initialValue ? "put" : "post");
  const submitUrl =
    extractValue.asOptionalString(node.props.submitUrl) ||
    extractValue.asOptionalString(node.props._data_url);

  return (
    <Form
      keepModalOpenOnSubmit={extractValue.asOptionalBoolean(node.props.keepModalOpenOnSubmit)}
      itemLabelPosition={extractValue.asOptionalString(node.props.itemLabelPosition)}
      itemLabelBreak={extractValue.asOptionalBoolean(node.props.itemLabelBreak)}
      itemLabelWidth={extractValue.asOptionalString(node.props.itemLabelWidth)}
      formState={formState}
      dispatch={dispatch}
      id={node.uid}
      style={style}
      cancelLabel={extractValue(node.props.cancelLabel)}
      saveLabel={extractValue(node.props.saveLabel)}
      saveInProgressLabel={extractValue(node.props.saveInProgressLabel)}
      swapCancelAndSave={extractValue.asOptionalBoolean(node.props.swapCancelAndSave, false)}
      onSubmit={lookupEventHandler("submit", {
        defaultHandler: submitUrl
          ? `(eventArgs)=> Actions.callApi({ url: "${submitUrl}", method: "${submitMethod}", body: eventArgs })`
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
      initialValue={initialValue}
      buttonRow={renderChild(node.props.buttonRowTemplate)}
      registerComponentApi={registerComponentApi}
      enabled={
        extractValue.asOptionalBoolean(node.props.enabled, true) &&
        !extractValue.asOptionalBoolean((node.props as any).loading, false)
      } //the as any is there to not include this property in the docs (temporary, we disable the form until it's data is loaded)
    >
      {renderChild(nodeWithItem)}
    </Form>
  );
}
