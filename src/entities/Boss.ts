import { BOSS_MAX_HP } from '../utils/constants';
import type { AttackType, BossState, Rect } from '../utils/types';
import type { AttackDefinition, AttackRuntime } from '../boss/BossAttack';
import { createGroundSweep } from '../boss/attacks/GroundSweep';
import { createCrushingHand } from '../boss/attacks/CrushingHand';
import { createEnergyBeam } from '../boss/attacks/EnergyBeam';
import { BossAttackPicker } from '../boss/BossStateMachine';

export class Boss {
  x = 790;
  y = 160;
  width = 380;
  height = 430;
  hp = BOSS_MAX_HP;
  maxHp = BOSS_MAX_HP;
  state: BossState = 'idle';
  weakPoint: Rect = { x: 850, y: 270, width: 130, height: 120 };
  currentAttack: AttackRuntime | null = null;
  private idleTimer = 0.45;
  private picker = new BossAttackPicker();

  reset(): void {
    this.hp = this.maxHp;
    this.state = 'idle';
    this.currentAttack = null;
    this.idleTimer = 0.45;
    this.picker = new BossAttackPicker();
  }

  get phaseMultiplier(): number {
    const ratio = this.hp / this.maxHp;
    if (ratio <= 0.3) {
      return 0.8;
    }
    if (ratio <= 0.6) {
      return 0.9;
    }
    return 1;
  }

  get attackCycleBoost(): number {
    return this.hp / this.maxHp <= 0.3 ? 0.85 : 1;
  }

  pickNextAttack(): void {
    const selected = this.picker.pick(['groundSweep', 'crushingHand', 'energyBeam']);
    this.currentAttack = {
      definition: this.createAttack(selected),
      timer: 0,
      didImpact: false,
      parryResolved: false,
    };
    this.state = 'telegraphing';
  }

  private createAttack(type: AttackType): AttackDefinition {
    const multiplier = this.phaseMultiplier;
    switch (type) {
      case 'groundSweep':
        return createGroundSweep(multiplier);
      case 'crushingHand':
        return createCrushingHand(multiplier);
      case 'energyBeam':
        return createEnergyBeam(multiplier);
    }
  }

  update(dt: number): void {
    if (this.state === 'dead') {
      return;
    }

    if (!this.currentAttack) {
      this.idleTimer -= dt;
      this.state = 'idle';
      if (this.idleTimer <= 0) {
        this.pickNextAttack();
      }
      return;
    }

    this.currentAttack.timer += dt;
    const attack = this.currentAttack.definition;
    const t = this.currentAttack.timer;

    if (t < attack.telegraph) {
      this.state = 'telegraphing';
      return;
    }

    if (t < attack.telegraph + attack.active) {
      this.state = 'attacking';
      return;
    }

    if (t < attack.telegraph + attack.active + attack.recovery) {
      this.state = 'recovering';
      return;
    }

    this.currentAttack = null;
    this.idleTimer = 0.35 * this.attackCycleBoost;
    this.state = 'idle';
  }

  isParryWindowActive(): boolean {
    if (!this.currentAttack || this.state !== 'telegraphing') {
      return false;
    }
    const { definition, timer } = this.currentAttack;
    if (definition.parryWindow <= 0) {
      return false;
    }
    return timer >= definition.telegraph - definition.parryWindow && timer < definition.telegraph;
  }

  isDamageActive(): boolean {
    if (!this.currentAttack) {
      return false;
    }
    const { definition, timer, parryResolved } = this.currentAttack;
    if (definition.type === 'energyBeam') {
      const beamStart = definition.telegraph;
      return !parryResolved && timer >= beamStart && timer < beamStart + definition.active;
    }
    return !parryResolved && timer >= definition.telegraph && timer < definition.telegraph + definition.active;
  }

  receiveDamage(amount: number): void {
    if (this.state === 'dead') {
      return;
    }
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.state = 'dead';
      this.currentAttack = null;
    }
  }
}
