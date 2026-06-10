import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specDir = path.join(root, "apps", "promptizer", "spec");
const destDir = path.join(root, "dist-electron", "apps", "promptizer", "spec");
mkdirSync(destDir, { recursive: true });

for (const name of readdirSync(specDir).filter((f) => f.endsWith(".json"))) {
  const source = path.join(specDir, name);
  const target = path.join(destDir, name);
  const tempTarget = path.join(destDir, `.${name}.${process.pid}.tmp`);
  const contents = readFileSync(source, "utf8");

  try {
    JSON.parse(contents);
  } catch (error) {
    throw new Error(`Invalid JSON in apps/promptizer/spec/${name}: ${error.message}`);
  }

  try {
    writeFileSync(tempTarget, contents);
    renameSync(tempTarget, target);
  } catch (error) {
    rmSync(tempTarget, { force: true });
    throw error;
  }
}
