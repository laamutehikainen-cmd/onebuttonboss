import type { Game } from './Game';

export class GameLoop {
  private lastTimestamp = 0;

  constructor(private readonly game: Game, private readonly ctx: CanvasRenderingContext2D) {}

  start(): void {
    const loop = (timestamp: number): void => {
      const rawDt = this.lastTimestamp === 0 ? 16.67 : timestamp - this.lastTimestamp;
      const dt = Math.min(rawDt, 33.33) / 1000;

      this.game.update(dt * this.game.timeScale);
      this.game.render(this.ctx);

      this.lastTimestamp = timestamp;
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
