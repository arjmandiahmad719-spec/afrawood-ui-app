// src/ai/components/director/ShotListPanel.jsx

import React, { useState } from "react";
import { exportGeneratedImage } from "../../../imageAI";
import { useAfraFlow } from "../../core/AfraFlowContext";

/**
 * ShotListPanel (stable)
 * - Uses existing flow context
 * - Adds export with watermark entitlement
 * - No breaking changes
 */

export default function ShotListPanel() {
  const { shots, activeShotId, setActiveShotId, user } = useAfraFlow();
  const [loadingId, setLoadingId] = useState(null);

  const activeShot = shots.find((s) => s.id === activeShotId);

  async function handleExport(shot) {
    if (!shot?.image) return;

    try {
      setLoadingId(shot.id);

      await exportGeneratedImage({
        imageUrl: shot.image,
        userContext: {
          user,
          plan: user?.plan,
        },
        sceneId: shot.sceneId,
        shotId: shot.id,
      });
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="w-full h-full flex flex-col gap-3 p-4 overflow-y-auto bg-black text-white">
      <h2 className="text-lg font-semibold">Shots</h2>

      {shots.map((shot) => {
        const isActive = shot.id === activeShotId;
        const isLoading = loadingId === shot.id;

        return (
          <div
            key={shot.id}
            onClick={() => setActiveShotId(shot.id)}
            className={`border rounded-xl p-3 cursor-pointer transition ${
              isActive
                ? "border-yellow-400 bg-[#111]"
                : "border-gray-700 hover:bg-[#111]"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">
                {shot.title || shot.id}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExport(shot);
                }}
                disabled={isLoading || !shot.image}
                className={`text-xs px-3 py-1 rounded-md transition ${
                  isLoading
                    ? "bg-gray-600"
                    : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
              >
                {isLoading ? "Exporting..." : "Export"}
              </button>
            </div>

            {shot.image && (
              <img
                src={shot.image}
                alt=""
                className="w-full rounded-lg"
              />
            )}
          </div>
        );
      })}

      {!shots.length && (
        <div className="text-sm text-gray-400">
          No shots available
        </div>
      )}
    </div>
  );
}