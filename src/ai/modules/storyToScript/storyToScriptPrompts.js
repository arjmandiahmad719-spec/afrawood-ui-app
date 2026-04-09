export function buildStoryToScriptPrompt(input) {
  const {
    storyIdea,
    contentType,
    seriesType,
    episodes,
    episodeDuration,
    genre,
    tone,
    durationMinutes,
    language,
    audience,
    includeNarration
  } = input;

  if (contentType === "series") {
    return `
You are a professional cinematic series writer.

Create a TV/streaming series structure from the following idea.

Requirements:
- Content Type: Series
- Series Type: ${seriesType}
- Number of Episodes: ${episodes}
- Duration Per Episode: ${episodeDuration} minutes
- Genre: ${genre}
- Tone: ${tone}
- Language: ${language}
- Audience: ${audience}
- Include narration: ${includeNarration ? "Yes" : "No"}

Story Idea:
${storyIdea}

Return:
1. Series title
2. Series logline
3. Episode-by-episode breakdown
4. Each episode should include:
   - Episode number
   - Episode title
   - Episode summary
   - Cliffhanger ending
`;
  }

  return `
You are a professional cinematic screenwriter.

Convert the following story idea into a structured screenplay.

Requirements:
- Content Type: Cinema
- Genre: ${genre}
- Tone: ${tone}
- Duration: ${durationMinutes} minutes
- Language: ${language}
- Audience: ${audience}
- Include narration: ${includeNarration ? "Yes" : "No"}

Story Idea:
${storyIdea}

Return a screenplay with:
1. Title
2. Logline
3. Scenes
4. Visual descriptions
5. Narration if needed
6. Dialogue
`;
}