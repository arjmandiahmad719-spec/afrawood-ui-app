import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMFY_BASE_URL = "http://127.0.0.1:8188";
const DEV_SERVER_URL = "http://127.0.0.1:5173";
const WORKFLOW_PATH =
  "F:\\AI-Studio\\ComfyUI\\user\\default\\workflows\\Afrawood_Workflow.json";

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0b0b0b",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.loadURL(DEV_SERVER_URL);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value));
}

function findPositivePromptNodeId(workflow) {
  const entries = Object.entries(workflow || {}).filter(
    ([, node]) => node?.class_type === "CLIPTextEncode"
  );

  if (!entries.length) {
    throw new Error("No CLIPTextEncode node found in workflow");
  }

  for (const [nodeId, node] of entries) {
    const text = String(node?.inputs?.text || "").toLowerCase();

    if (
      !text.includes("negative") &&
      !text.includes("blurry") &&
      !text.includes("worst") &&
      !text.includes("bad quality") &&
      !text.includes("watermark")
    ) {
      return nodeId;
    }
  }

  return entries[0][0];
}

function injectPromptIntoWorkflow(workflow, promptText) {
  const nextWorkflow = cloneDeep(workflow);
  const positiveNodeId = findPositivePromptNodeId(nextWorkflow);

  nextWorkflow[positiveNodeId] = {
    ...nextWorkflow[positiveNodeId],
    inputs: {
      ...nextWorkflow[positiveNodeId].inputs,
      text: promptText,
    },
  };

  return nextWorkflow;
}

function extractFirstImage(historyItem) {
  const outputs = historyItem?.outputs || {};

  for (const nodeOutput of Object.values(outputs)) {
    if (Array.isArray(nodeOutput?.images) && nodeOutput.images.length > 0) {
      return nodeOutput.images[0];
    }
  }

  return null;
}

function buildImageUrl(image) {
  const params = new URLSearchParams();
  params.set("filename", image.filename);
  params.set("type", image.type || "output");

  if (image.subfolder) {
    params.set("subfolder", image.subfolder);
  }

  return `${COMFY_BASE_URL}/view?${params.toString()}`;
}

async function ensureComfyRunning() {
  const res = await fetch(`${COMFY_BASE_URL}/system_stats`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("ComfyUI is not reachable on http://127.0.0.1:8188");
  }
}

ipcMain.handle("generate-image", async (_event, promptText = "") => {
  const finalPrompt = String(promptText || "").trim() || "face portrait";

  try {
    console.log("[AFRA] generate-image:start");
    console.log("[AFRA] prompt:", finalPrompt);
    console.log("[AFRA] workflow_path:", WORKFLOW_PATH);

    await ensureComfyRunning();

    const workflowRaw = await fs.readFile(WORKFLOW_PATH, "utf-8");
    const workflowJson = JSON.parse(workflowRaw);

    console.log("[AFRA] workflow_loaded");

    const promptWorkflow = injectPromptIntoWorkflow(workflowJson, finalPrompt);

    const payload = {
      prompt: promptWorkflow,
      client_id: "afrawood-electron",
    };

    console.log("[AFRA] sending /prompt ...");

    const promptRes = await fetch(`${COMFY_BASE_URL}/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const promptTextResponse = await promptRes.text();

    console.log("[AFRA] /prompt status:", promptRes.status);
    console.log("[AFRA] /prompt raw response:", promptTextResponse);

    if (!promptRes.ok) {
      throw new Error(
        `ComfyUI /prompt failed (${promptRes.status}): ${promptTextResponse}`
      );
    }

    let promptData = null;

    try {
      promptData = JSON.parse(promptTextResponse);
    } catch {
      throw new Error(`Invalid JSON from ComfyUI /prompt: ${promptTextResponse}`);
    }

    const promptId = promptData?.prompt_id;

    if (!promptId) {
      throw new Error("No prompt_id returned from ComfyUI");
    }

    console.log("[AFRA] prompt_id:", promptId);

    for (let i = 0; i < 180; i += 1) {
      await sleep(1000);

      let historyRes;
      try {
        historyRes = await fetch(`${COMFY_BASE_URL}/history/${promptId}`, {
          method: "GET",
          cache: "no-store",
        });
      } catch (error) {
        throw new Error(`ComfyUI connection lost while waiting for history: ${error?.message || "unknown error"}`);
      }

      if (!historyRes.ok) {
        continue;
      }

      const historyData = await historyRes.json();
      const historyItem = historyData?.[promptId];

      if (!historyItem) {
        continue;
      }

      const image = extractFirstImage(historyItem);

      if (!image) {
        continue;
      }

      const imageUrl = buildImageUrl(image);

      console.log("[AFRA] image_ready:", imageUrl);

      return imageUrl;
    }

    throw new Error("Image generation timed out or no output image found");
  } catch (error) {
    console.error("[AFRA] generate-image:error", error);
    throw new Error(error?.message || "Unknown generate-image error");
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});