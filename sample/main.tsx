import { startApp } from "../xmlui/src";

startApp(import.meta.glob("./src/**/*", { eager: true }));
