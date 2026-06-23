import { wrapComponent } from "../../runtime/rendering/adapter";
import { RatingInputMd } from "./RatingInput";
import { defaultProps } from "./RatingInput.defaults";
import { RatingInputNative, type RatingInputApi } from "./RatingInputReact";

const COMP = "RatingInput";

export const ratingInputRenderer = wrapComponent({
  name: COMP,
  metadata: RatingInputMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const apiRef = { current: null as RatingInputApi | null };
    return (
      <RatingInputNative
        {...adapter.rootAttrs("input")}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        maxRating={adapter.prop("maxRating", defaultProps.maxRating)}
        placeholder={adapter.stringProp("placeholder")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        onDidChange={(value) => {
          void adapter.event("didChange")(value);
        }}
        onFocus={() => {
          void adapter.event("gotFocus")();
        }}
        onBlur={() => {
          void adapter.event("lostFocus")();
        }}
      />
    );
  },
});
