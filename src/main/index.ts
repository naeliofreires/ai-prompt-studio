import { app, BrowserWindow } from "electron";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerIpcHandlers } from "./ipc/register-handlers.js";

if (!app.isPackaged) {
  dotenv.config({ path: path.join(process.cwd(), ".env") });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
const appIconPath = isDev
  ? path.join(process.cwd(), "public", "icon.png")
  : path.join(__dirname, "..", "..", "..", "dist", "icon.png");

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 700,
    title: "AI Prompt Studio",
    icon: appIconPath,
    backgroundColor: "#0b1020",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    void window.loadURL("http://localhost:5173");
    window.webContents.openDevTools({ mode: "detach" });
  } else {
    void window.loadFile(path.join(__dirname, "..", "..", "..", "dist", "index.html"));
  }

  return window;
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
