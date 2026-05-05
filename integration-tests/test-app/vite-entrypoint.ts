import { startApp } from "xmlui";
import extensions from "./extensions";

const runtime = import.meta.glob(["./**/*.xmlui", "/config.json"], { eager: true });

export function init() {
  startApp(runtime, extensions);
}
