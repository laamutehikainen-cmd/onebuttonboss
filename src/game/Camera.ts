import { rand } from '../utils/math';

export class Camera {
  private shakePower = 0;
  private shakeTime = 0;
  offsetX = 0;
  offsetY = 0;

  shake(power: number, duration: number): void {
    this.shakePower = Math.max(this.shakePower, power);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  update(dt: number): void {
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      this.offsetX = rand(-this.shakePower, this.shakePower);
      this.offsetY = rand(-this.shakePower, this.shakePower);
      this.shakePower *= 0.9;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.shakePower = 0;
    }
  }
}
