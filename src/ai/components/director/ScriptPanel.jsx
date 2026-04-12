import React, { useState } from "react";
import { runScriptEngine } from "../scriptEngine";

export default function ScriptPanel() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setResult("");

    const res = await runScriptEngine({
      topic,
      genre: "Cinematic",
      tone: "Professional",
      duration: "Short",
      platform: "YouTube",
      language: "English",
    });

    if (res.success) {
      setResult(res.data);
    } else {
      setResult(res.error);
    }

    setLoading(false);
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl mb-4">AI Script</h2>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter idea..."
        className="w-full p-3 mb-4 bg-black border border-white/20"
      />

      <button
        onClick={handleGenerate}
        className="px-4 py-2 bg-cyan-500 text-black font-bold"
      >
        {loading ? "Generating..." : "Generate Script"}
      </button>

      <pre className="mt-6 whitespace-pre-wrap">
        {result}
      </pre>
    </div>
  );
}