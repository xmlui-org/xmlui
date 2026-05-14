import xmluiPlugin from "xmlui/vite-xmlui-plugin";

export default {
  plugins: [xmluiPlugin()],
  build: {
    outDir: "dist-vite-plugin",
  },
};
