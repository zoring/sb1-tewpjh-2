import { GameInput, Vector2D } from '../types';

export class InputManager {
  private input: GameInput;
  private canvas: HTMLCanvasElement;
  private isMobile: boolean;

  constructor(canvas: HTMLCanvasElement, isMobile: boolean) {
    this.canvas = canvas;
    this.isMobile = isMobile;
    this.input = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      mouseX: 0,
      mouseY: 0,
    };

    if (!isMobile) {
      this.setupKeyboardEvents();
      this.setupMouseEvents();
    }
  }

  private setupKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': this.input.up = true; break;
        case 's': this.input.down = true; break;
        case 'a': this.input.left = true; break;
        case 'd': this.input.right = true; break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': this.input.up = false; break;
        case 's': this.input.down = false; break;
        case 'a': this.input.left = false; break;
        case 'd': this.input.right = false; break;
      }
    });
  }

  private setupMouseEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouseX = e.clientX - rect.left;
      this.input.mouseY = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', () => this.input.shoot = true);
    this.canvas.addEventListener('mouseup', () => this.input.shoot = false);
  }

  public handleTouchInput(direction: Vector2D) {
    this.input.up = direction.y < 0;
    this.input.down = direction.y > 0;
    this.input.left = direction.x < 0;
    this.input.right = direction.x > 0;
  }

  public handleTouchShoot(shooting: boolean) {
    this.input.shoot = shooting;
  }

  public getInput(): GameInput {
    return { ...this.input };
  }

  public cleanup() {
    if (!this.isMobile) {
      // Remove all event listeners
      window.removeEventListener('keydown', () => {});
      window.removeEventListener('keyup', () => {});
      this.canvas.removeEventListener('mousemove', () => {});
      this.canvas.removeEventListener('mousedown', () => {});
      this.canvas.removeEventListener('mouseup', () => {});
    }
  }
}