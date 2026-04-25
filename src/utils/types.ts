export type GameState = 'title' | 'playing' | 'victory' | 'defeat';

export type PlayerState =
  | 'idle'
  | 'jumping'
  | 'falling'
  | 'airAttacking'
  | 'parrying'
  | 'hurt'
  | 'dead';

export type BossState =
  | 'idle'
  | 'telegraphing'
  | 'attacking'
  | 'recovering'
  | 'stunned'
  | 'dead';

export type AttackType = 'groundSweep' | 'crushingHand' | 'energyBeam';

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};
