const COMFY_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_COMFY_URL) ||
  "http://127.0.0.1:8188";

const DEFAULT_WORKFLOW_URL = "/afrawood_workflow_api.json";
const HISTORY_STORAGE_KEY = "afrawood_image_history";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function generateSeed(seed, locked) {
  if (locked && Number.isFinite(Number(seed))) {
    return Number(seed);
  }
  return Math.floor(Math.random() * 1000000000);
}

function getRatioSize(ratio = "16:9") {
  switch (ratio) {
    case "1:1":
      return { width: 1024, height: 1024 };
    case "9:16":
      return { width: 768, height: 1344 };
    case "4:5":
      return { width: 896, height: 1120 };
    case "3:4":
      return { width: 960, height: 1280 };
    case "4:3":
      return { width: 1152, height: 896 };
    case "21:9":
      return { width: 1536, height: 640 };
    case "16:9":
    default:
      return { width: 1344, height: 768 };
  }
}

function normalizeWorkflowPayload(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Workflow file is invalid.");
  }

  if (raw.prompt && typeof raw.prompt === "object") {
    return structuredClone(raw.prompt);
  }

  return structuredClone(raw);
}

function getNodeEntries(workflow) {
  return Object.entries(workflow || {});
}

function getNodeClass(node) {
  return String(node?.class_type || "").trim();
}

function getNodeTitle(node) {
  return String(node?._meta?.title || "").trim().toLowerCase();
}

function setInputIfExists(node, key, value) {
  if (!node || !node.inputs || !(key in node.inputs)) return false;
  node.inputs[key] = value;
  return true;
}

function patchPromptNodes(workflow, positivePrompt, negativePrompt) {
  const clipTextNodes = getNodeEntries(workflow).filter(([, node]) => {
    return getNodeClass(node) === "CLIPTextEncode";
  });

  if (!clipTextNodes.length) return;

  let positivePatched = false;
  let negativePatched = false;

  clipTextNodes.forEach(([, node]) => {
    const title = getNodeTitle(node);
    const existingText = String(node?.inputs?.text || "").toLowerCase();

    if (!negativePatched && (title.includes("negative") || existingText.includes("worst quality"))) {
      node.inputs.text = negativePrompt;
      negativePatched = true;
      return;
    }

    if (!positivePatched) {
      node.inputs.text = positivePrompt;
      positivePatched = true;
      return;
    }

    if (!negativePatched) {
      node.inputs.text = negativePrompt;
      negativePatched = true;
    }
  });

  if (!negativePatched && clipTextNodes[1]?.[1]?.inputs) {
    clipTextNodes[1][1].inputs.text = negativePrompt;
  }
}

function patchSamplerNode(workflow, seed, steps = 30, cfg = 7, samplerName = "euler", scheduler = "normal", denoise = 1) {
  getNodeEntries(workflow).forEach(([, node]) => {
    if (getNodeClass(node) !== "KSampler") return;

    if (node.inputs) {
      if ("seed" in node.inputs) node.inputs.seed = seed;
      if ("steps" in node.inputs) node.inputs.steps = steps;
      if ("cfg" in node.inputs) node.inputs.cfg = cfg;
      if ("sampler_name" in node.inputs) node.inputs.sampler_name = samplerName;
      if ("scheduler" in node.inputs) node.inputs.scheduler = scheduler;
      if ("denoise" in node.inputs) node.inputs.denoise = denoise;
    }
  });
}

function patchCheckpoint(workflow, checkpoint) {
  if (!checkpoint) return;

  getNodeEntries(workflow).forEach(([, node]) => {
    if (getNodeClass(node) !== "CheckpointLoaderSimple") return;
    if (node.inputs && "ckpt_name" in node.inputs) {
      node.inputs.ckpt_name = checkpoint;
    }
  });
}

function patchImageSize(workflow, width, height) {
  getNodeEntries(workflow).forEach(([, node]) => {
    const classType = getNodeClass(node);

    if (classType === "EmptyLatentImage" && node.inputs) {
      if ("width" in node.inputs) node.inputs.width = width;
      if ("height" in node.inputs) node.inputs.height = height;
    }

    if ((classType === "EmptySD3LatentImage" || classType === "EmptyHunyuanLatentVideo") && node.inputs) {
      if ("width" in node.inputs) node.inputs.width = width;
      if ("height" in node.inputs) node.inputs.height = height;
    }
  });
}

function patchSavePrefix(workflow, prefix = "afrawood") {
  getNodeEntries(workflow).forEach(([, node]) => {
    if (getNodeClass(node) !== "SaveImage") return;
    if (node.inputs && "filename_prefix" in node.inputs) {
      node.inputs.filename_prefix = prefix;
    }
  });
}

function patchReferenceImage(workflow, uploadedName) {
  if (!uploadedName) return;

  getNodeEntries(workflow).forEach(([, node]) => {
    const classType = getNodeClass(node);
    if (classType !== "LoadImage" && classType !== "LoadImageMask") return;
    if (node.inputs && "image" in node.inputs) {
      node.inputs.image = uploadedName;
    }
  });
}

function buildImageUrl(image) {
  const filename = encodeURIComponent(image?.filename || "");
  const subfolder = encodeURIComponent(image?.subfolder || "");
  const type = encodeURIComponent(image?.type || "output");
  return `${COMFY_URL}/view?filename=${filename}&subfolder=${subfolder}&type=${type}&v=${Date.now()}`;
}

function extractImagesFromHistory(historyItem) {
  const outputs = historyItem?.outputs;
  if (!outputs || typeof outputs !== "object") return [];

  const items = [];

  Object.entries(outputs).forEach(([nodeId, nodeOutput]) => {
    if (!Array.isArray(nodeOutput?.images)) return;

    nodeOutput.images.forEach((image, index) => {
      items.push({
        id: `${nodeId}-${index}-${image.filename}`,
        nodeId,
        image,
        url: buildImageUrl(image),
      });
    });
  });

  return items;
}

export function getImageHistory() {
  if (typeof window === "undefined") return [];
  return safeJsonParse(window.localStorage.getItem(HISTORY_STORAGE_KEY), []);
}

export function saveImageHistoryItem(item) {
  if (typeof window === "undefined") return;
  const current = getImageHistory();
  const next = [item, ...current].slice(0, 50);
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
}

export function removeImageHistoryItem(id) {
  if (typeof window === "undefined") return;
  const current = getImageHistory();
  const next = current.filter((item) => item.id !== id);
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
}

export function clearImageHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_STORAGE_KEY);
}

export async function getImageEngineInfo() {
  return {
    name: "ComfyUI",
    url: COMFY_URL,
    workflowUrl: DEFAULT_WORKFLOW_URL,
  };
}

export async function checkImageEngineHealth() {
  try {
    const res = await fetch(`${COMFY_URL}/system_stats`, {
      method: "GET",
    });

    if (!res.ok) {
      return {
        ok: false,
        status: "offline",
        message: `ComfyUI responded with ${res.status}`,
      };
    }

    return {
      ok: true,
      status: "online",
      message: "ComfyUI is reachable",
    };
  } catch {
    return {
      ok: false,
      status: "offline",
      message: "ComfyUI is not reachable",
    };
  }
}

export async function loadDefaultWorkflow() {
  const res = await fetch(DEFAULT_WORKFLOW_URL, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Could not load afrawood_workflow_api.json");
  }

  const raw = await res.json();
  return normalizeWorkflowPayload(raw);
}

export async function uploadReferenceImage(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", "input");
  formData.append("overwrite", "true");

  const res = await fetch(`${COMFY_URL}/upload/image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Reference image upload failed");
  }

  const data = await res.json();
  return data?.name || file.name;
}

export async function generateImage({
  prompt,
  negativePrompt = "low quality, blurry, bad anatomy, deformed, watermark, text, logo",
  seed,
  seedLocked = false,
  ratio = "16:9",
  checkpoint = "",
  referenceImageFile = null,
  workflow = null,
  filenamePrefix = "afrawood",
  steps = 30,
  cfg = 7,
  samplerName = "euler",
  scheduler = "normal",
  denoise = 1,
}) {
  if (!prompt || !String(prompt).trim()) {
    throw new Error("Prompt is required.");
  }

  const health = await checkImageEngineHealth();
  if (!health.ok) {
    throw new Error("ComfyUI is not reachable. Run ComfyUI with CORS enabled.");
  }

  const finalSeed = generateSeed(seed, seedLocked);
  const { width, height } = getRatioSize(ratio);

  const promptWorkflow = workflow
    ? normalizeWorkflowPayload(workflow)
    : await loadDefaultWorkflow();

  let uploadedReferenceName = null;

  if (referenceImageFile) {
    uploadedReferenceName = await uploadReferenceImage(referenceImageFile);
  }

  patchPromptNodes(promptWorkflow, String(prompt).trim(), String(negativePrompt || "").trim());
  patchSamplerNode(promptWorkflow, finalSeed, steps, cfg, samplerName, scheduler, denoise);
  patchCheckpoint(promptWorkflow, checkpoint);
  patchImageSize(promptWorkflow, width, height);
  patchSavePrefix(promptWorkflow, filenamePrefix);
  patchReferenceImage(promptWorkflow, uploadedReferenceName);

  const promptRes = await fetch(`${COMFY_URL}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: promptWorkflow,
    }),
  });

  if (!promptRes.ok) {
    const text = await promptRes.text();
    throw new Error(text || "ComfyUI prompt error");
  }

  const promptData = await promptRes.json();
  const promptId = promptData?.prompt_id;

  if (!promptId) {
    throw new Error("No prompt id returned from ComfyUI");
  }

  let historyItem = null;

  for (let i = 0; i < 180; i += 1) {
    await sleep(1000);

    const historyRes = await fetch(`${COMFY_URL}/history/${promptId}`, {
      method: "GET",
    });

    if (!historyRes.ok) continue;

    const history = await historyRes.json();
    const current = history?.[promptId];

    if (current?.outputs) {
      historyItem = current;
      break;
    }
  }

  if (!historyItem) {
    throw new Error("Image generation timeout");
  }

  const images = extractImagesFromHistory(historyItem);

  if (!images.length) {
    throw new Error("No image returned from ComfyUI");
  }

  const primary = images[0];

  const historyRecord = {
    id: `${promptId}-${Date.now()}`,
    promptId,
    prompt: String(prompt).trim(),
    negativePrompt: String(negativePrompt || "").trim(),
    ratio,
    checkpoint,
    seed: finalSeed,
    imageUrl: primary.url,
    createdAt: Date.now(),
    images,
  };

  saveImageHistoryItem(historyRecord);

  return {
    ok: true,
    promptId,
    seed: finalSeed,
    ratio,
    width,
    height,
    imageUrl: primary.url,
    images,
    historyRecord,
  };
}

const imageAI = {
  getImageEngineInfo,
  checkImageEngineHealth,
  loadDefaultWorkflow,
  uploadReferenceImage,
  generateImage,
  getImageHistory,
  saveImageHistoryItem,
  removeImageHistoryItem,
  clearImageHistory,
};

export default imageAI;