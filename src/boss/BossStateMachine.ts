import type { AttackType } from '../utils/types';

export class BossAttackPicker {
  private recent: AttackType[] = [];

  pick(types: AttackType[]): AttackType {
    const filtered = types.filter((type) => {
      if (this.recent.length < 2) {
        return true;
      }
      return !(this.recent[this.recent.length - 1] === type && this.recent[this.recent.length - 2] === type);
    });
    const pool = filtered.length > 0 ? filtered : types;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    this.recent.push(choice);
    if (this.recent.length > 4) {
      this.recent.shift();
    }
    return choice;
  }
}
