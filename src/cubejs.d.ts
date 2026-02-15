declare module "cubejs" {
  interface CubeInstance {
    solve(): string;
    isSolved(): boolean;
    scramble(n: number): void;
    random(n: number): void;
  }

  interface CubeStatic {
    initSolver(): void;
    fromString(facelets: string): CubeInstance;
    fromCommands(commands: string): CubeInstance;
  }

  const Cube: CubeStatic;
  export default Cube;
}
