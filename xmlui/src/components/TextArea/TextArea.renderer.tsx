import { wrapComponent } from "../../runtime/rendering/adapter";
import { TextAreaMd } from "./TextArea";
import { defaultProps } from "./TextArea.defaults";
import { TextAreaNative, type TextAreaApi } from "./TextAreaReact";

const COMP = "TextArea";

export const textAreaRenderer = wrapComponent({
  name: COMP,
  metadata: TextAreaMd,
  defaultPart: "root",
  renderer({ adapter }) {
    return (
      <TextAreaNative
        {...adapter.rootAttrs("input")}
        ref={(api: TextAreaApi | null) => {
          if (api) {
            adapter.registerApi(api);
          }
        }}
        id={adapter.stringProp("id")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        label={adapter.prop("label")}
        placeholder={adapter.stringProp("placeholder", defaultProps.placeholder)}
        maxLength={adapter.prop("maxLength") as number | undefined}
        rows={adapter.prop("rows", defaultProps.rows) as number | undefined}
        minRows={adapter.prop("minRows") as number | undefined}
        maxRows={adapter.prop("maxRows") as number | undefined}
        autoSize={adapter.booleanProp("autoSize", false)}
        resize={adapter.stringProp("resize")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        autoComplete={adapter.prop("autoComplete", defaultProps.autoComplete)}
        autoCorrect={adapter.prop("autoCorrect") as boolean | undefined}
        spellCheck={adapter.prop("spellCheck") as boolean | undefined}
        autoCapitalize={adapter.stringProp("autoCapitalize")}
        enterSubmits={adapter.booleanProp("enterSubmits", defaultProps.enterSubmits)}
        escResets={adapter.booleanProp("escResets", false)}
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
