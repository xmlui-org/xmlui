import React, { useEffect, useMemo, useRef } from "react";

import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";

export const CardMd = createMetadata({
  status: "stable",
  description: "`Card` is a container that groups related content with optional title, subtitle, avatar, and scrolling APIs.",
  props: {
    id: {
      description: "Defines a component instance identifier used for references and APIs.",
      valueType: "string",
    },
    avatarUrl: {
      description: "The URL for an avatar image.",
      valueType: "string",
    },
    showAvatar: {
      description: "Indicates whether the avatar should be displayed.",
      valueType: "boolean",
      defaultValue: false,
    },
    avatarSize: {
      description: "Sets the avatar size.",
      valueType: "string",
    },
    title: {
      description: "The card title.",
      valueType: "string",
    },
    subtitle: {
      description: "The card subtitle.",
      valueType: "string",
    },
    linkTo: {
      description: "Wraps the title in a link that navigates to the specified target.",
      valueType: "string",
    },
    orientation: {
      description: "Controls whether Card children are laid out horizontally or vertically.",
      valueType: "string",
      defaultValue: "vertical",
    },
    testId: {
      description: "Adds a test identifier to the card root.",
      valueType: "string",
    },
  },
  events: {
    click: {
      description: "Triggered when the Card is clicked.",
      signature: "click(event: MouseEvent): void",
    },
    doubleClick: {
      description: "Triggered when the Card is double-clicked.",
      signature: "doubleClick(event: MouseEvent): void",
    },
    contextMenu: {
      description: "Triggered when the Card context menu is requested.",
      signature: "contextMenu(event: MouseEvent): void",
    },
  },
  apis: {
    scrollToTop: {
      description: "Scrolls the Card container to the top.",
      signature: "scrollToTop(behavior?: ScrollBehavior): void",
    },
    scrollToBottom: {
      description: "Scrolls the Card container to the bottom.",
      signature: "scrollToBottom(behavior?: ScrollBehavior): void",
    },
    scrollToStart: {
      description: "Scrolls the Card container to the start.",
      signature: "scrollToStart(behavior?: ScrollBehavior): void",
    },
    scrollToEnd: {
      description: "Scrolls the Card container to the end.",
      signature: "scrollToEnd(behavior?: ScrollBehavior): void",
    },
  },
});

export const cardRenderer = wrapComponent({
  name: "Card",
  metadata: CardMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const doubleClickSequenceRef = useRef(false);
    const title = adapter.stringProp("title", "");
    const subtitle = adapter.stringProp("subtitle", "");
    const linkTo = adapter.stringProp("linkTo", "");
    const avatarUrl = adapter.stringProp("avatarUrl", "");
    const showAvatar = adapter.booleanProp("showAvatar", Boolean(avatarUrl));
    const orientation = adapter.stringProp("orientation", "vertical") === "horizontal"
      ? "horizontal"
      : "vertical";

    useEffect(() => {
      adapter.registerApi({
        scrollToTop: (behavior: ScrollBehavior = "instant") => cardRef.current?.scrollTo({ top: 0, behavior }),
        scrollToBottom: (behavior: ScrollBehavior = "instant") => {
          const element = cardRef.current;
          element?.scrollTo({ top: element.scrollHeight - element.clientHeight, behavior });
        },
        scrollToStart: (behavior: ScrollBehavior = "instant") => cardRef.current?.scrollTo({ left: 0, behavior }),
        scrollToEnd: (behavior: ScrollBehavior = "instant") => {
          const element = cardRef.current;
          element?.scrollTo({ left: element.scrollWidth - element.clientWidth, behavior });
        },
      });
    }, [adapter]);

    const avatar = showAvatar ? (
      avatarUrl
        ? <img data-xmlui-part="avatar" src={avatarUrl} alt="avatar" style={avatarStyle} />
        : <div data-xmlui-part="avatar" role="img" aria-label="avatar" style={avatarStyle}>{initials(title)}</div>
    ) : null;
    const titleContent = title
      ? linkTo
        ? (
          <a
            href={linkTo}
            onClick={(event) => {
              event.preventDefault();
              window.history.pushState({}, "", linkTo);
            }}
          >
            <h3 data-xmlui-part="title" style={titleStyle}>{title}</h3>
          </a>
        )
        : <h3 data-xmlui-part="title" style={titleStyle}>{title}</h3>
      : null;
    const header = avatar || titleContent || subtitle ? (
      <div data-xmlui-part="header" style={headerStyle}>
        {avatar}
        <div data-xmlui-part="titlePanel" style={titlePanelStyle}>
          {titleContent}
          {subtitle ? <div data-xmlui-part="subtitle">{subtitle}</div> : null}
        </div>
      </div>
    ) : null;

    return (
      <div
        {...adapter.rootAttrs()}
        ref={cardRef}
        style={{
          minHeight: 1,
          padding: 16,
          border: "1px solid #d9dee7",
          borderRadius: 4,
          backgroundColor: "white",
          ...adapter.style,
        }}
        onClick={(event) => {
          if (adapter.node.events.doubleClick) {
            if (doubleClickSequenceRef.current) {
              return;
            }
            doubleClickSequenceRef.current = true;
          }
          void adapter.event("click")(event);
        }}
        onDoubleClick={(event) => {
          window.setTimeout(() => {
            doubleClickSequenceRef.current = false;
          }, 0);
          void adapter.event("doubleClick")(event);
        }}
        onContextMenu={(event) => void adapter.event("contextMenu")(event)}
      >
        {header}
        <div
          data-xmlui-part="content"
          style={{
            display: "flex",
            flexDirection: orientation === "horizontal" ? "row" : "column",
            gap: 8,
          }}
        >
          {adapter.renderChildren()}
        </div>
      </div>
    );
  },
});

const avatarStyle: React.CSSProperties = {
  alignItems: "center",
  backgroundColor: "#e6edf7",
  borderRadius: "50%",
  display: "inline-flex",
  height: 32,
  justifyContent: "center",
  objectFit: "cover",
  width: 32,
};

const headerStyle: React.CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: 12,
  marginBottom: 8,
};

const titlePanelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
};

const titleStyle: React.CSSProperties = {
  fontSize: "1rem",
  margin: 0,
};

function initials(title: string | undefined): string {
  return title?.trim().slice(0, 1).toUpperCase() ?? "";
}
