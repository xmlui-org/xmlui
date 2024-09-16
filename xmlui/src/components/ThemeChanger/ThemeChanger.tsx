import type { ComponentDef } from "@abstractions/ComponentDefs";
import { DropdownMenu, MenuItem } from "@components/DropdownMenu/DropdownMenuNative";
import { Button } from "@components/Button/ButtonNative";
import { ContentSeparator } from "@components/ContentSeparator/ContentSeparatorNative";
import { ModalDialog } from "@components/ModalDialog/ModalDialogNative";
import { RadioGroup, RadioGroupOption } from "@components/RadioGroup/RadioGroupNative";
import { useState } from "react";
import { useThemes } from "@components-core/theming/ThemeContext";
import { createComponentRenderer } from "@components-core/renderers";
import { Stack } from "@components/Stack/StackNative";
import { Text } from "@components/Text/TextNative";
import { Icon } from "@components/Icon/IconNative";

/**
 * This interface describes an AppEngine DropDownButton component.
 */
interface ThemeChangerButtonComponentDef extends ComponentDef {
  type: "ThemeChangerButton";
}

/**
 * Define the renderer for the Button component
 */
export const themeChangerButtonComponentRenderer =
  createComponentRenderer<ThemeChangerButtonComponentDef>(
    "ThemeChangerButton",
    ({ renderChild }) => {
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

      return (
        <>
          <DropdownMenu triggerTemplate={<Button variant="ghost" icon={<Icon name="palette" />} />}>
            <MenuItem
              iconPosition="right"
              icon={activeThemeTone === "light" ? <Icon name={"checkmark"} /> : ""}
              label="Light"
              onClick={() => setActiveThemeTone("light")}
            />
            <MenuItem
              iconPosition="right"
              icon={activeThemeTone === "dark" ? <Icon name={"checkmark"} /> : ""}
              label="Dark"
              onClick={() => setActiveThemeTone("dark")}
            />
            <ContentSeparator />
            <MenuItem label="Theme Settings" onClick={() => setThemeSettingsOpen(true)} />
          </DropdownMenu>

          {isThemeSettingsOpen && (
            <ModalDialog isInitiallyOpen={true} onClose={() => setThemeSettingsOpen(false)}>
              <Stack orientation={"vertical"}>
                <Text variant="strong" layout={{ marginBottom: "1rem" }}>
                  Set theme
                </Text>
                <Stack orientation={"vertical"} layout={{ width: "100%", overflow: "scroll" }}>
                  <Stack
                    orientation={"horizontal"}
                    verticalAlignment={"center"}
                    layout={{ gap: ".5rem", flexWrap: "wrap" }}
                  >
                    {availableThemeIds.map((themeUid: any) => (
                      <Button
                        key={themeUid}
                        style={{ padding: 0, width: "calc(50% - 0.5rem)" }}
                        variant={activeThemeId === themeUid ? "solid" : "ghost"}
                        themeColor="primary"
                        onClick={() => setActiveThemeId(themeUid)}
                      >
                        <Stack layout={{ width: "100%" }}>
                          {renderPreview(themeUid)}
                          <Text>{themeUid}</Text>
                        </Stack>
                      </Button>
                    ))}
                  </Stack>
                </Stack>
                <Stack orientation={"vertical"} layout={{ minHeight: "fit-content" }}>
                  <Text variant="strong" layout={{ marginBottom: "1rem" }}>
                    Set tone
                  </Text>
                  <RadioGroup
                    id="toneSelector"
                    value={activeThemeTone}
                    onDidChange={(value: any) => setActiveThemeTone(value)}
                  >
                    <Stack layout={{ gap: "1rem" }} orientation={"horizontal"}>
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
