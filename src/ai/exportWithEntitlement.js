// src/ai/exportWithEntitlement.js

import { applyWatermark } from "../utils/watermark";
import { getUserEntitlements } from "../utils/entitlement";

/**
 * Stable export pipeline for Afrawood images
 * - Keeps current app state safe
 * - Applies watermark only when entitlement requires it
 * - Returns original image if anything fails
 */

/**
 * Safe fetch -> Blob
 */
async function fetchImageBlob(imageUrl) {
  const res = await fetch(imageUrl, { mode: "cors" });
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status}`);
  }
  return await res.blob();
}

/**
 * Blob -> object URL
 */
function createObjectUrl(blob) {
  return URL.createObjectURL(blob);
}

/**
 * Detect data URL
 */
function isDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:image/");
}

/**
 * Best effort filename
 */
function buildFileName(options = {}) {
  const {
    prefix = "afrawood-image",
    extension = "png",
    shotId = "",
    sceneId = "",
    timestamp = Date.now(),
  } = options;

  const parts = [prefix];

  if (sceneId) parts.push(`scene-${sceneId}`);
  if (shotId) parts.push(`shot-${shotId}`);

  parts.push(String(timestamp));

  return `${parts.join("-")}.${extension}`;
}

/**
 * Trigger browser download
 */
export function downloadImage(imageUrl, fileName = "afrawood-image.png") {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Main export pipeline
 *
 * @param {object} params
 * @param {string} params.imageUrl
 * @param {object} params.userContext
 * @param {object} params.watermarkOptions
 * @param {boolean} params.autoDownload
 * @param {object} params.fileOptions
 *
 * @returns {Promise<object>}
 */
export async function exportImageWithEntitlement({
  imageUrl,
  userContext = {},
  watermarkOptions = {},
  autoDownload = false,
  fileOptions = {},
} = {}) {
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("exportImageWithEntitlement: imageUrl is required");
  }

  const entitlements = getUserEntitlements(userContext);
  const fileName = buildFileName(fileOptions);

  try {
    let finalImageUrl = imageUrl;
    let watermarked = false;

    if (entitlements.exportWatermark) {
      finalImageUrl = await applyWatermark(imageUrl, watermarkOptions);
      watermarked = finalImageUrl !== imageUrl || isDataUrl(finalImageUrl);
    }

    if (autoDownload) {
      downloadImage(finalImageUrl, fileName);
    }

    return {
      ok: true,
      imageUrl: finalImageUrl,
      originalImageUrl: imageUrl,
      fileName,
      watermarked,
      entitlements,
    };
  } catch (error) {
    console.error("exportImageWithEntitlement failed:", error);

    if (autoDownload) {
      downloadImage(imageUrl, fileName);
    }

    return {
      ok: false,
      imageUrl,
      originalImageUrl: imageUrl,
      fileName,
      watermarked: false,
      entitlements,
      error: error?.message || "Unknown export error",
    };
  }
}

/**
 * Optional helper:
 * prepares export result for storage/upload APIs
 */
export async function prepareExportPayload({
  imageUrl,
  userContext = {},
  watermarkOptions = {},
  fileOptions = {},
} = {}) {
  const result = await exportImageWithEntitlement({
    imageUrl,
    userContext,
    watermarkOptions,
    autoDownload: false,
    fileOptions,
  });

  try {
    let blob;

    if (isDataUrl(result.imageUrl)) {
      const response = await fetch(result.imageUrl);
      blob = await response.blob();
    } else {
      blob = await fetchImageBlob(result.imageUrl);
    }

    const objectUrl = createObjectUrl(blob);
    const file = new File([blob], result.fileName, {
      type: blob.type || "image/png",
    });

    return {
      ...result,
      blob,
      file,
      objectUrl,
    };
  } catch (error) {
    console.error("prepareExportPayload failed:", error);

    return {
      ...result,
      blob: null,
      file: null,
      objectUrl: null,
      payloadError: error?.message || "Failed to prepare export payload",
    };
  }
}