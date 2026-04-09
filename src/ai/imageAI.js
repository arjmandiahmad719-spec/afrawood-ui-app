// src/ai/imageAI.js

import { exportImageWithEntitlement } from "./exportWithEntitlement";

const COMFY_URL = "http://127.0.0.1:8188";

/* =========================
   Helpers
========================= */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSeed(seed, locked) {
  if (locked && Number.isFinite(Number(seed))) {
    return Number(seed);
  }
  return Math.floor(Math.random() * 1000000000);
}

function buildImageUrl(img) {
  const filename = encodeURIComponent(img?.filename || "");
  const subfolder = encodeURIComponent(img?.subfolder || "");
  const type = encodeURIComponent(img?.type || "output");
  return `${COMFY_URL}/view?filename=${filename}&subfolder=${subfolder}&type=${type}&v=${Date.now()}`;
}

function extractImagesFromOutputs(outputs) {
  if (!outputs || typeof outputs !== "object") return [];

  const urls = [];

  Object.values(outputs).forEach((node) => {
    if (Array.isArray(node?.images)) {
      node.images.forEach((img) => {
        urls.push(buildImageUrl(img));
      });
    }
  });

  return urls;
}

/* =========================
   Engine Info (FIX)
========================= */

export function getImageEngineInfo() {
  return {
    name: "ComfyUI",
    url: COMFY_URL,
    status: "connected",
  };
}

/* =========================
   Generate Image
========================= */

export async function generateImage({
  prompt,
  negativePrompt = "",
  seed,
  seedLocked = false,
  workflow,
}) {
  const finalSeed = getSeed(seed, seedLocked);

  const payload = {
    prompt,
    negative_prompt: negativePrompt,
    seed: finalSeed,
    workflow,
  };

  const res = await fetch(`${COMFY_URL}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("ComfyUI prompt error");
  }

  const data = await res.json();
  const promptId = data?.prompt_id;

  if (!promptId) {
    throw new Error("No prompt_id returned from ComfyUI");
  }

  let result;

  for (let i = 0; i < 100; i++) {
    await sleep(500);

    const historyRes = await fetch(`${COMFY_URL}/history/${promptId}`);
    if (!historyRes.ok) continue;

    const history = await historyRes.json();

    if (history?.[promptId]?.outputs) {
      result = history[promptId].outputs;
      break;
    }
  }

  if (!result) {
    throw new Error("Image generation timeout");
  }

  const images = extractImagesFromOutputs(result);

  if (!images.length) {
    throw new Error("No image returned from ComfyUI");
  }

  return {
    images,
    seed: finalSeed,
  };
}

/* =========================
   Export with Watermark
========================= */

export async function exportGeneratedImage({
  imageUrl,
  userContext = {},
  sceneId,
  shotId,
}) {
  return await exportImageWithEntitlement({
    imageUrl,
    userContext,
    watermarkOptions: {
      watermarkSrc: "/src/assets/afrawood-watermark.png",
      position: "bottom-right",
      opacity: 0.22,
      scale: 0.18,
      padding: 24,
    },
    autoDownload: true,
    fileOptions: {
      prefix: "afrawood",
      sceneId,
      shotId,
    },
  });
}

/* =========================
   DEFAULT EXPORT
========================= */

const imageAI = {
  generateImage,
  exportGeneratedImage,
  getImageEngineInfo, // 👈 اضافه شد
};

export default imageAI;