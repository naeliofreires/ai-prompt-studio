import { cpSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specDir = path.join(root, "spec");
const destDir = path.join(root, "dist-electron", "spec");
mkdirSync(destDir, { recursive: true });

for (const name of readdirSync(specDir).filter((f) => f.endsWith(".json"))) {
  cpSync(path.join(specDir, name), path.join(destDir, name));
}
