import { Graphics } from "./graphics";
declare var document: any;
export abstract class Game {
  public graphics: Graphics
  private previousRAF: number | null
  
  constructor() {
    this.init();
  }
  init() {
    this.graphics = new Graphics();

    if (!this.graphics.init()) {
      this.displayError('WebGL2 is not available.');
      return;
    }

    this.previousRAF = null;

    this._RAF();
  }

  private displayError(errorText: string) {
    const error = document.getElementById('error');
    if (!error) return;
    error.innerText = errorText;
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this.previousRAF === null) {
        this.previousRAF = t;
      }
      this.render(t - this.previousRAF);
      this.previousRAF = t;
    });
  }

  private render(timeInMS: number) {
    const timeInSeconds = timeInMS * 0.001;
    this.onStep(timeInSeconds);
    this.graphics.Render(timeInSeconds);

    this._RAF();
  }

  abstract onStep(timeInSeconds: number): void;
}