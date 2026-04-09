import { generateMockScript } from "./storyToScriptMock";
import { buildStoryToScriptPrompt } from "./storyToScriptPrompts";
import { defaultStoryToScriptInput } from "./storyToScriptTypes";

export async function generateStoryToScript(input = {}) {
  try {
    const finalInput = {
      ...defaultStoryToScriptInput,
      ...input
    };

    const prompt = buildStoryToScriptPrompt(finalInput);

    const result = await generateMockScript({
      ...finalInput,
      prompt
    });

    return result;
  } catch (error) {
    console.error("StoryToScript Error:", error);
    throw error;
  }
}