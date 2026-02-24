// This component was generated to hold inline scripts from your index.html
import {scripts} from "./inline-scripts.js";

export function InlineScripts() {
  return (
    <>
      {scripts.map((script, index) => (
        <script key={index} dangerouslySetInnerHTML={{ __html: script.trim() }} />
      ))}
    </>
  );
}