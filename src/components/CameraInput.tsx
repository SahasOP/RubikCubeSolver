// src/components/CameraInput.tsx
// Camera and image upload for cube state recognition

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, X, RefreshCw, Check, AlertCircle } from "lucide-react";

type CubeFace = "U" | "R" | "F" | "D" | "L" | "B";
type Color = "white" | "red" | "green" | "yellow" | "orange" | "blue";

interface DetectedCubeState {
  face: CubeFace;
  colors: Color[][];
  confidence: number;
}

interface CameraInputProps {
  onComplete: (cubeState: any) => void;
  onCancel: () => void;
}
const COLOR_TO_FACE: Record<Color, CubeFace> = {
  white: "U",
  red: "R",
  green: "F",
  yellow: "D",
  orange: "L",
  blue: "B",
};

// Added color palette constants (same as ColorPickerCubeInput)
const COLORS: Record<Color, string> = {
  white: "#FFFFFF",
  yellow: "#FFD500",
  red: "#EF4444",
  orange: "#F97316",
  green: "#22C55E",
  blue: "#3B82F6",
};
const COLOR_NAMES: Record<Color, string> = {
  white: "White",
  yellow: "Yellow",
  red: "Red",
  orange: "Orange",
  green: "Green",
  blue: "Blue",
};

export const CameraInput = ({ onComplete, onCancel }: CameraInputProps) => {
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedFaces, setCapturedFaces] = useState<DetectedCubeState[]>([]);
  const [currentFace, setCurrentFace] = useState<CubeFace>("U");
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingFace, setEditingFace] = useState<CubeFace | null>(null);
  const [editingColors, setEditingColors] = useState<Color[][] | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [paletteSelected, setPaletteSelected] = useState<Color>("white");
  // Helper to update captured face colors
  const updateCapturedFace = (face: CubeFace, newColors: Color[][]) => {
    setCapturedFaces((prev) => {
      const found = prev.find((f) => f.face === face);
      if (found) {
        return prev.map((f) => (f.face === face ? { ...f, colors: newColors } : f));
      } else {
        return [...prev, { face, colors: newColors, confidence: 0.8 }];
      }
    });
  };

  // Open in-place editor for a specific sticker (face,row,col)
  const openEditFaceCell = (face: CubeFace, row: number, col: number) => {
    const captured = capturedFaces.find((f) => f.face === face);
    const colors = captured
      ? captured.colors.map((r) => [...r])
      : ([
          ["white", "white", "white"],
          ["white", "white", "white"],
          ["white", "white", "white"],
        ] as Color[][]);
    setEditingFace(face);
    setEditingColors(colors);
    setEditingCell({ row, col });
    setPaletteSelected(colors[row][col] as Color);
  };

  // Open full-face editor
  const openEditFace = (face: CubeFace) => openEditFaceCell(face, 1, 1);

  const setEditCellColor = (row: number, col: number, color: Color) => {
    if (!editingColors) return;
    setEditingColors((prev) => {
      if (!prev) return prev;
      const clone = prev.map((r) => [...r]);
      clone[row][col] = color;
      return clone;
    });
  };

  const fillEditingFace = (color: Color) => {
    setEditingColors([
      [color, color, color],
      [color, color, color],
      [color, color, color],
    ]);
  };

  const saveEditingFace = () => {
    if (!editingFace || !editingColors) return;
    updateCapturedFace(editingFace, editingColors);
    setEditingFace(null);
    setEditingColors(null);
    setEditingCell(null);
  };

  const cancelEditing = () => {
    setEditingFace(null);
    setEditingColors(null);
    setEditingCell(null);
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const FACE_ORDER: CubeFace[] = ["U", "R", "F", "D", "L", "B"];
  const FACE_NAMES = {
    U: "Top (White)",
    R: "Right (Red)",
    F: "Front (Green)",
    D: "Bottom (Yellow)",
    L: "Left (Orange)",
    B: "Back (Blue)",
  };

  // Start camera
  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Capture current frame
  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Simulate color detection (in production, use actual CV library)
    const detected = await detectCubeColors(imageData);

    setCapturedFaces((prev) => [...prev.filter((f) => f.face !== currentFace), { face: currentFace, colors: detected, confidence: 0.85 }]);

    // Move to next face
    const currentIndex = FACE_ORDER.indexOf(currentFace);
    if (currentIndex < FACE_ORDER.length - 1) {
      setCurrentFace(FACE_ORDER[currentIndex + 1]);
    }

    setIsProcessing(false);
  };

  // Handle image upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const detected = await detectCubeColors(imageData);

        setCapturedFaces((prev) => [...prev.filter((f) => f.face !== currentFace), { face: currentFace, colors: detected, confidence: 0.75 }]);

        const currentIndex = FACE_ORDER.indexOf(currentFace);
        if (currentIndex < FACE_ORDER.length - 1) {
          setCurrentFace(FACE_ORDER[currentIndex + 1]);
        }

        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Simplified color detection (replace with actual CV in production)
  const detectCubeColors = async (imageData: ImageData): Promise<Color[][]> => {
    const size = Math.min(imageData.width, imageData.height);
    const offsetX = (imageData.width - size) / 2;
    const offsetY = (imageData.height - size) / 2;

    const cellSize = size / 3;
    const result: Color[][] = [];

    for (let row = 0; row < 3; row++) {
      const rowColors: Color[] = [];
      for (let col = 0; col < 3; col++) {
        const x = offsetX + col * cellSize + cellSize * 0.25;
        const y = offsetY + row * cellSize + cellSize * 0.25;

        rowColors.push(sampleCell(imageData, Math.floor(x), Math.floor(y), cellSize * 0.5));
      }
      result.push(rowColors);
    }

    return result;
  };

  const getFaceColor = (face: CubeFace): Color => {
    const colors: { [key in CubeFace]: Color } = {
      U: "white",
      R: "red",
      F: "green",
      D: "yellow",
      L: "orange",
      B: "blue",
    };
    return colors[face];
  };

  const handleComplete = () => {
    if (capturedFaces.length !== 6) {
      alert("Capture all 6 faces");
      return;
    }

    const notation = generateCubeNotation(capturedFaces);

    if (!validateCubeNotation(notation)) {
      alert("Invalid cube detected. Please rescan.");
      return;
    }

    // Pass the raw detec ted faces (array of {face, colors}) so the visual solver
    // can robustly normalize and map colors -> facelets.
    console.debug("Passing capturedFaces to visual solver:", capturedFaces, "derived notation:", notation);
    onComplete(capturedFaces);
  };

  const resetCapture = () => {
    setCapturedFaces([]);
    setCurrentFace("U");
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/10 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Camera / Image Recognition</h2>
            <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-6 h-6 text-white/60" />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2">
            <button onClick={() => setMode("camera")} className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${mode === "camera" ? "bg-cyan-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
              <Camera className="w-4 h-4 inline mr-2" />
              Camera
            </button>
            <button onClick={() => setMode("upload")} className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${mode === "upload" ? "bg-cyan-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera/Upload Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Current Face Indicator */}
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-blue-300">Capture Face: {FACE_NAMES[currentFace]}</h3>
                  <span className="text-sm text-white/60">{capturedFaces.length}/6 faces</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all" style={{ width: `${(capturedFaces.length / 6) * 100}%` }} />
                </div>
              </div>

              {/* Video/Upload Area */}
              <div className="bg-black rounded-xl overflow-hidden aspect-video relative">
                {mode === "camera" ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    {/* Overlay guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-4 border-cyan-400/50 w-64 h-64 rounded-lg" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4 text-white/60 hover:text-white transition-colors">
                      <Upload className="w-16 h-16" />
                      <span className="text-lg">Click to upload image</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-2" />
                      <p className="text-white">Detecting colors...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden canvas for image processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Capture Button */}
              <div className="flex gap-3">
                {mode === "camera" && (
                  <button onClick={captureFrame} disabled={isProcessing} className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <Camera className="w-5 h-5 inline mr-2" />
                    Capture Face
                  </button>
                )}
                <button onClick={resetCapture} className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-white/80 font-semibold transition-colors">
                  <RefreshCw className="w-5 h-5 inline mr-2" />
                  Reset
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-4">
                <h4 className="text-sm font-bold text-yellow-300 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Instructions
                </h4>
                <ul className="text-xs text-white/70 space-y-1">
                  <li>• Position the cube face in the center guide</li>
                  <li>• Ensure good lighting for accurate detection</li>
                  <li>• Capture all 6 faces in order</li>
                  <li>• Review detected colors before confirming</li>
                </ul>
              </div>
            </div>

            {/* Captured Faces Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Captured Faces</h3>

              <div className="space-y-3">
                {FACE_ORDER.map((face) => {
                  const captured = capturedFaces.find((f) => f.face === face);

                  return (
                    <div key={face} className={`p-3 rounded-xl border transition-all ${currentFace === face ? "border-cyan-400 bg-cyan-400/10" : captured ? "border-green-400/30 bg-green-400/5" : "border-white/10 bg-white/5"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white">{FACE_NAMES[face]}</span>
                        <div className="flex items-center gap-2">
                          {captured && (
                            <button onClick={() => openEditFace(face)} className="px-2 py-1 bg-white/5 rounded text-white/80 text-xs">
                              Edit Face
                            </button>
                          )}
                          {captured && <Check className="w-4 h-4 text-green-400" />}
                        </div>
                      </div>
                      {captured ? (
                        <div className="grid grid-cols-3 gap-1">
                          {captured.colors.flat().map((color, idx) => {
                            const row = Math.floor(idx / 3);
                            const col = idx % 3;
                            return (
                              <div
                                key={idx}
                                onClick={() => openEditFaceCell(face, row, col)}
                                title={`Click to edit (${COLOR_NAMES[color as Color]})`}
                                className="aspect-square rounded border border-black/30 cursor-pointer transform transition-transform hover:scale-105"
                                style={{
                                  backgroundColor: COLORS[color as Color],
                                }}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-white/60">Not captured</div>
                      )}{" "}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6 pt-6 border-t border-white/10">
            <button onClick={onCancel} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/80 font-semibold transition-colors">
              Cancel
            </button>
            <button onClick={handleComplete} disabled={capturedFaces.length !== 6} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <Check className="w-5 h-5 inline mr-2" />
              Confirm & Generate
            </button>
          </div>
        </div>
      </div>
      {/* Editing Modal */}
      {editingFace && editingColors && (
        <div className="fixed inset-0 z-[1000001] flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Edit Face: {FACE_NAMES[editingFace]}</h4>
              <button onClick={cancelEditing} className="p-1 rounded hover:bg-white/5 text-white/70">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {editingColors.flat().map((color, idx) => {
                const row = Math.floor(idx / 3);
                const col = idx % 3;
                const isActive = editingCell?.row === row && editingCell?.col === col;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setEditingCell({ row, col });
                      setPaletteSelected(color);
                    }}
                    className={`aspect-square rounded border ${isActive ? "ring-2 ring-cyan-400" : "border-black/30"} cursor-pointer`}
                    style={{ backgroundColor: COLORS[color] }}
                  />
                );
              })}
            </div>{" "}
            <div className="mb-4">
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(COLORS) as Color[]).map((c) => (
                  <button
                    onClick={() => {
                      setPaletteSelected(c);
                      if (editingCell) setEditCellColor(editingCell.row, editingCell.col, c);
                    }}
                    key={c}
                    className={`w-10 h-10 rounded-full border ${paletteSelected === c ? "ring-2 ring-cyan-400" : "border-white/10"}`}
                    style={{ backgroundColor: COLORS[c] }}
                  />
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={() => editingCell && setEditCellColor(editingCell.row, editingCell.col, paletteSelected)} className="px-3 py-2 bg-cyan-500 rounded text-white text-sm">
                  Apply to Cell
                </button>
                <button onClick={() => fillEditingFace(paletteSelected)} className="px-3 py-2 bg-white/5 rounded text-white text-sm">
                  Fill Face
                </button>
                <button onClick={() => fillEditingFace(editingColors[1][1])} className="px-3 py-2 bg-white/5 rounded text-white text-sm">
                  Fill with Center
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={cancelEditing} className="px-3 py-2 rounded bg-white/5 text-white/80">
                Cancel
              </button>
              <button onClick={saveEditingFace} className="px-3 py-2 rounded bg-cyan-500 text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }

  if (h < 0) h += 360;

  const s = max === 0 ? 0 : d / max;
  const v = max;

  return { h, s, v };
}
function classifyColor(h: number, s: number, v: number): Color {
  // Enhanced heuristic for varying lighting conditions
  if (v < 0.15) return "blue"; // Deep shadow fallback

  if (s < 0.35 && v > 0.6) return "white"; // More forgiving saturation for white

  if (h < 15 || h > 345) return "red";
  if (h >= 15 && h < 45) return "orange";
  if (h >= 45 && h < 90) return "yellow";
  if (h >= 90 && h < 170) return "green";
  if (h >= 170 && h < 270) return "blue";

  return "white";
}
function sampleCell(imageData: ImageData, startX: number, startY: number, size: number): Color {
  let r = 0,
    g = 0,
    b = 0,
    count = 0;

  for (let y = startY; y < startY + size; y += 4) {
    for (let x = startX; x < startX + size; x += 4) {
      const i = (y * imageData.width + x) * 4;
      r += imageData.data[i];
      g += imageData.data[i + 1];
      b += imageData.data[i + 2];
      count++;
    }
  }

  r /= count;
  g /= count;
  b /= count;

  const { h, s, v } = rgbToHsv(r, g, b);
  return classifyColor(h, s, v);
}
function normalizeFaceColors(colors: Color[][]): Color[][] {
  const center = colors[1][1];
  return colors.map((row) => row.map((c) => (c === center ? center : c)));
}
function generateCubeNotation(faces: DetectedCubeState[]) {
  const faceMap: Record<CubeFace, Color[][]> = {} as any;

  faces.forEach((f) => (faceMap[f.face] = f.colors));

  const order: CubeFace[] = ["U", "R", "F", "D", "L", "B"];

  return order.flatMap((face) => faceMap[face].flat().map((color) => COLOR_TO_FACE[color])).join("");
}
function validateCubeNotation(notation: string): boolean {
  if (notation.length !== 54) return false;

  const counts: Record<string, number> = {};
  for (const c of notation) counts[c] = (counts[c] || 0) + 1;

  return ["U", "R", "F", "D", "L", "B"].every((f) => counts[f] === 9);
}
