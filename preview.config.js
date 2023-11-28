// preview.config.js
const { svgr } = require("vite-plugin-react-svgr");

/** @type {import("@previewjs/config").PreviewConfig} */
module.exports = {
  vite: {
    plugins: [
      svgr({
        exportAs: "ReactComponent",
        // exportAs: "default" if you want `import Logo from "./logo.svg"` instead

        // If you import SVG files via an alias, you'll need to also pass "alias" here.
        // See https://previewjs.com/docs/config/aliases
        //
        // alias: { ... }
      }),
    ],
  },
};