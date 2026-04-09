export function buildSceneDialoguePayload({
  sceneId,
  sceneNumber,
  sceneTitle,
  dialogueOutput,
}) {
  return {
    id: sceneId,
    sceneNumber: sceneNumber || 1,
    title: sceneTitle || "Scene",
    characters: dialogueOutput?.characterSummary || "",
    lines: dialogueOutput?.lines || [],
    fullText: dialogueOutput?.fullText || "",
    createdAt: Date.now(),
  };
}