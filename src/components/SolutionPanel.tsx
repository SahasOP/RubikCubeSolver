import React from "react";

export function SolutionPanel({ solutions }) {
  if (!solutions || Object.keys(solutions).length === 0) return <div>No solutions found.</div>;
  return (
    <div style={{ marginTop: 32 }}>
      <h3>Solutions Found:</h3>
      {Object.entries(solutions)
        .sort(([a], [b]) => +a - +b)
        .map(([length, sols]) => (
          <div key={length} style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: "bold", fontSize: 17 }}>
              Length {length} ({sols?.length})
            </div>
            <ul>
              {sols.map((sol, idx) => (
                <li key={idx} style={{ marginBottom: 8, background: "#F8F9FA", borderRadius: 6, padding: 10, lineHeight: "1.6", fontFamily: "monospace" }}>
                  {sol.moves.join(" ")}
                  <button style={{ marginLeft: 16, padding: "2px 10px", borderRadius: 4, background: "#2563EB", color: "#fff", fontWeight: "bold" }} onClick={() => navigator.clipboard.writeText(sol.moves.join(" "))}>
                    Copy
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
