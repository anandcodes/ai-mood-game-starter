/**
 * geometryEvolution — Phase 2
 *
 * Evolves the main environment object based on score milestones.
 *
 * Stages:
 *   Score < 200: Sphere (Icosahedron high detail)
 *   Score < 500: Crystal (Octahedron / Low poly style)
 *   Score < 900: Fractal (recursive geometry or complex shape)
 *   Score >= 900: Glowing Complex Mesh (Torus Knot)
 */

export type EnvironmentStage = "sphere" | "crystal" | "fractal" | "complex";

export function getEnvironmentStage(score: number): EnvironmentStage {
    if (score >= 900) return "complex";
    if (score >= 500) return "fractal"; // actually, fractal is hard to do pure logic. Let's map it to geometry types.
    if (score >= 200) return "crystal";
    return "sphere";
}

// Helper to get geometry props based on stage
export function getGeometryProps(stage: EnvironmentStage) {
    switch (stage) {
        case "sphere":
            return { type: "Icosahedron", args: [1, 2] }; // Smoother sphere
        case "crystal":
            return { type: "Octahedron", args: [1.2, 0] }; // Sharp crystal
        case "fractal":
            return { type: "Dodecahedron", args: [1.1, 0] }; // Angular, complex looking? Or maybe multiple grouped meshes?
        // Let's use Dodecahedron for now as placeholder for "fractal-ish" look
        case "complex":
            return { type: "TorusKnot", args: [0.8, 0.3, 128, 16] }; // Complex knot
    }
}
