import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { TabItemComponent } from "../../../src/components/Tabs/TabItemReact";
import { TabContext } from "../../../src/components/Tabs/TabContext";

vi.mock("@radix-ui/react-tabs", () => ({
  Content: React.forwardRef<HTMLDivElement, any>(function Content(
    { children, value, forceMount, ...rest },
    ref,
  ) {
    return (
      <div ref={ref} data-value={value} data-force-mount={forceMount ? "true" : "false"} {...rest}>
        {children}
      </div>
    );
  }),
}));

function renderTabItem({
  activeTabId,
  keepMounted = false,
  activated = vi.fn(),
  deactivated = vi.fn(),
}: {
  activeTabId: string;
  keepMounted?: boolean;
  activated?: () => void;
  deactivated?: () => void;
}) {
  const register = vi.fn();
  const unRegister = vi.fn();
  const getTabItems = vi.fn(() => [{ innerId: ":r0:", label: "Account" }]);

  const result = render(
    <TabContext.Provider
      value={{
        register,
        unRegister,
        activeTabId,
        getTabItems,
        keepMounted,
      }}
    >
      <TabItemComponent label="Account" activated={activated} deactivated={deactivated}>
        Account content
      </TabItemComponent>
    </TabContext.Provider>,
  );

  return { ...result, activated, deactivated, register, unRegister };
}

describe("TabItemComponent", () => {
  it("fires activated when it becomes active and deactivated when it stops being active", () => {
    const activated = vi.fn();
    const deactivated = vi.fn();
    const register = vi.fn();
    const unRegister = vi.fn();
    const getTabItems = vi.fn(() => []);
    const makeContextValue = (activeTabId: string) => ({
      register,
      unRegister,
      activeTabId,
      getTabItems,
      keepMounted: true,
    });

    const { rerender } = render(
      <TabContext.Provider value={makeContextValue("")}>
        <TabItemComponent label="Account" activated={activated} deactivated={deactivated}>
          Account content
        </TabItemComponent>
      </TabContext.Provider>,
    );

    const tabId = register.mock.calls[0][0].innerId;
    getTabItems.mockReturnValue([{ innerId: tabId, label: "Account" }]);

    expect(activated).not.toHaveBeenCalled();
    expect(deactivated).not.toHaveBeenCalled();

    rerender(
      <TabContext.Provider value={makeContextValue(tabId)}>
        <TabItemComponent label="Account" activated={activated} deactivated={deactivated}>
          Account content
        </TabItemComponent>
      </TabContext.Provider>,
    );

    expect(activated).toHaveBeenCalledTimes(1);
    expect(deactivated).not.toHaveBeenCalled();

    rerender(
      <TabContext.Provider value={makeContextValue("other-tab")}>
        <TabItemComponent label="Account" activated={activated} deactivated={deactivated}>
          Account content
        </TabItemComponent>
      </TabContext.Provider>,
    );

    expect(activated).toHaveBeenCalledTimes(1);
    expect(deactivated).toHaveBeenCalledTimes(1);
  });

  it("does not fire deactivated for a tab that starts inactive", () => {
    const deactivated = vi.fn();

    renderTabItem({
      activeTabId: "other-tab",
      keepMounted: true,
      deactivated,
    });

    expect(deactivated).not.toHaveBeenCalled();
    expect(screen.getByText("Account content")).not.toBeVisible();
  });

  it("keeps inactive content mounted and hidden when keepMounted is true", () => {
    renderTabItem({
      activeTabId: "other-tab",
      keepMounted: true,
    });

    const content = screen.getByText("Account content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveStyle({ display: "none" });
    expect(content).toHaveAttribute("data-force-mount", "true");
  });

  it("does not render inactive content when keepMounted is false", () => {
    renderTabItem({
      activeTabId: "other-tab",
      keepMounted: false,
    });

    expect(screen.queryByText("Account content")).toBeNull();
  });
});
