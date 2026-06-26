import { wrapComponent } from "../../runtime/rendering/adapter";
import { FileInputMd } from "./FileInput";
import { defaultProps } from "./FileInput.defaults";
import { FileInputNative, type FileInputApi } from "./FileInputReact";

const COMP = "FileInput";

export const fileInputRenderer = wrapComponent({
  name: COMP,
  metadata: FileInputMd,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <FileInputNative
      {...adapter.rootAttrs("input")}
      ref={(api: FileInputApi | null) => {
        if (api) {
          adapter.registerApi(api as unknown as Record<string, unknown>);
        }
      }}
      id={adapter.stringProp("id")}
      bindTo={adapter.stringProp("bindTo")}
      value={adapter.prop("value")}
      initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
      acceptsFileType={adapter.prop("acceptsFileType")}
      multiple={adapter.booleanProp("multiple", defaultProps.multiple)}
      directory={adapter.booleanProp("directory", defaultProps.directory)}
      placeholder={adapter.stringProp("placeholder")}
      buttonLabel={adapter.stringProp("buttonLabel", defaultProps.buttonLabel)}
      buttonIcon={adapter.stringProp("buttonIcon", "browse:FileInput")}
      buttonIconPosition={adapter.stringProp("buttonIconPosition", defaultProps.buttonIconPosition)}
      buttonPosition={adapter.stringProp("buttonPosition", defaultProps.buttonPosition)}
      buttonSize={adapter.stringProp("buttonSize", defaultProps.buttonSize)}
      buttonThemeColor={adapter.stringProp("buttonThemeColor", defaultProps.buttonThemeColor)}
      buttonVariant={adapter.stringProp("buttonVariant", defaultProps.buttonVariant)}
      enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
      readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
      required={adapter.booleanProp("required", false)}
      autoFocus={adapter.booleanProp("autoFocus", false)}
      validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
      parseAs={adapter.stringProp("parseAs")}
      csvOptions={adapter.prop("csvOptions")}
      onDidChange={(value) => { void adapter.event("didChange")(value); }}
      onParseError={(error, file) => { void adapter.event("parseError")(error, file); }}
      onFocus={() => { void adapter.event("gotFocus")(); }}
      onBlur={() => { void adapter.event("lostFocus")(); }}
    />
  ),
});
