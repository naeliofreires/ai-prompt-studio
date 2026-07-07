import path from "node:path";

export function getPromptizerPreloadPath(__dirname: string) {
  return path.join(__dirname, "..", "..", "apps", "promptizer", "main", "preload.js");
}
