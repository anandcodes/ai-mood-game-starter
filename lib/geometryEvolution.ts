/**
 * geometryEvolution — Phase 18 (AERIS Overhaul)
 *
 * Evolves the main environment object based on Level milestones.
 * Includes 'Anomaly' stages at high levels.
 */

export type EnvironmentStage = "primitive" | "structured" | "crystalline" | "synthetic" | "quantum" | "anomaly";

export function getEnvironmentStage(level: number): EnvironmentStage {
    if (level >= 25) return "anomaly";
    if (level >= 15) return "quantum";
    if (level >= 10) return "synthetic";
    if (level >= 6) return "crystalline";
    if (level >= 3) return "structured";
    return "primitive";
}

export function getGeometryProps(stage: EnvironmentStage) {
    switch (stage) {
        case "primitive":
            return { type: "Icosahedron", args: [1, 1], wireframe: true };
        case "structured":
            return { type: "Octahedron", args: [1.2, 0], wireframe: true };
        case "crystalline":
            return { type: "Dodecahedron", args: [1.3, 0], wireframe: false };
        case "synthetic":
            return { type: "TorusKnot", args: [0.7, 0.3, 64, 8], wireframe: true };
        case "quantum":
            return { type: "TorusKnot", args: [0.9, 0.15, 128, 32], wireframe: false };
        case "anomaly":
            return { type: "Icosahedron", args: [1.5, 0], wireframe: true }; // Exploded look via scale in DynamicEnv
        default:
            return { type: "Icosahedron", args: [1, 1], wireframe: true };
    }
}
