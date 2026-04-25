import type { AttackType, Rect } from '../utils/types';

export type AttackDefinition = {
  type: AttackType;
  telegraph: number;
  parryWindow: number;
  active: number;
  recovery: number;
  warningRect: Rect;
  damageRect: Rect;
  mode: 'jump' | 'parry' | 'dodge';
};

export type AttackRuntime = {
  definition: AttackDefinition;
  timer: number;
  didImpact: boolean;
  parryResolved: boolean;
};
