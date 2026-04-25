import { Boss } from '../entities/Boss';
import { Player } from '../entities/Player';
import { Camera } from './Camera';
import { InputManager } from './InputManager';
import { ParticleSystem } from '../systems/ParticleSystem';
import { UIManager } from '../systems/UIManager';
import { AIR_ATTACK_DAMAGE, AIR_ATTACK_RECOVERY_DAMAGE, BASE_HEIGHT, BASE_WIDTH, DEBUG, GROUND_Y, PARRY_DAMAGE } from '../utils/constants';
import type { GameState, Rect } from '../utils/types';
import { intersects } from '../systems/CollisionSystem';
import { clamp, lerp } from '../utils/math';

export class Game {
  readonly player = new Player();
  readonly boss = new Boss();
  readonly camera = new Camera();
  readonly particles = new ParticleSystem();
  readonly ui = new UIManager();

  gameState: GameState = 'title';
  timeScale = 1;
  private timeScaleRecoverTimer = 0;
  private elapsedFightTime = 0;

  constructor(private readonly input: InputManager) {}

  resetRun(): void {
    this.player.reset();
    this.boss.reset();
    this.particles.particles = [];
    this.camera.shake(8, 0.2);
    this.timeScale = 1;
    this.elapsedFightTime = 0;
    this.gameState = 'playing';
  }

  private triggerSlowMotion(): void {
    this.timeScale = 0.25;
    this.timeScaleRecoverTimer = 0.15;
  }

  private handleActionPress(): void {
    if (this.gameState === 'victory' || this.gameState === 'defeat') {
      this.resetRun();
      return;
    }

    if (this.gameState === 'title') {
      this.resetRun();
      return;
    }

    if (this.gameState !== 'playing') {
      return;
    }

    if (this.boss.isParryWindowActive() && this.boss.currentAttack) {
      this.player.setParryState();
      this.boss.currentAttack.parryResolved = true;
      this.boss.receiveDamage(PARRY_DAMAGE);
      this.particles.spawnBurst(this.player.x + this.player.width / 2, this.player.y + 35, '#fef08a', 22, 600);
      this.camera.shake(16, 0.15);
      this.triggerSlowMotion();
      return;
    }

    if (!this.player.grounded && this.player.canAirAttack && this.player.state !== 'airAttacking') {
      if (this.player.doAirAttack()) {
        this.particles.spawnDirectional(this.player.x + this.player.width, this.player.y + 50, '#7dd3fc', 16, 1, -0.3);
      }
      return;
    }

    if (this.player.grounded) {
      if (this.player.jump()) {
        this.particles.spawnDirectional(this.player.x + this.player.width / 2, GROUND_Y - 6, '#cbd5e1', 14, 0, -0.8);
      }
      return;
    }
  }

  private getPlayerAttackDamage(): number {
    return this.boss.state === 'recovering' ? AIR_ATTACK_RECOVERY_DAMAGE : AIR_ATTACK_DAMAGE;
  }

  private processCombat(): void {
    if (this.gameState !== 'playing' || this.boss.state === 'dead') {
      return;
    }

    const attackHitbox = this.player.attackHitbox;
    if (attackHitbox && intersects(attackHitbox, this.boss.weakPoint)) {
      this.boss.receiveDamage(this.getPlayerAttackDamage());
      this.player.airAttackTimer = 0;
      this.player.state = this.player.grounded ? 'idle' : 'falling';
      this.particles.spawnBurst(this.boss.weakPoint.x + 30, this.boss.weakPoint.y + 50, '#fde047', 14);
      this.camera.shake(10, 0.1);
    }

    const danger = this.getCurrentDamageRect();
    if (danger && this.boss.isDamageActive() && intersects(this.player.bodyHitbox, danger)) {
      const tookDamage = this.player.takeHit();
      if (tookDamage) {
        this.particles.spawnBurst(this.player.x + 30, this.player.y + 55, '#fb7185', 15, 530);
        this.camera.shake(20, 0.2);
      }
    }

    if (this.player.hp <= 0) {
      this.gameState = 'defeat';
    }

    if (this.boss.hp <= 0) {
      this.boss.state = 'dead';
      this.gameState = 'victory';
      this.camera.shake(28, 0.5);
      this.particles.spawnBurst(this.boss.x + 180, this.boss.y + 220, '#f97316', 55, 660);
    }
  }

  private getCurrentDamageRect(): Rect | null {
    if (!this.boss.currentAttack) {
      return null;
    }
    return this.boss.currentAttack.definition.damageRect;
  }

  update(dt: number): void {
    this.input.update(dt);
    if (this.input.consumeAction()) {
      this.handleActionPress();
    }

    if (this.timeScaleRecoverTimer > 0) {
      this.timeScaleRecoverTimer -= dt;
      if (this.timeScaleRecoverTimer <= 0) {
        this.timeScaleRecoverTimer = 0;
      }
    } else {
      this.timeScale = lerp(this.timeScale, 1, clamp(dt * 14, 0, 1));
    }

    if (this.gameState === 'playing') {
      this.elapsedFightTime += dt;
      this.player.update(dt);
      this.boss.update(dt);
      this.processCombat();
      this.particles.update(dt);
      this.camera.update(dt);
    }

    this.input.endFrame();
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    const bg = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
    bg.addColorStop(0, '#120a1b');
    bg.addColorStop(1, '#050608');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    ctx.save();
    ctx.translate(this.camera.offsetX, this.camera.offsetY);

    ctx.fillStyle = '#1f172b';
    ctx.fillRect(0, GROUND_Y, BASE_WIDTH, BASE_HEIGHT - GROUND_Y);

    this.renderAttackWarnings(ctx);

    this.renderBoss(ctx);
    this.renderPlayer(ctx);

    this.particles.render(ctx);

    if (DEBUG) {
      this.renderDebug(ctx);
    }

    ctx.restore();

    this.ui.render(ctx, this.gameState, this.player, this.boss, this.elapsedFightTime);
  }

  private renderAttackWarnings(ctx: CanvasRenderingContext2D): void {
    if (!this.boss.currentAttack) {
      return;
    }
    const attack = this.boss.currentAttack;
    const def = attack.definition;
    const alphaPulse = 0.35 + Math.sin(attack.timer * 24) * 0.2;

    if (this.boss.state === 'telegraphing') {
      ctx.globalAlpha = alphaPulse;
      ctx.fillStyle = '#ef4444';
      const w = def.warningRect;
      if (def.type === 'crushingHand') {
        ctx.beginPath();
        ctx.arc(w.x + w.width / 2, w.y + w.height / 2, w.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(w.x, w.y, w.width, w.height);
      }
      ctx.globalAlpha = 1;
    }

    if (def.type === 'energyBeam' && this.boss.isDamageActive()) {
      const beam = def.damageRect;
      ctx.fillStyle = '#fef08a';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(beam.x, beam.y, beam.width, beam.height);
      ctx.globalAlpha = 1;
    }
  }

  private renderBoss(ctx: CanvasRenderingContext2D): void {
    const hurtFlash = this.boss.state === 'dead' ? 0.3 : 0;
    ctx.fillStyle = hurtFlash > 0 ? '#fca5a5' : '#7f1d1d';
    ctx.fillRect(this.boss.x, this.boss.y, this.boss.width, this.boss.height);

    ctx.fillStyle = '#fecaca';
    ctx.fillRect(this.boss.weakPoint.x, this.boss.weakPoint.y, this.boss.weakPoint.width, this.boss.weakPoint.height);

    if (this.boss.currentAttack?.definition.type === 'crushingHand') {
      const t = this.boss.currentAttack.timer;
      const yOffset = this.boss.currentAttack.definition.telegraph - t;
      const handY = clamp(160 + yOffset * 180, 120, 420);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(210, handY, 180, 95);
    }

    if (this.boss.currentAttack?.definition.type === 'groundSweep' && this.boss.state === 'attacking') {
      ctx.fillStyle = '#fb7185';
      const progress = this.boss.currentAttack.timer - this.boss.currentAttack.definition.telegraph;
      ctx.fillRect(1020 - progress * 2500, 565, 260, 28);
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D): void {
    const flashing = this.player.invulnerableTimer > 0 && Math.floor(this.player.invulnerableTimer * 20) % 2 === 0;
    ctx.globalAlpha = flashing ? 0.45 : 1;
    ctx.fillStyle = this.player.state === 'parrying' ? '#fde68a' : '#67e8f9';
    ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

    const attack = this.player.attackHitbox;
    if (attack) {
      ctx.fillStyle = '#bae6fd';
      ctx.globalAlpha = 0.7;
      ctx.fillRect(attack.x, attack.y, attack.width, attack.height);
    }

    ctx.globalAlpha = 1;
  }

  private renderDebug(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#22c55e';
    const p = this.player.bodyHitbox;
    ctx.strokeRect(p.x, p.y, p.width, p.height);
    const a = this.player.attackHitbox;
    if (a) {
      ctx.strokeStyle = '#3b82f6';
      ctx.strokeRect(a.x, a.y, a.width, a.height);
    }

    ctx.strokeStyle = '#eab308';
    ctx.strokeRect(this.boss.weakPoint.x, this.boss.weakPoint.y, this.boss.weakPoint.width, this.boss.weakPoint.height);

    if (this.boss.currentAttack) {
      const d = this.boss.currentAttack.definition.damageRect;
      ctx.strokeStyle = '#ef4444';
      ctx.strokeRect(d.x, d.y, d.width, d.height);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Boss state: ${this.boss.state}`, 20, 95);
    ctx.fillText(`Player state: ${this.player.state}`, 20, 115);
    ctx.fillText(`Attack: ${this.boss.currentAttack?.definition.type ?? 'none'}`, 20, 135);
  }
}
