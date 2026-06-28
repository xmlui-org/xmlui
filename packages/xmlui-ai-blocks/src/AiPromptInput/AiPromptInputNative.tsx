import React, {
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import TextareaAutosize from "react-textarea-autosize";

import { Button, Icon, type RegisterComponentApiFn, type UpdateStateFn } from "xmlui";

import styles from "./AiPromptInput.module.scss";

export type AiPromptInputModel = string | { value: string; label?: string; description?: string };

export type AiPromptInputSubmitPayload = {
  value: string;
  model?: string;
};

export type AiPromptInputModelChangePayload = {
  model?: string;
};

export type AiPromptInputNativeProps = {
  value?: string;
  initialValue?: string;
  model?: string;
  initialModel?: string;
  models?: AiPromptInputModel[];
  placeholder?: string;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  running?: boolean;
  enabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  clearOnSubmit?: boolean;
  enterSubmits?: boolean;
  sendLabel?: string;
  stopLabel?: string;
  modelLabel?: string;
  updateState?: UpdateStateFn;
  registerComponentApi?: RegisterComponentApiFn;
  onSubmit?: (value: AiPromptInputSubmitPayload) => void;
  onStop?: () => void;
  onDidChange?: (value: string) => void;
  onModelChange?: (value: AiPromptInputModelChangePayload) => void;
  className?: string;
  classes?: Record<string, string>;
  style?: CSSProperties;
};

export const defaultProps = {
  placeholder: "Describe what you want to build",
  rows: 3,
  running: false,
  enabled: true,
  readOnly: false,
  clearOnSubmit: true,
  enterSubmits: true,
  sendLabel: "Send",
  stopLabel: "Stop",
  modelLabel: "Model",
};

function normalizeModel(model: AiPromptInputModel) {
  if (typeof model === "string") {
    return { value: model, label: model };
  }
  return { value: model.value, label: model.label ?? model.value };
}

function resolveInitialModel(models: AiPromptInputModel[] | undefined, initialModel: string | undefined) {
  if (initialModel) {
    return initialModel;
  }
  return models?.[0] ? normalizeModel(models[0]).value : undefined;
}

export const AiPromptInputNative = memo(
  forwardRef<HTMLDivElement, AiPromptInputNativeProps>(function AiPromptInputNative(
    {
      value,
      initialValue,
      model,
      initialModel,
      models,
      placeholder = defaultProps.placeholder,
      rows = defaultProps.rows,
      minRows,
      maxRows,
      maxLength,
      running = defaultProps.running,
      enabled = defaultProps.enabled,
      readOnly = defaultProps.readOnly,
      autoFocus,
      clearOnSubmit = defaultProps.clearOnSubmit,
      enterSubmits = defaultProps.enterSubmits,
      sendLabel = defaultProps.sendLabel,
      stopLabel = defaultProps.stopLabel,
      modelLabel = defaultProps.modelLabel,
      updateState,
      registerComponentApi,
      onSubmit,
      onStop,
      onDidChange,
      onModelChange,
      className,
      classes,
      style,
    },
    ref,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const stateSyncTimerRef = useRef<number | undefined>(undefined);
    const [draftValue, setDraftValue] = useState(value ?? initialValue ?? "");
    const [focused, setFocused] = useState(false);
    const modelOptions = models?.map(normalizeModel) ?? [];
    const selectedModel = model ?? resolveInitialModel(models, initialModel);
    const disabled = !enabled;
    const canSubmit = !disabled && !readOnly && !running && Boolean(draftValue.trim());

    useEffect(() => {
      updateState?.(
        {
          value: initialValue ?? "",
          model: resolveInitialModel(models, initialModel),
        },
        { initial: true },
      );
    }, [initialModel, initialValue, models, updateState]);

    useEffect(() => {
      setDraftValue(value ?? "");
    }, [value]);

    useEffect(() => {
      if (autoFocus) {
        window.setTimeout(() => textareaRef.current?.focus(), 0);
      }
    }, [autoFocus]);

    const updateValue = useCallback(
      (nextValue: string) => {
        if (stateSyncTimerRef.current !== undefined) {
          window.clearTimeout(stateSyncTimerRef.current);
          stateSyncTimerRef.current = undefined;
        }
        setDraftValue(nextValue);
        updateState?.({ value: nextValue, model: selectedModel });
        onDidChange?.(nextValue);
      },
      [onDidChange, selectedModel, updateState],
    );

    const updateDraftValue = useCallback(
      (nextValue: string) => {
        setDraftValue(nextValue);
        onDidChange?.(nextValue);
      },
      [onDidChange],
    );

    const syncDraftValue = useCallback(() => {
      if (stateSyncTimerRef.current !== undefined) {
        window.clearTimeout(stateSyncTimerRef.current);
        stateSyncTimerRef.current = undefined;
      }
      updateState?.({ value: draftValue, model: selectedModel });
    }, [draftValue, selectedModel, updateState]);

    useEffect(() => {
      if (!focused) return undefined;
      if (stateSyncTimerRef.current !== undefined) {
        window.clearTimeout(stateSyncTimerRef.current);
      }
      stateSyncTimerRef.current = window.setTimeout(() => {
        stateSyncTimerRef.current = undefined;
        updateState?.({ value: draftValue, model: selectedModel });
      }, 300);

      return () => {
        if (stateSyncTimerRef.current !== undefined) {
          window.clearTimeout(stateSyncTimerRef.current);
          stateSyncTimerRef.current = undefined;
        }
      };
    }, [draftValue, focused, selectedModel, updateState]);

    const updateModel = useCallback(
      (nextModel: string | undefined) => {
        updateState?.({ value: draftValue, model: nextModel });
        onModelChange?.({ model: nextModel });
      },
      [draftValue, onModelChange, updateState],
    );

    const submit = useCallback(() => {
      const trimmed = draftValue.trim();
      if (!trimmed || running || disabled || readOnly) return;
      onSubmit?.({ value: draftValue, model: selectedModel });
      if (clearOnSubmit) {
        updateValue("");
      } else {
        syncDraftValue();
      }
    }, [
      clearOnSubmit,
      disabled,
      draftValue,
      onSubmit,
      readOnly,
      running,
      selectedModel,
      syncDraftValue,
      updateValue,
    ]);

    useEffect(() => {
      registerComponentApi?.({
        focus: () => {
          window.setTimeout(() => textareaRef.current?.focus(), 0);
        },
        setValue: (nextValue: string) => updateValue(nextValue ?? ""),
        clear: () => updateValue(""),
        submit,
        stop: () => onStop?.(),
        setModel: (nextModel: string) => updateModel(nextModel),
      });
    }, [onStop, registerComponentApi, submit, updateModel, updateValue]);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      updateDraftValue(event.target.value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (enterSubmits && event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submit();
      }
    };

    return (
      <div
        ref={ref}
        className={classnames(styles.root, classes?.["-component"], className)}
        style={style}
        data-focused={focused ? "true" : "false"}
        data-running={running ? "true" : "false"}
      >
        <TextareaAutosize
          ref={textareaRef}
          className={classnames(styles.textarea, classes?.input)}
          value={draftValue}
          placeholder={placeholder}
          minRows={minRows ?? rows}
          maxRows={maxRows}
          cacheMeasurements
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          aria-label="Prompt"
          aria-multiline="true"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            syncDraftValue();
          }}
        />

        <div className={classnames(styles.footer, classes?.footer)}>
          <div className={classnames(styles.leftTools, classes?.tools)}>
            {modelOptions.length > 0 ? (
              <select
                className={classnames(styles.modelSelect, classes?.modelSelect)}
                value={selectedModel ?? ""}
                aria-label={modelLabel}
                disabled={disabled || readOnly}
                onChange={(event) => updateModel(event.target.value || undefined)}
              >
                {modelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          <div className={classnames(styles.rightTools, classes?.actions)}>
            {running ? (
              <Button
                type="button"
                icon={<Icon name="square" size="xs" />}
                className={classnames(styles.stopButton, classes?.stopButton)}
                disabled={disabled}
                onClick={() => onStop?.()}
              >
              </Button>
            ) : null}
            <Button
              type="button"
              icon={<Icon name="arrowup" size="xs" />}
              className={classnames(styles.sendButton, classes?.sendButton)}
              disabled={!canSubmit}
              onClick={submit}
            >
            </Button>
          </div>
        </div>
      </div>
    );
  }),
);
