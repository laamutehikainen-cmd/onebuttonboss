import type { Particle } from '../utils/types';
import { rand } from '../utils/math';

export class ParticleSystem {
  particles: Particle[] = [];

  spawnBurst(x: number, y: number, color: string, amount: number, speed = 420): void {
    for (let i = 0; i < amount; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const velocity = rand(speed * 0.4, speed);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: rand(0.2, 0.55),
        maxLife: rand(0.2, 0.55),
        size: rand(3, 8),
        color,
      });
    }
  }

  spawnDirectional(x: number, y: number, color: string, amount: number, dirX: number, dirY: number): void {
    for (let i = 0; i < amount; i += 1) {
      this.particles.push({
        x,
        y,
        vx: dirX * rand(140, 440) + rand(-90, 90),
        vy: dirY * rand(140, 440) + rand(-90, 90),
        life: rand(0.15, 0.35),
        maxLife: rand(0.15, 0.35),
        size: rand(2, 5),
        color,
      });
    }
  }

  update(dt: number): void {
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const particle of this.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 800 * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.particles) {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
