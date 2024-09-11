import type { CSSProperties, Dispatch, FormEvent, ForwardedRef, ReactNode } from "react";
import { useEffect } from "react";
import { forwardRef, useMemo, useReducer, useState } from "react";
import styles from "./Form.module.scss";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import type { ContainerAction } from "@components-core/abstractions/containers";
import produce from "immer";
import type { InteractionFlags, SingleValidationResult, ValidationResult } from "./FormContext";
import { FormContext } from "./FormContext";
import { Button } from "@components/Button/ButtonNative";
import { EMPTY_OBJECT } from "@components-core/constants";
import type { GenericBackendError } from "@components-core/EngineError";
import { ValidationSummary } from "@components/ValidationSummary/ValidationSummary";
import { useEvent } from "@components-core/utils/misc";
import { groupInvalidValidationResultsBySeverity } from "@components/FormItem/Validations";
import type { FormAction } from "@components/Form/formActions";
import { backendValidationArrived, FormActionKind, formSubmitted, triedToSubmit } from "@components/Form/formActions";
import { ModalDialog } from "@components/ModalDialog/ModalDialog";
import { Text } from "@components/Text/Text";
import { Stack } from "@components/Stack/Stack";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc, nestedComp } from "@components-core/descriptorHelper";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { LookupEventHandlerFn, RegisterComponentApiFn, ValueExtractor } from "@abstractions/RendererDefs";

const setByPath = (obj: any, path: string, val: any) => {
  const keys = path.split(".");
  for (let i = 0; i < keys.length; i++) {
    const currentKey = keys[i];
    const nextKey = keys[i + 1];

    if (typeof nextKey !== "undefined") {
      obj[currentKey] = obj[currentKey] ? obj[currentKey] : {};
    } else {
      obj[currentKey] = val;
    }

    obj = obj[currentKey];
  }
};

export const getByPath = (obj: any, path: string) => {
  const keys = path.split(".");
  let ret = obj;
  for (let i = 0; i < keys.length; i++) {
    ret = ret?.[keys[i]];
  }
  return ret;
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
      setByPath(state.subject, uid, action.payload.value);
      state.interactionFlags[uid].isDirty = false;
      break;
    }
    case FormActionKind.FIELD_VALUE_CHANGED: {
      setByPath(state.subject, uid, action.payload.value);
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
          ...(state.validationResults[uid]?.validations.filter((val) => val.async) || []).map((val) => ({
            ...val,
            stale: true,
          })),
        ];
        state.validationResults[uid] = {
          ...action.payload.validationResult,
          isValid: mergedValidations.find((val) => !val.isValid) === undefined,
          validations: mergedValidations,
        };
      } else {
        state.validationResults[uid] = action.payload.validationResult;
      }
      state.interactionFlags[uid].invalidToValid = !prevValid && state.validationResults[uid].isValid;
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
    case FormActionKind.SUBMITTED: {
      state.generalValidationResults = [];
      state.interactionFlags = {};
      Object.keys(state.validationResults).forEach((key) => {
        state.validationResults[key].validations = state.validationResults[key].validations?.filter(
          (validation) => !validation.fromBackend
        );
        state.validationResults[key].isValid =
          state.validationResults[key].validations.find((val) => !val.isValid) === undefined;
      });
      break;
    }
    case FormActionKind.BACKEND_VALIDATION_ARRIVED: {
      state.generalValidationResults = action.payload.generalValidationResults;
      Object.keys(state.validationResults).forEach((key) => {
        state.validationResults[key].validations = state.validationResults[key].validations?.filter(
          (validation) => !validation.fromBackend
        );
      });
      Object.entries(action.payload.fieldValidationResults).forEach(([field, singleValidationResults]) => {
        state.validationResults[field].validations = [
          ...(state.validationResults[field]?.validations || []),
          ...((singleValidationResults as Array<SingleValidationResult>) || []),
        ];
        state.validationResults[field].isValid =
          state.validationResults[field].validations.find((val) => !val.isValid) === undefined;
      });
      break;
    }
    default:
  }
});

interface FormState {
  subject: any;
  validationResults: Record<string, ValidationResult>;
  generalValidationResults: Array<SingleValidationResult>;
  interactionFlags: Record<string, InteractionFlags>;
}

const initialState: FormState = {
  subject: {},
  validationResults: {},
  generalValidationResults: [],
  interactionFlags: {},
};

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
  saveIcon?: string;
  swapCancelAndSave?: boolean;
  onSubmit?: (params: Record<string, any> | undefined, options: { passAsDefaultBody: boolean }) => Promise<void>;
  onCancel?: () => void;
  onReset?: () => void;
  buttonRow?: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
  itemLabelBreak?: boolean;
  itemLabelWidth?: string;
  itemLabelPosition?: string;
};

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
  }: Props,
  ref: ForwardedRef<HTMLFormElement>
) {
  const [confirmSubmitModalVisible, setConfirmSubmitModalVisible] = useState(false);

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
    };
  }, [
    dispatch,
    formState.interactionFlags,
    formState.subject,
    formState.validationResults,
    initialValue,
    itemLabelBreak,
    itemLabelPosition,
    itemLabelWidth,
  ]);

  const doSubmit = useEvent(async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!enabled) {
      return;
    }
    setConfirmSubmitModalVisible(false);
    dispatch(triedToSubmit());
    const { error, warning } = groupInvalidValidationResultsBySeverity(Object.values(formState.validationResults));
    if (error.length) {
      return;
    }
    if (warning.length && !confirmSubmitModalVisible) {
      setConfirmSubmitModalVisible(true);
      return;
    }
    try {
      await onSubmit?.(formState.subject, {
        passAsDefaultBody: true,
      });
      dispatch(formSubmitted());
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
        })
      );
    }
  });

  const [key, setKey] = useState(1);
  const doReset = useEvent(() => {
    setKey((prev) => prev + 1);
    onReset?.();
  });

  const cancelButton = (
    <Button key="cancel" type="button" themeColor={"secondary"} variant={"ghost"} onClick={onCancel}>
      {cancelLabel}
    </Button>
  );
  const submitButton = (
    <Button key="submit" type={"submit"}>
      {saveLabel}
    </Button>
  );

  useEffect(() => {
    registerComponentApi?.({
      reset: doReset,
    });
  }, [doReset, registerComponentApi]);

  return (
    <>
      <form style={style} className={styles.wrapper} onSubmit={doSubmit} onReset={doReset} id={id} ref={ref} key={key}>
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
          <Stack orientation={"vertical"} layout={{ gap: "0.5rem" }}>
            <Text>
              The following warnings were found during validation. Please make sure you are willing to move forward
              despite these issues.
            </Text>
            <ValidationSummary
              generalValidationResults={formState.generalValidationResults}
              fieldValidationResults={formState.validationResults}
            />
            <Stack orientation={"horizontal"} horizontalAlignment={"end"} layout={{ gap: "1em" }}>
              <Button variant={"ghost"} themeColor={"secondary"} onClick={() => setConfirmSubmitModalVisible(false)}>
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

/**
 * An XMLUI `Form` is a fundamental component that displays user interfaces that allow users to input
 * (or change) data and submit it to the app (a server) for further processing.
 *
 * You can learn more about this component in the [Using Forms](/learning/using-components/forms/)
 * article.
 */
export interface FormComponentDef extends ComponentDef<"Form"> {
  props: {
    /**
     * This property sets the position of the item label. The default value is \`top\`.
     */
    itemLabelPosition?: string;

    /**
     * This property sets the width of the item label.
     */
    itemLabelWidth?: string;

    /**
     * This boolean value indicates if the label can be split into multiple lines if it would overflow
     * the available label width.
     */
    itemLabelBreak?: boolean;

    /** @descriptionRef */
    buttonRowTemplate?: string;

    /**
     * This property sets the initial value of the form's data structure. The form infrastructure
     * uses this value to set the initial state of form items within the form.
     */
    subject: string;
    /**
     * This property defines the label of the Cancel button, by default, "Cancel".
     */
    cancelLabel?: string;
    /**
     * This property defines the label of the Save button, by default, "Save".
     */
    saveLabel?: string;
    /**
     * By default, the Cancel button is to the left of the Save button. Set this property to
     * \`true\` to swap them or \`false\` to keep their original location.
     */
    swapCancelAndSave?: boolean;
  };
  events: {
    /** @descriptionRef */
    submit?: string;
    /**
     * The form infrastructure fires this event when the form is reset.
     */
    reset?: string;
  };
  contextVars: {
    /** @descriptionRef */
    $subject?: string;
  };
}

export const FormMd: ComponentDescriptor<FormComponentDef> = {
  displayName: "Form",
  description: "A form component that allows users to input data and submit it to the app",
  props: {
    buttonRowTemplate: nestedComp("The template encapsulating form buttons"),
    itemLabelPosition: desc("The position of the item label"),
    itemLabelWidth: desc("The width of the item label"),
    itemLabelBreak: desc("The label can be split into multiple lines if it would overflow the available label width"),
    subject: desc("The initial value of the form's data structure"),
    cancelLabel: desc("The label of the Cancel button"),
    saveLabel: desc("The label of the Save button"),
    swapCancelAndSave: desc("Swap the Cancel and Save buttons"),
  },
  events: {
    submit: desc("Triggers when the form data is about to save"),
    reset: desc("Triggers when the form data is about to reset"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "gap-Form": "$space-4",
    "gap-buttonRow-Form": "$space-4",
    light: {
      "color-bg-ValidationDisplay-error": "$color-danger-100",
      "color-bg-ValidationDisplay-warning": "$color-warn-100",
      "color-bg-ValidationDisplay-info": "$color-primary-100",
      "color-bg-ValidationDisplay-valid": "$color-success-100",
      "color-accent-ValidationDisplay-error": "$color-error",
      "color-accent-ValidationDisplay-warning": "$color-warning",
      "color-accent-ValidationDisplay-info": "$color-info",
      "color-accent-ValidationDisplay-valid": "$color-valid",
      "color-text-ValidationDisplay-error": "$color-error",
      "color-text-ValidationDisplay-warning": "$color-warning",
      "color-text-ValidationDisplay-info": "$color-info",
      "color-text-ValidationDisplay-valid": "$color-valid",
    },
    dark: {
      "color-bg-ValidationDisplay-error": "$color-danger-900",
      "color-bg-ValidationDisplay-warning": "$color-warn-900",
      "color-bg-ValidationDisplay-info": "$color-secondary-800",
      "color-bg-ValidationDisplay-valid": "$color-success-900",
      "color-accent-ValidationDisplay-error": "$color-danger-500",
      "color-accent-ValidationDisplay-warning": "$color-warn-700",
      "color-accent-ValidationDisplay-info": "$color-surface-200",
      "color-accent-ValidationDisplay-valid": "$color-success-600",
      "color-text-ValidationDisplay-error": "$color-danger-500",
      "color-text-ValidationDisplay-warning": "$color-warn-700",
      "color-text-ValidationDisplay-info": "$color-secondary-200",
      "color-text-ValidationDisplay-valid": "$color-success-600",
    },
  },
};

function FormWithContextVar({
  node,
  renderChild,
  extractValue,
  layoutCss,
  lookupEventHandler,
  registerComponentApi,
}: {
  node: FormComponentDef;
  renderChild: RenderChildFn;
  extractValue: ValueExtractor;
  layoutCss: CSSProperties;
  lookupEventHandler: LookupEventHandlerFn;
  registerComponentApi: RegisterComponentApiFn;
}) {
  const [formState, dispatch] = useReducer(formReducer, initialState);

  const nodeWithItem = useMemo(() => {
    return {
      type: "Fragment",
      vars: {
        $subject: formState.subject,
      },
      children: node.children,
    };
  }, [formState.subject, node.children]);

  return (
    <Form
      itemLabelPosition={extractValue.asOptionalString(node.props.itemLabelPosition)}
      itemLabelBreak={extractValue.asOptionalBoolean(node.props.itemLabelBreak)}
      itemLabelWidth={extractValue.asOptionalString(node.props.itemLabelWidth)}
      formState={formState}
      dispatch={dispatch}
      id={node.uid}
      style={layoutCss}
      cancelLabel={extractValue(node.props.cancelLabel)}
      saveLabel={extractValue(node.props.saveLabel)}
      swapCancelAndSave={extractValue.asOptionalBoolean(node.props.swapCancelAndSave, false)}
      onSubmit={lookupEventHandler("submit")}
      onCancel={lookupEventHandler("cancel")}
      onReset={lookupEventHandler("reset")}
      initialValue={extractValue(node.props.subject)}
      buttonRow={renderChild(node.props.buttonRowTemplate)}
      registerComponentApi={registerComponentApi}
    >
      {renderChild(nodeWithItem)}
    </Form>
  );
}

export const formComponentRenderer = createComponentRenderer<FormComponentDef>(
  "Form",
  ({ node, renderChild, extractValue, layoutCss, lookupEventHandler, registerComponentApi }) => {
    return (
      <FormWithContextVar
        node={node}
        renderChild={renderChild}
        extractValue={extractValue}
        lookupEventHandler={lookupEventHandler}
        layoutCss={layoutCss}
        registerComponentApi={registerComponentApi}
      />
    );
  },
  FormMd
);
