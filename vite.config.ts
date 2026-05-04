import react from "@vitejs/plugin-react";
import {defineConfig, loadEnv} from "vite";


export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    resolve: {
      dedupe: ["react", "react-dom", "react-is", "prop-types"],
    },
    optimizeDeps: {
      include: ["@emotion/react",
        "@emotion/styled",
        "hoist-non-react-statics",
        "prop-types",
        "react-is"],
    },
    define: {
      __TARUVI_SITE_URL__: JSON.stringify(env.TARUVI_SITE_URL || ""),
      __TARUVI_APP_SLUG__: JSON.stringify(env.TARUVI_APP_SLUG || ""),
      __TARUVI_API_KEY__: JSON.stringify(env.TARUVI_API_KEY || ""),
    },
    plugins: [react()],
    build:
      {
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules:
            true
        }
      }
  }
});
