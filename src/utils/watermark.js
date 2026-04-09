// src/utils/watermark.js

/**
 * Afrawood Watermark Engine
 * Stable, lightweight, async-safe
 */

/**
 * Load image as HTMLImageElement
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Apply watermark to image URL
 * @param {string} imageUrl - original image
 * @param {object} options
 * @returns {Promise<string>} watermarked image (dataURL)
 */
export async function applyWatermark(imageUrl, options = {}) {
  try {
    const {
      watermarkSrc = "/assets/afrawood-watermark.png",
      position = "bottom-right", // bottom-right | bottom-left | top-right | top-left | center
      opacity = 0.25,
      scale = 0.2, // relative size to image width
      padding = 20,
    } = options;

    const [baseImg, watermarkImg] = await Promise.all([
      loadImage(imageUrl),
      loadImage(watermarkSrc),
    ]);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = baseImg.width;
    canvas.height = baseImg.height;

    // draw base image
    ctx.drawImage(baseImg, 0, 0);

    // calculate watermark size
    const wmWidth = baseImg.width * scale;
    const ratio = watermarkImg.height / watermarkImg.width;
    const wmHeight = wmWidth * ratio;

    // position calculation
    let x = 0;
    let y = 0;

    switch (position) {
      case "bottom-right":
        x = canvas.width - wmWidth - padding;
        y = canvas.height - wmHeight - padding;
        break;
      case "bottom-left":
        x = padding;
        y = canvas.height - wmHeight - padding;
        break;
      case "top-right":
        x = canvas.width - wmWidth - padding;
        y = padding;
        break;
      case "top-left":
        x = padding;
        y = padding;
        break;
      case "center":
        x = (canvas.width - wmWidth) / 2;
        y = (canvas.height - wmHeight) / 2;
        break;
      default:
        x = canvas.width - wmWidth - padding;
        y = canvas.height - wmHeight - padding;
    }

    // apply opacity
    ctx.globalAlpha = opacity;

    // draw watermark
    ctx.drawImage(watermarkImg, x, y, wmWidth, wmHeight);

    // reset alpha
    ctx.globalAlpha = 1;

    // export final image
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.error("Watermark failed:", err);
    // fallback: return original image
    return imageUrl;
  }
}

/**
 * Optional helper for batch images
 */
export async function applyWatermarkBatch(imageUrls = [], options = {}) {
  const results = [];

  for (const url of imageUrls) {
    const wm = await applyWatermark(url, options);
    results.push(wm);
  }

  return results;
}