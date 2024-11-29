import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { useOptionType } from "@components/Option/OptionTypeProvider";
import type { Option } from "@components/abstractions";
import { memo } from "react";
import { dEnabled } from "@components/metadata-helpers";

const COMP = "Option";

export const OptionMd = createMetadata({
    description:
        `\`${COMP}\` is a non-visual component describing a selection option. Other components ` +
        `(such as \`Select\`, \`Combobox\`, and others) may use nested \`Option\` instances ` +
        `from which the user can select.`,
    props: {
        label: d(
            `This property defines the text to display for the option. If \`label\` is not defined, ` +
            `\`Option\` will use the \`value\` as the label.`,
        ),
        value: d(
            `This property defines the value of the option. If \`value\` is not defined, ` +
            `\`Option\` will use the \`label\` as the value.`,
        ),
        enabled: dEnabled(),
    },
});

const OptionNative = memo((props: Option) => {
    const OptionType = useOptionType();
    if (!OptionType) {
        return null;
    }
    return <OptionType {...props} />;
});
OptionNative.displayName = "OptionNative";

export const optionComponentRenderer = createComponentRenderer(
    COMP,
    OptionMd,
    ({ node, extractValue, layoutCss }) => {
        return (
            <OptionNative
                value={extractValue(node.props.value)}
                label={extractValue.asOptionalString(node.props.label)}
                enabled={extractValue.asOptionalBoolean(node.props.enabled)}
                style={layoutCss}
            />
        );
    },
);
