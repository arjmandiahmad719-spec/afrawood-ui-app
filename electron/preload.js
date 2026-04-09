import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("afraAPI", {
  generateImage: async (promptText) => {
    console.log("[PRELOAD] generateImage called with:", promptText);

    const result = await ipcRenderer.invoke("generate-image", promptText);

    console.log("[PRELOAD] generateImage result:", result);

    return result;
  },
});