// src/components/ui/CubePlayer.tsx
// FIXED VERSION - PROPER ANIMATION

import React, { useEffect, useRef } from "react";
import { TwistyPlayer } from "cubing/twisty";

interface CubePlayerProps {
  scramble?: string;
  solution?: string;
  puzzle?: string;
  tempoScale?: number;
  controlPanel?: "bottom-row" | "none";
  background?: string;
  visualization?: "3D" | "2D";
  autoPlay?: boolean;
}

export function CubePlayer({ scramble = "", solution = "", puzzle = "3x3x3", tempoScale = 1.5, controlPanel = "bottom-row", background = "none", visualization = "3D", autoPlay = false }: CubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<TwistyPlayer | null>(null);

  useEffect(() => {
    // Ensure script is loaded
    if (!document.querySelector("#twisty-script")) {
      const script = document.createElement("script");
      script.id = "twisty-script";
      script.src = "https://cdn.cubing.net/v0/js/cubing/twisty";
      script.type = "module";
      script.onload = () => {
        console.log("TwistyPlayer script loaded");
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Clear previous player
      if (playerRef.current && containerRef.current.contains(playerRef.current)) {
        containerRef.current.removeChild(playerRef.current);
        playerRef.current = null;
      }

      // Create new player
      const player = new TwistyPlayer({
        puzzle,
        background,
        controlPanel,
        visualization,
        tempoScale,
        hintFacelets: "floating",
        experimentalSetupAnchor: "start",
      });

      // Set algorithm with proper format
      if (solution && solution.trim()) {
        // Set the solution as the main algorithm
        player.alg = solution.trim();
        // Set scramble as setup
        if (scramble && scramble.trim()) {
          player.experimentalSetupAlg = scramble.trim();
        }
        console.log("Solution set:", solution.trim());
        console.log("Scramble setup:", scramble.trim());
      } else if (scramble && scramble.trim()) {
        // If only scramble, show scrambled state
        player.alg = scramble.trim();
        console.log("Only scramble set:", scramble.trim());
      } else {
        player.alg = "";
      }

      // Style the player
      player.style.width = "100%";
      player.style.minHeight = "360px";
      player.style.height = "360px";

      containerRef.current.appendChild(player);
      playerRef.current = player;

      // Auto play if requested and solution exists
      if (autoPlay && solution && solution.trim()) {
        // Small delay to ensure player is fully initialized
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.play();
            console.log("Auto-playing solution");
          }
        }, 100);
      }

      console.log("TwistyPlayer created with:", {
        scramble: scramble.trim(),
        solution: solution.trim(),
        puzzle,
        autoPlay,
      });
    } catch (error) {
      console.error("Error creating TwistyPlayer:", error);
    }

    return () => {
      if (playerRef.current && containerRef.current?.contains(playerRef.current)) {
        try {
          containerRef.current.removeChild(playerRef.current);
        } catch (e) {
          console.error("Error removing player:", e);
        }
        playerRef.current = null;
      }
    };
  }, [scramble, solution, puzzle, tempoScale, controlPanel, background, visualization, autoPlay]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden shadow"
      style={{
        background: background === "none" ? "#111111" : background,
      }}
    />
  );
}

export default CubePlayer;
