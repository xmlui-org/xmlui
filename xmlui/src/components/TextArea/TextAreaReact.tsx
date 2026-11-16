import React, {
  type ChangeEventHandler,
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  memo,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import { isNil } from "lodash-es";

import styles from "./TextArea.module.scss";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import TextAreaResizable from "./TextAreaResizable";
import { PART_INPUT } from "../../components-core/parts";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { ConciseValidationFeedback } from "../ConciseValidationFeedback/ConciseValidationFeedback";
import { Part } from "../Part/Part";
import { useFormContextPart } from "../Form/FormContext";
import { useFormItemInputId } from "../FormItem/FormItemContext";

const PART_CONCISE_VALIDATION_FEEDBACK = "conciseValidationFeedback";

import { defaultProps } from "./TextArea.defaults";

export const resizeOptionKeys = ["horizontal", "vertical", "both"] as const;
export type ResizeOptions = (typeof resizeOptionKeys)[number];

type Props = {
  id?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  allowCopy?: boolean;
  updateState?: UpdateStateFn;
  validationStatus?: ValidationStatus;
  autoFocus?: boolean;
  initialValue?: string;
  resize?: ResizeOptions;
  enterSubmits?: boolean;
  escResets?: boolean;
  onDidChange?: (e: any) => void;
  onSelectionDidChange?: (selection: TextAreaSelection) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  controlled?: boolean;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  registerComponentApi?: RegisterComponentApiFn;
  autoSize?: boolean;
  maxRows?: number;
  minRows?: number;
  maxLength?: number;
  rows?: number;
  enabled?: boolean;
  autoComplete?: string | boolean;
  autoCorrect?: boolean;
  spellCheck?: boolean;
  autoCapitalize?: string;
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
  invalidMessages?: string[];
};

export type TextAreaSelection = { start: number; end: number };

const normalizeOnOff = (value: boolean | undefined) =>
  value === undefined ? undefined : value ? "on" : "off";

const normalizeAutoComplete = (value: string | boolean | undefined) =>
  typeof value === "boolean" ? normalizeOnOff(value) : value;

export const TextArea = memo(
  forwardRef(function TextArea(
    {
      id: idProp,
      value = defaultProps.value,
      placeholder = defaultProps.placeholder,
      required = defaultProps.required,
      readOnly = defaultProps.readOnly,
      allowCopy = defaultProps.allowCopy,
      updateState = defaultProps.updateState,
      validationStatus,
      autoFocus = defaultProps.autoFocus,
      initialValue = defaultProps.initialValue,
      resize,
      onDidChange = defaultProps.onDidChange,
      onSelectionDidChange,
      onFocus = defaultProps.onFocus,
      onBlur = defaultProps.onBlur,
      controlled = defaultProps.controlled,
      enterSubmits = defaultProps.enterSubmits,
      escResets,
      style,
      className,
      classes,
      registerComponentApi,
      autoSize,
      maxRows,
      minRows,
      maxLength,
      rows = defaultProps.rows,
      enabled = defaultProps.enabled,
      autoComplete = defaultProps.autoComplete,
      autoCorrect,
      spellCheck,
      autoCapitalize,
      verboseValidationFeedback,
      validationIconSuccess,
      validationIconError,
      invalidMessages,
      ...rest
    }: Props,
    forwardedRef: ForwardedRef<HTMLTextAreaElement>,
  ) {
    const id = useFormItemInputId(idProp);
    // --- The component is initially unfocused
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const ref = useComposedRefs(inputRef, forwardedRef);
    const [cursorPosition, setCursorPosition] = useState(null);
    const [focused, setFocused] = React.useState(false);
    const [localValue, setLocalValue] = React.useState(value);
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const contextVerboseValidationFeedback = useFormContextPart(
      (ctx) => ctx?.verboseValidationFeedback,
    );
    const contextValidationIconSuccess = useFormContextPart((ctx) => ctx?.validationIconSuccess);
    const contextValidationIconError = useFormContextPart((ctx) => ctx?.validationIconError);

    const finalVerboseValidationFeedback =
      verboseValidationFeedback ?? contextVerboseValidationFeedback ?? true;
    const finalValidationIconSuccess =
      validationIconSuccess ?? contextValidationIconSuccess ?? "checkmark";
    const finalValidationIconError = validationIconError ?? contextValidationIconError ?? "close";

    let validationIcon = null;
    if (!finalVerboseValidationFeedback) {
      if (validationStatus === "valid") {
        validationIcon = finalValidationIconSuccess;
      } else if (validationStatus === "error") {
        validationIcon = finalValidationIconError;
      }
    }

    const updateValue = useCallback(
      (value: string) => {
        setLocalValue(value);
        updateState({ value: value });
        onDidChange(value);
      },
      [onDidChange, updateState],
    );

    const onInputChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
      (event) => {
        updateValue(event.target.value);
      },
      [updateValue],
    );

    useEffect(() => {
      updateState({ value: initialValue }, { initial: true });
    }, [initialValue, updateState]);

    useEffect(() => {
      if (autoFocus) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    }, [autoFocus]);

    // --- Execute this function when the user copies the value
    const handleCopy = (event: React.SyntheticEvent) => {
      if (allowCopy) {
        return true;
      } else {
        event.preventDefault();
        return false;
      }
    };

    // --- The last selection reported through selectionDidChange
    const lastSelectionRef = useRef<TextAreaSelection | null>(null);

    // --- Manage obtaining and losing the focus
    const handleOnFocus = () => {
      setFocused(true);
      onFocus?.();
    };
    const handleOnBlur = () => {
      setFocused(false);
      // --- Forget the last reported selection, so the next click into the field reports
      // --- its caret even when it lands where the previous one was
      lastSelectionRef.current = null;
      onBlur?.();
    };

    // --- Report caret and selection moves (#3959): after the browser has placed the caret, on
    // --- mouseup, cursor keys and edits, including collapsed selections and clicks inside an
    // --- already-focused field. Native listeners rather than React's onSelect: onSelect only
    // --- fires when document.activeElement is the field, which isn't true inside a shadow root
    // --- (a NestedApp playground or an island), where activeElement is the shadow host.
    const onSelectionDidChangeRef = useRef(onSelectionDidChange);
    onSelectionDidChangeRef.current = onSelectionDidChange;
    const reportSelection = useCallback((el: HTMLTextAreaElement) => {
      const handler = onSelectionDidChangeRef.current;
      if (!handler) return;
      const selection = { start: el.selectionStart, end: el.selectionEnd };
      const last = lastSelectionRef.current;
      if (last && last.start === selection.start && last.end === selection.end) return;
      lastSelectionRef.current = selection;
      handler(selection);
    }, []);
    const boundSelectionElRef = useRef<{ el: HTMLTextAreaElement; unbind: () => void } | null>(
      null,
    );
    // --- Bind to whichever <textarea> is rendered (plain, autoSize or resizable); rebinding only
    // --- when that element changes
    useEffect(() => {
      const el = inputRef.current;
      const bound = boundSelectionElRef.current;
      if (bound?.el === el) return;
      bound?.unbind();
      boundSelectionElRef.current = null;
      if (!el) return;
      // --- The same triggers and rules as React's select plugin: report only while the field has
      // --- focus, and not while a mouse button is down (focus and caret placement each change
      // --- the selection; the press reports once on mouseup). Focus is judged by the field's own
      // --- root, document or shadow root, which is the part React gets wrong in a shadow root.
      // --- The field's own "selectionchange"/"input" events are not used: they also fire for
      // --- programmatic value updates, at mount and while React re-sets a controlled value.
      let mouseDown = false;
      const hasFocus = () => (el.getRootNode() as Document | ShadowRoot).activeElement === el;
      const report = () => {
        if (!mouseDown && hasFocus()) reportSelection(el);
      };
      const onMouseDown = () => {
        mouseDown = true;
      };
      const onMouseUp = () => {
        if (!mouseDown) return;
        mouseDown = false;
        report();
      };
      const docEvents = ["selectionchange", "keydown", "keyup", "dragend"];
      docEvents.forEach((type) => document.addEventListener(type, report, true));
      el.addEventListener("mousedown", onMouseDown);
      // --- A drag may end outside the field
      document.addEventListener("mouseup", onMouseUp, true);
      boundSelectionElRef.current = {
        el,
        unbind: () => {
          docEvents.forEach((type) => document.removeEventListener(type, report, true));
          el.removeEventListener("mousedown", onMouseDown);
          document.removeEventListener("mouseup", onMouseUp, true);
        },
      };
    });
    useEffect(() => () => boundSelectionElRef.current?.unbind(), []);

    const getSelection = useCallback((): TextAreaSelection | undefined => {
      const el = inputRef.current;
      return el ? { start: el.selectionStart, end: el.selectionEnd } : undefined;
    }, []);

    const focus = useCallback(() => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }, []);

    const insert = useCallback(
      (text: any) => {
        const input = inputRef?.current;
        if (input && text) {
          const start = input.selectionStart;
          const value = input.value;
          onInputChange({
            // @ts-ignore
            target: {
              value: value.substring(0, start) + text + value.substring(start),
            },
          });
          setCursorPosition(start + text.length);
        }
      },
      [inputRef, onInputChange],
    );

    const setValue = useEvent((val: string) => {
      updateValue(val);
    });

    useEffect(() => {
      if (cursorPosition) {
        const input = inputRef?.current;
        if (input) {
          input.setSelectionRange(cursorPosition, cursorPosition);
          setCursorPosition(null);
        }
      }
    }, [localValue, cursorPosition, inputRef]);

    useEffect(() => {
      registerComponentApi?.({
        focus,
        insert,
        setValue,
        getSelection,
      });
    }, [focus, insert, registerComponentApi, setValue, getSelection]);

    // --- Handle the Enter key press
    const handleEnter = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (
          e.currentTarget.form &&
          enterSubmits &&
          e.key.toLowerCase() === "enter" &&
          !e.shiftKey
        ) {
          // -- Do not generate a new line
          e.preventDefault();
          e.currentTarget.form?.requestSubmit();
        }
        if (e.currentTarget.form && escResets && e.key.toLowerCase() === "escape" && !e.shiftKey) {
          e.preventDefault();
          e.currentTarget.form?.reset();
        }
      },
      [enterSubmits, escResets],
    );

    let textareaClasses = classnames(className, styles.textarea, {
      [styles.resizeHorizontal]: resize === "horizontal",
      [styles.resizeVertical]: resize === "vertical",
      [styles.resizeBoth]: resize === "both",
      [styles.focused]: focused,
      [styles.disabled]: !enabled,
      [styles.error]: validationStatus === "error",
      [styles.warning]: validationStatus === "warning",
      [styles.valid]: validationStatus === "valid",
    });
    const textareaProps: TextareaHTMLAttributes<HTMLTextAreaElement> &
      React.RefAttributes<HTMLTextAreaElement> = {
      ...rest,
      id,
      className: textareaClasses,
      ref,
      style: style as any,
      value: controlled ? localValue || "" : undefined,
      disabled: !enabled,
      name: id,
      placeholder,
      required,
      maxLength,
      "aria-multiline": true,
      "aria-readonly": readOnly,
      readOnly: readOnly,
      onChange: onInputChange,
      onCopy: handleCopy,
      onFocus: handleOnFocus,
      onBlur: handleOnBlur,
      onKeyDown: handleEnter,
      autoComplete: normalizeAutoComplete(autoComplete),
      autoCorrect: normalizeOnOff(autoCorrect),
      spellCheck,
      autoCapitalize,
    };

    const renderConciseFeedback = () =>
      !finalVerboseValidationFeedback && (
        <Part partId={PART_CONCISE_VALIDATION_FEEDBACK}>
          <div className={styles.floatingFeedback}>
            <ConciseValidationFeedback
              validationStatus={validationStatus}
              invalidMessages={invalidMessages}
              successIcon={finalValidationIconSuccess}
              errorIcon={finalValidationIconError}
            />
          </div>
        </Part>
      );

    if (resize === "both" || resize === "horizontal" || resize === "vertical") {
      return (
        <div className={classnames(styles.container, classes?.[COMPONENT_PART_KEY])}>
          <Part partId={PART_INPUT}>
            <TextAreaResizable
              ref={ref}
              {...textareaProps}
              style={style as any}
              className={classnames(textareaClasses)}
              maxRows={maxRows}
              minRows={minRows}
              rows={rows}
            />
          </Part>
          {renderConciseFeedback()}
        </div>
      );
    }
    if (autoSize || !isNil(maxRows) || !isNil(minRows)) {
      return (
        <div className={classnames(styles.container, classes?.[COMPONENT_PART_KEY])}>
          <Part partId={PART_INPUT}>
            <TextareaAutosize
              ref={ref}
              {...textareaProps}
              style={style as any}
              className={classnames(textareaClasses)}
              maxRows={maxRows}
              minRows={minRows}
              rows={rows}
            />
          </Part>
          {renderConciseFeedback()}
        </div>
      );
    }

    return (
      <div className={classnames(styles.container, classes?.[COMPONENT_PART_KEY])}>
        <Part partId={PART_INPUT}>
          <textarea
            ref={ref}
            {...textareaProps}
            rows={rows}
            className={classnames(textareaClasses)}
          />
        </Part>
        {renderConciseFeedback()}
      </div>
    );
  }),
);
