import { preview as vitePreview } from "vite";
import { getViteConfig } from "./viteConfig";

export const preview = async () => {
  try {
    const server = await vitePreview(getViteConfig());
    
    if (!server.httpServer) {
      throw new Error("HTTP server not available");
    }

    server.printUrls();
  } catch (e) {
    process.exit(1);
  }
};
