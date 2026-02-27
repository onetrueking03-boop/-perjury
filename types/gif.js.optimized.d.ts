declare module "gif.js.optimized" {
  type GIFOptions = {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
  };

  export default class GIF {
    constructor(options?: GIFOptions);
    addFrame(
      image: CanvasImageSource,
      options?: { delay?: number; copy?: boolean }
    ): void;
    on(event: "progress", cb: (p: number) => void): void;
    on(event: "finished", cb: (blob: Blob) => void): void;
    render(): void;
  }
}
