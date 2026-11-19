import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, relative, sep } from "node:path";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

const pages = [
  "index.html",
  "Tools/to-do/index.html",
  "Tools/简体繁体2/index.html",
  "Tools/Math_formula_properties/index.html",
  "GAmes/Flappy-bird/index.html",
  "GAmes/Google_dino/index.html",
  "GAmes/Chess/index.html",
  "GAmes/HumanBenchmark/index.html",
  "GAmes/Sudoku/Sudoku.html",
];

const staticFiles = [
  "manifest.webmanifest",
  "service-worker.js",
  "GAmes/Flappy-bird/script.js",
  "GAmes/Chess/xiangqi.js",
  "GAmes/Chess/script.js",
  "GAmes/HumanBenchmark/Game.js",
  "Tools/to-do/script.js",
];

const staticDirectories = [
  "icons",
  "fonts",
  "screenshots",
  "GAmes/phaser",
  "GAmes/Flappy-bird/assets",
  "GAmes/Google_dino/public/assests",
  "GAmes/Google_dino/src",
  "GAmes/Chess/images",
];

function getFiles(path) {
  return readdirSync(path).flatMap((name) => {
    const file = resolve(path, name);
    return statSync(file).isDirectory() ? getFiles(file) : [file];
  });
}

function preserveRuntimeFiles() {
  return {
    name: "preserve-runtime-files",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        const page = relative(root, context.filename);
        const manifestPath = relative(dirname(page), "manifest.webmanifest").split(sep).join("/");
        return html.replace(
          /(<link rel="manifest" href=")[^"]+(")/,
          `$1${manifestPath}$2`
        );
      },
    },
    generateBundle() {
      const files = [
        ...staticFiles.map((path) => resolve(root, path)),
        ...staticDirectories.flatMap((path) => getFiles(resolve(root, path))),
      ];

      for (const file of files) {
        this.emitFile({
          type: "asset",
          fileName: relative(root, file).split(sep).join("/"),
          source: readFileSync(file),
        });
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [preserveRuntimeFiles()],
  build: {
    manifest: true,
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page.replace(/[^\w.-]+/g, "-"), resolve(root, page)])
      ),
    },
  },
});
