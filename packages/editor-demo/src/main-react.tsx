/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import React from "react";
import ReactDOM from "react-dom/client";
import Editor from "./Editor.js";

export const init = async () => {
  const root = ReactDOM.createRoot(document.getElementById("react-root")!);
  root.render(
    <div style={{ height: "85vh" }}>
      <Editor text="<Button />" />
    </div>,
  );
};
