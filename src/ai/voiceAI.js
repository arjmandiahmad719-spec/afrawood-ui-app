function createToneWavBlob(durationSeconds = 3, frequency = 220) {
  const sampleRate = 22050;
  const seconds = Math.max(1, Math.round(durationSeconds));
  const numSamples = sampleRate * seconds;
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + numSamples * bytesPerSample);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i += 1) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + numSamples * bytesPerSample, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, numSamples * bytesPerSample, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const envelope =
      t < 0.08
        ? t / 0.08
        : t > seconds - 0.12
          ? Math.max(0, (seconds - t) / 0.12)
          : 1;

    const base = Math.sin(2 * Math.PI * frequency * t) * 0.18;
    const harmonic = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.08;
    const sample = (base + harmonic) * envelope;

    view.setInt16(offset, Math.max(-1, Math.min(1, sample)) * 32767, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function estimateDuration(text = "", speed = 1) {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const base = Math.max(2, words / 2.5);
  const adjusted = base / Math.max(0.6, Number(speed) || 1);

  return Math.max(2, Math.round(adjusted));
}

export function buildVoicePayload({
  projectTitle = "",
  text = "",
  language = "en",
  provider = "mock_ready",
  voiceName = "default_voice",
  gender = "male",
  style = "cinematic",
  emotion = "warm",
  speed = 1,
  pitch = 0,
  outputFormat = "wav",
  sampleRate = 22050,
  noiseReduction = true,
  normalizeAudio = true,
  subtitleFriendlyPauses = true,
} = {}) {
  return {
    app: "Afrawood",
    feature: "voice",
    provider,
    projectTitle: projectTitle || "Untitled Voice Project",
    input: {
      text,
      language,
    },
    voice: {
      name: voiceName,
      gender,
      style,
      emotion,
      speed: Number(speed) || 1,
      pitch: Number(pitch) || 0,
    },
    output: {
      format: outputFormat,
      sampleRate: Number(sampleRate) || 22050,
      noiseReduction: Boolean(noiseReduction),
      normalizeAudio: Boolean(normalizeAudio),
      subtitleFriendlyPauses: Boolean(subtitleFriendlyPauses),
    },
    estimatedDurationSec: estimateDuration(text, speed),
    createdAt: new Date().toISOString(),
  };
}

export async function generateVoice(options = {}) {
  const payload = buildVoicePayload(options);
  const duration = payload.estimatedDurationSec || 3;

  const blob = createToneWavBlob(duration, 220);
  const previewUrl = URL.createObjectURL(blob);

  return {
    ok: true,
    payload,
    previewUrl,
    duration,
  };
}

export default generateVoice;