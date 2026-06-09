// @vitest-environment node

import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { build } from "vite";
import { describe, expect, it } from "vitest";
import viteConfig from "../vite.config";

describe("packaged renderer asset paths", () => {
  it("emits relative asset URLs for Electron loadFile", async () => {
    const outDir = await mkdtemp(path.join(tmpdir(), "promptizer-vite-"));

    try {
      await build({
        ...viteConfig,
        build: {
          ...viteConfig.build,
          emptyOutDir: true,
          outDir,
        },
        logLevel: "silent",
      });

      const html = await readFile(path.join(outDir, "index.html"), "utf8");

      expect(html).not.toMatch(/\b(?:href|src)="\/(?:assets|icon\.svg)/);
      expect(html).toMatch(/\b(?:href|src)="\.\//);
    } finally {
      await rm(outDir, { force: true, recursive: true });
    }
  });
});
