import type { AttackDefinition } from '../BossAttack';

export function createGroundSweep(multiplier: number): AttackDefinition {
  return {
    type: 'groundSweep',
    telegraph: 0.9 * multiplier,
    parryWindow: 0,
    active: 0.14,
    recovery: 0.6 * multiplier,
    warningRect: { x: 120, y: 560, width: 900, height: 40 },
    damageRect: { x: 120, y: 560, width: 900, height: 45 },
    mode: 'jump',
  };
}
