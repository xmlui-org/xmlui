import { startApp } from "xmlui";
import testExtension from "xmlui-test-extension";

const runtime = import.meta.glob(["./**/*.xmlui", "/config.json"], { eager: true });

export function init() {
  startApp(runtime, [testExtension]);
}
