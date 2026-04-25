export class InputManager {
  wasActionPressedThisFrame = false;
  actionBufferTime = 0;
  private readonly actionBufferDuration = 0.08;

  constructor(target: HTMLElement | Window) {
    const press = (event: Event): void => {
      if (event instanceof KeyboardEvent && event.code !== 'Space') {
        return;
      }
      if (event.cancelable) {
        event.preventDefault();
      }
      this.wasActionPressedThisFrame = true;
      this.actionBufferTime = this.actionBufferDuration;
    };

    target.addEventListener('keydown', press);
    target.addEventListener('pointerdown', press);
    target.addEventListener('touchstart', press, { passive: false });
  }

  update(dt: number): void {
    this.actionBufferTime = Math.max(0, this.actionBufferTime - dt);
  }

  consumeAction(): boolean {
    if (this.wasActionPressedThisFrame || this.actionBufferTime > 0) {
      this.wasActionPressedThisFrame = false;
      this.actionBufferTime = 0;
      return true;
    }
    return false;
  }

  endFrame(): void {
    this.wasActionPressedThisFrame = false;
  }
}
