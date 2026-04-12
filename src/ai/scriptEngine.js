import { generateScriptAI } from "./scriptAI";

export async function runScriptEngine(input) {
  try {
    const result = await generateScriptAI(input);
    return {
      success: true,
      data: result,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Script generation failed",
    };
  }
}