/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import React from "react";
import ReactDOM from "react-dom/client";
import Editor from "./Editor.js";

const text = `<App>
  <HStack verticalAlignment="center" >
    <Button label="First"/>
    <ProgressBar width="80px" value="0.6" />
    <Theme color-primary="purple">
      <Button label="Second" />
      <ProgressBar width="80px" value="0.6" />
    </Theme>
    <Theme textColor-Button="orange">
      <Button label="Third" />
      <ProgressBar width="80px" value="0.6" />
    </Theme>
  </HStack>
</App>
`;
export const init = async () => {
  const root = ReactDOM.createRoot(document.getElementById("react-root")!);
  root.render(
    <div style={{ height: "85vh" }}>
      <Editor text={text} />
    </div>,
  );
};
