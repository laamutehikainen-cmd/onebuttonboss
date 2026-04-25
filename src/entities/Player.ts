import {
  GROUND_Y,
  GRAVITY,
  JUMP_VELOCITY,
  PLAYER_INVULNERABLE_TIME,
  PLAYER_MAX_HP,
  PLAYER_X,
} from '../utils/constants';
import type { PlayerState, Rect } from '../utils/types';

export class Player {
  x = PLAYER_X;
  y = GROUND_Y - 120;
  width = 70;
  height = 120;
  vy = 0;
  hp = PLAYER_MAX_HP;
  state: PlayerState = 'idle';
  grounded = true;
  canAirAttack = false;
  airAttackTimer = 0;
  invulnerableTimer = 0;
  parryTimer = 0;

  reset(): void {
    this.x = PLAYER_X;
    this.y = GROUND_Y - this.height;
    this.vy = 0;
    this.hp = PLAYER_MAX_HP;
    this.state = 'idle';
    this.grounded = true;
    this.canAirAttack = false;
    this.airAttackTimer = 0;
    this.invulnerableTimer = 0;
    this.parryTimer = 0;
  }

  get bodyHitbox(): Rect {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  get attackHitbox(): Rect | null {
    if (this.state !== 'airAttacking' || this.airAttackTimer <= 0) {
      return null;
    }
    return { x: this.x + this.width - 5, y: this.y + 24, width: 115, height: 44 };
  }

  jump(): boolean {
    if (!this.grounded) {
      return false;
    }
    this.vy = JUMP_VELOCITY;
    this.grounded = false;
    this.canAirAttack = true;
    this.state = 'jumping';
    return true;
  }

  doAirAttack(): boolean {
    if (this.grounded || !this.canAirAttack || this.state === 'airAttacking') {
      return false;
    }
    this.canAirAttack = false;
    this.airAttackTimer = 0.2;
    this.state = 'airAttacking';
    return true;
  }

  setParryState(): void {
    this.parryTimer = 0.16;
    this.state = 'parrying';
  }

  takeHit(): boolean {
    if (this.invulnerableTimer > 0 || this.state === 'dead') {
      return false;
    }
    this.hp -= 1;
    this.invulnerableTimer = PLAYER_INVULNERABLE_TIME;
    this.state = this.hp <= 0 ? 'dead' : 'hurt';
    return true;
  }

  update(dt: number): void {
    if (!this.grounded) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.vy > 0 && this.state === 'jumping') {
        this.state = 'falling';
      }
    }

    if (this.y + this.height >= GROUND_Y) {
      this.y = GROUND_Y - this.height;
      this.vy = 0;
      this.grounded = true;
      if (this.state !== 'dead' && this.state !== 'hurt') {
        this.state = 'idle';
      }
    }

    if (this.airAttackTimer > 0) {
      this.airAttackTimer -= dt;
      if (this.airAttackTimer <= 0 && !this.grounded && this.state === 'airAttacking') {
        this.state = 'falling';
      }
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0 && this.state === 'hurt') {
        this.state = this.grounded ? 'idle' : 'falling';
      }
    }

    if (this.parryTimer > 0) {
      this.parryTimer -= dt;
      if (this.parryTimer <= 0 && this.state === 'parrying') {
        this.state = this.grounded ? 'idle' : 'falling';
      }
    }
  }
}
