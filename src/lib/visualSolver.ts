import Cube from "cubejs";

// Initialize the solver tables once at the module level
try {
  Cube.initSolver();
} catch (e) {
  console.error("Cube solver initialization failed:", e);
}

type CubeFace = "U" | "R" | "F" | "D" | "L" | "B";
const facesOrder: CubeFace[] = ["U", "R", "F", "D", "L", "B"];

const colorToDefaultFace: Record<string, CubeFace> = {
  white: "U",
  red: "R",
  green: "F",
  yellow: "D",
  orange: "L",
  blue: "B",
};

/**
 * Converts various visual cube states into a scramble string.
 * A scramble is the inverse of the solution to reach the current state.
 */
export function convertVisualStateToScramble(cubeState: any): string {
  // 1. Handle String Inputs (Existing scrambles or Facelet strings)
  if (typeof cubeState === "string") {
    const s = cubeState.trim();

    // Return as-is if it's already a move sequence
    if (/\b([RULFDBMESxyz]|[rludfb])('?|2?)\b/i.test(s) && s.includes(" ")) {
      return s;
    }

    // If it's a 54-char facelet string
    if (/^[URFDLB]{54}$/i.test(s)) {
      return solveAndInvert(s.toUpperCase());
    }
    throw new Error("Unrecognized string input.");
  }

  // 2. Normalize Inputs into a Face Map (Record<CubeFace, string[]>)
  let faceMap: Record<CubeFace, string[]> = {} as any;

  if (Array.isArray(cubeState) && cubeState.length === 6) {
    // Camera captured array [{ face: 'U', colors: [...] }]
    cubeState.forEach((f: any) => {
      faceMap[f.face as CubeFace] = f.colors.flat().map(String);
    });
  } else if (Array.isArray(cubeState) && cubeState.length === 54) {
    // Flat array of 54 stickers
    facesOrder.forEach((face, i) => {
      faceMap[face] = cubeState.slice(i * 9, i * 9 + 9).map(String);
    });
  } else if (typeof cubeState === "object" && cubeState !== null) {
    // Face-keyed object { U: [[...]], R: [[...]] }
    facesOrder.forEach((face) => {
      faceMap[face] = Array.isArray(cubeState[face]) ? cubeState[face].flat().map(String) : [];
    });
  }

  // 3. Determine Dynamic Color-to-Face Mapping
  // The center sticker (index 4) of each face defines that face's color
  const colorToFace: Record<string, string> = {};
  facesOrder.forEach((f) => {
    const centerRaw = faceMap[f][4];
    const centerColor = normalizeColorName(centerRaw);
    colorToFace[centerColor] = f;
  });

  // 4. Construct the 54-character Facelet String
  // Order required by cubejs: U1..U9, R1..R9, F1..F9, D1..D9, L1..L9, B1..B9
  let faceletString = "";
  for (const f of facesOrder) {
    if (!faceMap[f] || faceMap[f].length !== 9) {
      throw new Error(`Incomplete data for face ${f}`);
    }
    for (const sticker of faceMap[f]) {
      const stickerColor = normalizeColorName(sticker);

      // If sticker is already a face letter
      if (/^[URFDLB]$/i.test(stickerColor)) {
        faceletString += stickerColor.toUpperCase();
      } else {
        const mappedFace = colorToFace[stickerColor];
        if (!mappedFace) {
          throw new Error(`Sticker color "${sticker}" cannot be mapped to a face.`);
        }
        faceletString += mappedFace;
      }
    }
  }

  return solveAndInvert(faceletString);
}

/**
 * Normalizes hex codes, short codes, and names to a standard color key.
 */
function normalizeColorName(val: string): string {
  const kLower = val.toLowerCase().trim();
  const hexToName: Record<string, string> = {
    "#ffffff": "white",
    "#fff": "white",
    "#ffff00": "yellow",
    "#ffd500": "yellow",
    "#ef4444": "red",
    "#f97316": "orange",
    "#22c55e": "green",
    "#3b82f6": "blue",
  };
  const shortMap: Record<string, string> = {
    w: "white",
    y: "yellow",
    r: "red",
    o: "orange",
    g: "green",
    b: "blue",
  };

  return hexToName[kLower] ?? shortMap[kLower] ?? kLower;
}

/**
 * Solves the facelet string and inverts the result to create a scramble.
 */
function solveAndInvert(facelets: string): string {
  try {
    const cube = Cube.fromString(facelets);
    const solution = cube.solve();
    if (!solution) throw new Error("No solution found.");

    const moves = solution.split(/\s+/).filter(Boolean);
    return invertSequence(moves).join(" ");
  } catch (err) {
    throw new Error(`Solver failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Helper: Invert moves (e.g., R -> R', R' -> R, R2 -> R2)
function invertMove(mv: string): string {
  if (mv.endsWith("'")) return mv.slice(0, -1);
  if (mv.endsWith("2")) return mv;
  return mv + "'";
}

// Helper: Reverse the sequence and invert each move
function invertSequence(moves: string[]): string[] {
  return moves.map(invertMove).reverse();
}
