import type { Boss } from '../entities/Boss';
import type { Player } from '../entities/Player';
import type { GameState } from '../utils/types';

export class UIManager {
  render(ctx: CanvasRenderingContext2D, gameState: GameState, player: Player, boss: Boss, elapsed: number): void {
    this.renderBossHp(ctx, boss);
    this.renderPlayerHp(ctx, player);

    if (gameState === 'title') {
      this.renderCenterText(ctx, 'One-Button Boss Fight', 'Press Space / Click / Tap', 'One button. Jump, strike, parry.');
    }

    if (gameState === 'victory') {
      this.renderCenterText(ctx, 'Victory', `Boss defeated in ${elapsed.toFixed(1)}s`, 'Press to restart');
    }

    if (gameState === 'defeat') {
      this.renderCenterText(ctx, 'Defeat', 'Learn the pattern. Try again.', 'Press to restart');
    }
  }

  private renderBossHp(ctx: CanvasRenderingContext2D, boss: Boss): void {
    const x = 170;
    const y = 30;
    const width = 940;
    const height = 28;
    const ratio = Math.max(0, boss.hp / boss.maxHp);

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(x - 6, y - 6, width + 12, height + 12);

    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, '#ff8b00');
    gradient.addColorStop(1, '#ff2a00');
    ctx.fillStyle = '#2f1010';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width * ratio, height);

    ctx.strokeStyle = '#ffe1af';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', x + width / 2, y - 10);
  }

  private renderPlayerHp(ctx: CanvasRenderingContext2D, player: Player): void {
    for (let i = 0; i < 3; i += 1) {
      const alive = i < player.hp;
      ctx.fillStyle = alive ? '#67e8f9' : 'rgba(103,232,249,0.2)';
      ctx.beginPath();
      ctx.arc(50 + i * 36, 50, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d7f9ff';
      ctx.stroke();
    }
  }

  private renderCenterText(ctx: CanvasRenderingContext2D, title: string, subtitle: string, helper: string): void {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 72px system-ui';
    ctx.fillText(title, ctx.canvas.width / 2, ctx.canvas.height / 2 - 70);
    ctx.font = 'bold 30px system-ui';
    ctx.fillStyle = '#ffd580';
    ctx.fillText(subtitle, ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.font = '24px system-ui';
    ctx.fillStyle = '#e2f2ff';
    ctx.fillText(helper, ctx.canvas.width / 2, ctx.canvas.height / 2 + 50);
  }
}
