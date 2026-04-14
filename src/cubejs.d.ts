declare module "cubejs" {
  export interface CubeInstance {
    move(moves: string): void;
    solve(maxDepth?: number): string;
    isSolved(): boolean;
    scramble(n?: number): void;
    random(n?: number): void;
    asString(): string;
  }

  export interface CubeClass {
    new (): CubeInstance;
    new (state: any): CubeInstance;
    initSolver(): void;
    fromString(facelets: string): CubeInstance;
  }

  const Cube: CubeClass;
  export default Cube;
}
