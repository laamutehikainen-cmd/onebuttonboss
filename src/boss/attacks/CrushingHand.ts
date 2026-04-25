import type { AttackDefinition } from '../BossAttack';

export function createCrushingHand(multiplier: number): AttackDefinition {
  return {
    type: 'crushingHand',
    telegraph: 1.0 * multiplier,
    parryWindow: 0.25,
    active: 0.08,
    recovery: 0.8 * multiplier,
    warningRect: { x: 220, y: 520, width: 140, height: 140 },
    damageRect: { x: 205, y: 430, width: 170, height: 180 },
    mode: 'parry',
  };
}
