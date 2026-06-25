import { wrapComponent } from "../../runtime/rendering/adapter";
import { PasswordInputMd, TextBoxMd } from "./TextBox";
import { defaultProps } from "./TextBox.defaults";
import { TextBoxNative, type TextBoxApi } from "./TextBoxReact";

const COMP = "TextBox";

export const textBoxRenderer = wrapComponent({
  name: COMP,
  metadata: TextBoxMd,
  defaultPart: "input",
  renderer({ adapter }) {
    return (
      <TextBoxNative
        {...adapter.rootAttrs("input")}
        ref={(api: TextBoxApi | null) => {
          if (api) {
            adapter.registerApi(api);
          }
        }}
        id={adapter.stringProp("id")}
        bindTo={adapter.stringProp("bindTo")}
        type={adapter.stringProp("type", defaultProps.type)}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        label={adapter.prop("label")}
        labelPosition={adapter.stringProp("labelPosition")}
        labelBreak={
          Object.prototype.hasOwnProperty.call(adapter.props, "labelBreak")
            ? adapter.booleanProp("labelBreak", false)
            : undefined
        }
        labelWidth={adapter.prop("labelWidth")}
        direction={adapter.stringProp("direction")}
        placeholder={adapter.stringProp("placeholder")}
        maxLength={adapter.prop("maxLength") as number | undefined}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        autoComplete={adapter.prop("autoComplete", defaultProps.autoComplete)}
        autoCorrect={adapter.prop("autoCorrect")}
        spellCheck={adapter.prop("spellCheck")}
        autoCapitalize={adapter.stringProp("autoCapitalize")}
        startText={adapter.prop("startText")}
        startIcon={adapter.prop("startIcon")}
        endText={adapter.prop("endText")}
        endIcon={adapter.prop("endIcon")}
        gap={adapter.stringProp("gap")}
        showPasswordToggle={adapter.booleanProp("showPasswordToggle", false)}
        passwordVisibleIcon={adapter.stringProp("passwordVisibleIcon", defaultProps.passwordVisibleIcon)}
        passwordHiddenIcon={adapter.stringProp("passwordHiddenIcon", defaultProps.passwordHiddenIcon)}
        verboseValidationFeedback={adapter.booleanProp("verboseValidationFeedback", true)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        invalidMessages={adapter.prop("invalidMessages", defaultProps.invalidMessages)}
        style={adapter.style}
        className={adapter.className}
        onDidChange={(value) => { void adapter.event("didChange")(value); }}
        onFocus={() => { void adapter.event("gotFocus")(); }}
        onBlur={() => { void adapter.event("lostFocus")(); }}
      />
    );
  },
});

export const passwordInputRenderer = wrapComponent({
  name: "PasswordInput",
  metadata: PasswordInputMd,
  defaultPart: "input",
  renderer({ adapter }) {
    return (
      <TextBoxNative
        {...adapter.rootAttrs("input")}
        ref={(api: TextBoxApi | null) => {
          if (api) {
            adapter.registerApi(api);
          }
        }}
        id={adapter.stringProp("id")}
        bindTo={adapter.stringProp("bindTo")}
        type="password"
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        label={adapter.prop("label")}
        labelPosition={adapter.stringProp("labelPosition")}
        labelBreak={
          Object.prototype.hasOwnProperty.call(adapter.props, "labelBreak")
            ? adapter.booleanProp("labelBreak", false)
            : undefined
        }
        labelWidth={adapter.prop("labelWidth")}
        direction={adapter.stringProp("direction")}
        placeholder={adapter.stringProp("placeholder")}
        maxLength={adapter.prop("maxLength") as number | undefined}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        autoComplete={adapter.prop("autoComplete", defaultProps.autoComplete)}
        autoCorrect={adapter.prop("autoCorrect")}
        spellCheck={adapter.prop("spellCheck")}
        autoCapitalize={adapter.stringProp("autoCapitalize")}
        startText={adapter.prop("startText")}
        startIcon={adapter.prop("startIcon")}
        endText={adapter.prop("endText")}
        endIcon={adapter.prop("endIcon")}
        gap={adapter.stringProp("gap")}
        showPasswordToggle={adapter.booleanProp("showPasswordToggle", false)}
        passwordVisibleIcon={adapter.stringProp("passwordVisibleIcon", defaultProps.passwordVisibleIcon)}
        passwordHiddenIcon={adapter.stringProp("passwordHiddenIcon", defaultProps.passwordHiddenIcon)}
        verboseValidationFeedback={adapter.booleanProp("verboseValidationFeedback", true)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        invalidMessages={adapter.prop("invalidMessages", defaultProps.invalidMessages)}
        style={adapter.style}
        className={adapter.className}
        onDidChange={(value) => { void adapter.event("didChange")(value); }}
        onFocus={() => { void adapter.event("gotFocus")(); }}
        onBlur={() => { void adapter.event("lostFocus")(); }}
      />
    );
  },
});
