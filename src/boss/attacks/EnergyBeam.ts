import type { AttackDefinition } from '../BossAttack';

export function createEnergyBeam(multiplier: number): AttackDefinition {
  return {
    type: 'energyBeam',
    telegraph: 1.2 * multiplier,
    parryWindow: 0.3,
    active: 0.5,
    recovery: 0.5 * multiplier,
    warningRect: { x: 130, y: 455, width: 920, height: 65 },
    damageRect: { x: 130, y: 455, width: 920, height: 65 },
    mode: 'dodge',
  };
}
