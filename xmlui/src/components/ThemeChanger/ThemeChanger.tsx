import { useState } from "react";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { useThemes } from "../../components-core/theming/ThemeContext";
import { createComponentRenderer } from "../../components-core/renderers";
import { DropdownMenu, MenuItem } from "../DropdownMenu/DropdownMenuNative";
import { Button } from "../Button/ButtonNative";
import { ContentSeparator } from "../ContentSeparator/ContentSeparatorNative";
import { ModalDialog } from "../ModalDialog/ModalDialogNative";
import { RadioGroup, RadioGroupOption } from "../RadioGroup/RadioGroupNative";
import { Stack } from "../Stack/StackNative";
import { Text } from "../Text/TextNative";
import { Icon } from "../Icon/IconNative";

const COMP = "ThemeChangerButton";
export const ThemeChangerButtonMd = createMetadata({
  status: "experimental",
  docFolder: "ThemeChanger",
  description: `The \`${COMP}\` component is a component that allows the user to change the theme of the app.`,
  props: {
    showSettings: d(
      "This property indicates if the Settings function of this component is displayed.",
      null,
      "boolean",
      true,
    ),
  },
});

/**
 * Define the renderer for the Button component
 */
export const themeChangerButtonComponentRenderer = createComponentRenderer(
  COMP,
  ThemeChangerButtonMd,
  ({ renderChild, node, extractValue }) => {
    const [isThemeSettingsOpen, setThemeSettingsOpen] = useState(false);
    const {
      activeThemeId,
      activeThemeTone,
      setActiveThemeId,
      setActiveThemeTone,
      availableThemeIds,
    } = useThemes();

    const renderPreview = (id: string) => {
      return renderChild({
        type: "Theme",
        props: {
          themeId: id,
          width: "100%",
          isRoot: "true",
          tone: "{activeThemeTone}",
        },
        children: [
          {
            type: "Card",
            props: {
              width: "100%",
            },
            children: [
              {
                type: "App",
                props: {
                  width: "100%",
                  height: "10rem",
                  layout: "horizontal",
                },
                children: [
                  {
                    type: "NavPanel",
                    props: {},
                    children: [
                      {
                        type: "NavLink",
                        props: {
                          active: "true",
                          url: "/",
                          label: "Home",
                        },
                      },
                      {
                        type: "NavLink",
                        props: {
                          url: "/about",
                          label: "About",
                        },
                      },
                      {
                        type: "NavLink",
                        props: {
                          url: "/contact",
                          label: "Contact",
                        },
                      },
                    ],
                  },
                  {
                    type: "Pages",
                    props: {
                      defaultRoute: "/",
                    },
                    children: [
                      {
                        type: "CVStack",
                        props: {
                          height: "100%",
                        },
                        children: [
                          {
                            type: "Text",
                            props: {
                              value: "Hello",
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
    };

    const showSettings = extractValue.asOptionalBoolean(node.props.showSettings, true);
    return (
      <>
        <DropdownMenu triggerTemplate={<Button variant="ghost" icon={<Icon name="palette" />} />}>
          <MenuItem
            iconPosition="end"
            icon={activeThemeTone === "light" ? <Icon name={"checkmark"} /> : ""}
            label="Light"
            onClick={() => setActiveThemeTone("light")}
          />
          <MenuItem
            iconPosition="end"
            icon={activeThemeTone === "dark" ? <Icon name={"checkmark"} /> : ""}
            label="Dark"
            onClick={() => setActiveThemeTone("dark")}
          />
          {showSettings && (
            <>
              <ContentSeparator />
              <MenuItem label="Theme Settings" onClick={() => setThemeSettingsOpen(true)} />
            </>
          )}
        </DropdownMenu>

        {isThemeSettingsOpen && (
          <ModalDialog isInitiallyOpen={true} onClose={() => setThemeSettingsOpen(false)}>
            <Stack orientation={"vertical"}>
              <Text variant="strong" layout={{ marginBottom: "1rem" }}>
                Set theme
              </Text>
              <Stack orientation={"vertical"} style={{ width: "100%", overflow: "scroll" }}>
                <Stack
                  orientation={"horizontal"}
                  verticalAlignment={"center"}
                  style={{ gap: ".5rem", flexWrap: "wrap" }}
                >
                  {availableThemeIds.map((themeUid: any) => (
                    <Button
                      key={themeUid}
                      style={{ padding: 0, width: "calc(50% - 0.5rem)" }}
                      variant={activeThemeId === themeUid ? "solid" : "ghost"}
                      themeColor="primary"
                      onClick={() => setActiveThemeId(themeUid)}
                    >
                      <Stack style={{ width: "100%" }}>
                        {renderPreview(themeUid)}
                        <Text>{themeUid}</Text>
                      </Stack>
                    </Button>
                  ))}
                </Stack>
              </Stack>
              <Stack orientation={"vertical"} style={{ minHeight: "fit-content" }}>
                <Text variant="strong" layout={{ marginBottom: "1rem" }}>
                  Set tone
                </Text>
                <RadioGroup
                  id="toneSelector"
                  value={activeThemeTone}
                  onDidChange={(value: any) => setActiveThemeTone(value)}
                >
                  <Stack style={{ gap: "1rem" }} orientation={"horizontal"}>
                    <RadioGroupOption label="Light" value="light" />
                    <RadioGroupOption label="Dark" value="dark" />
                  </Stack>
                </RadioGroup>
              </Stack>
            </Stack>
          </ModalDialog>
        )}
      </>
    );
  },
);
